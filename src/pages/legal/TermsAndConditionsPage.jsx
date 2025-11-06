import React from 'react';

const TermsAndConditionsPage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Términos y Condiciones de Uso - Wy Credito</h1>
        <div className="space-y-6 text-muted-foreground prose dark:prose-invert max-w-none">
          <p className="text-lg">
            <strong>Última actualización:</strong> 2 de Octubre, 2025
          </p>
          <p>
            El presente documento establece los Términos y Condiciones que rigen el uso de la plataforma digital de Wy Credito (en adelante, &quot;la Plataforma&quot;). Al acceder y utilizar nuestros servicios, usted (en adelante, &quot;el Usuario&quot;) declara haber leído, entendido y aceptado en su totalidad los presentes términos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">1. Objeto del Servicio</h2>
          <p>
            Wy Credito ofrece una plataforma tecnológica que facilita el proceso de solicitud y análisis de productos de financiamiento para empresas, de acuerdo con las políticas internas de la compañía y la regulación vigente en la República de Colombia.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">2. Tratamiento de Datos Personales (Habeas Data)</h2>
          <p>
            Al aceptar estos términos, el Usuario otorga su <strong>autorización previa, explícita e informada</strong> a Wy Credito para el tratamiento de sus datos personales y los de la empresa que representa, en concordancia con la Ley Estatutaria 1581 de 2012 y la Ley 1266 de 2008 (Ley de Habeas Data Financiero).
          </p>
          <p>
            La finalidad de este tratamiento incluye, pero no se limita a:
          </p>
          <ul className="list-disc list-inside">
            <li>Verificar la identidad del Usuario y la información de la empresa.</li>
            <li>Realizar el análisis de riesgo crediticio.</li>
            <li>Consultar, reportar y actualizar información en centrales de riesgo (operadores de información financiera) como TransUnion, Datacrédito, etc.</li>
            <li>Contactar al Usuario para asuntos relacionados con su solicitud.</li>
          </ul>
          <p>
            El Usuario tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales en cualquier momento, a través de los canales de atención que Wy Credito disponga para tal fin.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">3. Derechos y Deberes del Usuario</h2>
          <p>
            Es deber del Usuario suministrar información veraz, completa y actualizada durante todo el proceso de solicitud. Wy Credito no se hace responsable por las consecuencias derivadas de información inexacta o fraudulenta. Conforme al Estatuto del Consumidor (Ley 1480 de 2011), el Usuario tiene derecho a recibir información clara, transparente y oportuna sobre los productos y servicios ofrecidos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">4. Propiedad Intelectual</h2>
          <p>
            Todo el contenido, logos, código y diseño de la Plataforma son propiedad exclusiva de Wy Credito y están protegidos por las leyes de propiedad intelectual de Colombia.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">5. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a la jurisdicción de los jueces y tribunales de la ciudad de Bogotá D.C.
          </p>

          <p className="mt-12 italic">
            <strong>Nota Importante:</strong> Este es un documento preliminar. El contenido legal definitivo será proporcionado y validado por el equipo jurídico de Wy Credito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;