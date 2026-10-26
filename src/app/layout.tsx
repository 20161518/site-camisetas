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
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LOJA - Camisetas Masculinas Exclusivas',
  description: 'Liquidação de camisetas masculinas. Estoque limitado e peças únicas.',
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
                <Footer />
                <CartButton />
                <AccountButton />
                <WhatsAppButton />
                <AudioPlayer />
              </AudioProvider>
            </AuthProvider>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
