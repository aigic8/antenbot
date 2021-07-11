import { Message, Update } from "typegram"
import { findHashtags, getUserChats, makeClient, makeKeyboard, sendMessage } from "../helpers"
import { User, UserState } from "../types"
import * as db from '../db'
import { texts, keyboards } from "../texts"

type NewPrivateMessage = Update.New & Update.NonChannel & Message.TextMessage

const serverProblemMessage = (chatId: number) => 
  sendMessage({ text: texts.serverProblem, chatId, removeKeyboard: false })

const unknownMessage = (chatId: number) =>
  sendMessage({ text: texts.unknown, chatId, removeKeyboard: false })

export async function handlePrivateUpdate(update: Update.MyChatMemberUpdate) {
  if(update.my_chat_member.new_chat_member.status === "kicked")
    await db.removeUser(update.my_chat_member.from.id)
}

export async function handlePrivateMessage(update: Update.MessageUpdate) {
  const { message } = update
  const { chat, from : teleUser } = message
  const sendMessage = makeClient(chat.id)

  const user = await db.getUser(teleUser.id)
  if(user === false) { // server problem
    serverProblemMessage(chat.id)
    return
  }
  if(user === null) { // user does not exist
    sendMessage({ text: texts.welcome, keyboard: keyboards.default })
      .catch(err => console.error(err))
    const { first_name: firstName, last_name: lastName, id: userId, username } = teleUser
    await db.createUser({ firstName, lastName, userId, username, state: {name: "default", data: {}} })
    return
  }

  if(!("text" in message)) {
    unknownMessage(chat.id)
    return
  }

  const { name: state } = user.state
  if(state === "default")
    await handleDefaultState(message, user)
  else if(state === "addingGroup-sendingGroupName")
    await handleAGSendingGroupName(message, user)
  else if(state === "addingGroup-sendingChannelName")
    await handleAGSendingChannelName(message, user)
  else if(state === "addingGroup-sendingHashtags")
    await handleAGSendingHashtags(message, user)

}


async function handleDefaultState(message: NewPrivateMessage, user: User) {
  if(message.text === texts.keyAddNewGroup) {
    const keyboard = await makeUserGroupsKeyboard(user.userId)
    if(!keyboard)
      serverProblemMessage(message.chat.id)
    else {
      keyboard.push([texts.keyReload])
      sendMessage({text: texts.chooseGroupName, chatId: message.chat.id, keyboard })
      await db.setUserState(message.from.id, {name: "addingGroup-sendingGroupName", data: {}})
    }
  } else {
    unknownMessage(message.chat.id)
  }
}

async function handleAGSendingGroupName(message: NewPrivateMessage, user: User) {
  if(message.text === texts.keyReload) {
    const keyboard = await makeUserGroupsKeyboard(user.userId)
    if(!keyboard)
      serverProblemMessage(message.chat.id)
    else {
      keyboard.push([texts.keyReload])
      sendMessage({text: texts.chooseGroupName, chatId: message.chat.id, keyboard })
    }
    return
  }
  const group = await db.findGroupWithTitle(message.text)
  if(group === false)
    serverProblemMessage(message.chat.id)
  else if(group === null)
    unknownMessage(message.chat.id) // TODO change to ask to do a refresh
  else {
    const userGroup = await getUserChats(user.userId, [group.chatId])
    if(userGroup.length === 0) {
      sendMessage({ text: texts.mustBeInGroup, removeKeyboard: false, chatId: message.chat.id })
    }
    const keyboard = await makeUserChannelsKeyboard(user.userId)
    if(!keyboard)
      serverProblemMessage(message.chat.id)
    else {
      keyboard.push([texts.keyReload])
      sendMessage({ text: texts.chooseChannelName, chatId: message.chat.id, keyboard })
      await db.setUserState(user.userId, { name: "addingGroup-sendingChannelName", data: { choosenGroup: group.chatId } })
    }
  }

}

async function handleAGSendingChannelName(message: NewPrivateMessage, user: User ) {
  if(message.text === texts.keyReload) {
    const keyboard = await makeUserChannelsKeyboard(user.userId)
    if(!keyboard)
      serverProblemMessage(message.chat.id)
    else {
      keyboard.push([texts.keyReload])
      sendMessage({ text: texts.chooseChannelName, chatId: message.chat.id, keyboard })
    }
    return
  }

  const channel = await db.findChannelWithTitle(message.text)
  if(channel === false)
    serverProblemMessage(message.chat.id)
  else if(channel === null)
    unknownMessage(message.chat.id)
  else {
    sendMessage({ text: texts.chooseHashtags, chatId: message.chat.id })
    const state = user.state as UserState.AGSendingChannelName
    await db.setUserState(user.userId, { name: "addingGroup-sendingHashtags", data: { 
      choosenGroup: state.data.choosenGroup,
      choosenChannel: channel.chatId
    }})
  }
  
}

async function handleAGSendingHashtags(message: NewPrivateMessage, user: User) {
  const hashtags = findHashtags(message.text)
  const state = user.state as UserState.AGSendingHashtags
  const { choosenGroup, choosenChannel } = state.data
  if(hashtags.length === 0)
    sendMessage({text: texts.atLeastAHashtag, chatId: message.chat.id})
  else {
    sendMessage({ text: texts.successfulOperation, chatId: message.chat.id, keyboard:keyboards.default })
    await db.addLinkToGroup(choosenGroup, choosenChannel, hashtags)
    await db.setUserState(user.userId, { name: "default", data: {} })
  }
}

async function makeUserGroupsKeyboard(userId: number) {
  const groups = await db.getGroups()
  if(groups === false) return false
  const userGroupIds = (await getUserChats(userId, groups.map(group => group.chatId)))
    .map(group => group.chatId)
  const keys = groups.filter(group => userGroupIds.includes(group.chatId)).map(group => group.title)
  return makeKeyboard(keys)
}

async function makeUserChannelsKeyboard(userId: number) {
  const channels = await db.getChannels()
  if(channels === false) return false
  const userChannelIds = (await getUserChats(userId, channels.map(channel => channel.chatId)))
    .map(channel => channel.chatId)
  const keys = channels.filter(channel => userChannelIds.includes(channel.chatId)).map(channel => channel.title)
  return makeKeyboard(keys)
}