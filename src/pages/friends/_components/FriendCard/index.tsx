import Link from '@docusaurus/Link'
import React, { memo } from 'react'

import type { Friend } from '@site/data/friends'
import styles from './styles.module.css'
import {cn} from "@site/src/utils/cnUtils";

const FriendCard = memo(({ friend }: { friend: Friend }) => (
  <li className={cn(styles.friendCard, 'padding-vert--sm padding-horiz--md')}>
    <img
      src={typeof friend.avatar === 'string' ? "/anonymous.png" : "/anonymous.png"}
      alt={friend.title}
      className={cn(styles.friendCardImage)}
    />
    <div className="card__body">
      <div className={cn(styles.friendCardHeader)}>
        <h4 className={styles.friendCardTitle}>
          <Link to={friend.website} className={styles.friendCardLink} rel="">
            {friend.title}
          </Link>
        </h4>
      </div>
      <p className={styles.friendCardDesc}>{friend.description}</p>
    </div>
  </li>
))

export default FriendCard
