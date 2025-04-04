import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridIcon, BookmarkIcon, Heart } from "lucide-react";
import Image from "next/image";
import { uniqueId } from "lodash";
import { Post, SafeType, User } from "@/types";
import { faker } from '@faker-js/faker';

const user: SafeType<User> = {
	id: Number(uniqueId),
	username: faker.internet.username(),
	name: faker.person.fullName(),
	bio: faker.lorem.sentence(),
	avatar_url: faker.image.url(),
	created_at: faker.date.past().toISOString(),
	email: faker.internet.email(),
	followers_count: faker.number.int({ min: 100, max: 5000 }),
	following_count: faker.number.int({ min: 100, max: 5000 }),
	posts_count: faker.number.int({ min: 100, max: 5000 }),
};

const posts: SafeType<Post>[] = Array.from({ length: 9 }, () => ({
		id: Number(uniqueId()),
		user_id: Number(uniqueId()),
		caption: faker.lorem.sentence(),
		image_url: faker.image.url({ height: 200, width: 200 }),
		likes_count: faker.number.int({ min: 100, max: 5000 }),
		published_at: faker.date.past().toISOString(),
		username: faker.internet.username(),
		name: faker.person.fullName(),
		avatar_url: faker.image.url({ height: 200, width: 200 })
}));

export default function ProfilePage() {



	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
				<Avatar className="w-20 h-20 sm:w-32 sm:h-32">
					<AvatarImage src={user.avatar_url ?? undefined} />
					<AvatarFallback>{user?.name?.[0] ?? 'U'}</AvatarFallback>
				</Avatar>

				<div className="flex-1 text-center sm:text-left">
					<div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
						<h1 className="text-xl font-semibold">{user.username}</h1>
						<Button variant="outline" size="sm">Edit Profile</Button>
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
						{posts.map((post) => post.image_url ? (
							<div key={post.id} className="aspect-square relative group">
								<Image
									src={post.image_url}
									alt={`Post ${post.id}`}
									className="object-cover w-full h-full"
									width={200}
									height={200}
								/>
								<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
									<div className="flex items-center gap-2">
										<Heart className="h-5 w-5" />
										<span>{post.likes_count}</span>
									</div>
								</div>
							</div>
						): null)}
					</div>
				</TabsContent>

				<TabsContent value="saved">
					<div className="text-center py-12 text-gray-500">
						<p>No saved posts yet.</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
