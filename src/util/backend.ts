import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import {firebaseConfig} from './firebase.config'

firebase.initializeApp(firebaseConfig)

let _isLoggedIn: boolean | null = null
firebase.auth().onAuthStateChanged((user) => {
  _isLoggedIn = !!user
})

export function isLoggedIn(): boolean | null {
  return _isLoggedIn
}

export function onLogin(fn: (user: firebase.User) => void): void {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) return

    fn(user)
  })
}

export function onLogout(fn: () => void): void {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) return

    fn()
  })
}

export async function register(email: string, password: string): Promise<void> {
  await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch((error: {message: string; code: string}) => {
      // TODO: display error
      console.error(`Error registering user '${email}': ${error.message} (${error.code})`)
    })
}

export async function login(email: string, password: string): Promise<void> {
  await firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error: {message: string; code: string}) => {
      // TODO: display error
      console.error(`Error signing in user '${email}': ${error.message} (${error.code})`)
    })
}

export async function logout(): Promise<void> {
  const currentUser = firebase.auth().currentUser
  if (!currentUser) {
    return
  }

  await firebase
    .auth()
    .signOut()
    .catch((error: {message: string; code: string}) => {
      // TODO: display error
      const displayName = currentUser.displayName || ''

      console.error(`Error signing out user '${displayName}': ${error.message} (${error.code})`)
    })
}
