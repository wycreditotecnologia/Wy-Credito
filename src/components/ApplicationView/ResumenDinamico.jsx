import React from 'react';

const ResumenDinamico = ({ formData }) => {
  return (
    <div className="sticky top-40 space-y-4 text-sm">
      {formData?.razonSocial && (
        <div>
          <p className="font-semibold text-muted-foreground">Razón Social</p>
          <p>{formData.razonSocial}</p>
        </div>
      )}
      {formData?.nit && (
        <div>
          <p className="font-semibold text-muted-foreground">NIT</p>
          <p>{formData.nit}</p>
        </div>
      )}
      {/* Agrega aquí más campos del formData a medida que se necesiten */}
      {formData?.documentos && formData.documentos.camaraComercio && (
         <div>
          <p className="font-semibold text-muted-foreground">Cámara de Comercio</p>
          <p className="text-green-500">✅ Cargada</p>
        </div>
      )}
    </div>
  );
};

export default ResumenDinamico;