import {Popup} from './components/popup'
import {Reminders} from './reminders'

const _reminders = new Reminders()
const _popup = new Popup(_reminders)

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')

  await _reminders.initialized
  setupEventListeners()

  topBarRightContainer.prepend(createTimeTracker())
}

function setupEventListeners() {
  _reminders.on('update', (reminders) => {
    _popup.renderReminders(reminders)
  })
  _reminders.on('reminder', (reminder) => {
    alert(`Day ${reminder.day}: ${reminder.text}`) // TODO: use toast or whatever
  })
}

async function waitFor(selector: string) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const el = document.querySelector(selector)
    if (el) return el

    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

function createTimeTracker() {
  const timeTracker = document.createElement('div')
  timeTracker.addEventListener('keydown', (event) => event.stopImmediatePropagation())
  timeTracker.classList.add('time-tracker')

  const label = document.createElement('label')
  label.setAttribute('for', 'time-tracker-days')
  label.textContent = 'Day '

  const days = document.createElement('input')
  days.type = 'number'
  days.id = 'time-tracker-days'
  days.size = 4
  days.value = _reminders.currentDay.toString()
  days.addEventListener('change', () => {
    let day = Number(days.value)
    if (day <= 1) {
      day = 1
      days.value = '1'
    }

    void _reminders.changeDay(day)
  })

  const reminderButton = document.createElement('button')
  reminderButton.classList.add('reminders-toggle')
  reminderButton.addEventListener('click', (event) => {
    event.stopImmediatePropagation()
    _popup.toggle()
  })

  timeTracker.appendChild(label)
  timeTracker.appendChild(days)
  timeTracker.appendChild(reminderButton)
  _popup.append(timeTracker)

  return timeTracker
}

void run()
