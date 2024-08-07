import CodeBlock from '@theme/CodeBlock'
import Layout from '@theme/Layout'
import React, {useEffect, useState} from 'react'

import {motion} from 'framer-motion'
import styles from './styles.module.css'
import FriendCard from "@site/src/pages/friends/_components/FriendCard";
import Comments from "@site/src/components/Comments";
import {Friend, IFriendInfo, IResult, VNoticeCardProps} from "@site/src/utils/interface/zjType";
import service from "@site/src/utils/service";

const TITLE = '友链'
const DESCRIPTION = '有很多良友，胜于有很多财富。'
const ADD_FRIEND_URL = '#submitCommentForm'

const SITE_INFO = `title: 'Z 不殊'
description: '想要拥有的必须现在就去做'
website: 'https://zbus.top'
avatar: 'https://zbus.top/logo.png'
`

function SiteInfo() {
    return (
        <div
            className="w-96 rounded-[var(--ifm-pre-border-radius)] border border-black border-solid border-opacity-10 text-left text-sm leading-none">
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

export async function getFriendsFromService() {
    try {
        const resp = await service({
            url: '/api/friends',
            method: 'get'
        });
        return JSON.parse(JSON.stringify(resp)) as IResult<Map<string, IFriendInfo[]>>;
    } catch (error) {
        let {message} = error;
        // window.alert("系统开小差了！请稍后重试！" + message);
        return {
            code: 500,
            message: "系统开小差了！请稍后重试！" + message,
            data: {} as Map<string, IFriendInfo[]>
        };
    }
}

function FriendCards() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [tools, setTools] = useState<Friend[]>([]);
    const fetchFriendsFromServer = async () => {
        getFriendsFromService().then((result: IResult<Map<string, IFriendInfo[]>>) => {
            if (!result && result.code != "0") {
                return;
            }
            const friendGroup: Map<string, IFriendInfo[]> = new Map(Object.entries(result.data));
            const friendList: Friend[] = [];
            const toolList: Friend[] = [];
            friendGroup.forEach((friends, key) => {
                if (key == '我的工具组') {
                    friends.forEach((friend: IFriendInfo) => {
                        const oneTool = {
                            title: friend.title,
                            description: friend.description,
                            website: friend.siteUrl,
                            avatar: friend.logoUrl
                        }
                        toolList.push(oneTool)
                    })
                }
                if (key == '我的友链') {
                    friends.forEach((friend: IFriendInfo) => {
                        const oneFriend = {
                            title: friend.title,
                            description: friend.description,
                            website: friend.siteUrl,
                            avatar: friend.logoUrl
                        }
                        friendList.push(oneFriend)
                    })
                }
            })
            setFriends(friendList)
            setTools(toolList)
        })
    };

    // 组件挂载完成后获取评论列表
    useEffect(() => {
        fetchFriendsFromServer().then(r => {
        });
    }, []); // 空依赖数组表示这个 effect 只会在组件挂载时运行一次

    const applyContent = '' +
        'title: 网站名称\n' +
        'description: 简要描述下您的网站\n' +
        'website: 网站首页地址\n' +
        'avatar: 网站 logo 地址';
    const noticeCardProps: VNoticeCardProps = {
        title: "友链申请声明",
        type: 'info',
        icon: '💡',
        description: <>
            <p>请在申请之前，确保已经在自己的网站中添加了本站的友链。</p>
            <CodeBlock
                language="yaml"
                title="申请格式"
                showLineNumbers>
                {applyContent}
            </CodeBlock>
        </>
    }
    return (
        <section className="margin-top--lg margin-bottom--lg">
            <div className={styles.friendContainer}>
                <h2>工具列表</h2>
                <ul className={styles.friendList}>
                    {tools.map(tool => (
                        <FriendCard key={tool.avatar} friend={tool}/>
                    ))}
                </ul>
                <h2>良师益友</h2>
                <ul className={styles.friendList}>
                    {friends.map(friend => (
                        <FriendCard key={friend.avatar} friend={friend}/>
                    ))}
                </ul>
                <Comments articleId={'@site/my-friends/links/apply'} noticeCardBeforeSumitForm={noticeCardProps}/>
            </div>
        </section>
    )
}

export default function FriendLink(): JSX.Element {
    const ref = React.useRef<HTMLDivElement>(null)

    return (
        <Layout title={TITLE} description={DESCRIPTION}>
            <motion.main ref={ref} className="margin-vert--md">
                <FriendHeader/>
                <FriendCards/>
                <motion.div drag dragConstraints={ref} className={styles.dragBox}>
                    <SiteInfo/>
                </motion.div>
            </motion.main>
        </Layout>
    )
}
