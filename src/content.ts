import {Reminder, ReminderEvents, Reminders} from './reminders'

const _reminders = new Reminders()

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')

  await _reminders.initialized
  setupEventListeners()

  topBarRightContainer.prepend(createTimeTracker())
}

function setupEventListeners() {
  _reminders.on(ReminderEvents.add, () => {
    renderReminders()
  })
  _reminders.on(ReminderEvents.remove, () => {
    renderReminders()
  })
  _reminders.on(ReminderEvents.reminder, (event) => {
    alert(`Day ${event.reminder.day}: ${event.reminder.text}`) // TODO: display properly as a toast or whatever
    renderReminders()
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
  reminderButton.addEventListener('click', toggleReminderPopup)

  timeTracker.appendChild(label)
  timeTracker.appendChild(days)
  timeTracker.appendChild(reminderButton)
  timeTracker.appendChild(createReminderPopup())

  return timeTracker
}

function createReminderPopup() {
  const popup = document.createElement('div')
  popup.classList.add('reminder-popup')

  const dayInput = document.createElement('input')
  dayInput.classList.add('new-reminder-day')
  dayInput.placeholder = 'Day'
  const textInput = document.createElement('input')
  textInput.classList.add('new-reminder-text')
  textInput.placeholder = 'New Reminder'

  const addButton = document.createElement('button')
  addButton.classList.add('add-reminder')
  addButton.textContent = '+'
  addButton.addEventListener('click', () => {
    const day = dayInput.value
    const text = textInput.value

    _reminders
      .add(day, text)
      .then(() => {
        dayInput.value = ''
        textInput.value = ''
      })
      .catch((error: Error) => {
        alert(error.message) // TODO: flash message
      })
  })

  const reminders = document.createElement('table')
  reminders.classList.add('reminders')
  renderReminders(reminders)

  popup.appendChild(dayInput)
  popup.appendChild(textInput)
  popup.appendChild(addButton)
  popup.appendChild(reminders)

  return popup
}

function renderReminders(table?: HTMLTableElement) {
  if (!table) {
    table = document.querySelector('table.reminders') as HTMLTableElement
  }
  table.innerHTML = ''

  for (const reminder of _reminders.openReminders) {
    table.appendChild(renderReminder(reminder))
  }
}

function renderReminder(reminder: Reminder) {
  const reminderRow = document.createElement('tr')

  const reminderDay = document.createElement('td')
  reminderDay.textContent = reminder.day.toString()

  const reminderText = document.createElement('td')
  reminderText.textContent = reminder.text

  const reminderActions = document.createElement('td')
  const deleteReminder = document.createElement('button')
  deleteReminder.textContent = '-'
  deleteReminder.addEventListener('click', function () {
    void _reminders.remove(reminder)
  })
  reminderActions.appendChild(deleteReminder)

  reminderRow.appendChild(reminderDay)
  reminderRow.appendChild(reminderText)
  reminderRow.appendChild(reminderActions)

  return reminderRow
}

function toggleReminderPopup(event: Event) {
  event.stopImmediatePropagation()

  const popup = document.querySelector('.reminder-popup')!
  if (popup.classList.contains('show')) {
    hideReminderPopup()
  } else {
    showReminderPopup()
  }
}

function showReminderPopup() {
  const popup = document.querySelector('.reminder-popup')!
  popup.classList.add('show')

  const overlay = document.createElement('div')
  overlay.id = 'overlay'
  overlay.style.position = 'fixed'
  overlay.style.left = '0'
  overlay.style.top = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.addEventListener('click', hideReminderPopup)
  popup.parentElement!.prepend(overlay)
}

function hideReminderPopup() {
  document.querySelector('.reminder-popup')!.classList.remove('show')
  document.getElementById('overlay')!.remove() // TODO: only remove if it exists
}

void run()
