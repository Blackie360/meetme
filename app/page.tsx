import { HeroSection } from "@/components/hero-section"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark">
      <main className="min-h-screen bg-background">
        <HeroSection />
      </main>
    </ThemeProvider>
  )
}
