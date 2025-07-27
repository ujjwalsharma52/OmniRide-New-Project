import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import SiteHeader from '@/components/site-header';
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'OmniRide',
  description: 'Your ride, your way.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            </div>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}