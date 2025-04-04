import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Home, Search, PlusSquare, Heart } from "lucide-react";
import { faker } from "@faker-js/faker";

export function Navbar() {
	return (
		<header className="border-b fixed top-0 left-0 right-0 bg-white z-10">
			<div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
				<Link href="/" className="text-xl font-bold">
					InstaClone
				</Link>

				<div className="hidden md:block w-64">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
						<Input placeholder="Search" className="pl-8" />
					</div>
				</div>

				<nav className="flex items-center space-x-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/">
							<Home className="h-6 w-6" />
						</Link>
					</Button>

					<Button variant="ghost" size="icon">
						<PlusSquare className="h-6 w-6" />
					</Button>

					<Button variant="ghost" size="icon">
						<Heart className="h-6 w-6" />
					</Button>

					<Button variant="ghost" size="icon" asChild>
						<Link href="/profile/1">
							<Avatar className="h-8 w-8">
								<AvatarImage src={faker.image.url()} />
								<AvatarFallback>JS</AvatarFallback>
							</Avatar>
						</Link>
					</Button>
				</nav>
			</div>
		</header>
	);
}
