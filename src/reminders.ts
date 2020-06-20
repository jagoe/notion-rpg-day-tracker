import {Store} from './store'

export interface Reminder {
  day: number
  text: string
}

export enum ReminderEvents {
  reminder = 'reminder',
  update = 'update',
}

interface EventMap {
  [ReminderEvents.reminder]: ReminderEvent
  [ReminderEvents.update]: RemindersUpdateEvent
}

class ReminderEvent extends Event {
  public constructor(action: ReminderEvents, public reminder: Reminder) {
    super(action)
  }
}

class RemindersUpdateEvent extends Event {
  public constructor(action: ReminderEvents, public reminders: Array<Reminder>) {
    super(action)
  }
}

type EventListener<T extends Event> = (event: T) => void

interface ReminderStore {
  day: number
  reminders: Array<Reminder>
}

export class Reminders {
  private _updateListeners: Array<EventListener<RemindersUpdateEvent>> = []
  private _reminderListeners: Array<EventListener<ReminderEvent>> = []

  private _store = new Store<ReminderStore>()
  private _reminders: Array<Reminder> = []
  private _currentDay: number = 0

  public initialized: Promise<void>

  public constructor() {
    this.initialized = new Promise((resolve) => {
      void this._store.load('day', 'reminders').then((stored) => {
        this._currentDay = stored.day || 1
        this._reminders = stored.reminders || []
        this._sortReminders()

        resolve()
      })
    })
  }

  public on<T extends ReminderEvents>(event: T, fn: EventListener<EventMap[T]>): void {
    switch (event) {
      case ReminderEvents.update:
        this._updateListeners.push(fn as EventListener<RemindersUpdateEvent>)
        break
      case ReminderEvents.reminder:
        this._reminderListeners.push(fn as EventListener<ReminderEvent>)
        break
    }
  }

  public get currentDay(): number {
    return this._currentDay
  }

  public get openReminders(): Array<Reminder> {
    return this._reminders.map((reminder) => ({...reminder}))
  }

  private _dayPattern = /^\+?\d+$/
  public async add(dayString: string, text: string): Promise<void> {
    if (!text) {
      throw new Error('Please provide a reminder text.')
    }

    if (!this._dayPattern.test(dayString)) {
      throw new Error('Please provide a day, optionally prefixed with a + sign.')
    }

    const day = dayString.startsWith('+') ? this._currentDay + Number(dayString.substr(1)) : Number(dayString)

    if (this._reminders.some((existingReminder) => existingReminder.day === day && existingReminder.text === text)) {
      throw new Error('That reminder already exists.')
    }

    const reminder = {day, text}
    this._reminders.push(reminder)
    this._sortReminders()

    this._emit(ReminderEvents.update, {reminders: this.openReminders}) // TODO: send all reminders for re-render?
    await this._saveReminders()
  }

  public async remove(reminder: Reminder): Promise<void> {
    const index = this._reminders.findIndex(
      (existing) => existing.day === reminder.day && existing.text === reminder.text,
    )
    if (index === -1) {
      throw new Error(`Could not find reminder 'Day ${reminder.day}: ${reminder.text}'`)
    }

    this._reminders.splice(index, 1)

    this._emit(ReminderEvents.update, {reminders: this.openReminders}) // TODO: send all reminders for re-render?
    await this._saveReminders()
  }

  public async changeDay(day: number): Promise<void> {
    this._currentDay = day
    await this._store.save('day', day)

    await this._checkReminders()
  }

  private _emit(
    action: ReminderEvents,
    {reminder, reminders}: {reminder?: Reminder; reminders?: Array<Reminder>},
  ): void {
    switch (action) {
      case ReminderEvents.update:
        for (const listenerCallback of this._updateListeners) {
          if (!reminders) {
            throw new Error(`Missing event prperty 'reminders'`)
          }
          listenerCallback(new RemindersUpdateEvent(action, reminders))
        }
        break
      case ReminderEvents.reminder:
        for (const listenerCallback of this._reminderListeners) {
          if (!reminder) {
            throw new Error(`Missing event prperty 'reminder'`)
          }
          listenerCallback(new ReminderEvent(action, reminder))
          break
        }
    }
  }

  private async _checkReminders() {
    const dueReminders = this._reminders.filter((reminder) => reminder.day <= this._currentDay)

    for (const reminder of dueReminders) {
      this._reminders.splice(this._reminders.indexOf(reminder), 1)
      this._emit(ReminderEvents.reminder, {reminder})
    }

    this._emit(ReminderEvents.update, {reminders: this.openReminders})

    await this._saveReminders()
  }

  private async _saveReminders() {
    await this._store.save('reminders', this._reminders)
  }

  private _sortReminders() {
    this._reminders = this._reminders.sort((a, b) => a.day - b.day)
  }
}
