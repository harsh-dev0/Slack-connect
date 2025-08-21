import express from "express"
import { SlackService } from "../services/slackService"
import { User } from "../models/User"

const router = express.Router()

router.get("/slack", (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID
  const redirectUri = process.env.SLACK_REDIRECT_URI
  const scopes = "channels:read,chat:write,users:read"

  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .json({ error: "Missing Slack OAuth configuration" })
  }

  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`

  res.json({ authUrl })
})

router.get("/slack/callback", async (req, res) => {
  try {
    const { code } = req.query

    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ error: "Authorization code is required" })
    }

    const tokenData = await SlackService.exchangeCodeForToken(code)

    const existingUser = await User.findOne({
      slackUserId: tokenData.authed_user.id,
    })

    if (existingUser) {
      existingUser.accessToken = tokenData.authed_user.access_token
      existingUser.slackTeamId = tokenData.team.id
      if (tokenData.authed_user.refresh_token) {
        existingUser.refreshToken = tokenData.authed_user.refresh_token
      }
      if (tokenData.authed_user.expires_in) {
        existingUser.tokenExpiresAt = new Date(
          Date.now() + tokenData.authed_user.expires_in * 1000
        )
      }
      await existingUser.save()
    } else {
      const newUser = new User({
        slackUserId: tokenData.authed_user.id,
        slackTeamId: tokenData.team.id,
        accessToken: tokenData.authed_user.access_token,
        refreshToken: tokenData.authed_user.refresh_token,
        tokenExpiresAt: tokenData.authed_user.expires_in
          ? new Date(Date.now() + tokenData.authed_user.expires_in * 1000)
          : undefined,
      })
      await newUser.save()
    }

    res.json({
      success: true,
      userId: tokenData.authed_user.id,
      teamId: tokenData.team.id,
    })
  } catch (error: any) {
    console.error("OAuth callback error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findOne({ slackUserId: userId })

    if (!user) {
      return res.json({ connected: false })
    }

    res.json({
      connected: true,
      teamId: user.slackTeamId,
      tokenExpires: user.tokenExpiresAt,
    })
  } catch (error: any) {
    console.error("Auth status error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
