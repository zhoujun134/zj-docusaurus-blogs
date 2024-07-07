import Admonition from '@theme/Admonition';
import {VNoticeCardProps} from "@site/src/utils/interface/zjType";
import styles from './styles.module.css'
export default function NoticeCard(noticeCard: VNoticeCardProps) {
    return (
        <div className={styles.noticeCardContainer}>
            <Admonition type={noticeCard.type} icon={noticeCard.icon} title={noticeCard.title}>
                {noticeCard.description}
            </Admonition>
        </div>
    );
}
