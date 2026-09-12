export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL ?? 'https://sms-backend-8v7d.onrender.com',
).replace(/\/$/, '')

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(0, '데이터를 불러오지 못했습니다.')
  }

  if (!response.ok) {
    let detail = '데이터를 불러오지 못했습니다.'
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body.detail === 'string' && body.detail.trim()) {
        detail = body.detail
      }
    } catch {
      /* keep default */
    }
    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<T>
}
