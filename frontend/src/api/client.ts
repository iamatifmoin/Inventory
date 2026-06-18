import axios from 'axios'

type FastApiValidationItem = {
  msg?: string
}

type FastApiErrorDetail = string | FastApiValidationItem[]

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.'
  }

  const detail = error.response?.data?.detail as FastApiErrorDetail | undefined

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg?.trim())
      .filter((message): message is string => Boolean(message))

    if (messages.length > 0) {
      return messages.join(', ')
    }
  }

  return error.message || 'Request failed.'
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.message = getApiErrorMessage(error)
    return Promise.reject(error)
  },
)
