'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { ImagePlus } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import Image from 'next/image'

export function CreatePostModal() {
	const [caption, setCaption] = useState('')
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [open, setOpen] = useState(false)
	const { createPost, createPostIsLoading } = usePosts()
	const [currentUser] = useState({ id: 1 })

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		createPost(
			{
				caption,
				image_url: imagePreview || undefined,
				user_id: currentUser.id,
			},
			{
				onSuccess: () => {
					setCaption('')
					setImagePreview(null)
					setOpen(false)
				},
			}
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Criar post</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Criar novo post</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{imagePreview ? (
						<div className="aspect-square w-full relative overflow-hidden rounded-md">
							<Image
								src={imagePreview}
								alt="Preview"
								className="w-full h-full object-cover"
								height={300}
								width={300}
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								className="absolute top-2 right-2 bg-white/80 hover:bg-white"
								onClick={() => setImagePreview(null)}
							>
								Alterar
							</Button>
						</div>
					) : (
						<div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center space-y-2 text-center">
							<ImagePlus className="h-8 w-8 text-gray-400" />
							<p className="text-sm text-muted-foreground">
								Faça um upload de uma imagem para o post
							</p>
							<Input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="max-w-xs"
							/>
						</div>
					)}

					<Textarea
						placeholder="Escreva uma descrição..."
						value={caption}
						onChange={(e) => setCaption(e.target.value)}
						rows={3}
						style={{
							resize: 'none',
						}}
					/>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={createPostIsLoading || !caption.trim()}
						>
							{createPostIsLoading ? 'Compartilhando...' : 'Compartilhar'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
