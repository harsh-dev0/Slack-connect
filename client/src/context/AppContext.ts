import { createContext, type Dispatch } from "react"
import type {
  Channel,
  ScheduledMessage,
  AuthStatus,
} from "../services/api"

export interface AppState {
  user: {
    id: string | null
    teamId: string | null
    isConnected: boolean
  }
  channels: Channel[]
  scheduledMessages: ScheduledMessage[]
  loading: {
    auth: boolean
    channels: boolean
    messages: boolean
    sending: boolean
  }
  error: string | null
}

export type AppAction =
  | {
      type: "SET_USER"
      payload: { id: string; teamId: string; isConnected: boolean }
    }
  | { type: "SET_AUTH_STATUS"; payload: AuthStatus }
  | { type: "SET_CHANNELS"; payload: Channel[] }
  | { type: "SET_SCHEDULED_MESSAGES"; payload: ScheduledMessage[] }
  | { type: "ADD_SCHEDULED_MESSAGE"; payload: ScheduledMessage }
  | { type: "REMOVE_SCHEDULED_MESSAGE"; payload: string }
  | {
      type: "SET_LOADING"
      payload: { key: keyof AppState["loading"]; value: boolean }
    }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" }

export const AppContext = createContext<{
  state: AppState
  dispatch: Dispatch<AppAction>
} | null>(null)
