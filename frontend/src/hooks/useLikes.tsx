import { InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LikeServices } from "@/services/likes";
import { Like, PaginatedResponde, Post, SafeType } from "@/types";
import { useEffect, useState } from "react";

type OldPosts = InfiniteData<SafeType<PaginatedResponde<Post>>>;

export function useLikes(postId?: number) {
	const queryClient = useQueryClient();

	const {
		data: likesData,
		isLoading: isLoadingLikes,
		isError: isErrorLikes,
		error: errorLikes,
	} = useQuery({
		queryKey: ["likes", postId],
		queryFn: () => LikeServices.GetAll(postId!),
		enabled: !!postId,
	});

	const {
		mutate: likePost,
		isPending: isLikingPost,
		error: likePostError,
	} = useMutation({
		mutationFn: LikeServices.Like,
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });

			const previousPosts = queryClient.getQueryData(["posts"]);

			queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: OldPosts) => {
				if (!oldData?.pages) return oldData;

				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						data: page?.data?.map((post) => {
							if (post?.id === variables.post_id) {
								return {
									...post,
									likes_count: (post?.likes_count ?? 0) + 1,
								};
							}
							return post;
						}),
					})),
				};
			});

			return { previousPosts, postId: variables.post_id };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: OldPosts) => {
				if (!oldData?.pages) return oldData;

				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						data: page?.data?.map((post) => {
							if (post?.id === context?.postId) {
								return {
									...post,
									likes_count: (post?.likes_count ?? 1) - 1,
								};
							}
							return post;
						}),
					})),
				};
			});
		},
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["posts"] }),
				queryClient.invalidateQueries({ queryKey: ["likes", postId] }),
			]);
		},
	});

	const [likesError, setLikesError] = useState<string | null>(null);
	const [likesList, setLikesList] = useState<SafeType<Like>[]>([]);

	useEffect(() => {
		if (isErrorLikes || !!errorLikes) {
			setLikesError("Erro ao carregar curtidas.");
			return;
		}

		if (likesData && !(likesData instanceof Error)) {
			const validLikes = likesData.data?.filter(l => !!l) ?? []
			setLikesList(validLikes);
		}
	}, [likesData, isErrorLikes, errorLikes]);

	return {
		likes: likesList,
		isLoadingLikes,
		likesError,
		likePost,
		isLikingPost,
		likePostError: !!likePostError,
	} as const;
}
