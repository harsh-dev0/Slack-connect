import express from "express"
import { SlackService } from "../services/slackService"
import { ScheduledMessage } from "../models/ScheduledMessage"
import { SchedulerService } from "../services/schedulerService"
import { User } from "../models/User"

const router = express.Router()

router.post("/send", async (req, res) => {
  try {
    const { userId, channelId, message } = req.body

    if (!userId || !channelId || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const accessToken = await SlackService.getValidAccessToken(userId)
    await SlackService.sendMessage(accessToken, channelId, message)

    res.json({ success: true })
  } catch (error: any) {
    console.error("Send message error:", error)

    if (error.message === "TOKEN_EXPIRED") {
      return res.status(401).json({ error: "Token expired" })
    }

    res.status(500).json({ error: error.message })
  }
})

router.post("/schedule", async (req, res) => {
  try {
    const { userId, channelId, channelName, message, scheduledFor } =
      req.body

    if (
      !userId ||
      !channelId ||
      !channelName ||
      !message ||
      !scheduledFor
    ) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return res
        .status(400)
        .json({ error: "Scheduled time must be in the future" })
    }

    const user = await User.findOne({ slackUserId: userId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const scheduledMessage = new ScheduledMessage({
      userId,
      slackTeamId: user.slackTeamId,
      channelId,
      channelName,
      message,
      scheduledFor: scheduledDate,
    })

    await scheduledMessage.save()

    const scheduler = SchedulerService.getInstance()
    scheduler.scheduleMessage(scheduledMessage)

    res.json({
      success: true,
      messageId: scheduledMessage._id,
    })
  } catch (error: any) {
    console.error("Schedule message error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/scheduled/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const scheduledMessages = await ScheduledMessage.find({
      userId,
      status: { $in: ["pending", "sent", "failed"] },
    }).sort({ scheduledFor: 1 })

    res.json({ messages: scheduledMessages })
  } catch (error: any) {
    console.error("Get scheduled messages error:", error)
    res.status(500).json({ error: error.message })
  }
})

router.delete("/scheduled/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params

    const message = await ScheduledMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    if (message.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Can only cancel pending messages" })
    }

    message.status = "cancelled"
    await message.save()

    const scheduler = SchedulerService.getInstance()
    scheduler.cancelScheduledMessage(messageId)

    res.json({ success: true })
  } catch (error: any) {
    console.error("Cancel message error:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
