import React from 'react'

import styles from './styles.module.css'

export type ViewType = 'list' | 'grid'

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewType
  onChange: (value: ViewType) => void
}) {
  return (
    <div className={styles.toggle} aria-label="展示方式">
      <button
        type="button"
        aria-label="列表视图"
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
      >
        ☰
      </button>
      <button
        type="button"
        aria-label="网格视图"
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
      >
        ▦
      </button>
    </div>
  )
}
