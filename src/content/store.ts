import * as firebase from 'firebase/app'
import * as backend from '../util/backend'
import {Reminder} from './models'
import {EventEmitter} from './util/eventEmitter'

interface Workspace extends firebase.firestore.DocumentData {
  day: number
}

interface WorkspaceDocument extends firebase.firestore.DocumentSnapshot<Workspace> {}
interface ReminderDocument extends firebase.firestore.QueryDocumentSnapshot<Reminder> {}

export interface ReminderStoreEvents {
  day: number
  reminders: Array<Reminder>
}

export class ReminderStore extends EventEmitter<ReminderStoreEvents> implements Workspace {
  // TODO: merge Reminders & ReminderStore
  private _userId: string | null = null
  private _db = firebase.firestore()

  public initialized: Promise<void>
  public day = 1
  public reminders: Array<Reminder> = []

  public constructor(private _workspace: string) {
    super()

    this.initialized = new Promise((resolve) => {
      backend.onLogin((user) => {
        this._userId = user.uid
        void this._load().then(resolve)
      })
    })
    backend.onLogout(() => (this._userId = null))
  }

  private get _workspacesPath() {
    if (!this._userId) throw new Error('Not logged in')

    return `users/${this._userId}/workspaces`
  }

  private get _workspacePath() {
    if (!this._userId) throw new Error('Not logged in')

    return `${this._workspacesPath}/${this._workspace}`
  }

  private get _remindersPath() {
    if (!this._userId) throw new Error('Not logged in')

    return `${this._workspacePath}/reminders`
  }

  private async _load(): Promise<void> {
    if (!this._userId) throw new Error('Not logged in')

    await this._initializeWorkspace()
    await this._initializeDay()
    await this._initializeReminders()
  }

  private async _initializeWorkspace() {
    const workspace = await this._db.collection(this._workspacesPath).doc(this._workspace).get()
    if (workspace.exists) return

    await workspace.ref.set({day: 1})
  }

  private async _initializeDay() {
    const setDay = (doc: WorkspaceDocument) => {
      const data = doc.data()
      this.day = data?.day || 1

      this._emit('day', this.day)
    }

    const ref = this._db.doc(`${this._workspacePath}`)
    setDay((await ref.get()) as WorkspaceDocument)

    ref.onSnapshot((snapshot) => setDay(snapshot as WorkspaceDocument))
  }

  private async _initializeReminders() {
    const setReminders = (docs: Array<ReminderDocument>) => {
      this.reminders = docs.map((doc) => {
        return {id: doc.id, ...doc.data()}
      })

      this._emit('reminders', this.reminders)
    }

    const collection = this._db.collection(`${this._remindersPath}`).orderBy('day', 'asc')
    const ref = await collection.get()
    setReminders(ref.docs as Array<ReminderDocument>)

    collection.onSnapshot((snapshot) => setReminders(snapshot.docs as Array<ReminderDocument>))
  }

  public async changeWorkspace(workspace: string): Promise<void> {
    this._workspace = workspace
    await this._load()
  }

  public async setDay(day: number): Promise<void> {
    if (!this._userId) throw new Error('Not logged in')

    await this._db.doc(`${this._workspacePath}`).update('day', day)
  }

  public async addReminder(reminder: Reminder): Promise<void> {
    if (!this._userId) throw new Error('Not logged in')

    await this._db.collection(`${this._remindersPath}`).add(reminder)
  }

  public async removeReminder(reminder: Reminder): Promise<void> {
    if (!this._userId) throw new Error('Not logged in')

    await this._db.doc(`${this._remindersPath}/${reminder.id ?? ''}`).delete()
  }

  public async updateReminder(reminder: Reminder): Promise<void> {
    if (!this._userId) throw new Error('Not logged in')

    await this._db.doc(`${this._remindersPath}/${reminder.id ?? ''}`).update(reminder)
  }
}
