import {FlashMessageService} from './components/flashMessageService'
import {TimeTracker} from './components/timeTracker'
import {Reminders} from './reminders'
import {getCurrentWorkspace} from './util/getCurrentWorkspace'
import {waitFor} from './util/waitFor'

async function run() {
  const topBarRightContainer = await waitFor('.notion-topbar > div > div:last-of-type')
  const currentWorkspace = await getCurrentWorkspace()

  const reminders = new Reminders(currentWorkspace)
  const timeTracker = new TimeTracker(reminders)

  reminders.on('reminder', (reminder) => {
    FlashMessageService.info(`Day ${reminder.day}: ${reminder.text}`, {persist: true})
  })

  timeTracker.prepend(topBarRightContainer)
}

void run()
