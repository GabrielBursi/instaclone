import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostServices } from "@/services/posts";
import { MetaPagination, PaginatedResponde, Post, SafeType } from "@/types";
import { uniqueId } from "lodash";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";

type OldPosts = InfiniteData<SafeType<PaginatedResponde<Post>>>

export function usePosts(userId?: string) {
	const queryClient = useQueryClient();

	const {
		data: postsData,
		isLoading: isLoadingPosts,
		error: errorPosts,
		isError: isErrorPosts,
		hasNextPage: hasNextPosts,
		hasPreviousPage: hasPreviousPosts,
		fetchNextPage: fetchNextPosts,
		isFetching: isFetchingPosts
	} = useInfiniteQuery({
		queryKey: ["posts", userId],
		queryFn: ({ pageParam }) => {
			return PostServices.GetAll({
				cursor: pageParam,
				limit: "10",
				...(userId ? { user_id: userId } : {})
			});
		},
		getNextPageParam: (lastPage) => {
			if (lastPage instanceof Error || !lastPage.meta?.has_next_page) {
				return undefined;
			}

			const next_cursor = lastPage?.meta.next_cursor;
			if (next_cursor)
				return next_cursor.toString()
			return undefined;
		},
		initialPageParam: undefined as undefined | string,
	});

	const { data: createdPost, isPending: createPostIsLoading, error: createPostError, mutate: createPost } = useMutation({
		mutationFn: PostServices.Create,
		onMutate: async (newPost) => {

			await queryClient.cancelQueries({ queryKey: ["posts", userId] });

			const previousPosts = queryClient.getQueryData(["posts", userId]);

			queryClient.setQueryData(["posts", userId], (old: OldPosts) => {
				if (!old?.pages?.[0]) return old;

				const optimisticPost: Post = {
					id: Number(uniqueId()),
					user_id: newPost.user_id,
					caption: newPost.caption,
					image_url: newPost.image_url ?? faker.image.url(),
					published_at: new Date().toISOString(),
					likes_count: 0,
					username: "You",
					name: "You",
					avatar_url: faker.image.url()
				};

				const newPages = [...old.pages];
				newPages[0] = {
					...newPages[0],
					data: [optimisticPost, ...(newPages[0]?.data ? newPages[0].data : [])]
				};

				return { ...old, pages: newPages };
			});

			return { previousPosts };
		},
		onError: (err, newPost, context) => {

			queryClient.setQueryData(["posts", userId], context?.previousPosts);
		},
		onSettled: () => {

			queryClient.invalidateQueries({ queryKey: ["posts", userId] });
		}
	});

	const { data: deletedPost, isPending: deletePostIsLoading, error: deletePostError, mutate: deletePost } = useMutation({
		mutationFn: PostServices.DeleteById,
		onMutate: async (postId) => {
			await queryClient.cancelQueries({ queryKey: ["posts", userId] });

			const previousPosts = queryClient.getQueryData(["posts", userId]);

			queryClient.setQueryData(["posts", userId], (old: OldPosts) => {
				if (!old?.pages) return old;

				const newPages = old.pages.map((page) => ({
					...page,
					// eslint-disable-next-line sonarjs/no-nested-functions
					data: page?.data?.filter((post) => post?.id !== postId)
				}));

				return { ...old, pages: newPages };
			});

			return { previousPosts };
		},
		onError: (_err, _postId, context) => {
			queryClient.setQueryData(["posts", userId], context?.previousPosts);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts", userId] });
		}
	});

	const [posts, setPosts] = useState<SafeType<Post>[]>([]);
	const [postsMeta, setPostsMeta] = useState<SafeType<MetaPagination> | null>(null);
	const [postsError, setPostsError] = useState<string | null>(null);

	useEffect(() => {
		if (!postsData && (isErrorPosts || !!errorPosts)) {
			setPostsError('Erro')
			return
		}

		if (!!postsData && postsData.pages.some(p => p instanceof Error)) {
			setPostsError('Erro')
			return
		}

		if (postsData) {
			const validPages = postsData.pages.filter((p): p is SafeType<PaginatedResponde<Post>> => !(p instanceof Error));
			const allPosts = validPages.flatMap((page) => page.data ?? []);
			const validPosts = allPosts.filter(p => !!p)
			setPosts(validPosts);
			setPostsMeta(validPages.at(-1)?.meta ?? null);
		}
	}, [errorPosts, isErrorPosts, postsData]);

	return {
		posts,
		fetchNextPosts,
		isLoadingPosts,
		isFetchingPosts,
		hasNextPosts,
		hasPreviousPosts,
		postsMeta,
		postsError,
		deletePost,
		deletePostError: !!deletePostError || !!(deletedPost instanceof Error),
		deletePostIsLoading,
		createPost,
		createPostError: !!createPostError || !!(createdPost instanceof Error),
		createPostIsLoading,
		createdPost: !!createdPost && !(createdPost instanceof Error) ? createdPost : null
	} as const
}
