import dotenv from 'dotenv'
dotenv.config()
import { checkEnv, runCommand } from "../src/helpers"
checkEnv()

const URI = "https://antenbot-aigic88.fandogh.cloud/bot" + process.env.BOT_TOKEN as string

runCommand("deleteWebhook")
  .then(() => runCommand("setWebhook", { url: URI }))
  .then(() => console.log("Done!"))
  .catch(err => console.error(err))