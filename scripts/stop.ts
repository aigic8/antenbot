import dotenv from 'dotenv'
dotenv.config()
import { runCommand } from "../src/helpers";

runCommand("deleteWebhook")
  .then(() => console.log("Done!"))
  .catch(err => console.error(err))