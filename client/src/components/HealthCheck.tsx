import { useState, useEffect } from "react"
import api from "../services/api"

const HealthCheck = () => {
  const [status, setStatus] = useState<"checking" | "healthy" | "error">(
    "checking"
  )

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get("/health")
        setStatus("healthy")
      } catch {
        setStatus("error")
      }
    }

    checkHealth()
  }, [])

  if (status === "checking") {
    return (
      <div className="flex items-center text-sm text-gray-400">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
        Connecting...
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center text-sm text-red-400">
        <svg
          className="w-3 h-3 mr-2"
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
        Server offline
      </div>
    )
  }

  return (
    <div className="flex items-center text-sm text-green-400">
      <svg
        className="w-3 h-3 mr-2"
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
      Server Connected
    </div>
  )
}

export default HealthCheck
