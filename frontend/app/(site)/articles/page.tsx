import ArticleCard from "@/components/article-card"
import NewsletterForm from "@/components/newsletter-form"
import { articles } from "@/lib/article-data"

const topicTags = ["Điện toán đám mây", "Microservices", "DevOps", "Kubernetes", "API Design"]

export default function ArticlesPage() {
  const featuredArticles = articles.filter(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

  return (
    <div className="bg-background">
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Bài Viết Chuyên Sâu</p>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              70 ngày tìm hiểu kiến thức về cây xanh
            </h1>
            <p className="text-xl text-muted-foreground">
              Tổng hợp trải nghiệm khám phá thiên nhiên, nuôi dưỡng môi trường sống xanh và câu chuyện thực tế từ hành trình gần gũi với đất – cây – trời..
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {topicTags.map(tag => (
                <span key={tag} className="bg-primary/15 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Chủ đề nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredArticles.map(article => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Tất cả bài viết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Nhận bài mới mỗi tuần</h2>
            <p className="text-muted-foreground">
              Đăng ký để nhận bản tin mới nhất. Chỉ mang tính demo.
            </p>
            <NewsletterForm />
            <p className="text-sm text-muted-foreground">Gửi form.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
