import { Chat, Update } from "typegram"
import * as db from '../db'


export function handleChannelUpdate(update: Update.MyChatMemberUpdate) {
  let { chat } = update.my_chat_member
  const { status } = update.my_chat_member.new_chat_member
  chat = chat as Chat.ChannelChat
  if(status === "administrator")
    db.addChannel({ chatId: chat.id, title: chat.title })
  else if(status === "left" || status === "kicked")
    db.removeChannel(chat.id)
}