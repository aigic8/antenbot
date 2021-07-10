import admin from 'firebase-admin'
import { User, UserState } from './types'
import * as path from 'path'

const configPath = path.resolve(__dirname, "..", process.env.FB_CONFIG_PATH as string)
const serviceAccount = require(configPath)
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const store = admin.firestore()
store.settings({ ignoreUndefinedProperties: true })

interface GroupChannel { chatId: number, title: string }
interface GroupLink    { channelId: number, tags: string[] }

export async function addGroup(val: GroupChannel) {
  const { chatId, title } = val
  try { await store.collection("groups").doc(chatId.toString()).set({ title }, {  }) }
  catch(err) { console.error("Error while adding group:", err) }
}

export async function getGroups() : Promise<GroupChannel[] | false> {
  try {
    const groups = await store.collection("groups").get()
    return groups.docs
      .filter(group => group.exists)
      .map(group => ({ chatId: parseInt(group.id), title: group.data()?.title }))
  } catch(err) { console.error("Error retrivieng groups:", err) }
  return false
}

export async function findGroupWithTitle(title: string) : Promise<GroupChannel | false | null> {
  try {
    const groupRefs = await store.collection("groups").where("title", "==", title).get()
    const groups = groupRefs.docs.filter(group => group.exists)
    if(groups.length === 0) return null
    return { chatId: parseInt(groups[0].id), title }
  } catch(err) { console.error("Error retrivieng group by title:", err) }
  return false
}

export async function addLinkToGroup(groupId: number, channelId: number, tags: string[]) {
  try { 
    await store.collection("groups").doc(groupId.toString())
      .collection("links").doc(channelId.toString()).set({ tags })
  } catch(err) { console.error("Error while adding group link:", err) }
}

export async function getGroupLinks(groupId: number) {
  try {
    const links = await store.collection("groups").doc(groupId.toString()).collection("links").get()
    const tags: GroupLink[] = links.docs
      .filter(link => link.exists)
      .map(link => ({channelId: parseInt(link.id), tags: link.data().tags}))
    return tags
  } catch(err) { console.error("Error while getting group links: ", err) }
  return false
}

export async function removeGroup(chatId: number) { 
  try { await store.collection("groups").doc(chatId.toString()).delete() }
  catch(err) { console.error("Error while removing group: ", err) }
}

export async function addChannel(val: GroupChannel) {
  const { chatId, title } = val
  try { await store.collection("channels").doc(chatId.toString()).set({ title }) }
  catch(err) { console.error("Error while adding channel:", err) }
}

export async function getChannels() : Promise<GroupChannel[] | false> {
  try {
    const channels = await store.collection("channels").get()
    return channels.docs
      .filter(channel => channel.exists)
      .map(channel => ({ chatId: parseInt(channel.id), title: channel.data()?.title }))
  } catch(err) { console.error("Error retrivieng channels:", err) }
  return false
}

export async function findChannelWithTitle(title: string) : Promise<GroupChannel | false | null> {
  try {
    const channelRefs = await store.collection("channels").where("title", "==", title).get()
    const channels = channelRefs.docs.filter(channel => channel.exists)
    if(channels.length === 0) return null
    return { chatId: parseInt(channels[0].id), title }
  } catch(err) { console.error("Error retrivieng channel by title:", err) }
  return false
}

export async function removeChannel(chatId: number) {
  try { await store.collection("channels").doc(chatId.toString()).delete() }
  catch(err) { console.error("Error while removing channel: ", err) }
}

export async function getUser(userId: number) : Promise<User | null | false> {
  try { 
    const user = await store.collection("users").doc(userId.toString()).get()
    if(user.exists) return {...user.data(), userId} as User
    return null
  } catch(err) { console.error("Error while getting user: ", err) }
  return false
}

export async function createUser(user: User) {
  const { userId, ...userData } = user
  try { await store.collection("users").doc(userId.toString()).set(userData) }
  catch(err) { console.error("Error while creating user: ", err) }
}

export async function setUserState(id: number, state: UserState) {
  try { await store.collection("users").doc(id.toString()).set({ state }, { merge: true }) }
  catch(err) { console.error("Error while updating user state", err) }
}