import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Política de Privacidad y Tratamiento de Datos</h1>
        <div className="space-y-6 text-muted-foreground prose dark:prose-invert max-w-none">
          <p className="text-lg">
            <strong>Última actualización:</strong> 2 de Octubre, 2025
          </p>
          <p>
            De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, Wy Credito se compromete a proteger la privacidad y seguridad de los datos personales de sus Usuarios. Esta política describe cómo recolectamos, usamos, almacenamos, circulamos y suprimimos la información.
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">1. Responsable del Tratamiento</h2>
          <p>
            <strong>Razón Social:</strong> Wy Credito Tecnología S.A.S. (Placeholder)<br />
            <strong>NIT:</strong> 900.000.000-1 (Placeholder)<br />
            <strong>Domicilio:</strong> Bogotá D.C., Colombia<br />
            <strong>Correo Electrónico:</strong> protecciondedatos@wycredito.com (Placeholder)
          </p>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">2. Finalidad de la Recolección de Datos</h2>
          <p>
            Los datos personales que recolectamos serán utilizados para las siguientes finalidades, autorizadas explícitamente por el Usuario:
          </p>
          <ul className="list-disc list-inside">
            <li>Evaluar la viabilidad y el riesgo para el otorgamiento de créditos.</li>
            <li>Validar la información suministrada en centrales de información financiera y otros operadores de datos.</li>
            <li>Gestionar el proceso de solicitud, desembolso y cobranza de obligaciones.</li>
            <li>Contactar al Usuario vía email, teléfono o WhatsApp para comunicaciones transaccionales y de servicio.</li>
            <li>Cumplir con requerimientos legales de autoridades competentes.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">3. Derechos del Titular (Habeas Data)</h2>
          <p>
            Como titular de la información, el Usuario tiene los siguientes derechos:
          </p>
           <ul className="list-disc list-inside">
            <li>Acceder en forma gratuita a los datos proporcionados que hayan sido objeto de tratamiento.</li>
            <li>Conocer, actualizar y rectificar su información frente a datos parciales, inexactos, incompletos, fraccionados, que induzcan a error, o aquellos cuyo tratamiento esté prohibido o no haya sido autorizado.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Presentar ante la Superintendencia de Industria y Comercio (SIC) quejas por infracciones a lo dispuesto en la normativa vigente.</li>
            <li>Revocar la autorización y/o solicitar la supresión del dato, siempre que no exista un deber legal o contractual que impida eliminarlos.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 border-b pb-2">4. Seguridad de la Información</h2>
          <p>
            Wy Credito adopta las medidas técnicas, humanas y administrativas necesarias para otorgar seguridad a los registros, evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.
          </p>

           <p className="mt-12 italic">
            <strong>Nota Importante:</strong> Este es un documento preliminar. El contenido legal definitivo será proporcionado y validado por el equipo jurídico de Wy Credito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;