'use client'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  ListBulletIcon,
  PlayCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { stripHtml } from 'string-strip-html'
import { twMerge } from 'tailwind-merge'

import ButtonTw from '../atoms/button-tw'
import LoaderTw from '../atoms/loader-tw'
import { CHAT_USE_CASE_QUESTIONS } from '@/lib/utils/chatbot-utils'
import { fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import { showError, showErrorMessage } from '@/lib/utils/toast-utils'

type FormInputs = { message: string }

type ChatMessage = { type: 'user' | 'bot'; content: string; timestamp: Date }

const UseCasePanel = ({
  icon,
  children,
  onClickHandler,
  className,
}: {
  icon: ReactNode
  children: ReactNode
  onClickHandler: () => void
  className?: string
}) => (
  <div
    className={twMerge(
      `w-full cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-white hover:bg-gray-50`,
      className
    )}
    onClick={onClickHandler}
  >
    <div className="flex items-start gap-2 p-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </div>
  </div>
)

const ChatMessage = ({ message }: { message: ChatMessage }) => (
  <div
    className={`animate-slide-in mb-6 opacity-0 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
  >
    <span
      className={twMerge(
        `text-normal inline-block max-w-[560px] rounded-lg px-3 py-2.5`,
        message.type === 'user'
          ? 'chat-message-user from-ibis-blue to-ibis-blue-light bg-gradient-to-br whitespace-pre-line text-white'
          : 'chat-message-bot markdown-style bg-gray-100 text-gray-800'
      )}
    >
      {message.type === 'user' ? (
        message.content
      ) : (
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      )}
    </span>
    <span className="mx-1 mt-2 block text-xs text-gray-400">
      {dayjs(message.timestamp).format('DD.MM.YYYY, HH:mm')}
    </span>
  </div>
)

// Utility function to strip HTML while preserving line breaks and spaces
const stripHtmlPreserveLineBreaks = (html: string): string => {
  return stripHtml(html, {
    skipHtmlDecoding: true,
    trimOnlySpaces: false,
    cb: ({ tag, deleteFrom, deleteTo, rangesArr, proposedReturn }) => {
      if (tag.name === 'br') {
        rangesArr.push([deleteFrom as number, deleteTo as number, `\n`])
      } else {
        rangesArr.push(proposedReturn)
      }
    },
  }).result
}

const Chatbot: React.FC = () => {
  const t = useTranslations('components.chatbot')

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>()

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLParagraphElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current?.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const message = stripHtmlPreserveLineBreaks(data.message)
    if (!message) {
      return
    }
    // Clear the form after submission
    if (inputRef.current) {
      inputRef.current.innerHTML = ''
    }

    setMessages((prev) => [
      ...prev,
      { type: 'user', content: message, timestamp: dayjs().toDate() },
    ])

    // show bot loading state
    setIsRequesting(true)

    try {
      const response = await fetchGatewayRaw('/ai-engine/chat-request', {
        method: 'POST',
        body: JSON.stringify({ request: message, threadId }),
      })

      // hide bot loading state
      setIsRequesting(false)

      const responseData = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: responseData.response,
          timestamp: dayjs().toDate(),
        },
      ])

      setThreadId(responseData.threadId)
    } catch (e) {
      showError(t('error'))
      setIsRequesting(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(onSubmit)()
    }
  }

  const onOpenNewChat = async () => {
    if (!isRequesting) {
      if (threadId) {
        // delete thread on server side
        try {
          await fetchGatewayRaw(`/ai-engine/thread?threadId=${threadId}`, {
            method: 'DELETE',
          })
        } catch (e) {
          showErrorMessage(e)
        }
      }

      // reset state
      setThreadId(null)
      setMessages([])
    }
  }

  return (
    <div className="chatbot-container fixed right-8 bottom-8 z-[100]">
      <div
        className={twMerge(
          'bg from-ibis-blue to-ibis-blue-light hover:bg-ibis-blue-light absolute right-0 bottom-0 z-30 flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-2xl'
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? (
          <ChevronDownIcon aria-hidden="true" className="h-8 w-8" />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
        )}
      </div>
      <div
        className={twMerge(
          'absolute right-0 bottom-20 z-40 flex max-h-[calc(100vh-9rem)] max-w-[1600px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl transition-all',
          isExpanded
            ? 'h-[calc(100vh-9rem)] w-[calc(100vw-4rem)] xl:w-[calc(100vw-24rem)]'
            : 'h-[800px] w-[560px]',
          isOpen ? 'chatbot-transform-open' : 'chatbot-transform-closed'
        )}
      >
        <div className="from-ibis-indigo to-ibis-blue-light flex flex-row items-center justify-between border-0 bg-gradient-to-br px-6 py-4">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-md text-gray-100 hover:text-white focus:outline-none"
          >
            <span className="sr-only">{t('buttons.close')}</span>
            {isExpanded ? (
              <ArrowsPointingInIcon
                aria-hidden="true"
                className="h-6 w-6"
                title={t('screenreader.collapse')}
              />
            ) : (
              <ArrowsPointingOutIcon
                aria-hidden="true"
                className="h-6 w-6"
                title={t('screenreader.expand')}
              />
            )}
          </button>
          <div className="flex flex-col">
            <span className="text-center text-xl font-semibold tracking-tight text-gray-50">
              {t('title')}
            </span>
            <span className="text-center text-sm font-normal tracking-tight text-gray-100">
              {t('subtitle')}
            </span>
          </div>
          <button
            type="button"
            disabled={isRequesting}
            onClick={onOpenNewChat}
            className="rounded-md text-gray-100 hover:text-white focus:outline-none disabled:text-gray-200"
          >
            <span className="sr-only">{t('screenreader.newChat')}</span>
            <ArrowTopRightOnSquareIcon
              aria-hidden="true"
              className="h-8 w-8"
              title={t('buttons.newChat')}
            />
          </button>
        </div>
        <div
          className="mx-4 h-64 flex-[1_0_auto] overflow-y-auto scroll-smooth bg-white py-4"
          ref={messagesContainerRef}
        >
          {!messages.length && (
            <>
              <span className="my-8 block w-full text-center text-lg font-normal tracking-tight text-gray-600 italic">
                {t.rich('intro1', {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
                <br />
                {t('intro2')}
              </span>
              <span className="text-normal my-8 block w-full text-center font-normal tracking-tight text-gray-600">
                {t('intro3')}
              </span>
              <div className="intro-container grid grid-cols-2 gap-2 px-8">
                <UseCasePanel
                  className="col-span-1"
                  icon={
                    <PlayCircleIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-green-400"
                    />
                  }
                  onClickHandler={() => {
                    onSubmit({ message: CHAT_USE_CASE_QUESTIONS.start })
                  }}
                >
                  {CHAT_USE_CASE_QUESTIONS.start}
                </UseCasePanel>
                <UseCasePanel
                  className="col-span-1"
                  icon={
                    <ClockIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-blue-400"
                    />
                  }
                  onClickHandler={() => {
                    onSubmit({ message: CHAT_USE_CASE_QUESTIONS.zeiterfassung })
                  }}
                >
                  {CHAT_USE_CASE_QUESTIONS.zeiterfassung}
                </UseCasePanel>
                <UseCasePanel
                  className="col-span-1"
                  icon={
                    <UsersIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-orange-500"
                    />
                  }
                  onClickHandler={() => {
                    onSubmit({
                      message: CHAT_USE_CASE_QUESTIONS.kurseTeilnehmer,
                    })
                  }}
                >
                  {CHAT_USE_CASE_QUESTIONS.kurseTeilnehmer}
                </UseCasePanel>
                <UseCasePanel
                  className="col-span-1"
                  icon={
                    <ListBulletIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-purple-400"
                    />
                  }
                  onClickHandler={() => {
                    onSubmit({ message: CHAT_USE_CASE_QUESTIONS.benefits })
                  }}
                >
                  {CHAT_USE_CASE_QUESTIONS.benefits}
                </UseCasePanel>
              </div>
            </>
          )}
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isRequesting && (
            <div className="ml-2 flex flex-row items-center gap-2">
              <LoaderTw />{' '}
              <span className="text-normal animate-pulse text-gray-600">
                {t('thinking')}
              </span>
            </div>
          )}
        </div>
        <div className="form-container bg-white p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative flex min-h-13 flex-col-reverse rounded-2xl border border-gray-300 bg-gray-100">
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <p
                    ref={inputRef}
                    contentEditable={!isRequesting}
                    role="textbox"
                    className="chatbot-input mx-14 my-3 ml-3 max-h-60 flex-auto cursor-text overflow-y-auto border-0 p-2 outline-0 before:text-gray-500"
                    data-placeholder={t('placeholder.input')}
                    onBlur={(e) => field.onChange(e.target.innerHTML)}
                    onInput={(e) => field.onChange(e.currentTarget.innerHTML)}
                    onKeyDown={handleKeyDown}
                  />
                )}
              />
              {errors.message && (
                <span className="text-sm text-red-500">
                  {errors.message.message}
                </span>
              )}
              <ButtonTw
                disabled={isRequesting}
                type="submit"
                className="absolute right-3 bottom-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 p-2 ring-emerald-500 hover:bg-emerald-500 disabled:bg-gray-500 disabled:text-gray-200"
              >
                <ArrowUpIcon className="h-6 w-6" />
              </ButtonTw>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
