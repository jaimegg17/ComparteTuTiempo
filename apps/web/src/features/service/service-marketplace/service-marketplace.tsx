"use client"

import { useState } from "react"
import { Search, Heart, MessageCircle, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const services = [
  {
    id: 1,
    title: "Clases diseño",
    category: "Oferta",
    duration: "120 min",
    image: "/design-class-woman-hoodie.png",
    bgColor: "bg-gray-200",
  },
  {
    id: 2,
    title: "Clase fotografía",
    category: "Oferta",
    duration: "60 min",
    image: "/happy-woman-photography-class.png",
    bgColor: "bg-cyan-200",
  },
  {
    id: 3,
    title: "Soft skills",
    category: "Oferta",
    duration: "90 min",
    image: "/soft-skills-woman-hoodie.png",
    bgColor: "bg-pink-200",
  },
  {
    id: 4,
    title: "Necesito niñera",
    category: "Demanda",
    price: "$77.00",
    image: "/babysitter-woman-yellow.png",
    bgColor: "bg-yellow-300",
  },
  {
    id: 5,
    title: "Corte de pelo urgente",
    category: "Demanda",
    duration: "45 min",
    image: "/surprised-woman-urgent-haircut.png",
    bgColor: "bg-gray-100",
  },
  {
    id: 6,
    title: "Clases de pádel",
    category: "Oferta",
    image: "/padel-woman-orange.png",
    bgColor: "bg-orange-400",
  },
]

const filterSections = [
  { title: "Categorías", expanded: true },
  { title: "Valoración", expanded: true },
  { title: "Disponibilidad", expanded: true },
  { title: "Duración", expanded: true },
  { title: "Tipo", expanded: true },
  { title: "Presencialidad", expanded: true },
  { title: "Idioma", expanded: true },
]

export function ServiceMarketplace() {
  const [activeTab, setActiveTab] = useState("Nuevas")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
              </div>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Inicio
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Servicios
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Comunidades
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                FaQ
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search" className="pl-10 w-64 bg-gray-100 border-0" />
            </div>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <h2 className="text-lg font-semibold mb-6">Filtros</h2>

          <div className="space-y-6">
            {filterSections.map((section) => (
              <div key={section.title}>
                <button className="flex items-center justify-between w-full text-left">
                  <span className="text-sm font-medium text-gray-700">{section.title}</span>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            ))}

            {/* Duration Range Slider */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Duración</h3>
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>40 min</span>
                  <span>100 min</span>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "bg-red-400",
                  "bg-orange-400",
                  "bg-yellow-400",
                  "bg-green-400",
                  "bg-blue-400",
                  "bg-purple-400",
                  "bg-pink-400",
                  "bg-gray-400",
                ].map((color) => (
                  <div key={color} className={`w-6 h-6 rounded-full ${color} cursor-pointer`}></div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex space-x-8 mb-6">
            {["Nuevas", "Recomendadas"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`relative h-48 ${service.bgColor}`}>
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    {service.duration && <span className="text-sm text-gray-500">{service.duration}</span>}
                    {service.price && <span className="text-sm font-semibold">{service.price}</span>}
                  </div>
                  <p className="text-sm text-gray-600">{service.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Contáctanos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Incidencias
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ's
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Sobre nosotros</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Historia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Colaboraciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Más información</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Política de privacidad
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-400">
                Eklingpura Chouraha, Ahmedabad Main Road
                <br />
                (NH 8- Near Mahadev Hotel) Udaipur, India- 313002
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs">f</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs">@</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs">t</span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs">in</span>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Copyright © 2025 ComparteTuTiempo Arroyo Pvt Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
