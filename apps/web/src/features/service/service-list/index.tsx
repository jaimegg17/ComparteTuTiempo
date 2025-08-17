"use client";

import { useState } from 'react';
import { useServices } from '@/shared/hooks/use-services';
import { ServiceCard } from './service-card';
import { ServiceFilters } from './service-filters';
import type { ServiceListQuery } from '@comparte-tu-tiempo/contracts';

export function ServiceList() {
  const [query, setQuery] = useState<ServiceListQuery>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, error } = useServices(query);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los servicios</p>
      </div>
    );
  }

  if (!data?.services || data.services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron servicios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceFilters query={query} onQueryChange={setQuery} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.services.map((service: any) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Paginación básica */}
      {data.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setQuery((prev: ServiceListQuery) => ({ ...prev, page: prev.page - 1 }))}
            disabled={query.page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {query.page} de {data.totalPages}
          </span>
          <button
            onClick={() => setQuery((prev: ServiceListQuery) => ({ ...prev, page: prev.page + 1 }))}
            disabled={query.page >= data.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
