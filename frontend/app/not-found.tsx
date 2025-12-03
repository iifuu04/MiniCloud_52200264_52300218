import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="mt-4 text-4xl font-bold text-foreground">Trang bạn tìm kiếm chưa sẵn sàng</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Đường dẫn có thể đã thay đổi hoặc nội dung đang được cập nhật. Bạn có thể quay lại trang chủ hoặc khám phá blog ngay bây giờ.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Về trang chủ
        </Link>
        <Link href="/blog-static" className="rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:border-green-600 dark:hover:border-green-400 transition-colors">
          Xem Blog-Static
        </Link>
      </div>
    </div>
  )
}
