"use client";

import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import type { Service } from '@comparte-tu-tiempo/contracts';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      educacion: 'bg-blue-100 text-blue-800',
      hogar: 'bg-green-100 text-green-800',
      tecnologia: 'bg-purple-100 text-purple-800',
      salud: 'bg-red-100 text-red-800',
      deportes: 'bg-orange-100 text-orange-800',
      arte: 'bg-pink-100 text-pink-800',
      otros: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.otros;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'presencial') {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header con categoría y precio */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(service.category)}`}>
            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              {service.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">h</span>
          </div>
        </div>
        
        {/* Título del servicio */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {service.title}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Footer con información y botón */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Duración */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{service.duration}h</span>
            </div>
            
            {/* Tipo de servicio */}
            <div className="flex items-center space-x-1">
              {getTypeIcon(service.type)}
              <span className="capitalize">{service.type}</span>
            </div>
          </div>
        </div>
        
        {/* Botón de acción */}
        <Link href={`/services/${service.id}`} className="block">
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full"
          >
            Ver Detalles
          </Button>
        </Link>
      </div>
    </div>
  );
}
