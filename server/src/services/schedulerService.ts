import * as cron from "node-cron"
import { ScheduledMessage } from "../models/ScheduledMessage"
import { SlackService } from "./slackService"

export class SchedulerService {
  private static instance: SchedulerService
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map()

  private constructor() {}

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService()
    }
    return SchedulerService.instance
  }

  async initialize() {
    await this.loadPendingMessages()
    this.startPeriodicCheck()
  }

  private async loadPendingMessages() {
    try {
      const pendingMessages = await ScheduledMessage.find({
        status: "pending",
        scheduledFor: { $gt: new Date() },
      })

      for (const message of pendingMessages) {
        this.scheduleMessage(message)
      }

      console.log(
        `Loaded ${pendingMessages.length} pending scheduled messages`
      )
    } catch (error) {
      console.error("Error loading pending messages:", error)
    }
  }

  private startPeriodicCheck() {
    cron.schedule("*/1 * * * *", async () => {
      try {
        const overdueMessages = await ScheduledMessage.find({
          status: "pending",
          scheduledFor: { $lte: new Date() },
        })

        for (const message of overdueMessages) {
          await this.sendScheduledMessage(message)
        }
      } catch (error) {
        console.error("Error in periodic check:", error)
      }
    })
  }

  scheduleMessage(message: any) {
    const messageId = message._id.toString()

    if (this.scheduledJobs.has(messageId)) {
      this.scheduledJobs.get(messageId)?.destroy()
    }

    const scheduledTime = new Date(message.scheduledFor)
    const now = new Date()

    if (scheduledTime <= now) {
      this.sendScheduledMessage(message)
      return
    }

    const cronExpression = this.createCronExpression(scheduledTime)

    const task = cron.schedule(
      cronExpression,
      async () => {
        await this.sendScheduledMessage(message)
        this.scheduledJobs.delete(messageId)
      },
      {
        timezone: "UTC",
      }
    )

    this.scheduledJobs.set(messageId, task)
  }

  cancelScheduledMessage(messageId: string) {
    if (this.scheduledJobs.has(messageId)) {
      this.scheduledJobs.get(messageId)?.destroy()
      this.scheduledJobs.delete(messageId)
    }
  }

  private async sendScheduledMessage(message: any) {
    try {
      const accessToken = await SlackService.getValidAccessToken(
        message.userId
      )

      await SlackService.sendMessage(
        accessToken,
        message.channelId,
        message.message
      )

      message.status = "sent"
      message.sentAt = new Date()
      await message.save()

      console.log(`Successfully sent scheduled message ${message._id}`)
    } catch (error: any) {
      console.error(
        `Failed to send scheduled message ${message._id}:`,
        error
      )

      message.status = "failed"
      message.error = error.message
      await message.save()
    }
  }

  private createCronExpression(date: Date): string {
    const minute = date.getUTCMinutes()
    const hour = date.getUTCHours()
    const day = date.getUTCDate()
    const month = date.getUTCMonth() + 1
    const year = date.getUTCFullYear()

    return `${minute} ${hour} ${day} ${month} *`
  }
}
