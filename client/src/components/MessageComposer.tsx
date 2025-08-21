import React, { useState, useEffect } from "react"
import { useApp } from "../context/useApp"
import { channelsApi, messagesApi, type Channel } from "../services/api"
import { format } from "date-fns"
import toast from "react-hot-toast"

const MessageComposer: React.FC = () => {
  const { state, dispatch } = useApp()
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    null
  )
  const [message, setMessage] = useState("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)

  useEffect(() => {
    const loadChannels = async () => {
      if (!state.user.id || !state.user.isConnected) return

      dispatch({
        type: "SET_LOADING",
        payload: { key: "channels", value: true },
      })
      try {
        const { channels } = await channelsApi.getChannels(state.user.id)
        dispatch({ type: "SET_CHANNELS", payload: channels })
      } catch (error) {
        console.error("Failed to load channels:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load channels" })
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "channels", value: false },
        })
      }
    }

    loadChannels()
  }, [state.user.id, state.user.isConnected, dispatch])

  const handleSendMessage = async () => {
    if (!selectedChannel || !message.trim() || !state.user.id) return

    dispatch({
      type: "SET_LOADING",
      payload: { key: "sending", value: true },
    })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      if (isScheduled) {
        const scheduledDateTime = new Date(
          `${scheduleDate}T${scheduleTime}`
        )
        if (scheduledDateTime <= new Date()) {
          dispatch({
            type: "SET_ERROR",
            payload: "Scheduled time must be in the future",
          })
          return
        }

        await messagesApi.scheduleMessage(
          state.user.id,
          selectedChannel.id,
          selectedChannel.name,
          message,
          scheduledDateTime.toISOString()
        )

        dispatch({ type: "SET_ERROR", payload: null })
        toast.success("Message scheduled successfully!")

        // Refresh scheduled messages list
        try {
          const { messages } = await messagesApi.getScheduledMessages(
            state.user.id
          )
          dispatch({ type: "SET_SCHEDULED_MESSAGES", payload: messages })
        } catch (error) {
          console.error("Failed to refresh scheduled messages:", error)
        }
      } else {
        await messagesApi.sendMessage(
          state.user.id,
          selectedChannel.id,
          message
        )
        toast.success("Message sent successfully!")
      }

      setMessage("")
      setScheduleDate("")
      setScheduleTime("")
      setIsScheduled(false)
    } catch (error: unknown) {
      console.error("Failed to send message:", error)
      dispatch({
        type: "SET_ERROR",
        payload:
          (error as { response?: { data?: { error?: string } } })?.response
            ?.data?.error || "Failed to send message",
      })
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "sending", value: false },
      })
    }
  }

  if (!state.user.isConnected) {
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Compose Message
      </h2>

      {state.loading.channels ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-300">Loading channels...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="channel"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Select Channel
            </label>
            <select
              id="channel"
              value={selectedChannel?.id || ""}
              onChange={(e) => {
                const channel = state.channels.find(
                  (c) => c.id === e.target.value
                )
                setSelectedChannel(channel || null)
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-200 hover:border-gray-500 cursor-pointer"
            >
              <option value="">Choose a channel...</option>
              {state.channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  #{channel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-200 hover:border-gray-500 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="h-5 w-5 text-zinc-600 focus:ring-zinc-500 focus:ring-2 border-gray-600 bg-gray-800 rounded-md transition-all duration-200 cursor-pointer"
            />
            <label
              htmlFor="schedule"
              className="text-sm font-medium text-gray-300"
            >
              Schedule for later
            </label>
          </div>

          {isScheduled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-200 hover:border-gray-500"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-200 hover:border-gray-500"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>
          )}

          {state.error && (
            <div className="bg-red-900 border border-red-700 rounded-md p-3">
              <p className="text-sm text-red-300">{state.error}</p>
            </div>
          )}

          <button
            onClick={handleSendMessage}
            disabled={
              !selectedChannel ||
              !message.trim() ||
              state.loading.sending ||
              (isScheduled && (!scheduleDate || !scheduleTime))
            }
            className="w-full bg-zinc-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {state.loading.sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isScheduled ? "Scheduling..." : "Sending..."}
              </>
            ) : (
              <>
                {isScheduled ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Schedule Message
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Now
                  </>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default MessageComposer
