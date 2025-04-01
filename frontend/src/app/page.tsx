'use client'

import { FollowerServices, LikeServices, PostServices, UserServices } from "@/services";
import { useEffect } from "react";

export default function Home() {
	useEffect(() => {
		PostServices.GetAll().then(data => console.log(data))
		UserServices.GetAll().then(data => console.log(data))
		LikeServices.GetAll(1).then(data => console.log(data))
		FollowerServices.GetFollowers(1).then(data => console.log(data))
	}, []);

	return (
		<h1>hello world</h1>
	)
}
