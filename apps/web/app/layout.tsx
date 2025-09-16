import type { Metadata } from 'next';
import { Actor } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/widgets/header';
import './globals.css';

const actor = Actor({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-actor'
});

export const metadata: Metadata = {
  title: 'ComparteTuTiempo - Banco de Tiempo',
  description: 'Plataforma para intercambiar habilidades usando horas como moneda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${actor.variable} font-actor`}>
        <Providers>
          <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <Header />
            <main className="w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
