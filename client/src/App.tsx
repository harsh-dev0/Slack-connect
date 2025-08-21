import { AppProvider } from "./context/AppProvider"
import AuthConnect from "./components/AuthConnect"
import MessageComposer from "./components/MessageComposer"
import ScheduledMessages from "./components/ScheduledMessages"
import CallbackHandler from "./components/CallbackHandler"
import HealthCheck from "./components/HealthCheck"

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <CallbackHandler />

        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mr-4">
                Slack Connect
              </h1>
              <HealthCheck />
            </div>
            <p className="text-gray-600">
              Send messages immediately or schedule them for later
            </p>
          </div>

          <div className="space-y-6">
            <AuthConnect />
            <MessageComposer />
            <ScheduledMessages />
          </div>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
