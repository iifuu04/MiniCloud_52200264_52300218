import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    try {
        const resolvedParams = await params
        // Lấy tên file từ slug (ví dụ: blog1.html)
        const filename = resolvedParams.slug.join("/")

        // Kiểm tra nếu không có extension, thêm .html
        const filePath = filename.includes(".")
            ? join(process.cwd(), "public", "blog", filename)
            : join(process.cwd(), "public", "blog", `${filename}.html`)

        // Kiểm tra file có tồn tại không
        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 })
        }

        // Đọc file HTML
        const fileContent = await readFile(filePath, "utf-8")

        // Trả về với content-type HTML
        return new NextResponse(fileContent, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        })
    } catch (error) {
        // Nếu file không tồn tại, trả về 404
        console.error("Error serving blog-static file:", error)
        return new NextResponse("File not found", { status: 404 })
    }
}
