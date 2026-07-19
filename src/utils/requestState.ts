export function createRequestState() {
  let count = 0

  return {
    start: () => {
      count += 1
      return count
    },
    finish: () => {
      count = Math.max(0, count - 1)
      return count
    },
    active: () => count,
  }
}
