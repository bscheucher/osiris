import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useState } from 'react'

import { DatepickerCore } from '../atoms/datepicker-tw/datepicker-tw'
import { SelectCore } from '../atoms/input-select-tw'
import { ToggleCore } from '../atoms/input-toggle-tw'
import TitleComponent from '@/components/atoms/title'
import Pagination from '@/components/molecules/pagination'
import ProjectControllingTable, {
  ProjectControllingForm,
} from '@/components/organisms/project-controlling-table'
import { convertArrayToKeyLabelOptions } from '@/lib/utils/form-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import { getFromToDate } from '@/lib/utils/widget-utils'
import { getAllProjects } from '@/lib/utils/widget-utils'

const otherValue = 'OTHER'

export default function ProjectControlling({ preview }: { preview?: boolean }) {
  const t = useTranslations('dashboard.projectControllingDaten')

  const dropDownMap = useMemo(
    () =>
      new Map<string, string>([
        ['PEOT', t('dropdown.peot')],
        [otherValue, t('dropdown.otherValue')],
        ['M', t('dropdown.m')],
        ['Y', t('dropdown.y')],
        ['TDEOY', t('dropdown.tdeoy')],
        ['TDEOP', t('dropdown.tdeop')],
        ['NXW', t('dropdown.nxw')],
        ['NNXW', t('dropdown.nnxw')],
        ['NXM', t('dropdown.nxm')],
        ['NNXM', t('dropdown.nnxm')],
        ['MTD', t('dropdown.mtd')],
      ]),
    [t]
  )

  const dropDownOptions = useMemo(() => [...dropDownMap.keys()], [dropDownMap])

  const [formData, setFormData] = useState<ProjectControllingForm>({
    from: null,
    to: null,
    dirty: false,
    error: '',
    selectedDropDown: dropDownOptions[0],
    isActive: true,
    isFuture: false,
    projects: [],
    index: 0,
  })

  const fetchProjects = async (form = formData) => {
    if (preview) {
      return
    }

    await getAllProjects(form.isActive, form.isFuture)
      .then((projects) => (form.projects = projects))
      .catch((error) => showErrorMessage(error))
    setFormData({ ...form })
    const [from, to] = getFromToDate(form)

    if (form.selectedDropDown == otherValue) {
      if (form.dirty) {
        if (from == null || to == null) {
          setFormData({
            ...form,
            error: t('message.error.noStartAndEndDate'),
          })
        } else if (from > to) {
          setFormData({
            ...form,
            error: t('message.error.startDateBeforeEndDate'),
          })
        }
      }
    }
  }
  useEffect(() => {
    fetchProjects()
  }, [])

  function handleFutureChanged(b: boolean) {
    updateFormAndRefetch({ dirty: true, isFuture: b, index: 0 })
  }

  function updateFormAndRefetch(param: Partial<ProjectControllingForm>) {
    const form = { ...formData, ...param }
    setFormData(form)
    fetchProjects(form)
  }

  function handleActiveChanged(b: boolean) {
    const form: Partial<ProjectControllingForm> = {
      dirty: true,
      isActive: b,
      index: 0,
    }
    if (!b) {
      form.isFuture = false
    }
    updateFormAndRefetch(form)
  }

  function handleDropDownChange(e: string) {
    // user just selected the old value again - do nothing
    if (e == formData.selectedDropDown) {
      return
    }
    updateFormAndRefetch({ selectedDropDown: e, from: null, to: null })
  }

  function handleDateChange(
    from: Date | string | null,
    to: Date | string | null
  ) {
    let dateFrom = null
    let dateTo = null

    if (!(from === '' || from === null)) {
      dateFrom = new Date(from as Date | string)
    }
    if (!(to === '' || to === null)) {
      dateTo = new Date(to as Date | string)
    }
    const form = {
      ...formData,
      from: dateFrom,
      to: dateTo,
      dirty: true,
      error: '',
    }
    setFormData(form)
    if (dateFrom && dateTo) {
      fetchProjects(form)
    }
  }

  function handleIndexChange(i: number) {
    const form = { ...formData, index: i }
    setFormData(form)
  }

  return (
    <div className="mx-auto flex h-full flex-col gap-6 px-8 py-4">
      <TitleComponent title={t('titel')} />
      <div className="flex flex-grow flex-col justify-between">
        {/* INPUT */}
        <div className="flex basis-[125px] flex-row justify-between">
          <div className="z-50 flex basis-1/2 flex-col justify-between gap-3">
            <div data-testid="select-component">
              <SelectCore
                options={convertArrayToKeyLabelOptions(dropDownOptions)}
                onChange={(e) => void handleDropDownChange(e.target.value)}
                value={formData.selectedDropDown}
              />
            </div>
            {formData.selectedDropDown === otherValue && (
              <div className="z-10 flex flex-col justify-between gap-3">
                <div className="flex flex-row justify-between">
                  <div>{t('von')}</div>
                  <div>
                    <DatepickerCore
                      onChange={(date) => handleDateChange(date, formData.to)}
                      selected={formData.from}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <div>{t('bis')}</div>
                  <div>
                    <DatepickerCore
                      onChange={(date) => handleDateChange(formData.from, date)}
                      selected={formData.to}
                    />
                  </div>
                </div>
                <div className="flex flex-grow-0 justify-end text-sm text-red-500">
                  {formData.error}&nbsp;
                </div>
              </div>
            )}
          </div>
          <div className="flex w-40 flex-col gap-4">
            <ToggleCore
              onChange={handleActiveChanged}
              checked={formData.isActive}
              rightLabel={t('checkbox.active')}
            />
            {formData.isActive && (
              <ToggleCore
                onChange={handleFutureChanged}
                checked={formData.isFuture}
                rightLabel={t('checkbox.inDerZukunft')}
              />
            )}
          </div>
        </div>

        {/* PROJECT */}
        <ProjectControllingTable form={formData} preview={preview} />

        {/* FORECAST */}
        <ProjectControllingTable
          form={formData}
          isForecast={true}
          preview={preview}
          showSollStunden={true}
        />

        {/* PAGINATION */}
        <Pagination
          index={formData.index}
          valueChanged={handleIndexChange}
          entries={formData.projects?.length}
        />
      </div>
    </div>
  )
}
