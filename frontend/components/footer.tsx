import Link from "next/link"
import { Leaf, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-green-700 dark:bg-green-900 text-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-green-300" />
              <h3 className="text-xl font-bold">Sống Xanh</h3>
            </div>
            <p className="text-white/80">Hướng dẫn và chia sẻ về lối sống bền vững, thân thiện với môi trường.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/" className="hover:text-green-300 transition-colors">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link href="/blog-static" className="hover:text-green-300 transition-colors">
                  Blog-Static
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-green-300 transition-colors">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-green-300 transition-colors">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Chủ Đề</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/blog-static" className="hover:text-green-300 transition-colors">
                  Tái Chế
                </Link>
              </li>
              <li>
                <Link href="/blog-static" className="hover:text-green-300 transition-colors">
                  Năng Lượng Sạch
                </Link>
              </li>
              <li>
                <Link href="/blog-static" className="hover:text-green-300 transition-colors">
                  Nông Nghiệp Bền Vững
                </Link>
              </li>
              <li>
                <Link href="/blog-static" className="hover:text-green-300 transition-colors">
                  Bảo Vệ Môi Trường
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Liên Hệ</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>songxanh@example.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/80 text-sm">
            <p>&copy; 2025 Sống Xanh. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-white/70">
              <span>Chính sách bảo mật (đang cập nhật)</span>
              <span>Điều khoản sử dụng (đang cập nhật)</span>
              <Link href="/" className="hover:text-green-300 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
