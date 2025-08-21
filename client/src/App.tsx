import { AppProvider } from "./context/AppProvider"
import AuthConnect from "./components/AuthConnect"
import MessageComposer from "./components/MessageComposer"
import ScheduledMessages from "./components/ScheduledMessages"
import CallbackHandler from "./components/CallbackHandler"
import HealthCheck from "./components/HealthCheck"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-black">
        <CallbackHandler />

        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="relative text-center mb-6">
            <h1 className="text-3xl font-bold text-white">
              Slack Connect
            </h1>
            <div className="absolute top-0 right-0">
              <HealthCheck />
            </div>
            <p className="text-gray-300 mt-2">
              Send messages immediately or schedule them for later
            </p>
          </div>

          <div className="space-y-6">
            <AuthConnect />
            <MessageComposer />
            <ScheduledMessages />
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#374151",
              color: "#fff",
              border: "1px solid #4B5563",
            },
            success: {
              style: {
                background: "#065F46",
                border: "1px solid #059669",
              },
            },
            error: {
              style: {
                background: "#7F1D1D",
                border: "1px solid #DC2626",
              },
            },
          }}
        />
      </div>
    </AppProvider>
  )
}

export default App
