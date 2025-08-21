import React, { useEffect } from "react"
import { useApp } from "../context/useApp"
import { authApi } from "../services/api"

const AuthConnect: React.FC = () => {
  const { state, dispatch } = useApp()

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!state.user.id) return

      dispatch({
        type: "SET_LOADING",
        payload: { key: "auth", value: true },
      })
      try {
        const authStatus = await authApi.getAuthStatus(state.user.id)
        dispatch({ type: "SET_AUTH_STATUS", payload: authStatus })
      } catch (error) {
        console.error("Failed to check auth status:", error)
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "auth", value: false },
        })
      }
    }

    checkAuthStatus()
  }, [state.user.id, dispatch])

  const handleConnect = async () => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "auth", value: true },
      })
      const { authUrl } = await authApi.getSlackAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Failed to get auth URL:", error)
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to connect to Slack",
      })
      dispatch({
        type: "SET_LOADING",
        payload: { key: "auth", value: false },
      })
    }
  }

  const handleDisconnect = () => {
    dispatch({ type: "LOGOUT" })
  }

  if (state.loading.auth) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-300">Checking connection...</span>
      </div>
    )
  }

  if (state.user.isConnected) {
    return (
      <div className="bg-green-900 border border-green-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-300">
                Connected to Slack
              </h3>
              <p className="text-sm text-green-400">
                Your workspace is connected and ready to use
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-white">
          Connect to Slack
        </h3>
        <p className="mt-1 text-sm text-gray-300">
          Connect your Slack workspace to start sending messages
        </p>
        <div className="mt-6">
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.12h2.52v2.522a2.528 2.528 0 0 1-2.52 2.523Zm0 0a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165v-6.734a2.528 2.528 0 0 1 2.522-2.523 2.528 2.528 0 0 1 2.52 2.523v6.734Z" />
              <path d="M8.847 15.165a2.528 2.528 0 0 1 2.523-2.523 2.528 2.528 0 0 1 2.52 2.523v2.522a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.523-2.523v-2.522Zm6.734 0a2.528 2.528 0 0 1 2.523-2.523A2.528 2.528 0 0 1 20.627 15.165a2.528 2.528 0 0 1-2.523 2.523h-2.523v-2.523Z" />
              <path d="M18.104 8.431a2.528 2.528 0 0 1 2.523 2.523 2.528 2.528 0 0 1-2.523 2.52h-2.523V10.954a2.528 2.528 0 0 1 2.523-2.523Zm0 0a2.528 2.528 0 0 1 2.523-2.52A2.528 2.528 0 0 1 23.15 8.431a2.528 2.528 0 0 1-2.523 2.52h-6.734a2.528 2.528 0 0 1-2.52-2.52 2.528 2.528 0 0 1 2.52-2.523h6.734Z" />
              <path d="M8.847 8.431A2.528 2.528 0 0 1 11.37 5.908a2.528 2.528 0 0 1 2.52 2.523v2.52a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.523-2.523V8.431Zm0-6.734A2.528 2.528 0 0 1 11.37 4.22a2.528 2.528 0 0 1 2.52-2.523A2.528 2.528 0 0 1 16.413 4.22a2.528 2.528 0 0 1-2.523 2.523v6.734a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.523-2.523V1.697Z" />
            </svg>
            Connect to Slack
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthConnect
