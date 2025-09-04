export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a ComparteTuTiempo!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tu plataforma para intercambiar habilidades usando horas como moneda
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-700">
            El frontend está funcionando correctamente. 
            <br />
            Ahora puedes acceder a la aplicación completa.
          </p>
        </div>
      </div>
    </div>
  );
}
