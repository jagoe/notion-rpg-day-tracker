import {FlashMessageService} from './components/flashMessageService'
import {TimeTracker} from './components/timeTracker'
import {Reminders} from './reminders'
import {getCurrentWorkspace} from './util/getCurrentWorkspace'
import {waitFor} from './util/waitFor'

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')
  let currentWorkspace = await getCurrentWorkspace()

  const reminders = new Reminders(currentWorkspace)
  const timeTracker = new TimeTracker(reminders)

  reminders.on('reminder', (reminder) => {
    FlashMessageService.info(`Day ${reminder.day}: ${reminder.text}`, {persist: true})
  })

  setInterval(() => {
    void getCurrentWorkspace().then((workspace) => {
      if (workspace === currentWorkspace) return

      currentWorkspace = workspace
      void reminders.changeWorkspace(workspace)
    })
  }, 500)

  timeTracker.prepend(topBarRightContainer)
}

void run()
