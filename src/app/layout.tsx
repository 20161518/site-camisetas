import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AudioProvider } from '@/context/AudioContext';
import { AuthProvider } from '@/context/AuthContext';
import CartButton from '@/components/CartButton';
import AudioPlayer from '@/components/AudioPlayer';
import AccountButton from '@/components/AccountButton';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ONSTAGE - Camisetas Masculinas',
  description: 'Liquidação de camisetas masculinas. Estoque limitado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <Suspense fallback={null}>
            <AuthProvider>
              <AudioProvider>
                {children}
                <CartButton />
                <AudioPlayer />
                <AccountButton />
              </AudioProvider>
            </AuthProvider>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
