import dotenv from 'dotenv'
import { checkEnv } from './helpers'
dotenv.config(); checkEnv()
import express from 'express'
import { Update } from 'typegram'
import onUpdate from './handlers/handlers'

const DEFAULT_PORT = "3000"
const PORT = parseInt(process.env.PORT || DEFAULT_PORT)

const app = express()
app.use(express.json())

app.get("/", (_req, res) => {
  res.end("App is working!")
})

const BOT_PATH = "/bot" + process.env.BOT_TOKEN as string
app.post(BOT_PATH, (req, res) => {
  onUpdate(req.body as Update)
  res.end("")
})

app.listen(PORT, () => console.log(`App is running on PORT ${PORT}.`))

