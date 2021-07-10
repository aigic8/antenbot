import { Chat, Update } from "typegram"
import * as db from '../db'
import { findHashtags, forwardMessage } from "../helpers"


export function handleGroupUpdate(update: Update.MyChatMemberUpdate) {
  let { chat } = update.my_chat_member
  chat = chat as (Chat.GroupChat | Chat.SupergroupChat)
  const { status } = update.my_chat_member.new_chat_member
  if(status === "member" || status === "administrator")
    db.addGroup({ chatId: chat.id, title: chat.title })
  else if(status === "left" || status === "kicked")
    db.removeGroup(chat.id)
}

export async function handleGroupMessage(update: Update.MessageUpdate) {
  const { message } = update
  if(!("text" in message))
    return

  const messageTags = findHashtags(message.text)
  if(messageTags.length === 0) return

  const links = await db.getGroupLinks(update.message.chat.id)
  if(!links) return // TODO send message in group and say something went wrong!

  if(links.length === 0) return
  if(links.every(link => link.tags.length === 0)) return

  const channels = links.reduce((prev, link) => {
    const noOverlap = messageTags.every(messageTag => !link.tags.includes(messageTag))
    if(noOverlap) return prev
    return [...prev, link.channelId]
  }, [] as number[])

  if(channels.length === 0) return
  const fromId = message.chat.id
  const messageId = message.message_id
  return Promise.all(channels.map((distId) => forwardMessage({ fromId, messageId, distId })))
}