import React, { useReducer, type ReactNode } from "react"
import { AppContext, type AppState, type AppAction } from "./AppContext"

const initialState: AppState = {
  user: {
    id: localStorage.getItem("slack_user_id") || null,
    teamId: localStorage.getItem("slack_team_id") || null,
    isConnected: false,
  },
  channels: [],
  scheduledMessages: [],
  loading: {
    auth: false,
    channels: false,
    messages: false,
    sending: false,
  },
  error: null,
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_USER":
      localStorage.setItem("slack_user_id", action.payload.id)
      localStorage.setItem("slack_team_id", action.payload.teamId)
      return {
        ...state,
        user: action.payload,
      }
    case "SET_AUTH_STATUS":
      return {
        ...state,
        user: {
          ...state.user,
          isConnected: action.payload.connected,
        },
      }
    case "SET_CHANNELS":
      return {
        ...state,
        channels: action.payload,
      }
    case "SET_SCHEDULED_MESSAGES":
      return {
        ...state,
        scheduledMessages: action.payload,
      }
    case "ADD_SCHEDULED_MESSAGE":
      return {
        ...state,
        scheduledMessages: [...state.scheduledMessages, action.payload],
      }
    case "REMOVE_SCHEDULED_MESSAGE":
      return {
        ...state,
        scheduledMessages: state.scheduledMessages.filter(
          (msg) => msg._id !== action.payload
        ),
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }
    case "LOGOUT":
      localStorage.removeItem("slack_user_id")
      localStorage.removeItem("slack_team_id")
      return {
        ...initialState,
        user: {
          id: null,
          teamId: null,
          isConnected: false,
        },
      }
    default:
      return state
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
