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

    // Validate userId format (Slack user IDs typically start with U)
    if (!userId.match(/^U[A-Z0-9]+$/)) {
      console.error(`❌ Invalid user ID format: ${userId}`)
      return res.status(400).json({ error: "Invalid user ID format" })
    }

    let accessToken: string
    try {
      accessToken = await SlackService.getValidAccessToken(userId)
      console.log(`✅ Got access token for user ${userId}`)
    } catch (tokenError: any) {
      console.error(
        `❌ Token error for user ${userId}:`,
        tokenError.message
      )

      if (tokenError.message === "TOKEN_EXPIRED") {
        return res.status(401).json({
          error: "Token expired",
          message: "Please reconnect your Slack account",
        })
      }

      if (tokenError.message === "User not found") {
        return res.status(404).json({
          error: "User not found",
          message: "Please reconnect to Slack.",
        })
      }

      if (tokenError.message === "No access token available") {
        return res.status(401).json({
          error: "No access token",
          message: "Please reconnect your Slack account",
        })
      }

      // Database or other errors
      console.error(
        `❌ Unexpected token error for user ${userId}:`,
        tokenError
      )
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve access token",
      })
    }

    let channels: any[]
    try {
      channels = await SlackService.getChannels(accessToken)
      console.log(
        `✅ Fetched ${channels.length} channels for user ${userId}`
      )
    } catch (channelsError: any) {
      console.error(
        `❌ Channels fetch error for user ${userId}:`,
        channelsError.message
      )

      if (channelsError.message === "TOKEN_EXPIRED") {
        return res.status(401).json({
          error: "Token expired",
          message: "Please reconnect your Slack account",
        })
      }

      if (channelsError.message.includes("timeout")) {
        return res.status(408).json({
          error: "Request timeout",
          message:
            "Slack API is taking too long to respond. Please try again.",
        })
      }

      // Other Slack API errors
      return res.status(502).json({
        error: "Slack API error",
        message: `Failed to fetch channels: ${channelsError.message}`,
      })
    }

    res.json({ channels })
  } catch (error: any) {
    console.error(
      `❌ Unexpected error in channels route for user ${req.params.userId}:`,
      error
    )
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while fetching channels",
    })
  }
})

export default router
