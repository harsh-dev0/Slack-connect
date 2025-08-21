import express from "express"
import { SlackService } from "../services/slackService"

const router = express.Router()

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const accessToken = await SlackService.getValidAccessToken(userId)
    const channels = await SlackService.getChannels(accessToken)

    res.json({ channels })
  } catch (error: any) {
    console.error("Get channels error:", error)

    if (error.message === "TOKEN_EXPIRED") {
      return res.status(401).json({ error: "Token expired" })
    }

    res.status(500).json({ error: error.message })
  }
})

export default router
