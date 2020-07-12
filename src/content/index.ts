import {FlashMessageService} from './components/flashMessageService'
import {TimeTracker} from './components/timeTracker'
import {Reminders} from './reminders'
import {getCurrentWorkspace} from './util/getCurrentWorkspace'
import {waitFor} from './util/waitFor'

function run() {
  let currentWorkspace: string
  let reminders: Reminders

  setInterval(() => {
    void getCurrentWorkspace().then(async (workspace) => {
      if (workspace === currentWorkspace) return
      currentWorkspace = workspace

      if (reminders) {
        await reminders.changeWorkspace(workspace)
      }

      if (!document.querySelector('.time-tracker')) {
        reminders = await init(workspace, reminders)
      }
    })
  }, 500)
}

async function init(workspace: string, reminders?: Reminders) {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')
  if (!reminders) {
    reminders = new Reminders(workspace)
    reminders.on('reminder', (reminder) => {
      FlashMessageService.info(`Day ${reminder.day}: ${reminder.text}`, {persist: true})
    })
  }
  const timeTracker = new TimeTracker(reminders)

  timeTracker.prepend(topBarRightContainer)

  return reminders
}

void run()
