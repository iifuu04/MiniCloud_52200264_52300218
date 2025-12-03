const staticBlogLinks = [
    {
        slug: "blog1",
        href: "/blog-static/blog1.html",
        title: "10 Cách Sống Xanh Tại Nhà",
        description: "Những mẹo đơn giản để bắt đầu lối sống bền vững ngay từ ngôi nhà của bạn.",
    },
    {
        slug: "blog2",
        href: "/blog-static/blog2.html",
        title: "Tái Chế Thông Minh: Hướng Dẫn Chi Tiết",
        description: "Học cách phân loại và tái chế rác thải một cách hiệu quả để bảo vệ môi trường.",
    },
    {
        slug: "blog3",
        href: "/blog-static/blog3.html",
        title: "Nông Nghiệp Bền Vững: Tương Lai Của Thực Phẩm",
        description: "Khám phá các phương pháp canh tác thân thiện với môi trường và bền vững.",
    },
]

export default function BlogStaticPage() {
    return (
        <div className="bg-background">
            <section className="bg-gradient-to-br from-green-50 dark:from-green-950/20 via-background to-background py-16">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-green-600 dark:text-green-400">Blog-Static</p>
                    <h1 className="text-4xl font-bold text-foreground">Sống Xanh - Hướng Dẫn Thực Tế</h1>
                    <p className="text-muted-foreground text-lg">
                        Những bài viết hữu ích về lối sống bền vững, bảo vệ môi trường và phát triển bền vững.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12 space-y-12">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Bài Viết HTML Tĩnh</h2>
                    <p className="text-muted-foreground">
                        Các bài viết được phục vụ trực tiếp qua Nginx alias tại <code className="bg-muted px-2 py-1 rounded">/blog-static/</code>
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {staticBlogLinks.map(item => (
                        <article key={item.slug} className="rounded-2xl border border-border bg-card/30 p-6 hover:border-green-600 dark:hover:border-green-400 transition-colors">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest">HTML tĩnh</p>
                            <h3 className="mt-2 text-xl font-semibold text-foreground">
                                <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    {item.title}
                                </a>
                            </h3>
                            <p className="text-muted-foreground mt-3">{item.description}</p>
                            <a className="mt-4 inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:underline" href={item.href} target="_blank" rel="noopener noreferrer">
                                Mở bài viết
                                <span aria-hidden>↗</span>
                            </a>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}

