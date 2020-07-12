import * as backend from '../../util/backend'
import {KeyCode} from '../util/keyCode'
import {Popup} from './popup'
import {FlashMessageService} from './flashMessageService'

export class AuthPopup extends Popup {
  private _emailInput: HTMLInputElement
  private _passwordInput: HTMLInputElement
  private _passwordConfirmationInput: HTMLInputElement
  private _submitButton: HTMLButtonElement
  private _toggleLink: HTMLAnchorElement
  private _form: HTMLFormElement

  private _mode: 'login' | 'register' = 'login'

  public constructor() {
    super('auth')

    this._form = this._buildForm()
    this._emailInput = this._buildEmailInput()
    this._passwordInput = this._buildPassInput()
    this._passwordConfirmationInput = this._buildPassConfirmationInput()
    this._submitButton = this._buildSubmitButton()
    this._toggleLink = this._buildToggleLink()

    this._form.appendChild(this._emailInput)
    this._form.appendChild(this._passwordInput)
    this._form.appendChild(this._passwordConfirmationInput)
    this._form.appendChild(this._submitButton)
    this._form.appendChild(this._toggleLink)

    this._addChildren(this._form)

    this._popup.addEventListener('keypress', (event) => {
      if (event.keyCode !== KeyCode.Enter) return

      this._submitButton.click()
    })
  }

  private _buildForm() {
    const form = document.createElement('form')
    form.addEventListener('submit', (event) => event.preventDefault())

    return form
  }

  private _buildEmailInput() {
    const input = document.createElement('input')
    input.type = 'email'
    input.placeholder = 'Email'
    input.autocomplete = 'true'

    return input
  }

  private _buildPassInput() {
    const input = document.createElement('input')
    input.type = 'password'
    input.placeholder = 'Password'
    input.autocomplete = 'true'

    return input
  }

  private _buildPassConfirmationInput() {
    const input = document.createElement('input')
    input.type = 'password'
    input.placeholder = 'Confirm password'
    input.autocomplete = 'true'
    input.classList.add('hidden')

    return input
  }

  private _buildSubmitButton() {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Login'

    button.addEventListener('click', (event) => {
      event.preventDefault()

      if (this._mode === 'login') {
        void this._login()
      } else {
        void this._register()
      }
    })

    return button
  }

  private _buildToggleLink() {
    const anchor = document.createElement('a')
    anchor.href = '#'
    anchor.textContent = 'Register'

    anchor.addEventListener('click', (event) => {
      event.preventDefault()

      if (this._mode === 'login') {
        this._mode = 'register'
        this._submitButton.textContent = 'Register'
        this._passwordConfirmationInput.classList.remove('hidden')
        anchor.textContent = 'Login'
      } else {
        this._mode = 'login'
        this._submitButton.textContent = 'Login'
        this._passwordConfirmationInput.classList.add('hidden')
        anchor.textContent = 'Register'
      }
    })

    return anchor
  }

  private static EMAIL_PATTERN = /.*?@.*?\..*?/
  private async _register() {
    const email = this._emailInput.value
    const password = this._passwordInput.value
    const passwordConfirmation = this._passwordConfirmationInput.value

    if (!AuthPopup.EMAIL_PATTERN.test(email)) {
      FlashMessageService.error('Please enter a valid email address')
      return
    }

    if (password !== passwordConfirmation) {
      FlashMessageService.error('The passwords do not match')
      return
    }

    if (password.length < 6) {
      FlashMessageService.error('Passwords should be at least 6 characters')
      return
    }

    await backend.register(email, password).catch(this._handleError)
    this.hide()
  }

  private async _login() {
    const email = this._emailInput.value
    const password = this._passwordInput.value

    await backend.login(email, password).catch(this._handleError)
    this.hide()
  }

  private _handleError(error: {message: string; code: string}) {
    switch (error.code) {
      case 'auth/invalid-email':
        FlashMessageService.error('Please enter a valid email address')
        break
      case 'auth/user-not-found':
        FlashMessageService.error('That user does not exist')
        break
      case 'auth/wrong-password':
        FlashMessageService.error('Please enter the correct password')
        break
      case 'auth/weak-password':
        FlashMessageService.error('Passwords should be at least 6 characters')
        break
      case 'auth/email-already-in-use':
        FlashMessageService.error('An account with that email already exists')
        break
      default:
        console.warn(`Unknown error: ${error.message} (${error.code})`)
        break
    }
  }
}
