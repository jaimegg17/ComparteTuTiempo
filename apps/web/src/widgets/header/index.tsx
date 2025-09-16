"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/shared/ui/button";

export function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <header className="bg-[#C7D2D2] shadow-sm border-b w-full">
      <div className="w-full px-4 sm:px-6 py-2">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/images/logo.png" 
                alt="ComparteTuTiempo Logo" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-[#3C4242] ml-2">
                ComparteTuTiempo
              </span>
            </Link>
          </div>

          {/* Navegación - Responsive */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/"
              className="text-[#3C4242] hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/services"
              className="text-[#3C4242] hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="/communities"
              className="text-[#3C4242] hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Comunidades
            </Link>
            <Link
              href="/faq"
              className="text-[#3C4242] hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Acciones - Lado derecho */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoading && (
              <span className="text-gray-600 text-xs sm:text-sm">Cargando...</span>
            )}
            {error && (
              <span className="text-red-600 text-xs sm:text-sm">Error: {error.message}</span>
            )}
            {user ? (
              <>
                <span className="text-[#3C4242] text-xs sm:text-sm hidden sm:block">
                  ¡Hola, {user.name || user.email}!
                </span>
                <Link href="/api/auth/logout">
                  <Button
                    size="sm"
                    className="bg-[#1D2F3D] text-white hover:bg-[#0F1A23] transition-colors rounded-md px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm"
                  >
                    Salir
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/api/auth/login">
                  <Button
                    size="sm"
                    className="bg-[#1D2F3D] text-white hover:bg-[#0F1A23] transition-colors rounded-md px-4 py-2"
                  >
                    Entra
                  </Button>
                </Link>
                <Link href="/api/auth/login">
                  <Button 
                    size="sm" 
                    className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors rounded-md px-4 py-2"
                  >
                    Regístrate
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
