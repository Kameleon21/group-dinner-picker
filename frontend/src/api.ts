export type Option = {
  id: string
  name: string
  link: string
  votes: number
  createdAt: string
}

export type LockState = {
  locked: boolean
  lockedAt?: string | null
}

export type OptionsStats = {
  totalOptions: number
  totalVotes: number
  mostPopularOption?: Option | null
  averageVotes: number
}

export type HealthStatus = {
  status: string
  timestamp: string
  version: string
}

type HttpMethod = 'GET' | 'POST' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
}

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1'

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? DEFAULT_BASE_URL

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const responseText = await response.text()
  const parsed = responseText ? safeParseJson(responseText) : null

  if (!response.ok) {
    const errorMessage = deriveErrorMessage(parsed, response.statusText)
    throw new Error(errorMessage)
  }

  return parsed as T
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Failed to parse JSON response', error)
    return null
  }
}

function deriveErrorMessage(parsed: unknown, fallback: string): string {
  if (!parsed || typeof parsed !== 'object') {
    return fallback || 'Request failed'
  }

  const maybeRecord = parsed as Record<string, unknown>
  const message = typeof maybeRecord.message === 'string' ? maybeRecord.message : undefined
  const violations = Array.isArray(maybeRecord.violations)
    ? maybeRecord.violations
        .map((violation) => {
          if (typeof violation !== 'object' || violation === null) return null
          const violationRecord = violation as Record<string, unknown>
          const field = typeof violationRecord.field === 'string' ? violationRecord.field : null
          const violationMessage =
            typeof violationRecord.message === 'string' ? violationRecord.message : null
          if (!violationMessage) return null
          return field ? `${field}: ${violationMessage}` : violationMessage
        })
        .filter(Boolean)
    : []

  const details = [message, ...violations].filter(Boolean) as string[]

  return details.length > 0 ? details.join(' | ') : fallback || 'Request failed'
}

export async function getOptions(): Promise<Option[]> {
  return request<Option[]>('/options')
}

export async function createOption(name: string, link: string): Promise<Option> {
  return request<Option>('/options', { method: 'POST', body: { name, link } })
}

export async function vote(optionId: string, delta: number): Promise<Option> {
  return request<Option>('/vote', { method: 'POST', body: { optionId, delta } })
}

export async function deleteOption(optionId: string): Promise<void> {
  await request<void>(`/options/${optionId}`, { method: 'DELETE' })
}

export async function getLockState(): Promise<LockState> {
  return request<LockState>('/lock')
}

export async function setLockState(locked: boolean): Promise<LockState> {
  return request<LockState>('/lock', { method: 'POST', body: { locked } })
}

export async function getStats(): Promise<OptionsStats> {
  return request<OptionsStats>('/options/stats')
}

export async function resetSession(): Promise<void> {
  await request<void>('/session/reset', { method: 'POST' })
}

export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health')
}
