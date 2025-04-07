import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostFeed } from "@/components/PostFeed";

export default function Home() {

	return (
		<main className="max-w-xl mx-auto py-4 px-4 sm:px-0">
			<div className="flex gap-4 overflow-x-auto pb-4 mb-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex flex-col items-center">
						<div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 p-0.5">
							<div className="bg-white rounded-full p-0.5 w-full h-full">
								<Avatar className="w-full h-full">
									<AvatarImage src={`/api/placeholder/40/40`} />
									<AvatarFallback>U{i}</AvatarFallback>
								</Avatar>
							</div>
						</div>
						<span className="text-xs mt-1 truncate w-16 text-center">user_{i}</span>
					</div>
				))}
			</div>
			<PostFeed />
		</main>
	);
}
