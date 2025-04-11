'use client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GridIcon, BookmarkIcon, Heart } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { usePosts } from '@/hooks/usePosts'
import { useFollowing } from '@/hooks/useFollowing'
import { useState } from 'react'
import Image from 'next/image'
import { faker } from '@faker-js/faker'

export default function ProfilePage() {
	const params = useParams()
	const userId = typeof params.id === 'string' ? params.id : ''
	const { user, isLoading: userLoading } = useUser(userId)
	const { posts } = usePosts(userId)
	const [currentUser] = useState({ id: 1 })
	const { followUser, unfollowUser, isUnfollowingUser, isFollowingUser } =
		useFollowing(currentUser.id)
	const [isFollowing, setIsFollowing] = useState(false)

	const handleFollowToggle = () => {
		if (!user?.id) return

		if (isFollowing) {
			unfollowUser({
				follower_id: currentUser.id,
				following_id: parseFloat(userId),
			})
		} else {
			followUser({
				follower_id: currentUser.id,
				following_id: parseFloat(userId),
			})
		}

		setIsFollowing(!isFollowing)
	}

	if (userLoading || !user) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
				<Avatar className="w-20 h-20 sm:w-32 sm:h-32">
					<AvatarImage src={user.avatar_url ?? undefined} />
					<AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
				</Avatar>

				<div className="flex-1 text-center sm:text-left">
					<div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
						<h1 className="text-xl font-semibold">{user.username}</h1>
						{user.id !== currentUser.id ? (
							<Button
								variant={isFollowing ? 'outline' : 'default'}
								size="sm"
								onClick={handleFollowToggle}
								disabled={isFollowingUser || isUnfollowingUser}
							>
								{isFollowing ? 'Unfollow' : 'Follow'}
							</Button>
						) : (
							<Button variant="outline" size="sm">
								Edit Profile
							</Button>
						)}
					</div>

					<div className="flex justify-center sm:justify-start gap-8 mb-4">
						<div className="text-center">
							<span className="font-semibold">{user.posts_count}</span>
							<p className="text-sm">posts</p>
						</div>
						<div className="text-center">
							<span className="font-semibold">{user.followers_count}</span>
							<p className="text-sm">followers</p>
						</div>
						<div className="text-center">
							<span className="font-semibold">{user.following_count}</span>
							<p className="text-sm">following</p>
						</div>
					</div>

					<div>
						<p className="font-medium">{user.name}</p>
						<p className="text-sm">{user.bio}</p>
					</div>
				</div>
			</div>

			<Tabs defaultValue="posts">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="posts">
						<GridIcon className="h-4 w-4 mr-2" />
						Posts
					</TabsTrigger>
					<TabsTrigger value="saved">
						<BookmarkIcon className="h-4 w-4 mr-2" />
						Saved
					</TabsTrigger>
				</TabsList>

				<TabsContent value="posts" className="mt-6">
					<div className="grid grid-cols-3 gap-1">
						{posts.map((post) => (
							<div key={post.id} className="aspect-square relative group">
								<Image
									src={post.image_url ?? faker.image.url()}
									alt={`Post ${post.id}`}
									className="object-cover w-full h-full"
									width={100}
									height={100}
								/>
								<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
									<div className="flex items-center gap-2">
										<Heart className="h-5 w-5" />
										<span>{post.likes_count}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="saved">
					<div className="text-center py-12 text-gray-500">
						<p>No saved posts yet.</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
