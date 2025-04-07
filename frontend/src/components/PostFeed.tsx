'use client'

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "./PostCard";
import List from "rc-virtual-list";

export function PostFeed({ userId }: { userId?: string }) {
	const { posts, isLoadingPosts, deletePost, fetchNextPosts, isFetchingPosts, postsMeta } = usePosts(userId);
	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && postsMeta?.has_next_page && !isFetchingPosts) {
			fetchNextPosts();
		}
	}, [inView, fetchNextPosts, postsMeta, isFetchingPosts]);

	if (isLoadingPosts)
		return (
			<div className="flex justify-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
			</div>
		)

	return (
		<List data={posts} itemHeight={500} itemKey="id">
			{(post, index) =>
				index === posts.length - 1 && isFetchingPosts ? (
					<div className="flex flex-col py-4 gap-2">
						<PostCard
							key={post.id}
							post={post}
							ref={index === posts.length - 1 ? ref : null}
							onDelete={() => post.id && deletePost(post.id)}
						/>
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 self-center"></div>
					</div>
				) :
					(
						<div>
							<PostCard
								key={post.id}
								post={post}
								ref={index === posts.length - 1 ? ref : null}
								onDelete={() => post.id && deletePost(post.id)}
							/>
						</div>
					)}
		</List>
	);
}
