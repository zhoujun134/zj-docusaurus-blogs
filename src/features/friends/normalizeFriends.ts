import type {Friend, IFriendInfo, IResult} from '@site/src/utils/interface/zjType'

type FriendGroups = Record<string, IFriendInfo[]>

function mapFriend(friend: IFriendInfo): Friend {
  return {
    title: friend.title ?? '',
    description: friend.description ?? '',
    website: friend.siteUrl ?? '',
    avatar: friend.logoUrl,
  }
}

export function normalizeFriends(response?: IResult<FriendGroups>): {
  friends: Friend[]
  tools: Friend[]
} {
  if (response?.code !== '0' || !response.data) {
    return {friends: [], tools: []}
  }

  return {
    friends: (response.data['我的友链'] ?? []).map(mapFriend),
    tools: (response.data['我的工具组'] ?? []).map(mapFriend),
  }
}
