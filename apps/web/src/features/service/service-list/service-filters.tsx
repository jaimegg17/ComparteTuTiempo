"use client";

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import type { ServiceListQuery } from '@comparte-tu-tiempo/contracts';

interface ServiceFiltersProps {
  query: ServiceListQuery;
  onQueryChange: (query: ServiceListQuery) => void;
}

export function ServiceFilters({ query, onQueryChange }: ServiceFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(query.q || '');

  const categories = [
    { value: 'educacion', label: 'Educación' },
    { value: 'hogar', label: 'Hogar' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'salud', label: 'Salud' },
    { value: 'deportes', label: 'Deportes' },
    { value: 'arte', label: 'Arte' },
    { value: 'otros', label: 'Otros' },
  ];

  const types = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrido', label: 'Híbrido' },
  ];

  const handleSearch = () => {
    onQueryChange({ ...query, q: searchTerm, page: 1 });
  };

  const handleCategoryFilter = (category: string | null) => {
    onQueryChange({ 
      ...query, 
      category: (category as any) || undefined, 
      page: 1 
    });
  };

  const handleTypeFilter = (type: string | null) => {
    onQueryChange({ 
      ...query, 
      type: (type as any) || undefined, 
      page: 1 
    });
  };

  const clearFilters = () => {
    onQueryChange({
      page: 1,
      pageSize: query.pageSize,
    });
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Filtros de Búsqueda
      </h2>
      
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleSearch} size="sm">
            Buscar
          </Button>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categoría</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!query.category ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter(null)}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={query.category === category.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtros por tipo */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Servicio</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!query.type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter(null)}
          >
            Todos
          </Button>
          {types.map((type) => (
            <Button
              key={type.value}
              variant={query.type === type.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleTypeFilter(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Botón limpiar filtros */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}
