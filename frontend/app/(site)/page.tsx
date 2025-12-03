import Hero from "@/components/hero"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <Hero />

      <section id="about" className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-green-600 dark:text-green-400">Về Sống Xanh</p>
          <h2 className="text-4xl font-bold text-foreground">Cộng đồng sống bền vững</h2>
          <p className="text-lg text-muted-foreground">
            Sống Xanh được xây dựng để chia sẻ kiến thức về lối sống bền vững, bảo vệ môi trường và phát triển bền vững.
            Chúng tôi cung cấp những hướng dẫn thực tế, dễ áp dụng để bạn có thể bắt đầu hành trình sống xanh ngay hôm nay.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Khám Phá Blog-Static</h2>
            <p className="text-lg text-muted-foreground">Đọc các bài viết về lối sống bền vững và bảo vệ môi trường</p>
          </div>
          <div className="text-center">
            <Link 
              href="/blog-static" 
              className="inline-flex items-center gap-2 rounded-full bg-green-600 dark:bg-green-500 px-8 py-4 font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              Xem Blog-Static
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-card py-16 md:py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-green-600 dark:text-green-400">Liên hệ</p>
            <h2 className="text-3xl font-bold text-foreground mt-4 mb-6">Luôn sẵn sàng trò chuyện</h2>
            <p className="text-muted-foreground">
              Có góp ý hay muốn hợp tác? Hãy gửi email hoặc kết nối qua mạng xã hội. Chúng tôi phản hồi trong 24 giờ làm việc.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">Thông tin liên lạc</p>
            <a href="mailto:songxanh@example.com" className="block text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
              songxanh@example.com
            </a>
            <a href="tel:+84123456789" className="block text-lg font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
              +84 123 456 789
            </a>
            <p className="text-muted-foreground">Hà Nội, Việt Nam</p>
          </div>
        </div>
      </section>
    </>
  )
}
