import Footer from '@/components/ui/footer';
import '../app/globals.css';
import Header from '@/components/ui/header';
import { Suspense } from 'react';
// import { Skeleton } from '@/components/ui/skeleton'; // Adjust path based on your setup

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div
          className="min-h-screen flex flex-col text-white relative overflow-hidden"
          style={{
            background:
              'linear-gradient(to bottom left, #0F0931 1%, #110714 12%, #000000 15%, #000000 85%, #110714 88%, #0F0931 95%)',
          }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Suspense
                fallback={
                  <div className="container text-black mx-auto px-4 py-8">
                   Loading...
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}