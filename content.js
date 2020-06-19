let _day
let _reminders

async function run() {
  const topBarRightContainer = await waitFor(
    '.notion-topbar > div > div:last-of-type',
  )

  const {day, reminders} = await new Promise((resolve) =>
    chrome.storage.sync.get(['day', 'reminders'], ({day, reminders}) =>
      resolve({day, reminders}),
    ),
  )

  _reminders = reminders || []
  _day = Number(day) || 1

  topBarRightContainer.prepend(createTimeTracker(day || 1))
}

async function waitFor(selector) {
  while (true) {
    const el = document.querySelector(selector)
    if (el) return el

    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

function createTimeTracker(initialDay) {
  const timeTracker = document.createElement('div')
  timeTracker.classList.add('time-tracker')

  const label = document.createElement('label')
  label.setAttribute('for', 'time-tracker-days')
  label.textContent = 'Day '

  const days = document.createElement('input')
  days.type = 'number'
  days.id = 'time-tracker-days'
  days.size = 4
  days.value = initialDay
  days.addEventListener('keydown', ($event) =>
    $event.stopImmediatePropagation(),
  )
  days.addEventListener('change', () => {
    let day = Number(days.value)
    if (day <= 1) {
      day = 1
      days.value = 1
    }

    changeInGameDay(day)
  })

  const reminderButton = document.createElement('button')
  reminderButton.classList.add('add-reminder')
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

  popup.textContent = 'Reminders'

  return popup
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

function showReminderPopup(event) {
  event.stopImmediatePropagation()

  const popup = document.querySelector('.reminder-popup')
  popup.classList.add('show')
  document.addEventListener('click', hideReminderPopup)
}

function hideReminderPopup(event) {
  if (event.target.classList.contains('reminder-popup')) {
    event.stopImmediatePropagation()
    return
  }

  document.querySelector('.reminder-popup').classList.remove('show')
  document.removeEventListener('click', hideReminderPopup)
}

const relativeReminderPattern = /(?:in (?:(\d+) days|(1) day)|(\d+) Tage später|nach (\d+) Tagen|in (\d+) Tagen)/i
const absoluteReminderPattern = /(?:Tag (\d+)|day (\d+)|on (?:day (\d+)|the (\d+). day)|am (\d+). Tag|an Tag (\d+))/i
async function parseReminderText(text) {
  let day
  const relativeMatches = relativeReminderPattern.exec(text)
  const absoluteMatches = absoluteReminderPattern.exec(text)

  if (relativeMatches) {
    for (const match of relativeMatches.slice(1)) {
      if (!match) continue

      day = _day + Number(match)
      break
    }
  } else if (absoluteMatches) {
    for (const match of absoluteMatches.slice(1)) {
      if (!match) continue

      day = Number(match)
      break
    }
  }

  return day
}

async function addReminder(day, text) {
  if (!day || day < 0) {
    return
  }

  _reminders.push({day, text})

  await new Promise((resolve) =>
    chrome.storage.sync.set({reminders: _reminders}, resolve),
  )
}

async function changeInGameDay(day) {
  _day = Number(day)
  await new Promise((resolve) => chrome.storage.sync.set({day}, resolve))

  // TODO: extract handling reminders
  const reminders = _reminders.filter((reminder) => reminder.day === day)
  for (const reminder of reminders) {
    console.log(reminder.text) // TODO: display properly as a toast or whatever
    _reminders.splice(_reminders.indexOf(reminder), 1)
  }
}

async function clearReminders() {
  _reminders = []
  // TODO: refactor saving/loading
  await new Promise((resolve) =>
    chrome.storage.sync.set({reminders: _reminders}, resolve),
  )
}

run()
