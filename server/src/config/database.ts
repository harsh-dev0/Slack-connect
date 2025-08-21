import mongoose from "mongoose"

export const connectDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/slack-connect"

    await mongoose.connect(mongoUri)

    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error)
})

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})
