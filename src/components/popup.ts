import {Reminder, Reminders} from '../reminders'

export class Popup extends HTMLDivElement {
  private _dayInput: HTMLInputElement
  private _textInput: HTMLInputElement
  private _addButton: HTMLButtonElement
  private _remindersTable: HTMLTableElement
  private _overlay: HTMLDivElement | null = null

  public constructor(private _reminders: Reminders) {
    super()

    this._dayInput = this._buildDayInput()
    this._textInput = this._buildTextInput()
    this._addButton = this._buildAddButton()
    this._remindersTable = this._buildRemindersTable()

    this.renderReminders(this._reminders.openReminders)

    this._buildPopup()
  }

  private _buildPopup() {
    this.classList.add('reminder-popup')

    this.appendChild(this._dayInput)
    this.appendChild(this._textInput)
    this.appendChild(this._addButton)
    this.appendChild(this._remindersTable)
  }

  private _buildDayInput() {
    const input = document.createElement('input')
    input.classList.add('new-reminder-day')
    input.placeholder = 'Day'

    input.addEventListener('keypress', (event) => void this._addNewReminder(event))

    return input
  }

  private _buildTextInput() {
    const input = document.createElement('input')
    input.classList.add('new-reminder-text')
    input.placeholder = 'New Reminder'

    input.addEventListener('keypress', (event) => void this._addNewReminder(event))

    return input
  }

  private _buildAddButton() {
    const button = document.createElement('button')
    button.classList.add('add-reminder')
    button.textContent = '+'

    button.addEventListener('click', () => void this._addNewReminder())

    return button
  }

  private async _addNewReminder(event?: KeyboardEvent) {
    if (event && event.keyCode !== 13) return

    const day = this._dayInput.value
    const text = this._textInput.value

    await this._reminders.add(day, text).catch((error: Error) => {
      alert(error.message) // TODO: use flash message
    })

    this._dayInput.value = ''
    this._textInput.value = ''
  }

  private _buildRemindersTable() {
    const table = document.createElement('table')
    table.classList.add('reminders')

    return table
  }

  private _buildReminderRow(reminder: Reminder) {
    const row = document.createElement('tr')

    const reminderDay = document.createElement('td')
    reminderDay.textContent = reminder.day.toString()

    const reminderText = document.createElement('td')
    reminderText.textContent = reminder.text

    const reminderActions = document.createElement('td')
    const deleteReminder = document.createElement('button')
    deleteReminder.textContent = '-'
    deleteReminder.addEventListener('click', () => {
      void this._reminders.remove(reminder).catch((error: Error) => {
        alert(error.message) // TODO: use flash bar
      })
    })
    reminderActions.appendChild(deleteReminder)

    row.appendChild(reminderDay)
    row.appendChild(reminderText)
    row.appendChild(reminderActions)

    return row
  }

  private _insertOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    overlay.style.position = 'fixed'
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.addEventListener('click', () => this.hideReminderPopup())
    this.parentElement!.prepend(overlay)
  }

  public renderReminders(reminders: Array<Reminder>): void {
    this._remindersTable.innerHTML = ''

    for (const reminder of reminders) {
      this._remindersTable.appendChild(this._buildReminderRow(reminder))
    }
  }

  public toggle(): void {
    if (this.classList.contains('show')) {
      this.hideReminderPopup()
    } else {
      this.showReminderPopup()
    }
  }

  public showReminderPopup(): void {
    this.classList.add('show')
    this._insertOverlay()
  }

  public hideReminderPopup(): void {
    this.classList.remove('show')
    if (this._overlay) this._overlay.remove()
  }
}
