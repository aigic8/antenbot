import { Update } from 'typegram'
import { handleChannelUpdate } from './channelHandlers'
import { handleGroupUpdate, handleGroupMessage } from './groupHandlers'
import { handlePrivateMessage } from './privateHandlers'

export default function onUpdate(update: Update) {
  if("my_chat_member" in update) {
    if(update.my_chat_member.chat.type === "group" || update.my_chat_member.chat.type === "supergroup")
      handleGroupUpdate(update)
    else if(update.my_chat_member.chat.type === "channel")
      handleChannelUpdate(update)
    return
  }

  if(!("message" in update)) return

  const chatType = update.message.chat.type
  if(chatType === "private")
    handlePrivateMessage(update)
  else if(chatType === "group" || chatType === "supergroup")
    handleGroupMessage(update)
  

}