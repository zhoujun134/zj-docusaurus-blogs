// 响应体 ========================= start =======================================
export interface IResult<T> {
  code: string
  message: string
  data?: T
}

export interface Page<T> {
  current: number
  total: number
  pageSize: number
  records?: T[]
}

export interface IFriendInfo {
  title?: string
  siteUrl?: string
  logoUrl?: string
  description?: string
}

export type Friend = {
  title: string
  description: string
  website: string
  avatar?: string
}

export interface VNoticeCardProps {
  title: string
  description: React.JSX.Element | string
  type: 'tip' | 'danger' | 'note' | 'warning' | 'info'
  icon?: string
  href?: string
}
// 响应体 ========================= end =======================================

// 请求体 ======================== start =======================================
// 请求体 ======================== end =======================================
