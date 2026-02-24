const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")

const app = express()
app.use(cors())
app.use(express.json())

const requests = {}

app.post("/create-proof-request", (req, res) => {
  const id = uuidv4()

  requests[id] = {
    status: "pending",
    policy: req.body
  }

  res.json({
    request_url: `http://localhost:3001/request?id=${id}`
  })
})

app.get("/request", (req, res) => {
  const { id } = req.query

  if (!requests[id]) return res.status(404).send("Not found")

  res.json({
    version: "1.0",
    id,
    ...requests[id].policy,
    nonce: "mock-nonce",
    context: "Default"
  })
})

app.post("/verify", (req, res) => {
  const { id } = req.body

  if (requests[id]) {
    requests[id].status = "verified"
  }

  res.json({ success: true })
})

app.get("/request-status", (req, res) => {
  const { id } = req.query

  res.json({
    status: requests[id]?.status || "unknown"
  })
})

app.listen(3001, () => {
  console.log("Mock verifier running on 3001")
})