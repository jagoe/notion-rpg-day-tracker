import {waitFor} from '../util/waitFor'

enum FlashMessageType {
  error = 'error',
  warning = 'warning',
  info = 'info',
}

interface FlashMessageOptions {
  persist?: boolean
  timeout?: number
}

const DEFAULT_OPTIONS: FlashMessageOptions = {persist: false, timeout: 5000}

export class FlashMessageService {
  private static _messageBar = (() => {
    const bar = document.createElement('ul')
    bar.classList.add('time-tracker-message-bar')

    void waitFor('.notion-topbar').then((topbar) => {
      const parent = topbar.parentElement!
      parent.style.position = 'relative'
      parent.appendChild(bar)
    })

    return bar
  })()

  public static error(message: string, options = DEFAULT_OPTIONS): void {
    FlashMessageService._show(FlashMessageType.error, message, options)
  }

  public static warning(message: string, options = DEFAULT_OPTIONS): void {
    FlashMessageService._show(FlashMessageType.warning, message, options)
  }

  public static info(message: string, options = DEFAULT_OPTIONS): void {
    FlashMessageService._show(FlashMessageType.info, message, options)
  }

  private static _show(type: FlashMessageType, message: string, options: FlashMessageOptions) {
    const messageElement = document.createElement('li')
    messageElement.classList.add(type, 'out')
    messageElement.textContent = message
    messageElement.style.zIndex = `${1000 - FlashMessageService._messageBar.childElementCount}`

    const close = () => {
      messageElement.classList.add('out')
      setTimeout(() => {
        messageElement.remove()
      }, 500)
    }

    const closeButton = document.createElement('button')
    closeButton.textContent = '×'
    closeButton.addEventListener('click', () => close())
    messageElement.appendChild(closeButton)

    if (!options.persist) {
      setTimeout(() => close(), options.timeout)
    }

    FlashMessageService._messageBar.appendChild(messageElement)
    setTimeout(() => messageElement.classList.remove('out'), 0)
  }
}
