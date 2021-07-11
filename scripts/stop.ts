import dotenv from 'dotenv'
dotenv.config()
import { checkEnv, runCommand } from "../src/helpers";
checkEnv()

runCommand("deleteWebhook")
  .then(() => console.log("Done!"))
  .catch(err => console.error(err))