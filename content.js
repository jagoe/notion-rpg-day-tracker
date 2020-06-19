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
  reminderButton.addEventListener('click', createReminderPopup)

  timeTracker.appendChild(label)
  timeTracker.appendChild(days)
  timeTracker.appendChild(reminderButton)

  return timeTracker
}

// TODO: add popup where reminders can be added (either als text or with a day input field [N for abs or +N for rel])
function createReminderPopup() {}

const relativeReminderPattern = /(?:in (?:(\d+) days|(1) day)|(\d+) Tage später|nach (\d+) Tagen|in (\d+) Tagen)/i
const absoluteReminderPattern = /(?:Tag (\d+)|day (\d+)|on (?:day (\d+)|the (\d+). day)|am (\d+). Tag|an Tag (\d+))/i
// TODO: separate extraction & adding → addReminder(day, text) just adds the reminder
async function addReminder(text) {
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

  if (!day) {
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
