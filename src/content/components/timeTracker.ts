import {Reminders} from '../reminders'
import * as backend from '../../util/backend'
import {ReminderPopup} from './reminderPopup'
import {AuthPopup} from './authPopup'

export class TimeTracker {
  private _authPopup: AuthPopup
  private _reminderPopup: ReminderPopup
  private _timeTracker: HTMLDivElement

  public constructor(private _reminders: Reminders) {
    this._authPopup = new AuthPopup()
    this._reminderPopup = new ReminderPopup(_reminders)
    this._timeTracker = this._buildTimeTracker()
    this._trapEvents()
  }

  private _buildTimeTracker() {
    const timeTracker = document.createElement('div')
    timeTracker.classList.add('time-tracker', this._getTheme())

    const {label, input} = this._buildDayInput()
    timeTracker.appendChild(label)
    timeTracker.appendChild(input)
    timeTracker.appendChild(this._buildPopupButton())
    this._authPopup.append(timeTracker)
    this._reminderPopup.append(timeTracker)

    void this._reminders.initialized.then(() => {
      input.value = this._reminders.currentDay.toString()
      label.classList.remove('hidden')
      input.classList.remove('hidden')
    })

    return timeTracker
  }

  private _buildDayInput() {
    const label = document.createElement('label')
    label.classList.add('hidden')
    label.setAttribute('for', 'tt-days')
    label.textContent = 'Day '

    const input = document.createElement('input')
    input.classList.add('hidden')
    input.type = 'number'
    input.id = 'tt-days'
    input.size = 4
    input.value = this._reminders.currentDay.toString()
    input.addEventListener('change', () => {
      let day = Number(input.value)
      if (day <= 1) {
        day = 1
        input.value = '1'
      }

      void this._reminders.changeDay(day)
    })

    this._reminders.on('day', (day) => {
      const current = input.value
      const newValue = day.toString()

      if (current === newValue) return

      input.value = newValue
      void this._reminders.changeDay(day)
    })

    return {label, input}
  }

  private _buildPopupButton() {
    const button = document.createElement('button')
    button.classList.add('tt-reminders-toggle')
    button.addEventListener('click', (event) => {
      event.stopImmediatePropagation()

      const loginState = new Promise<boolean>((resolve) => {
        let interval: NodeJS.Timeout | null = null
        const checkLoginState = () => {
          const isLoggedIn = backend.isLoggedIn()
          if (isLoggedIn !== null) resolve(isLoggedIn)
          if (interval) clearInterval(interval)
        }

        interval = setInterval(checkLoginState, 100)
      })
      void loginState.then((isLoggedIn) => {
        if (isLoggedIn) {
          this._reminderPopup.toggle()
        } else {
          this._authPopup.toggle()
        }
      })
    })

    return button
  }

  private _trapEvents() {
    this._timeTracker.addEventListener('keydown', (event) => {
      event.stopImmediatePropagation()
    })
    this._timeTracker.addEventListener('keyup', (event) => {
      event.stopImmediatePropagation()
    })
    this._timeTracker.addEventListener('keypress', (event) => {
      event.stopImmediatePropagation()
    })
    this._timeTracker.addEventListener('copy', (event) => {
      event.stopImmediatePropagation()
    })
    this._timeTracker.addEventListener('cut', (event) => {
      event.stopImmediatePropagation()
    })
    this._timeTracker.addEventListener('paste', (event) => {
      event.stopImmediatePropagation()
    })
  }

  private _getTheme() {
    return document.body.classList.contains('dark') ? 'dark' : 'light'
  }

  public prepend(parent: Element): void {
    parent.prepend(this._timeTracker)
  }
}
