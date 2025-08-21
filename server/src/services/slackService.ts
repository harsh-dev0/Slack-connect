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
  token_type: string
  scope: string
  bot_user_id?: string
  app_id: string
  refresh_token?: string
  expires_in?: number
  team: {
    id: string
    name: string
  }
  authed_user: {
    id: string
    scope?: string
    access_token?: string
    token_type?: string
    refresh_token?: string
    expires_in?: number
  }
  enterprise?: any
  is_enterprise_install: boolean
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
      console.log(
        `🔍 Fetching channels from Slack API with token: ${accessToken.substring(
          0,
          10
        )}...`
      )

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

      console.log(`📡 Slack API response status: ${response.status}`)
      console.log(`📡 Slack API response ok: ${response.data.ok}`)

      if (!response.data.ok) {
        console.error(`❌ Slack API error: ${response.data.error}`)
        if (response.data.error === "token_expired") {
          throw new Error("TOKEN_EXPIRED")
        }
        throw new Error(`Slack API error: ${response.data.error}`)
      }

      const channels = response.data.channels || []
      console.log(
        `✅ Successfully fetched ${channels.length} channels from Slack`
      )

      return channels
    } catch (error: any) {
      console.error(
        `❌ Error fetching channels from Slack:`,
        error.response?.data || error.message
      )

      if (error.message === "TOKEN_EXPIRED") {
        throw error
      }

      if (error.response?.status === 401) {
        throw new Error("TOKEN_EXPIRED")
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
    console.log(`🔍 Looking up user: ${userId}`)

    const user = await User.findOne({ slackUserId: userId })
    if (!user) {
      console.error(`❌ User not found in database: ${userId}`)
      throw new Error("User not found")
    }

    console.log(
      `✅ Found user: ${userId}, token expires: ${user.tokenExpiresAt}`
    )

    if (user.tokenExpiresAt && user.tokenExpiresAt <= new Date()) {
      console.log(
        `⏰ Token expired for user ${userId}, attempting refresh`
      )

      if (!user.refreshToken) {
        console.error(`❌ No refresh token available for user ${userId}`)
        throw new Error("Token expired and no refresh token available")
      }

      try {
        const tokenData = await this.refreshAccessToken(user.refreshToken)
        console.log(`✅ Successfully refreshed token for user ${userId}`)

        user.accessToken = tokenData.access_token
        if (tokenData.refresh_token) {
          user.refreshToken = tokenData.refresh_token
        }
        if (tokenData.expires_in) {
          user.tokenExpiresAt = new Date(
            Date.now() + tokenData.expires_in * 1000
          )
        }
        if (tokenData.authed_user?.access_token) {
          user.userToken = tokenData.authed_user.access_token
        }

        await user.save()
      } catch (error) {
        console.error(
          `❌ Failed to refresh token for user ${userId}:`,
          error
        )
        throw new Error("Failed to refresh access token")
      }
    }

    console.log(`✅ Returning valid access token for user ${userId}`)
    return user.accessToken
  }

  static async getUserToken(userId: string): Promise<string> {
    const user = await User.findOne({ slackUserId: userId })
    if (!user) {
      throw new Error("User not found")
    }

    if (user.userToken) {
      return user.userToken
    }

    return user.accessToken
  }
}
