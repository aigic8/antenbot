

export interface User {
  userId: number,
  username?: string,
  firstName: string,
  lastName?: string,
  state: UserState
}

export namespace UserState {

  export interface Default {
    name: "default",
    data: {}
  }

  export interface AGSendingGroupName {
    name: "addingGroup-sendingGroupName",
    data: {}
  }

  export interface AGSendingChannelName {
    name: "addingGroup-sendingChannelName",
    data: { choosenGroup: number }
  }

  export interface AGSendingHashtags {
    name: "addingGroup-sendingHashtags",
    data: { choosenGroup: number, choosenChannel: number }
  }

}


export type UserState = UserState.Default | 
  UserState.AGSendingGroupName | UserState.AGSendingChannelName | UserState.AGSendingHashtags