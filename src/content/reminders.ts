import {ReminderStore} from './store'
import {EventEmitter} from './util/eventEmitter'
import {Reminder} from './models'

interface ReminderEvents {
  reminder: Reminder
  update: Array<Reminder>
}

export class Reminders extends EventEmitter<ReminderEvents> {
  private _store: ReminderStore

  public initialized: Promise<void>

  public constructor(workspace: string) {
    super()

    this._store = new ReminderStore(workspace)

    this.initialized = new Promise((resolve) => {
      void this._store.initialized.then(resolve)
    })
  }

  public get currentDay(): number {
    return this._store.day
  }

  public get openReminders(): Array<Reminder> {
    // TODO: filter in store
    return this._store.reminders.filter((reminder) => !reminder.closed).map((reminder) => ({...reminder}))
  }

  private _dayPattern = /^\+?\d+$/
  public async add(dayString: string, text: string): Promise<void> {
    if (!text) {
      throw new Error('Please provide a reminder text.')
    }

    if (!this._dayPattern.test(dayString)) {
      throw new Error('Please provide a day, optionally prefixed with a + sign.')
    }

    const day = dayString.startsWith('+') ? this._store.day + Number(dayString.substr(1)) : Number(dayString)

    if (
      this._store.reminders.some((existingReminder) => existingReminder.day === day && existingReminder.text === text)
    ) {
      throw new Error('That reminder already exists.')
    }

    const reminder = {day, text, closed: false}
    await this._store.addReminder(reminder)

    this._emit('update', this.openReminders)
  }

  public async remove(reminder: Reminder): Promise<void> {
    await this._store.removeReminder(reminder)

    this._emit('update', this.openReminders)
  }

  public async changeDay(day: number): Promise<void> {
    await this._store.setDay(day)

    await this._checkReminders()
    await this._reopenReminders()
  }

  private async _checkReminders() {
    const dueReminders = this._store.reminders.filter((reminder) => reminder.day <= this._store.day)

    for (const reminder of dueReminders) {
      this._emit('reminder', reminder)
      reminder.closed = true
      await this._store.updateReminder(reminder)
    }

    this._emit('update', this.openReminders)
  }

  private async _reopenReminders() {
    const reopenedReminders = this._store.reminders.filter(
      (reminder) => reminder.closed && reminder.day > this._store.day,
    )

    for (const reminder of reopenedReminders) {
      reminder.closed = false
      await this._store.updateReminder(reminder)
    }

    this._emit('update', this.openReminders)
  }
}
