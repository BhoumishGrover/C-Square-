const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  if (typeof window !== 'undefined') {
    const port = import.meta.env.VITE_API_PORT || '5050'
    return `${window.location.protocol}//${window.location.hostname}:${port}/api`
  }

  return 'http://localhost:5050/api'
}

const API_BASE_URL = resolveApiBaseUrl()

const resolveAuthBaseUrl = () => {
  if (import.meta.env.VITE_AUTH_BASE_URL) {
    return import.meta.env.VITE_AUTH_BASE_URL
  }
  if (API_BASE_URL.endsWith('/api')) {
    return `${API_BASE_URL.slice(0, -4)}/auth`
  }
  return `${API_BASE_URL}/auth`
}

const AUTH_BASE_URL = resolveAuthBaseUrl()

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (data?.error) {
        errorMessage = data.error
      }
    } catch (err) {
      // ignore JSON parse errors and use default message
    }
    throw new Error(errorMessage)
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export const apiRequest = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`
  const init = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  }
  const response = await fetch(url, init)
  return handleResponse(response)
}

export const getApiBaseUrl = () => API_BASE_URL

const authRequest = async (path, options = {}) => {
  const url = `${AUTH_BASE_URL}${path}`
  const init = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  }
  const response = await fetch(url, init)
  return handleResponse(response)
}

export const loginWithEmail = (payload) =>
  authRequest('/login', { method: 'POST', body: JSON.stringify(payload) })

export const registerWithEmail = (payload) =>
  authRequest('/register', { method: 'POST', body: JSON.stringify(payload) })

export const fetchSession = () => authRequest('/session')

export const logout = () => authRequest('/logout', { method: 'POST' })

export const adminRequest = async (path, options = {}) =>
  apiRequest(`/admin${path}`, options)

export const fetchSellerCompanies = () =>
  adminRequest('/companies')

export const fetchCompanyProjects = (companyId) =>
  adminRequest(`/companies/${companyId}/projects`)

export const purchaseProject = (projectId, payload) =>
  apiRequest(`/projects/${projectId}/purchase`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getAuthBaseUrl = () => AUTH_BASE_URL
