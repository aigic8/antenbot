import dotenv from 'dotenv'
dotenv.config()
import { runCommand } from "../src/helpers"

const URI = "https://00a0926f1d75.ngrok.io/bot" + process.env.BOT_TOKEN as string

runCommand("deleteWebhook")
  .then(() => runCommand("setWebhook", { url: URI }))
  .then(() => console.log("Done!"))
  .catch(err => console.error(err))