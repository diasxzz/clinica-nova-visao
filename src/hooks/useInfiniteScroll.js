import { useEffect, useRef } from 'react'

export function useInfiniteScroll({ hasMore, onLoadMore }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    const node = sentinelRef.current

    if (!node || !hasMore) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  return sentinelRef
}
