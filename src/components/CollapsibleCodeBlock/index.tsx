import React, {useState} from 'react'

import styles from './styles.module.css'

export default function CollapsibleCodeBlock({
  children,
}: {
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <div
        className={expanded ? styles.expanded : styles.collapsed}
        data-testid="collapsible-code-content"
      >
        {children}
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        onClick={() => setExpanded(value => !value)}
      >
        {expanded ? '折叠代码' : '展开代码'}
      </button>
    </div>
  )
}
