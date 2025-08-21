import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "server", ts: Date.now() })
})

// simple search echo route for testing
app.get("/api/search", (req, res) => {
  const q = String(req.query.q ?? "")
  res.json({ results: [`you searched: ${q}`] })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))
