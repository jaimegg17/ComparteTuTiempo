import { ServiceList } from '@/features/service/service-list';
import { Header } from '@/widgets/header';

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Servicios Disponibles
        </h1>
        <ServiceList />
      </main>
    </div>
  );
}
