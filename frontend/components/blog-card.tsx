"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  category: string
  image: string
  date: string
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-border hover:scale-105 transition-transform duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold animate-fade-in">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{post.date}</span>
          </div>
        </div>

        <Link href={`/blog/${post.id}`}>
          <button className="mt-4 w-full bg-secondary text-secondary-foreground py-2 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
            Đọc Tiếp
          </button>
        </Link>
      </div>
    </article>
  )
}
