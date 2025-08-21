import express from "express"
import { SlackService } from "../services/slackService"
import { User } from "../models/User"

const router = express.Router()

router.get("/slack", (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID
  const redirectUri = process.env.SLACK_REDIRECT_URI
  const userScopes = "channels:read,users:read"
  const botScopes = "channels:read,chat:write,users:read"

  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .json({ error: "Missing Slack OAuth configuration" })
  }

  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${botScopes}&user_scope=${userScopes}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`

  res.json({ authUrl })
})

router.get("/slack/callback", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"

  try {
    const { code } = req.query

    if (!code || typeof code !== "string") {
      console.error("No authorization code provided")
      return res.redirect(`${frontendUrl}?error=no_code`)
    }

    const tokenData = await SlackService.exchangeCodeForToken(code)

    if (
      !tokenData.access_token ||
      !tokenData.bot_user_id ||
      !tokenData.team?.id ||
      !tokenData.authed_user?.id
    ) {
      console.error("Invalid token data:", tokenData)
      return res.redirect(`${frontendUrl}?error=invalid_token`)
    }

    const existingUser = await User.findOne({
      slackUserId: tokenData.authed_user.id,
    })

    if (existingUser) {
      existingUser.accessToken = tokenData.access_token
      existingUser.botUserId = tokenData.bot_user_id
      existingUser.slackTeamId = tokenData.team.id
      if (tokenData.authed_user.access_token) {
        existingUser.userToken = tokenData.authed_user.access_token
      }
      if (tokenData.refresh_token) {
        existingUser.refreshToken = tokenData.refresh_token
      }
      if (tokenData.expires_in) {
        existingUser.tokenExpiresAt = new Date(
          Date.now() + tokenData.expires_in * 1000
        )
      }
      await existingUser.save()
    } else {
      const newUser = new User({
        slackUserId: tokenData.authed_user.id,
        slackTeamId: tokenData.team.id,
        accessToken: tokenData.access_token,
        botUserId: tokenData.bot_user_id,
        userToken: tokenData.authed_user.access_token || null,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
      })
      await newUser.save()
    }

    console.log(`✅ OAuth success for user ${tokenData.authed_user.id}`)

    res.redirect(
      `${frontendUrl}?success=true&userId=${tokenData.authed_user.id}&teamId=${tokenData.team.id}`
    )
  } catch (error: any) {
    console.error("OAuth callback error:", error)
    res.redirect(
      `${frontendUrl}?error=oauth_failed&message=${encodeURIComponent(
        error.message
      )}`
    )
  }
})

router.get("/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`🔍 Checking auth status for user: ${userId}`)

    const user = await User.findOne({ slackUserId: userId })

    if (!user) {
      console.log(`❌ User not found in auth status check: ${userId}`)
      return res.json({ connected: false })
    }

    console.log(`✅ User found in auth status check: ${userId}`)
    res.json({
      connected: true,
      teamId: user.slackTeamId,
      botUserId: user.botUserId,
      tokenExpires: user.tokenExpiresAt,
    })
  } catch (error: any) {
    console.error("Auth status error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/debug/users", async (req, res) => {
  try {
    console.log("🔍 Debug endpoint: Fetching all users from database")

    const users = await User.find(
      {},
      { slackUserId: 1, slackTeamId: 1, createdAt: 1, _id: 0 }
    )

    console.log(
      `✅ Debug endpoint: Found ${users.length} users in database`
    )

    res.json({
      count: users.length,
      users: users,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Debug users error:", error)
    res.status(500).json({ error: error.message, stack: error.stack })
  }
})

router.get("/debug/db-health", async (req, res) => {
  try {
    const mongoose = require("mongoose")
    const dbState = mongoose.connection.readyState
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    res.json({
      database: {
        state: states[dbState as keyof typeof states] || "unknown",
        readyState: dbState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ DB health check error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.delete("/debug/cleanup-invalid-users", async (req, res) => {
  try {
    console.log("🧹 Cleaning up users with missing slackUserId")

    const result = await User.deleteMany({
      $or: [
        { slackUserId: { $exists: false } },
        { slackUserId: null },
        { slackUserId: "" },
      ],
    })

    console.log(`✅ Deleted ${result.deletedCount} invalid users`)

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Invalid users cleaned up",
    })
  } catch (error: any) {
    console.error("❌ Cleanup error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
