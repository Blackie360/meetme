import Image from "next/image"
import { WaitlistForm } from "./waitlist-form"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />

      {/* Animated circles */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 py-24 sm:px-6 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <div className="flex">
            <div className="relative flex items-center gap-x-2 rounded-full bg-purple-600/10 px-4 py-1 text-sm leading-6 text-purple-200 ring-1 ring-inset ring-purple-600/20">
              <span className="font-semibold">Early Access</span>
              <span className="h-0.5 w-0.5 rounded-full bg-purple-200" />
              <span>Limited spots available</span>
            </div>
          </div>
          <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Blend Your Spotify Experience
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Create, share, and discover the perfect Spotify Blends with friends. Take control of your collaborative
            playlists with advanced management tools.
          </p>

          <WaitlistForm />

          <div className="mt-10 flex items-center gap-x-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                  style={{
                    backgroundColor: `hsl(${260 + i * 10}, 70%, ${50 + i * 5}%)`,
                  }}
                />
              ))}
            </div>
            <div className="text-sm leading-6 text-gray-300">
              <strong className="font-semibold text-white">250+</strong> music lovers already joined
            </div>
          </div>
        </div>
        <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
          <div className="relative mx-auto h-80 w-80 overflow-hidden rounded-xl shadow-xl sm:h-96 sm:w-96 lg:h-[500px] lg:w-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-900 opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=500&width=500"
                width={500}
                height={500}
                alt="Spotify Blend visualization"
                className="h-full w-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M6 12c0-1.7.7-3.2 1.8-4.2" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M18 12c0 1.7-.7 3.2-1.8 4.2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">Spotify Blends</h3>
                <p className="mt-2 text-sm text-gray-200">
                  Seamlessly merge your music taste with friends and create the perfect shared playlists
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
