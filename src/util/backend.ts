import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import {firebaseConfig} from './firebase.config'

firebase.default.initializeApp(firebaseConfig)

let _isLoggedIn: boolean | null = null
firebase.default.auth().onAuthStateChanged((user) => {
  _isLoggedIn = !!user
})

export function isLoggedIn(): boolean | null {
  return _isLoggedIn
}

export function onLogin(fn: (user: firebase.default.User) => void): void {
  firebase.default.auth().onAuthStateChanged((user) => {
    if (!user) return

    fn(user)
  })
}

export function onLogout(fn: () => void): void {
  firebase.default.auth().onAuthStateChanged((user) => {
    if (user) return

    fn()
  })
}

export async function register(email: string, password: string): Promise<void> {
  await firebase.default.auth().createUserWithEmailAndPassword(email, password)
}

export async function login(email: string, password: string): Promise<void> {
  await firebase.default.auth().signInWithEmailAndPassword(email, password)
}

export async function logout(): Promise<void> {
  const currentUser = firebase.default.auth().currentUser
  if (!currentUser) {
    return
  }

  await firebase.default.auth().signOut()
}
