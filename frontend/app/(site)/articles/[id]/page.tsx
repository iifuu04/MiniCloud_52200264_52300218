"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { articles } from "@/lib/article-data"

export default function ArticleDetailPage() {
  const params = useParams()
  const articleId = Number.parseInt(params.id as string)
  const article = articles.find(a => a.id === articleId)

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Không tìm thấy bài viết</h1>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  const relatedArticles = articles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 2)

  return (
    <article className="bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại mục bài viết
        </Link>

        <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
            {article.category}
          </span>
        </div>

        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground text-balance">{article.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><User className="h-4 w-4" />{article.author}</span>
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{article.date}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{article.readTime}</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        <section className="rounded-2xl border border-border bg-muted/40 p-6">
          <h3 className="text-lg font-semibold text-foreground">Về tác giả</h3>
          <p className="text-muted-foreground">
            {article.author} là chuyên gia {article.category.toLowerCase()} với nhiều năm triển khai giải pháp sống xanh và chia sẻ kiến thức cho cộng đồng.
          </p>
        </section>

        {relatedArticles.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Bài viết liên quan</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedArticles.map(item => (
                <Link key={item.id} href={`/articles/${item.id}`} className="block rounded-xl border border-border p-4 hover:border-primary">
                  <p className="text-sm text-muted-foreground">{item.date} · {item.readTime}</p>
                  <h4 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h4>
                  <p className="text-muted-foreground line-clamp-2">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
