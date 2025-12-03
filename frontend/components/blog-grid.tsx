"use client"

import BlogCard from "./blog-card"
import { blogPosts } from "@/lib/blog-data"

export default function BlogGrid() {
  return (
    <section id="blog-section" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Bài Viết Mới Nhất</h2>
          <p className="text-lg text-muted-foreground">Cập nhật những bài viết thú vị về thiên nhiên</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
