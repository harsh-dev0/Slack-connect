import React, { useEffect } from "react"
import { useApp } from "../context/useApp"
import { messagesApi } from "../services/api"
import { format, formatDistanceToNow } from "date-fns"

const ScheduledMessages: React.FC = () => {
  const { state, dispatch } = useApp()

  useEffect(() => {
    const loadScheduledMessages = async () => {
      if (!state.user.id || !state.user.isConnected) return

      dispatch({
        type: "SET_LOADING",
        payload: { key: "messages", value: true },
      })
      try {
        const { messages } = await messagesApi.getScheduledMessages(
          state.user.id
        )
        dispatch({ type: "SET_SCHEDULED_MESSAGES", payload: messages })
      } catch (error) {
        console.error("Failed to load scheduled messages:", error)
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to load scheduled messages",
        })
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "messages", value: false },
        })
      }
    }

    loadScheduledMessages()
  }, [state.user.id, state.user.isConnected, dispatch])

  const handleCancelMessage = async (messageId: string) => {
    try {
      await messagesApi.cancelScheduledMessage(messageId)
      dispatch({ type: "REMOVE_SCHEDULED_MESSAGE", payload: messageId })
    } catch (error) {
      console.error("Failed to cancel message:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to cancel message" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900 text-yellow-300 border-yellow-700"
      case "sent":
        return "bg-green-900 text-green-300 border-green-700"
      case "failed":
        return "bg-red-900 text-red-300 border-red-700"
      case "cancelled":
        return "bg-gray-800 text-gray-300 border-gray-600"
      default:
        return "bg-gray-800 text-gray-300 border-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "sent":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      case "failed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      case "cancelled":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
        )
      default:
        return null
    }
  }

  if (!state.user.isConnected) {
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Scheduled Messages
      </h2>

      {state.loading.messages ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-300">Loading messages...</span>
        </div>
      ) : state.scheduledMessages.length === 0 ? (
        <div className="text-center py-8">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">
            No scheduled messages
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            Schedule a message using the composer above to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.scheduledMessages.map((message) => (
            <div
              key={message._id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-white">
                      #{message.channelName}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {getStatusIcon(message.status)}
                      <span className="ml-1 capitalize">
                        {message.status}
                      </span>
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {message.message}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>
                      Scheduled:{" "}
                      {format(
                        new Date(message.scheduledFor),
                        "MMM d, yyyy h:mm a"
                      )}
                    </span>
                    {message.status === "pending" && (
                      <span>
                        (
                        {formatDistanceToNow(
                          new Date(message.scheduledFor),
                          { addSuffix: true }
                        )}
                        )
                      </span>
                    )}
                    {message.sentAt && (
                      <span>
                        Sent:{" "}
                        {format(
                          new Date(message.sentAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </span>
                    )}
                  </div>

                  {message.error && (
                    <p className="text-xs text-red-400 mt-1">
                      Error: {message.error}
                    </p>
                  )}
                </div>

                {message.status === "pending" && (
                  <button
                    onClick={() => handleCancelMessage(message._id)}
                    className="ml-4 text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScheduledMessages
