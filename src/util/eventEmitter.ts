type EventHandler<T> = (data: T) => void

export abstract class EventEmitter<T> {
  private _events: Record<string, Array<EventHandler<any>>> = {}

  /**
   *
   * @param eventName Name of the event
   * @param fn Event handler
   */
  public on<A extends keyof T>(eventName: A, fn: EventHandler<T[A]>): () => void {
    if (!this._events[eventName]) {
      this._events[eventName] = []
    }

    this._events[eventName].push(fn)

    return () => {
      this.off(eventName, fn)
    }
  }

  public off<A extends keyof T>(eventName: A, fn: EventHandler<T[A]>): void {
    const handlers = this._events[eventName]
    if (!handlers) return

    const listenerIndex = handlers.indexOf(fn)
    if (listenerIndex === -1) return

    handlers.splice(listenerIndex, 1)
  }

  protected _emit<A extends keyof T>(eventName: A, data: T[A]): void {
    const handlers = this._events[eventName]
    if (!handlers) return

    handlers.forEach((listener) => listener.call(null, data))
  }
}
