export interface SlackTokenResponse {
  ok: boolean
  access_token: string
  refresh_token?: string
  expires_in?: number
  team: {
    id: string
    name: string
  }
  authed_user: {
    id: string
    access_token: string
    refresh_token?: string
    expires_in?: number
  }
  error?: string
}

export interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
  is_archived?: boolean
}

export interface SlackApiResponse<T = any> {
  ok: boolean
  error?: string
  data?: T
}
