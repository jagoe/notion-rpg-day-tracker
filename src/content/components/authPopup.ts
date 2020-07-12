import * as backend from '../../util/backend'
import {Popup} from './popup'

export class AuthPopup extends Popup {
  private _emailInput: HTMLInputElement
  private _passwordInput: HTMLInputElement
  private _passwordConfirmationInput: HTMLInputElement
  private _submitButton: HTMLButtonElement
  private _toggleLink: HTMLAnchorElement

  private _mode: 'login' | 'register' = 'login'

  public constructor() {
    super('auth')

    this._emailInput = this._buildEmailInput()
    this._passwordInput = this._buildPassInput()
    this._passwordConfirmationInput = this._buildPassConfirmationInput()
    this._submitButton = this._buildSubmitButton()
    this._toggleLink = this._buildToggleLink()

    this._addChildren(
      this._emailInput,
      this._passwordInput,
      this._passwordConfirmationInput,
      this._submitButton,
      this._toggleLink,
    )
  }

  private _buildEmailInput() {
    const input = document.createElement('input')
    input.type = 'email'
    input.placeholder = 'Email'

    return input
  }

  private _buildPassInput() {
    const input = document.createElement('input')
    input.type = 'password'
    input.placeholder = 'Password'

    return input
  }

  private _buildPassConfirmationInput() {
    const input = document.createElement('input')
    input.type = 'password'
    input.placeholder = 'Confirm password'
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
        this._login()
      } else {
        this._register()
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
  private _register() {
    const email = this._emailInput.value
    const password = this._passwordInput.value
    const passwordConfirmation = this._passwordConfirmationInput.value

    if (!AuthPopup.EMAIL_PATTERN.test(email)) {
      // TODO: display error
      console.error('Not a valid email address')
      return
    }

    if (password !== passwordConfirmation) {
      // TODO: display error
      console.error('Passwords do not match')
      return
    }

    void backend.register(email, password).then(() => this.hide())
  }

  private _login() {
    const email = this._emailInput.value
    const password = this._passwordInput.value

    void backend.login(email, password).then(() => this.hide())
  }
}
