Service frontend cung cấp giao diện người dùng xây dựng bằng Next.js 16 + TypeScript + Tailwind CSS. Docker image chạy trực tiếp Node.js (không reverse proxy Nginx trong thư mục này).

- Runtime: Node.js 20 (image `node:20-alpine`)
- Framework: Next.js 16
- Ngôn ngữ: TypeScript
- Styling: Tailwind CSS
- Docker build multi-stage: cài deps, build (`npm run build`), chạy `npm start`

```
frontend/
├── app/
│   ├── (site)/                 # Nhóm các route chính
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Trang chủ
│   │   ├── blog/
│   │   │   ├── page.tsx        # Trang liệt kê blog
│   │   │   └── [id]/page.tsx   # Trang chi tiết blog
│   │   ├── articles/
│   │   │   ├── page.tsx        # Trang liệt kê articles
│   │   │   └── [id]/page.tsx   # Trang chi tiết article
│   ├── layout.tsx
│   ├── globals.css
├── components/                 # Header, Footer, Hero, Card...
├── lib/                        # Dữ liệu blog & articles (blog-data.tsx, article-data.tsx)
├── public/                     # Static assets (images, svg...)
├── Dockerfile
└── package.json
```


## 5. Cấu hình Nginx / Proxy thực tế
Trong môi trường docker-compose, load balancer Nginx (service `proxy`) CÓ cấu hình:
- Upstream round-robin cho hai container frontend (`web-frontend-server1`, `web-frontend-server2`).
- Alias `location /blog-static/` trỏ tới thư mục đã được mount từ `./frontend/public/blog` → cho phép truy cập các file HTML tĩnh qua `http://localhost/blog-static/blog1.html`.

Khi chạy đơn lẻ (không đi qua proxy) các file tĩnh chỉ truy cập được dưới dạng `http://localhost:3000/blog/blog1.html` (do Next.js tự phục vụ từ `public/`). Các link trong trang `app/(site)/blog/page.tsx` hiện sử dụng tiền tố `/blog-static/` nên sẽ trả 404 nếu truy cập trực tiếp cổng 3001/3002 mà không đi qua Nginx.

Tùy chọn chỉnh sửa:
1. Giữ alias `/blog-static/` (không cần sửa code) – phù hợp khi luôn đi qua proxy.
2. Đổi các `href` trong `staticBlogLinks` sang `/blog/blog1.html`… để thống nhất cho cả chạy trực tiếp.

## 6. Cách build & chạy
### Chạy độc lập (Docker)
```bash
docker build -t web-frontend-server ./frontend
docker run --rm -p 3000:3000 web-frontend-server
```

### Chạy qua docker-compose
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "3000:3000"
```

## 7. Endpoint & port
- `http://localhost:3000/` – Trang chủ (App Router page.tsx)
- `http://localhost:3000/blog/` – Trang blog index (app/(site)/blog/page.tsx)
- `http://localhost:3000/articles/` – Trang articles
- `http://localhost:3000/api/metrics` – Prometheus metrics (`frontend_up 1`)
- Static HTML qua Next.js trực tiếp: `/blog/blog1.html`, `/blog/blog2.html`, `/blog/blog3.html`
- Static HTML qua proxy alias: `/blog-static/blog1.html`, ...

## 8. Hướng dẫn kiểm thử
```bash
# Kiểm tra header HTTP
curl -I http://localhost:3000/
curl -I http://localhost:3000/blog/
curl -I http://localhost:3000/articles/
```
Status mong đợi:
- 200 OK cho các route hợp lệ
- 404 Not Found cho slug không tồn tại (ví dụ `/blog/99999` nếu ID không định nghĩa trong `lib/blog-data.tsx`)

Truy cập bằng trình duyệt: mở các URL ở trên và kiểm tra nội dung render (cards, layout, styles Tailwind).

## 9. Nội dung động & tĩnh (đã triển khai)
### Động (Next.js render từ dữ liệu JSON)
- Blog: `lib/blog-data.tsx`
- Articles: `lib/article-data.tsx`

Thêm/sửa bài viết động:
1. Cập nhật mảng dữ liệu.
2. Rebuild image/container nếu chạy Docker: `docker compose up -d --build web-frontend-server1 web-frontend-server2`.

### Tĩnh (HTML thuần trong `public/blog/`)
Các file hiện có: `blog1.html`, `blog2.html`, `blog3.html`.
- Truy cập trực tiếp (không proxy): `/blog/<file>.html`
- Qua Nginx alias: `/blog-static/<file>.html`

Thêm file tĩnh mới: đặt `public/blog/my-post.html` → truy cập `/blog/my-post.html` (hoặc `/blog-static/my-post.html` nếu đi qua proxy).

Khuyến nghị: nếu môi trường thường xuyên cần truy cập trực tiếp container (không qua proxy) hãy sửa `app/(site)/blog/page.tsx` để dùng đường dẫn `/blog/...`.

## 10. Troubleshooting
| Vấn đề | Nguyên nhân | Cách xử lý |
|--------|------------|------------|
| Link `/blog-static/...` 404 khi truy cập trực tiếp port 3001/3002 | Alias chỉ tồn tại trong proxy Nginx | Dùng `/blog/<file>.html` hoặc truy cập qua `http://localhost/` (port 80) |
| 404 `/blog/<id>` | ID không có trong dữ liệu | Kiểm tra `lib/blog-data.tsx` / `lib/article-data.tsx` |
| Static asset (ảnh) không load | Sai đường dẫn hoặc chưa nằm trong `public/` | Đảm bảo asset ở `public/` và dùng đường dẫn tuyệt đối `/...` |
| CSS không áp dụng | Mất import `globals.css` hoặc build lỗi | Kiểm tra import trong `app/layout.tsx` và logs build |
| Container không start | Lỗi build hoặc thiếu deps | Xem logs, chạy lại `npm ci` |
| Sai port tài liệu | Nhầm giữa port proxy (80) và port container (3001/3002) | Xác định bối cảnh truy cập: qua proxy hay trực tiếp |

Logs:
```bash
docker-compose logs -f frontend
```
Restart:
```bash
docker-compose restart frontend
```
