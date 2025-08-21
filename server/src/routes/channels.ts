import express from "express"
import { SlackService } from "../services/slackService"

const router = express.Router()

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`🔍 Fetching channels for user: ${userId}`)

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" })
    }

    const accessToken = await SlackService.getValidAccessToken(userId)
    console.log(`✅ Got access token for user ${userId}`)

    const channels = await SlackService.getChannels(accessToken)
    console.log(
      `✅ Fetched ${channels.length} channels for user ${userId}`
    )

    res.json({ channels })
  } catch (error: any) {
    console.error(
      `❌ Get channels error for user ${req.params.userId}:`,
      error
    )

    if (error.message === "TOKEN_EXPIRED") {
      return res.status(401).json({ error: "Token expired" })
    }

    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ error: "User not found. Please reconnect to Slack." })
    }

    res.status(500).json({ error: error.message })
  }
})

export default router
