import {Reminders} from '../reminders'
import {KeyCode} from '../util/keyCode'
import {Reminder} from '../models'
import {FlashMessageService} from './flashMessageService'
import {Popup} from './popup'

export class ReminderPopup extends Popup {
  private _dayInput: HTMLInputElement
  private _textInput: HTMLInputElement
  private _addButton: HTMLButtonElement
  private _remindersList: HTMLUListElement

  public constructor(private _reminders: Reminders) {
    super('reminders')

    this._dayInput = this._buildDayInput()
    this._textInput = this._buildTextInput()
    this._addButton = this._buildAddButton()
    this._remindersList = this._buildRemindersList()

    _reminders.on('reminders', (reminders) => {
      this._renderReminders(reminders.filter((reminder) => !reminder.closed))
    })

    this._addChildren(
      this._dayInput,
      this._textInput,
      this._addButton,
      document.createElement('hr'),
      this._remindersList,
    )
  }

  private _buildDayInput() {
    const input = document.createElement('input')
    input.classList.add('tt-new-reminder-day')
    input.placeholder = 'Day'

    input.addEventListener('keypress', (event) => void this._addNewReminder(event))

    return input
  }

  private _buildTextInput() {
    const input = document.createElement('input')
    input.classList.add('tt-new-reminder-text')
    input.placeholder = 'New Reminder'

    input.addEventListener('keypress', (event) => void this._addNewReminder(event))

    return input
  }

  private _buildAddButton() {
    const button = document.createElement('button')
    button.classList.add('tt-add-reminder', 'text')
    button.textContent = '+'

    button.addEventListener('click', () => void this._addNewReminder())

    return button
  }

  private async _addNewReminder(event?: KeyboardEvent) {
    if (event && event.keyCode !== KeyCode.Enter) return

    const day = this._dayInput.value
    const text = this._textInput.value

    await this._reminders.add(day, text).catch((error: Error) => {
      FlashMessageService.error(error.message)
    })

    this._dayInput.value = ''
    this._textInput.value = ''
  }

  private _buildRemindersList() {
    const list = document.createElement('ul')
    list.classList.add('tt-reminders')

    return list
  }

  private _renderReminders(reminders: Array<Reminder>): void {
    this._remindersList.innerHTML = ''

    for (const reminder of reminders) {
      this._remindersList.appendChild(this._buildReminderEntry(reminder))
    }
  }

  private _buildReminderEntry(reminder: Reminder) {
    const item = document.createElement('li')

    const reminderDay = document.createElement('span')
    reminderDay.textContent = reminder.day.toString()

    const reminderText = document.createElement('span')
    reminderText.textContent = reminder.text

    const reminderActions = document.createElement('span')
    const deleteReminder = document.createElement('button')
    deleteReminder.classList.add('text')
    deleteReminder.textContent = '\u2013'
    deleteReminder.addEventListener('click', () => {
      void this._reminders.remove(reminder).catch((error: Error) => {
        FlashMessageService.error(error.message)
      })
    })
    reminderActions.appendChild(deleteReminder)

    item.appendChild(reminderDay)
    item.appendChild(reminderText)
    item.appendChild(reminderActions)

    return item
  }
}
