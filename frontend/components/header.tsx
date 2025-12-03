"use client"

import Link from "next/link"
import { useState } from "react"
import { Leaf, Menu, X } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

const navLinks = [
  { label: "Trang Chủ", href: "/" },
  { label: "Blog-Static", href: "/blog-static" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 animate-slide-in-left">
            <Leaf className="w-8 h-8 text-green-600 dark:text-green-400 animate-float" />
            <h1 className="text-2xl font-bold text-foreground">Sống Xanh</h1>
          </Link>

          <nav className="hidden md:flex gap-8 items-center animate-slide-in-right">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Đóng menu điều hướng"
            onClick={closeMenu}
          />
          <div className="ml-auto h-full w-72 bg-card border-l border-border shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-lg font-semibold text-foreground">Menu</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground"
                onClick={closeMenu}
                aria-label="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-foreground hover:text-green-600 dark:hover:text-green-400"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
