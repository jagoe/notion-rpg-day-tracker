export interface Reminder {
  id?: string
  day: number
  text: string
  closed: boolean
}

export interface ReminderEdit {
  id?: string
  day: number | string
  text: string
  closed: boolean
}
