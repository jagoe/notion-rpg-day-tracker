import {TimeTracker} from './components/timeTracker'
import {Reminders} from './reminders'

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')

  const reminders = new Reminders()
  await reminders.initialized
  const timeTracker = new TimeTracker(reminders)

  reminders.on('reminder', (reminder) => {
    alert(`Day ${reminder.day}: ${reminder.text}`) // TODO: use toast or whatever
  })

  timeTracker.prepend(topBarRightContainer)
}

async function waitFor(selector: string): Promise<Element> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const el = document.querySelector(selector)
    if (el) return el

    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

void run()
