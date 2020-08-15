import {ReminderStore, ReminderStoreEvents} from './store'
import {EventEmitter} from './util/eventEmitter'
import {Reminder, ReminderEdit} from './models'

interface ReminderEvents {
  reminder: Reminder
}

export class Reminders extends EventEmitter<ReminderEvents & ReminderStoreEvents> {
  private _store: ReminderStore

  public initialized: Promise<void>

  public constructor(workspace: string) {
    super()

    this._store = new ReminderStore(workspace)
    this._store.on('day', (day) => this._emit('day', day))
    this._store.on('reminders', (reminders) => this._emit('reminders', reminders))

    this.initialized = new Promise((resolve) => {
      void this._store.initialized.then(resolve)
    })
  }

  public get currentDay(): number {
    return this._store.day
  }

  private _dayPattern = /^\+?\d+$/
  public async add(dayString: string, text: string): Promise<void> {
    const reminder = this._transformReminder({day: dayString, text, closed: false})
    this._validateReminder(reminder)

    await this._store.addReminder(reminder)
  }

  public async remove(reminder: Reminder): Promise<void> {
    await this._store.removeReminder(reminder)
  }

  public async edit(updated: ReminderEdit): Promise<void> {
    const reminder = this._transformReminder(updated)
    this._validateReminder(reminder)

    await this._store.updateReminder(reminder)
  }

  public async changeDay(day: number): Promise<void> {
    await this._store.setDay(day)

    await this._checkReminders()
    await this._reopenReminders()
  }

  private _transformReminder(reminder: ReminderEdit): Reminder {
    const dayText = reminder.day.toString()
    if (!this._dayPattern.test(dayText)) {
      throw new Error('Please provide a day, optionally prefixed with a + sign.')
    }

    const day = dayText.startsWith('+') ? this._store.day + Number(dayText.substr(1)) : Number(dayText)

    return {...reminder, day}
  }

  private _validateReminder(reminder: ReminderEdit): void {
    if (!reminder.text) {
      throw new Error('Please provide a reminder text.')
    }

    if (reminder.day <= this._store.day) {
      throw new Error(`The day must be greater than the current in-game day.`)
    }

    if (
      this._store.reminders.some(
        (existingReminder) =>
          existingReminder.day === reminder.day &&
          existingReminder.text === reminder.text &&
          existingReminder.id !== reminder.id,
      )
    ) {
      throw new Error('That reminder already exists.')
    }
  }

  private async _checkReminders() {
    const dueReminders = this._store.reminders.filter((reminder) => !reminder.closed && reminder.day <= this._store.day)

    for (const reminder of dueReminders) {
      this._emit('reminder', reminder)
      reminder.closed = true
      await this._store.updateReminder(reminder)
    }
  }

  private async _reopenReminders() {
    const reopenedReminders = this._store.reminders.filter(
      (reminder) => reminder.closed && reminder.day > this._store.day,
    )

    for (const reminder of reopenedReminders) {
      reminder.closed = false
      await this._store.updateReminder(reminder)
    }
  }
}
