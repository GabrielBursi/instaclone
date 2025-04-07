import { Ref, useState } from "react";
import { Post, SafeType } from "@/types";
import { useLikes } from "@/hooks/useLikes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { faker } from "@faker-js/faker";
import Link from "next/link";

interface PostCardProps {
	post: SafeType<Post>;
	onDelete?: () => void;
	ref: Ref<HTMLDivElement>
}

export const PostCard =
	({ post, onDelete, ref }: PostCardProps) => {
		const { likePost, isLikingPost } = useLikes(post.id ?? undefined);
		const [currentUser] = useState({ id: 1 });

		const handleLike = () => {
			if (post.id)
				likePost({
					user_id: currentUser.id,
					post_id: post.id
				});
		};

		return (
			<div ref={ref} className="border rounded-md overflow-hidden bg-white mb-6">
				<div className="flex items-center justify-between p-3">
					<Link href={`/profile/${post.user_id}`}>
						<div className="flex items-center space-x-3">
							<Avatar>
								<AvatarImage src={post.avatar_url || undefined} />
								<AvatarFallback>{post.name?.[0] || "U"}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-sm">{post.username}</p>
							</div>
						</div>
					</Link>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-5 w-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{post.user_id === currentUser.id && (
								<DropdownMenuItem onClick={onDelete} className="text-red-500">
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="relative aspect-square w-full bg-gray-100">
					<Image
						src={post.image_url ?? faker.image.url()}
						alt={`Post by ${post.username}`}
						className="object-cover w-full h-full"
						height={500}
						width={500}
					/>
				</div>

				<div className="p-3">
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="icon"
							className={isLikingPost ? "opacity-50" : ""}
							onClick={handleLike}
							disabled={isLikingPost}
						>
							<Heart className={`h-6 w-6 ${post.likes_count && post.likes_count > 0 ? "fill-red-500 text-red-500" : ""}`} />
						</Button>
						<Button variant="ghost" size="icon">
							<MessageCircle className="h-6 w-6" />
						</Button>
					</div>

					<p className="font-medium text-sm mt-2">
						{post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
					</p>

					<div className="mt-1">
						<span className="font-medium text-sm">{post.username}</span>
						<span className="text-sm ml-2">{post.caption}</span>
					</div>

					<p className="text-xs text-gray-500 mt-1">
						{post.published_at && formatRelativeTime(new Date(post.published_at))}
					</p>
				</div>
			</div>
		);
	};
