import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  slackUserId: string
  slackTeamId: string
  accessToken: string
  botUserId?: string
  userToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  slackUserId: { type: String, required: true, unique: true },
  slackTeamId: { type: String, required: true },
  accessToken: { type: String, required: true },
  botUserId: { type: String },
  userToken: { type: String },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export const User = mongoose.model<IUser>("User", UserSchema)
