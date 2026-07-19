import React, { useEffect, useRef, useState } from 'react'

import styles from './styles.module.css'

interface Props {
  anchorEl?: HTMLElement | string
  id: string
  text: string
  delay?: number
  children: React.ReactElement
}

export default function Tooltip({ children, id, text, delay = 300 }: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const timeout = useRef<number | null>(null)
  const tooltipId = `${id}_tooltip`

  const cancelTimer = () => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current)
      timeout.current = null
    }
  }

  const show = () => {
    if (!text) return
    cancelTimer()
    timeout.current = window.setTimeout(() => setOpen(true), delay)
  }

  const hide = () => {
    cancelTimer()
    setOpen(false)
  }

  useEffect(() => cancelTimer, [])

  return (
    <span
      className={styles.tooltipTrigger}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(children, {
        'aria-describedby': open ? tooltipId : undefined,
      } as React.HTMLAttributes<HTMLElement>)}
      {open ? (
        <span id={tooltipId} role="tooltip" className={styles.tooltip}>
          {text}
          <span className={styles.tooltipArrow} />
        </span>
      ) : null}
    </span>
  )
}
