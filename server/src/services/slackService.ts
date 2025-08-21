import axios from "axios"
import { User } from "../models/User"

export interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
}

export interface SlackOAuthResponse {
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
}

export class SlackService {
  private static readonly BASE_URL = "https://slack.com/api"

  static async exchangeCodeForToken(
    code: string
  ): Promise<SlackOAuthResponse> {
    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET
    const redirectUri = process.env.SLACK_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Slack OAuth configuration")
    }

    const response = await axios.post(
      `${this.BASE_URL}/oauth.v2.access`,
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    if (!response.data.ok) {
      throw new Error(`Slack OAuth error: ${response.data.error}`)
    }

    return response.data
  }

  static async refreshAccessToken(
    refreshToken: string
  ): Promise<SlackOAuthResponse> {
    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("Missing Slack OAuth configuration")
    }

    const response = await axios.post(
      `${this.BASE_URL}/oauth.v2.access`,
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    if (!response.data.ok) {
      throw new Error(`Slack token refresh error: ${response.data.error}`)
    }

    return response.data
  }

  static async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/conversations.list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            types: "public_channel,private_channel",
            exclude_archived: true,
          },
        }
      )

      if (!response.data.ok) {
        if (response.data.error === "token_expired") {
          throw new Error("TOKEN_EXPIRED")
        }
        throw new Error(`Slack API error: ${response.data.error}`)
      }

      return response.data.channels
    } catch (error: any) {
      if (error.message === "TOKEN_EXPIRED") {
        throw error
      }
      throw new Error(`Failed to fetch channels: ${error.message}`)
    }
  }

  static async sendMessage(
    accessToken: string,
    channelId: string,
    text: string
  ): Promise<void> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/chat.postMessage`,
        {
          channel: channelId,
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.data.ok) {
        if (response.data.error === "token_expired") {
          throw new Error("TOKEN_EXPIRED")
        }
        throw new Error(`Slack API error: ${response.data.error}`)
      }
    } catch (error: any) {
      if (error.message === "TOKEN_EXPIRED") {
        throw error
      }
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  static async getValidAccessToken(userId: string): Promise<string> {
    const user = await User.findOne({ slackUserId: userId })
    if (!user) {
      throw new Error("User not found")
    }

    if (user.tokenExpiresAt && user.tokenExpiresAt <= new Date()) {
      if (!user.refreshToken) {
        throw new Error("Token expired and no refresh token available")
      }

      try {
        const tokenData = await this.refreshAccessToken(user.refreshToken)

        user.accessToken = tokenData.authed_user.access_token
        if (tokenData.authed_user.refresh_token) {
          user.refreshToken = tokenData.authed_user.refresh_token
        }
        if (tokenData.authed_user.expires_in) {
          user.tokenExpiresAt = new Date(
            Date.now() + tokenData.authed_user.expires_in * 1000
          )
        }

        await user.save()
      } catch (error) {
        throw new Error("Failed to refresh access token")
      }
    }

    return user.accessToken
  }
}
