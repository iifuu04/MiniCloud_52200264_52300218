Backend Flask cung cấp một vài API công khai và bảo vệ JWT, đồng thời hiển thị tài liệu Swagger UI với OAuth2/PKCE. Kết nối MySQL database và trả về dữ liệu từ file tĩnh `students.json`.
- Runtime: Python 3.11 (slim image)
- Framework: Flask 3.0
- Auth: Keycloak (OIDC) qua `PyJWT` + `PyJWKClient`
- API Docs: Swagger UI phục vụ `openapi.json`
- Database: MySQL với connection pooling

## Thư Mục
```
backend/
├── app.py          # Flask application + routes + JWT middleware
├── students.json   # Dữ liệu mẫu trả về ở /api/student
├── openapi.json    # OpenAPI spec dùng cho Swagger UI
├── Dockerfile      # Build image Python 3.11 slim
├── requirements.txt # Python dependencies
└── README.md
```

## Environment Variables Bắt Buộc
| Tên | Bắt buộc | Mô tả |
|-----|----------|------|
| `OIDC_ISSUER` | Yes | Issuer Keycloak nội bộ, ví dụ: `http://auth:8080/auth/realms/master` |
| `OIDC_AUDIENCE` | Yes | Audience gán cho client/backend (ví dụ `backend`) |
| `DB_HOST` | No | MySQL host (mặc định: `database`) |
| `DB_PORT` | No | MySQL port (mặc định: `3306`) |
| `DB_USER` | No | MySQL user (mặc định: `root`) |
| `DB_PASSWORD` | No | MySQL password (mặc định: `root`) |
| `DB_NAME` | No | MySQL database name (mặc định: `Mini_Cloud`) |
| `DB_POOL_LIMIT` | No | Connection pool size (mặc định: `5`) |

Ứng dụng sẽ thoát ngay nếu thiếu `OIDC_ISSUER` hoặc `OIDC_AUDIENCE`. Từ `OIDC_ISSUER` nội bộ suy ra JWKS URI: `ISSUER + /protocol/openid-connect/certs`.

Lưu ý: Bên ngoài container (host) Keycloak truy cập tại `http://localhost:8082/auth/...`; bên trong network dùng hostname `auth:8080`.

## Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```
Port 8081 được publish trong `docker-compose.yml`.

## Phụ Thuộc Chính
- Flask
- flask-cors
- PyJWT
- PyJWKClient (từ PyJWT)
- mysql-connector-python
- cryptography

## Routes & Bảo Vệ
| Route | Phương thức | Bảo vệ JWT | Mô tả |
|-------|-------------|------------|-------|
| `/hello` | GET | Public | Trả về JSON "Hello, world!" |
| `/api/hello` | GET | Public | Alias tương tự `/hello` |
| `/api/student` | GET | Public | Đọc và trả về nội dung `students.json` |
| `/api/db-test` | GET | Public | Kiểm tra kết nối MySQL |
| `/api/subjects` | GET | Public | Lấy danh sách subjects từ MySQL |
| `/secure` | GET | Protected | Yêu cầu access token hợp lệ (RS256) |
| `/api-docs` | GET (UI) | Public | Swagger UI + OAuth2 PKCE |
| `/openapi.json` | GET | Public | OpenAPI specification JSON |

## Swagger UI / OAuth2
Swagger phục vụ tại `/api-docs`. File `openapi.json` định nghĩa security scheme OAuth2 authorizationCode. Cấu hình UI dùng:
- `clientId: backend`
- `usePkceWithAuthorizationCodeGrant: true`

**Cấu hình Keycloak client "backend":**
- Client ID: `backend`
- Client Protocol: `openid-connect`
- Access Type: `public` (hoặc `confidential` nếu cần secret)
- Valid Redirect URIs: `http://localhost:8081/api-docs/oauth2-redirect.html` hoặc `http://localhost:8081/oauth2-redirect.html`
- Web Origins: `http://localhost:8081`
- PKCE Code Challenge Method: `S256` (nếu dùng PKCE)

Đường dẫn auth/token trong `openapi.json` dùng host-port ngoài (`localhost:8082`) để chạy thử từ browser.

## Luồng Xác Thực
1. Người dùng đăng nhập Keycloak và nhận Access Token (RS256).
2. Gửi request đến `/secure` kèm header `Authorization: Bearer <token>`.
3. Middleware kiểm tra: giải quyết JWKS, khớp audience (`OIDC_AUDIENCE`), issuer, và thuật toán.
4. Payload hợp lệ => trả JSON gồm các claim (`preferred_username`, `email`, ...).

## Khởi Chạy & Phát Triển
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Logging / Quan Sát
- Startup in ra cấu hình OIDC + JWKS URI.
- Lỗi JWT được xử lý trong decorator `jwt_required` (trả JSON với chi tiết).
- Dữ liệu sinh viên đọc thất bại sẽ log lỗi file / parse.

## Troubleshooting
| Vấn đề | Nguyên nhân thường gặp | Cách xử lý |
|--------|------------------------|-----------|
| App thoát ngay khi start | Thiếu env OIDC_ISSUER / OIDC_AUDIENCE | Kiểm tra biến trong `docker-compose.yml` |
| 401 Unauthorized ở `/secure` | Token sai audience / hết hạn / issuer khác | Lấy lại token từ đúng realm, kiểm tra `aud` claim |
| Swagger không login được | Sai clientId hoặc realm URL | Đảm bảo realm path `/auth/realms/master` đúng và client `swagger-ui` tồn tại |
| Không thấy dữ liệu sinh viên | Lỗi đọc / parse `students.json` | Kiểm tra định dạng JSON hợp lệ (UTF-8, không comment) |
| Database connection failed | MySQL chưa sẵn sàng hoặc sai credentials | Kiểm tra MySQL container đang chạy và env vars đúng |
