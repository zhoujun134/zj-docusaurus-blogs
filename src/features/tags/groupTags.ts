export type TagLike = {
  label: string
}

export function groupTagsDeterministically<T extends TagLike>(tags: readonly T[]) {
  const sortedTags = [...tags].sort((left, right) => {
    if (left.label === right.label) return 0
    return left.label < right.label ? -1 : 1
  })
  const groups = new Map<string, T[]>()

  for (const tag of sortedTags) {
    const letter = Array.from(tag.label)[0]?.toUpperCase() ?? '#'
    const group = groups.get(letter) ?? []
    group.push(tag)
    groups.set(letter, group)
  }

  return Array.from(groups, ([letter, groupedTags]) => ({
    letter,
    tags: groupedTags,
  }))
}
