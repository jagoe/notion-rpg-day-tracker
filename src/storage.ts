export class Store<T> {
  public async load(...keys: Array<keyof T>): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (items) => resolve(items as T))
    })
  }

  public async save<K extends keyof T>(key: K, data: T[K]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({[key]: data}, resolve)
    })
  }
}
