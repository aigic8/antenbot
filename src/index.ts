require("dotenv").config()
import { checkEnv } from './helpers'
import express from 'express'
import { Update } from 'typegram'
import onUpdate from './handlers/handlers'

checkEnv()

const DEFAULT_PORT = "3000"
const PORT = parseInt(process.env.PORT || DEFAULT_PORT)

const app = express()
app.use(express.json())

app.get("/", (_req, res) => {
  res.end("App is working!")
})

const BOT_PATH = "/bot" + process.env.BOT_TOKEN as string
app.post(BOT_PATH, (req, res) => {
  try { onUpdate(req.body as Update) }
  catch(err) { console.error("ERROR ON UPDATE: ", err) }
  res.end("")
})

app.listen(PORT, () => console.log(`App is running on PORT ${PORT}.`))

