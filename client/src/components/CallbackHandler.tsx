import React, { useEffect } from "react"
import { useApp } from "../context/useApp"
import { authApi } from "../services/api"

const CallbackHandler: React.FC = () => {
  const { dispatch } = useApp()

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get("code")
      const error = urlParams.get("error")
      const success = urlParams.get("success")
      const userId = urlParams.get("userId")
      const teamId = urlParams.get("teamId")

      if (error) {
        dispatch({
          type: "SET_ERROR",
          payload: `Authorization error: ${error}`,
        })
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
        return
      }

      if (success === "true" && userId && teamId) {
        dispatch({
          type: "SET_USER",
          payload: {
            id: userId,
            teamId: teamId,
            isConnected: true,
          },
        })
        dispatch({ type: "SET_ERROR", payload: null })
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
        return
      }

      if (code) {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "auth", value: true },
        })
        try {
          const result = await authApi.handleSlackCallback(code)
          dispatch({
            type: "SET_USER",
            payload: {
              id: result.userId,
              teamId: result.teamId,
              isConnected: true,
            },
          })
          dispatch({ type: "SET_ERROR", payload: null })
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          )
        } catch (error: unknown) {
          console.error("Callback error:", error)
          dispatch({
            type: "SET_ERROR",
            payload:
              (error as { response?: { data?: { error?: string } } })
                ?.response?.data?.error ||
              "Failed to complete authorization",
          })
        } finally {
          dispatch({
            type: "SET_LOADING",
            payload: { key: "auth", value: false },
          })
        }
      }
    }

    handleCallback()
  }, [dispatch])

  return null
}

export default CallbackHandler
