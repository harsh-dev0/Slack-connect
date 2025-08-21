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

router.get("/debug/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`🔍 DEBUG: Testing channel fetch for user: ${userId}`)

    // Step 1: Check if user exists
    const User = require("../models/User").User
    const user = await User.findOne({ slackUserId: userId })
    if (!user) {
      return res.json({
        step: "user_lookup",
        success: false,
        error: "User not found",
        userId,
      })
    }

    console.log(`✅ DEBUG: User found: ${userId}`)
    console.log(`✅ DEBUG: User has token: ${!!user.accessToken}`)
    console.log(`✅ DEBUG: Token expires: ${user.tokenExpiresAt}`)

    // Step 2: Test token retrieval
    let accessToken
    try {
      accessToken = await SlackService.getValidAccessToken(userId)
      console.log(
        `✅ DEBUG: Got access token: ${accessToken.substring(0, 10)}...`
      )
    } catch (tokenError) {
      return res.json({
        step: "token_retrieval",
        success: false,
        error: tokenError.message,
        userId,
      })
    }

    // Step 3: Test Slack API call
    try {
      const channels = await SlackService.getChannels(accessToken)
      console.log(
        `✅ DEBUG: Successfully fetched ${channels.length} channels`
      )

      return res.json({
        step: "complete",
        success: true,
        channelCount: channels.length,
        channels: channels.slice(0, 3), // First 3 channels for testing
        userId,
      })
    } catch (slackError) {
      return res.json({
        step: "slack_api",
        success: false,
        error: slackError.message,
        userId,
      })
    }
  } catch (error: any) {
    console.error(
      `❌ DEBUG: Unexpected error for user ${req.params.userId}:`,
      error
    )
    res.json({
      step: "unexpected_error",
      success: false,
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
    })
  }
})

export default router
