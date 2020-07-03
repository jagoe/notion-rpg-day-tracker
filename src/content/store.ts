export class Store<T> {
  public constructor(private _workspace: string) {}

  public async load(...keys: Array<keyof T>): Promise<T> {
    const namespacedKeys = keys.map((key) => this._toNamespacedKey(key))

    const namespacedResult = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.sync.get(namespacedKeys, (items) => resolve(items))
    })

    return Object.entries(namespacedResult).reduce(
      (acc, [key, value]) => ({...acc, [this._toPlainKey(key)]: value}),
      {} as T,
    )
  }

  public async save<K extends keyof T>(key: K, data: T[K]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({[this._toNamespacedKey(key)]: data}, resolve)
    })
  }

  private _toNamespacedKey(key: string): string {
    return `${this._workspace}.${key}`
  }

  private _toPlainKey(key: string): string {
    return key.substr(this._workspace.length + 1)
  }
}
