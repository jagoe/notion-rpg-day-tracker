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
  timeTracker.classList.add('time-tracker')

  const label = document.createElement('label')
  label.setAttribute('for', 'time-tracker-days')
  label.textContent = 'Day '

  const days = document.createElement('input')
  days.type = 'number'
  days.id = 'time-tracker-days'
  days.size = 4
  days.value = _day
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

  const input = document.createElement('input')
  input.classList.add('new-reminder')
  input.placeholder = 'New Reminder'

  const addButton = document.createElement('button')
  addButton.classList.add('add-reminder')
  addButton.textContent = '+'
  addButton.addEventListener('click', () => {
    const text = input.value
    const day = parseReminderText(text)
    if (!day) {
      // TODO: prettier errors
      alert('Could not parse reminder text')
      return
    }

    addReminder(day, text)
    input.value = ''
  })

  const reminders = document.createElement('table')
  reminders.classList.add('reminders')
  renderReminders(reminders)

  popup.appendChild(input)
  popup.appendChild(addButton)
  popup.appendChild(reminders)

  return popup
}

function renderReminders(table) {
  if (!table) {
    table = document.querySelector('table.reminders')
  }
  table.innerHTML = ''

  for (const reminder of _reminders) {
    const reminderRow = document.createElement('tr')

    const reminderDay = document.createElement('td')
    reminderDay.textContent = reminder.day

    const reminderText = document.createElement('td')
    reminderText.textContent = reminder.text

    const reminderActions = document.createElement('td')
    const deleteReminder = document.createElement('button')
    deleteReminder.textContent = '-'
    deleteReminder.addEventListener('click', () => {
      removeReminder(reminder)
    })
    reminderActions.appendChild(deleteReminder)

    reminderRow.appendChild(reminderDay)
    reminderRow.appendChild(reminderText)
    reminderRow.appendChild(reminderActions)

    table.appendChild(reminderRow)
  }
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

const relativeReminderPattern = /(?:in (?:(\d+) days|(1) day)|(\d+) Tage später|nach (\d+) Tagen|in (\d+) Tagen)/i
const absoluteReminderPattern = /(?:Tag (\d+)|day (\d+)|on (?:day (\d+)|the (\d+). day)|am (\d+). Tag|an Tag (\d+))/i
function parseReminderText(text) {
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

function addReminder(day, text) {
  if (!day || day < 0) {
    return
  }

  _reminders.push({day, text})
  _reminders = _reminders.sort((a, b) => a.day - b.day)

  renderReminders()
  saveReminders()
}

function removeReminder(reminder) {
  const index = _reminders.indexOf((r) => r === reminder)

  _reminders.splice(index, 1)

  renderReminders()
  saveReminders()
}

function changeInGameDay(day) {
  _day = Number(day)
  new Promise((resolve) => chrome.storage.sync.set({day}, resolve))

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
  return new Promise((resolve) =>
    chrome.storage.sync.set({reminders: _reminders}, resolve),
  )
}

run()
