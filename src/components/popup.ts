import {Reminder, Reminders} from '../reminders'
import {KeyCode} from '../util/keyCode'
import {FlashMessageService} from './flashMessageService'

export class Popup {
  private _popup: HTMLDivElement
  private _dayInput: HTMLInputElement
  private _textInput: HTMLInputElement
  private _addButton: HTMLButtonElement
  private _remindersList: HTMLUListElement
  private _overlay: HTMLDivElement | null = null

  public constructor(private _reminders: Reminders) {
    this._dayInput = this._buildDayInput()
    this._textInput = this._buildTextInput()
    this._addButton = this._buildAddButton()
    this._remindersList = this._buildRemindersList()

    void this._reminders.initialized.then(() => {
      this._renderReminders(this._reminders.openReminders)
    })
    _reminders.on('update', (reminders) => {
      this._renderReminders(reminders)
    })

    this._popup = this._buildPopup()
  }

  private _buildPopup() {
    const popup = document.createElement('div')
    popup.classList.add('reminder-popup') // TODO: make it look like the other popups

    popup.appendChild(this._dayInput)
    popup.appendChild(this._textInput)
    popup.appendChild(this._addButton)
    popup.appendChild(document.createElement('hr'))
    popup.appendChild(this._remindersList)

    return popup
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
    list.classList.add('reminders')

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
    deleteReminder.textContent = '–'
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

  private _insertOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    overlay.style.position = 'fixed'
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.addEventListener('click', () => this.hideReminderPopup())
    this._popup.parentElement!.prepend(overlay)

    return overlay
  }

  public append(parent: HTMLElement): void {
    parent.appendChild(this._popup)
  }

  public toggle(): void {
    if (this._popup.classList.contains('show')) {
      this.hideReminderPopup()
    } else {
      this.showReminderPopup()
    }
  }

  public showReminderPopup(): void {
    this._popup.classList.add('show')
    this._overlay = this._insertOverlay()
  }

  public hideReminderPopup(): void {
    this._popup.classList.remove('show')
    if (this._overlay) {
      this._overlay.remove()
      this._overlay = null
    }
  }
}
