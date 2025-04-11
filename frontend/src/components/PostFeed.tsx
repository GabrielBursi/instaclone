'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'
import 'react-virtualized/styles.css'
import {
	AutoSizer,
	List,
	CellMeasurer,
	CellMeasurerCache,
	WindowScroller,
} from 'react-virtualized'
import { ListRowRenderer, RenderedRows } from 'react-virtualized/dist/es/List'

export function PostFeed({ userId }: Readonly<{ userId?: number }>) {
	const { posts, isLoadingPosts, fetchNextPosts, isFetchingPosts, postsMeta } =
		usePosts(userId)

	const cache = useRef(
		new CellMeasurerCache({
			fixedWidth: true,
			defaultHeight: 500,
		})
	)

	const listRef = useRef<List>(null)

	useEffect(() => {
		cache.current.clearAll()
		listRef.current?.recomputeRowHeights()
	}, [posts.length])

	const rowRenderer: ListRowRenderer = useCallback(
		({ index, key, parent }) => {
			const post = posts[index]
			if (!post) return null

			return (
				<CellMeasurer
					key={key}
					cache={cache.current}
					parent={parent}
					columnIndex={0}
					rowIndex={index}
				>
					{({ registerChild }) => (
						<div ref={registerChild} className="mb-6">
							<PostCard post={post} ref={registerChild} />
						</div>
					)}
				</CellMeasurer>
			)
		},
		[posts]
	)

	const handleRowsRendered = useCallback(
		({ stopIndex }: RenderedRows) => {
			if (
				stopIndex >= posts.length - 1 &&
				postsMeta?.has_next_page &&
				!isFetchingPosts
			) {
				fetchNextPosts()
			}
		},
		[posts, postsMeta, isFetchingPosts, fetchNextPosts]
	)

	if (isLoadingPosts)
		return (
			<div className="flex justify-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
			</div>
		)

	return (
		<WindowScroller>
			{({ height, isScrolling, scrollTop, onChildScroll }) => (
				<AutoSizer disableHeight>
					{({ width }) => (
						<List
							ref={listRef}
							autoHeight
							height={height}
							width={width}
							deferredMeasurementCache={cache.current}
							rowCount={posts.length}
							rowHeight={cache.current.rowHeight}
							rowRenderer={rowRenderer}
							estimatedRowSize={500}
							overscanRowCount={3}
							onRowsRendered={handleRowsRendered}
							isScrolling={isScrolling}
							onScroll={onChildScroll}
							scrollTop={scrollTop}
						/>
					)}
				</AutoSizer>
			)}
		</WindowScroller>
	)
}
