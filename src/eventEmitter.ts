type EventData = Record<string, unknown>
type EventHandler = (data: EventData) => void

export abstract class EventEmitter {
  private events: Record<string, Array<EventHandler>> = {}

  /**
   *
   * @param eventName Name of the event
   * @param fn Event handler
   */
  public on(eventName: string, fn: EventHandler): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(fn)

    return () => {
      this.off(eventName, fn)
    }
  }

  public off(action: string, fn: EventHandler): void {
    const handlers = this.events[action]
    if (!handlers) return

    const listenerIndex = handlers.indexOf(fn)
    if (listenerIndex === -1) return

    handlers.splice(listenerIndex, 1)
  }

  protected _emit(action: string, data: EventData): void {
    const handlers = this.events[action]
    if (!handlers) return

    handlers.forEach((listener) => listener.call(null, data))
  }
}
