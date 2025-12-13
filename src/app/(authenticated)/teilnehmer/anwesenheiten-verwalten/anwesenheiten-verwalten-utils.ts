export interface AbwesenheitSeminarTrainer {
  email: string
  funktion: string
  id: number
  name: string
  telefon: string
}

export interface AnwesenheitSeminarEntry {
  seminarId: number
  project: string
  seminar: string
  standort: string
  von: string
  bis: string
  verzoegerung: number
  changedOn: string
  trainers: AbwesenheitSeminarTrainer[]
}
