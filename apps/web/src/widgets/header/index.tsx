"use client";

import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              ComparteTuTiempo
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Inicio
            </Link>
            <Link href="/services" className="text-gray-600 hover:text-gray-900">
              Servicios
            </Link>
            <Link href="/communities" className="text-gray-600 hover:text-gray-900">
              Comunidades
            </Link>
            <Link href="/messages" className="text-gray-600 hover:text-gray-900">
              Mensajes
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
