import * as backend from './backend'

function run() {
  setupAuthChanges()
  setupRegistration()
  setupLogin()
  setupLogout()
}

function setupAuthChanges() {
  const anonymousSection = document.getElementById('anonymous-section')!
  const userSection = document.getElementById('user-section')!
  const loading = document.getElementById('loading')!

  backend.onLogin(() => {
    loading.classList.add('hidden')
    anonymousSection.classList.add('hidden')
    userSection.classList.remove('hidden')
  })

  backend.onLogout(() => {
    loading.classList.add('hidden')
    anonymousSection.classList.remove('hidden')
    userSection.classList.add('hidden')
  })
}

function setupRegistration() {
  const registerBtn = document.getElementById('register')!
  const sectionSwitch = document.getElementById('switch-login')!
  const registrationSection = document.getElementById('registration-section')!
  const loginSection = document.getElementById('login-section')!

  registerBtn.addEventListener('click', register)
  sectionSwitch.addEventListener('click', () => {
    registrationSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
  })
}

function setupLogin() {
  const loginBtn = document.getElementById('login')!
  const sectionSwitch = document.getElementById('switch-registration')!
  const registrationSection = document.getElementById('registration-section')!
  const loginSection = document.getElementById('login-section')!

  loginBtn.addEventListener('click', login)
  sectionSwitch.addEventListener('click', () => {
    registrationSection.classList.remove('hidden')
    loginSection.classList.add('hidden')
  })
}

function setupLogout() {
  const logoutBtn = document.getElementById('logout')!

  logoutBtn.addEventListener('click', logout)
}

const EMAIL_PATTERN = /.*?@.*?\..*?/
function register() {
  const email = (document.getElementById('email') as HTMLInputElement).value
  const password = (document.getElementById('password') as HTMLInputElement).value
  const passwordConfirmation = (document.getElementById('password-confirmation') as HTMLInputElement).value

  if (!EMAIL_PATTERN.test(email)) {
    // TODO: display error
    console.error('Not a valid email address')
    return
  }

  if (password !== passwordConfirmation) {
    // TODO: display error
    console.error('Passwords do not match')
    return
  }

  void backend.register(email, password)
}

function login() {
  const email = (document.getElementById('email') as HTMLInputElement).value
  const password = (document.getElementById('password') as HTMLInputElement).value

  void backend.login(email, password)
}

function logout() {
  void backend.logout()
}

run()
