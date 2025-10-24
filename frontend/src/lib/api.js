const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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
