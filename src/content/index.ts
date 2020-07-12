import {FlashMessageService} from './components/flashMessageService'
import {TimeTracker} from './components/timeTracker'
import {Reminders} from './reminders'
import {getCurrentWorkspace} from './util/getCurrentWorkspace'
import {waitFor} from './util/waitFor'

function run() {
  let currentWorkspace: string

  setInterval(() => {
    void getCurrentWorkspace().then(async (workspace) => {
      if (workspace === currentWorkspace) return
      currentWorkspace = workspace

      await init(workspace)
    })
  }, 500)
}

async function init(workspace: string, reminders?: Reminders) {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')
  reminders = new Reminders(workspace)
  reminders.on('reminder', (reminder) => {
    FlashMessageService.info(`Day ${reminder.day}: ${reminder.text}`, {persist: true})
  })

  const timeTracker = new TimeTracker(reminders)

  const existing = document.querySelector('.time-tracker')
  if (existing) {
    existing.remove()
  }
  timeTracker.prepend(topBarRightContainer)

  return reminders
}

void run()
