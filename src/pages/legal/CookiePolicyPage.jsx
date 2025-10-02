import React from 'react';

const CookiePolicyPage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Política de Cookies</h1>
        <div className="space-y-4 text-muted-foreground prose dark:prose-invert max-w-none">
          <p>
            <strong>Última actualización:</strong> 2 de Octubre, 2025
          </p>
          <p>
            Este documento es un marcador de posición. El contenido legal definitivo sobre la política de cookies de Wy Credito será insertado aquí por el equipo correspondiente.
            El propósito de esta página es asegurar que la navegación y la estructura del sitio web funcionen correctamente.
          </p>
          <h2 className="text-2xl font-semibold mt-8">¿Qué son las cookies?</h2>
          <p>
            Nuestra plataforma utiliza cookies para mejorar la experiencia del usuario, analizar el tráfico del sitio y personalizar el contenido.
            Una cookie es un pequeño archivo de texto que se almacena en tu navegador. Al utilizar nuestro sitio, usted acepta nuestro uso de cookies de acuerdo con esta política.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;