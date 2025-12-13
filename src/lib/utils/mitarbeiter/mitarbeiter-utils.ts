export interface Masterdata {
  [key: string]: any[]
}

// helper methods

// Type guard to check if a value is a File
export function isFile(value: any): value is File {
  return value instanceof File
}

//TODO UC1 delete test data
export interface MitarbeiterEntry {
  id: number
  name: string
  kostenstelle: string
  fuehrungskraft: string
  svnr: string
  personalnummer: string
}
