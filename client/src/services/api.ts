import axios from "axios"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface Channel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
}

export interface ScheduledMessage {
  _id: string
  userId: string
  channelId: string
  channelName: string
  message: string
  scheduledFor: string
  status: "pending" | "sent" | "cancelled" | "failed"
  createdAt: string
  sentAt?: string
  error?: string
}

export interface AuthStatus {
  connected: boolean
  teamId?: string
  tokenExpires?: string
}

export const authApi = {
  getSlackAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await api.get("/auth/slack")
    return response.data
  },

  handleSlackCallback: async (
    code: string
  ): Promise<{ success: boolean; userId: string; teamId: string }> => {
    const response = await api.post("/auth/slack/callback", { code })
    return response.data
  },

  getAuthStatus: async (userId: string): Promise<AuthStatus> => {
    const response = await api.get(`/auth/status/${userId}`)
    return response.data
  },
}

export const channelsApi = {
  getChannels: async (
    userId: string
  ): Promise<{ channels: Channel[] }> => {
    const response = await api.get(`/channels/${userId}`)
    return response.data
  },
}

export const messagesApi = {
  sendMessage: async (
    userId: string,
    channelId: string,
    message: string
  ): Promise<{ success: boolean }> => {
    const response = await api.post("/messages/send", {
      userId,
      channelId,
      message,
    })
    return response.data
  },

  scheduleMessage: async (
    userId: string,
    channelId: string,
    channelName: string,
    message: string,
    scheduledFor: string
  ): Promise<{ success: boolean; messageId: string }> => {
    const response = await api.post("/messages/schedule", {
      userId,
      channelId,
      channelName,
      message,
      scheduledFor,
    })
    return response.data
  },

  getScheduledMessages: async (
    userId: string
  ): Promise<{ messages: ScheduledMessage[] }> => {
    const response = await api.get(`/messages/scheduled/${userId}`)
    return response.data
  },

  cancelScheduledMessage: async (
    messageId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(`/messages/scheduled/${messageId}`)
    return response.data
  },
}

export default api
