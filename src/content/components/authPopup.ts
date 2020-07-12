import * as backend from '../../util/backend'

// TODO: extract abstract class Popup
export class AuthPopup {
  private _popup: HTMLDivElement
  private _emailInput: HTMLInputElement
  private _passwordInput: HTMLInputElement
  private _passwordConfirmationInput: HTMLInputElement
  private _submitButton: HTMLButtonElement
  private _toggleLink: HTMLAnchorElement
  private _overlay: HTMLDivElement | null = null

  private _mode: 'login' | 'register' = 'login'

  public constructor() {
    this._emailInput = this._buildEmailInput()
    this._passwordInput = this._buildPassInput()
    this._passwordConfirmationInput = this._buildPassConfirmationInput()
    this._submitButton = this._buildSubmitButton()
    this._toggleLink = this._buildToggleLink()
    this._popup = this._buildPopup()
  }

  private _buildPopup() {
    const popup = document.createElement('div')
    popup.classList.add('tt-popup', 'tt-popup-auth')

    popup.appendChild(this._emailInput)
    popup.appendChild(this._passwordInput)
    popup.appendChild(this._passwordConfirmationInput)
    popup.appendChild(this._submitButton)
    popup.appendChild(this._toggleLink)

    return popup
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
        anchor.textContent = 'Register'
      } else {
        this._mode = 'login'
        this._submitButton.textContent = 'Login'
        this._passwordConfirmationInput.classList.add('hidden')
        anchor.textContent = 'Login'
      }
    })

    return anchor
  }

  private _insertOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'overlay'
    overlay.style.position = 'fixed'
    overlay.style.left = '0'
    overlay.style.top = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.addEventListener('click', () => this.hide())
    this._popup.parentElement!.prepend(overlay)

    return overlay
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

  public append(parent: HTMLElement): void {
    parent.appendChild(this._popup)
  }

  public toggle(): void {
    if (this._popup.classList.contains('show')) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    this._popup.classList.add('show')
    this._overlay = this._insertOverlay()
  }

  public hide(): void {
    this._popup.classList.remove('show')
    if (this._overlay) {
      this._overlay.remove()
      this._overlay = null
    }
  }
}
