"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, User, Clock, Tag } from "lucide-react"

interface Article {
  id: number
  title: string
  excerpt: string
  category: string
  image: string
  date: string
  content: string
  author: string
  readTime: string
  tags: string[]
  featured: boolean
}

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article className={`bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:scale-105 ${
      featured ? 'md:col-span-1' : ''
    }`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={article.image || "/placeholder.svg"}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            {article.category}
          </span>
        </div>
        {featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Nổi bật
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`font-bold text-card-foreground mb-3 line-clamp-2 hover:text-primary transition-colors ${
          featured ? 'text-xl' : 'text-lg'
        }`}>
          {article.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="text-muted-foreground text-xs">
              +{article.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{article.readTime}</span>
          </div>
        </div>

        <Link href={`/articles/${article.id}`}>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Đọc bài viết
          </button>
        </Link>
      </div>
    </article>
  )
}
