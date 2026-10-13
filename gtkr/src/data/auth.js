import { reactive } from 'vue'

const AUTH_KEY = 'gtkr_auth'
const USER_KEY = 'gtkr_auth_user'

export const auth = reactive({
  loggedIn: localStorage.getItem(AUTH_KEY) === '1',
  user: localStorage.getItem(USER_KEY) || '',
})

export function login(identity) {
  auth.loggedIn = true
  auth.user = identity
  localStorage.setItem(AUTH_KEY, '1')
  localStorage.setItem(USER_KEY, identity)
}

export function logout() {
  auth.loggedIn = false
  auth.user = ''
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
}
