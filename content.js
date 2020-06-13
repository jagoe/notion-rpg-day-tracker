async function run() {
  const topBarRightContainer = await waitFor(
    '.notion-topbar > div > div:last-of-type',
  )

  const day = await new Promise((resolve) =>
    chrome.storage.sync.get(['day'], ({day}) => resolve(day)),
  )

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

    changeIngameDay(day)
  })

  timeTracker.appendChild(label)
  timeTracker.appendChild(days)

  return timeTracker
}

async function changeIngameDay(day) {
  return new Promise((resolve) => chrome.storage.sync.set({day}, resolve))
}

run()
