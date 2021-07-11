# Anten Bot
Anten is a small telegram bot used to forward messages from groups to channels by hashtags. The original bot is t.me/anten_robot .

## Getting started with code
Things you need to get started:
- `node.js`, `npm` and `typescript`
- `.env` file in the root directory, similar to `sample.env`
- firebase credentials certificate json file for firestore
- `nodemon` and `ts-loader` for development enviroment
- `ngrok` is not required but recommended

## Commands
- `start`: runs `src/index.ts`
- `startjs`: runs js file `dist\index.js`
- `serve`: starts a development server using `nodemon` and `ts-loader`
- `setWebhook`: sets telegram webhook to url
- `deleteWebhook`: deletes telegram webhook
- `build`: build files into `dist` directory.

## Scripts
contents of `scripts` directory:
- `start.ts` is used to set webhook on current URL.
- `stop.ts` is used to delete webhook

Happy Hacking✌