import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDatabase } from "./config/database"
import { SchedulerService } from "./services/schedulerService"
import authRoutes from "./routes/auth"
import channelRoutes from "./routes/channels"
import messageRoutes from "./routes/messages"

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
)
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "slack-connect-server", ts: Date.now() })
})

app.use("/api/auth", authRoutes)
app.use("/api/channels", channelRoutes)
app.use("/api/messages", messageRoutes)

const PORT = process.env.PORT || 4000

const startServer = async () => {
  try {
    await connectDatabase()

    const scheduler = SchedulerService.getInstance()
    await scheduler.initialize()

    app.listen(PORT, () => {
      console.log(
        `🚀 Slack Connect API running on http://localhost:${PORT}`
      )
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
