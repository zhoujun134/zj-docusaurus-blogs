import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import config from '../../docusaurus.config'

describe('site configuration', () => {
  it('contains only the project identity', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../../docusaurus.config.ts'), 'utf8')

    expect(config.title).toBe('Z 不殊')
    expect(source).toContain('zhoujun134/zj-docusaurus-blogs')
    expect(source).not.toContain('kuizuo/blog')
    expect(source).not.toContain('愧怍')
  })
})
