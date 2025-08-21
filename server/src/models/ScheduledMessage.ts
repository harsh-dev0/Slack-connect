import mongoose, { Schema, Document } from "mongoose"

export interface IScheduledMessage extends Document {
  userId: string
  slackTeamId: string
  channelId: string
  channelName: string
  message: string
  scheduledFor: Date
  status: "pending" | "sent" | "cancelled" | "failed"
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  error?: string
}

const ScheduledMessageSchema = new Schema<IScheduledMessage>({
  userId: { type: String, required: true },
  slackTeamId: { type: String, required: true },
  channelId: { type: String, required: true },
  channelName: { type: String, required: true },
  message: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "sent", "cancelled", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  error: { type: String },
})

ScheduledMessageSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export const ScheduledMessage = mongoose.model<IScheduledMessage>(
  "ScheduledMessage",
  ScheduledMessageSchema
)
