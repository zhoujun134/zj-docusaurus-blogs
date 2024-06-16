import CodeBlock from '@theme/CodeBlock'
import Layout from '@theme/Layout'
import React from 'react'

import {Friends} from '@site/data/friends'

import {motion} from 'framer-motion'
import styles from './styles.module.css'
import FriendCard from "@site/src/pages/friends/_components/FriendCard";
import Comments from "@site/src/components/Comments";

const TITLE = '友链'
const DESCRIPTION = '有很多良友，胜于有很多财富。'
const ADD_FRIEND_URL = '#submitCommentForm'

const SITE_INFO = `title: 'Z 不殊'
description: '道阻且长，行则将至'
website: 'https://zbus.top'
avatar: 'https://img.zbus.top/zbus/logo.jpg'
`

function SiteInfo() {
  return (
    <div className="w-96 rounded-[var(--ifm-pre-border-radius)] border border-black border-solid border-opacity-10 text-left text-sm leading-none">
      <CodeBlock language="yaml" title="本站信息" className={styles.codeBlock}>
        {SITE_INFO}
      </CodeBlock>
    </div>
  )
}

function FriendHeader() {
  return (
    <section className="margin-top--lg margin-bottom--lg text-center">
      <h1>{TITLE}</h1>
      <p>{DESCRIPTION}</p>
      <a className="button button--primary" href={ADD_FRIEND_URL} rel="noreferrer">
        🔗 申请友链
      </a>
    </section>
  )
}

function FriendCards() {
    return (
    <section className="margin-top--lg margin-bottom--lg">
      <div className={styles.friendContainer}>
        <ul className={styles.friendList}>
          {Friends.map(friend => (
            <FriendCard key={friend.avatar} friend={friend} />
          ))}
        </ul>
          <Comments articleId={'@site/my-friends/links/apply'}/>
      </div>
    </section>
  )
}

export default function FriendLink(): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <motion.main ref={ref} className="margin-vert--md">
        <FriendHeader />
        <FriendCards />
        <motion.div drag dragConstraints={ref} className={styles.dragBox}>
          <SiteInfo />
        </motion.div>
      </motion.main>
    </Layout>
  )
}
