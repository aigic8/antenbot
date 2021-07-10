import axios from "axios";
import { ChatMember } from 'typegram'

interface sendMessageParam { chatId: number, text: string, keyboard?: string[][], removeKeyboard?: boolean }
interface forwardMessageParam { fromId: number, distId: number, messageId: number }

const TOKEN = process.env.BOT_TOKEN as string

export function checkEnv() {
  if(!process.env.PORT)
    console.warn("No port specified in .env file, falling back to default port.")
  if(!process.env.BOT_TOKEN)
    throw "BOT_TOKEN is required for application to run.Please specify it in .env file."
  if(!process.env.FB_CONFIG_PATH)
    throw "FB_CONFIG_PATH is required for application to run.Please specify it in .env file."
}

export async function runCommand(command: string, params : object = {}) {
  return axios.post(`https://api.telegram.org/bot${TOKEN}/${command}`, params)
    .then(resp => resp.data)
    .catch(err => {throw err.response.data})
}

export function sendMessage(params: sendMessageParam) {
  const result: any = { chat_id: params.chatId, text: params.text}
  if(params.removeKeyboard != false)
    result.reply_markup = { remove_keyboard: true }
  if(params.keyboard) {
    const keyboard = params.keyboard.map(row => row.map(text => ({ text })))
    result.reply_markup = {
      keyboard,
      resize_keyboard: true
    }
  }
  return runCommand("sendMessage", result)
}

export function forwardMessage(param: forwardMessageParam) {
  const { distId : chat_id, fromId: from_chat_id, messageId: message_id } = param
  return runCommand("forwardMessage", { chat_id, from_chat_id, message_id })
}

export const makeClient = (chatId: number) => (params: Omit<sendMessageParam, "chatId">) => 
  sendMessage({ ...params, chatId })

export async function getUserChats(userId: number, chatIds: number[]) {
  const chats : {member: ChatMember, chatId: number}[] = await Promise.all(chatIds.map(async (chatId) => {
    const data = await runCommand("getChatMember", { chat_id: chatId, user_id: userId })
    return { chatId, member: data.result }
  }))

  
  return chats.filter(chat => (chat.member.status != "left" && chat.member.status != "kicked"))
}

export function makeKeyboard(keys: string[]) {
  return keys.reduce((prev, key, i) => {
    if((i % 2) === 0) return [...prev, [key]]
    const curr = [...prev]
    curr[(i - 1) / 2].push(key)
    return curr
  } ,[] as string[][])
}

export function findHashtags(text: string) {
  const hashtagsWithDups = text.match(/#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+/g)
  const hashtags = [...new Set(hashtagsWithDups)]
  return hashtags.map(hashtag => hashtag.substr(1))
}