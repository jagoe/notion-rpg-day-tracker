// TODO: add events for those two, so storage and updates happen reactively
let _day
let _reminders
const _dayPattern = /^\+?\d+$/

// TODO: split into separate files for storage, logic, presentation, etc.

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')

  const { day, reminders } = await new Promise((resolve) =>
    chrome.storage.sync.get(['day', 'reminders'], ({ day, reminders }) => resolve({ day, reminders })),
  )

  _reminders = (reminders || []).sort((a, b) => a.day - b.day)
  _day = Number(day) || 1

  topBarRightContainer.prepend(createTimeTracker())
}

async function waitFor(selector) {
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
  days.value = _day
  days.addEventListener('change', () => {
    let day = Number(days.value)
    if (day <= 1) {
      day = 1
      days.value = 1
    }

    changeInGameDay(day)
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
    if (!_dayPattern.test(day)) {
      // TODO: add flash message module
      alert('Please provide the day as a number, optionally prefixed with a + sign.')
      return
    }
    if (!text) {
      alert('Please provide a reminder text.')
      return
    }

    if (_reminders.some((reminder) => reminder.day === day && reminder.text === text)) {
      alert('That reminder already exists')
      return
    }

    addReminder(day, text)

    dayInput.value = ''
    textInput.value = ''
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

function renderReminders(table) {
  if (!table) {
    table = document.querySelector('table.reminders')
  }
  table.innerHTML = ''

  for (let i = 0; i < _reminders.length; i++) {
    const reminderRow = renderReminder(_reminders[i])

    table.appendChild(reminderRow)
  }
}

function renderReminder(reminder) {
  const reminderRow = document.createElement('tr')

  const reminderDay = document.createElement('td')
  reminderDay.textContent = reminder.day

  const reminderText = document.createElement('td')
  reminderText.textContent = reminder.text

  const reminderActions = document.createElement('td')
  const deleteReminder = document.createElement('button')
  deleteReminder.textContent = '-'
  deleteReminder.addEventListener('click', function () {
    removeReminder(reminder)
  })
  reminderActions.appendChild(deleteReminder)

  reminderRow.appendChild(reminderDay)
  reminderRow.appendChild(reminderText)
  reminderRow.appendChild(reminderActions)

  return reminderRow
}

function toggleReminderPopup(event) {
  event.stopImmediatePropagation()

  const popup = document.querySelector('.reminder-popup')
  if (popup.classList.contains('show')) {
    hideReminderPopup(event)
  } else {
    showReminderPopup(event)
  }
}

function showReminderPopup() {
  const popup = document.querySelector('.reminder-popup')
  popup.classList.add('show')

  const overlay = document.createElement('div')
  overlay.id = 'overlay'
  overlay.style.position = 'fixed'
  overlay.style.left = 0
  overlay.style.top = 0
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.addEventListener('click', hideReminderPopup)
  popup.parentElement.prepend(overlay)
}

function hideReminderPopup() {
  document.querySelector('.reminder-popup').classList.remove('show')
  document.getElementById('overlay').remove()
}

function addReminder(day, text) {
  if (!_dayPattern.test(day)) {
    return
  }

  if (day.startsWith('+')) {
    day = _day + Number(day.substr(1))
  } else {
    day = Number(day)
  }

  if (_reminders.some((reminder) => reminder.day === day && reminder.text === text)) {
    return
  }

  _reminders.push({ day, text })
  _reminders = _reminders.sort((a, b) => a.day - b.day)

  renderReminders()
  saveReminders()
}

function removeReminder(reminder) {
  const index = _reminders.indexOf(reminder)
  if (index === -1) {
    return
  }

  _reminders.splice(index, 1)

  renderReminders()
  saveReminders()
}

function changeInGameDay(day) {
  _day = Number(day)
  new Promise((resolve) => chrome.storage.sync.set({ day }, resolve))

  checkReminders()
}

function checkReminders(currentDay) {
  const reminders = _reminders.filter((reminder) => reminder.day <= currentDay)

  for (const reminder of reminders) {
    alert(`Day ${reminder.day}: ${reminder.text}`) // TODO: display properly as a toast or whatever
    _reminders.splice(_reminders.indexOf(reminder), 1)
  }

  renderReminders()

  saveReminders()
}

function clearReminders() {
  _reminders = []
  // TODO: refactor saving/loading
  saveReminders()
}

async function saveReminders() {
  return new Promise((resolve) => chrome.storage.sync.set({ reminders: _reminders }, resolve))
}

run()
