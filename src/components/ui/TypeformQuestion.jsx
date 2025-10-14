import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';

// Wrapper visual para una pregunta estilo Typeform: centra el contenido,
// muestra título/descripción y opcionalmente el progreso y botón volver.
const TypeformQuestion = ({
  title,
  description,
  children,
  stepIndex = 0,
  totalSteps = 1,
  onPrev,
  showProgress = true,
  autoFit = true,
  layout = 'single', // 'single' | 'two' | 'three'
  aside = null,
  onSaveContinue,
  sessionId,
}) => {
  const progress = Math.round(((stepIndex + 1) / Math.max(totalSteps, 1)) * 100);

  // Autoajuste vertical: centra si hay espacio; alinea arriba si el contenido es alto
  const contentRef = useRef(null);
  const [justifyClass, setJustifyClass] = useState('justify-center');

  useEffect(() => {
    if (!autoFit) return;
    const recalc = () => {
      const viewport = window.innerHeight || 800;
      // Compensación aproximada por encabezado/timeline y barra flotante
      const headerComp = 140; // sticky header y timeline
      const footerComp = 0;   // sin barra flotante fija
      const available = Math.max(320, viewport - headerComp - footerComp);
      const el = contentRef.current;
      if (el) {
        const contentHeight = el.offsetHeight;
        setJustifyClass(contentHeight > available * 0.85 ? 'justify-start' : 'justify-center');
      }
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [children, autoFit]);

  return (
    <div className={`min-h-[50vh] sm:min-h-[56vh] flex flex-col items-center ${autoFit ? justifyClass : 'justify-start pt-8 sm:pt-12'}`}>
      {/* Progreso simple */}
      {showProgress && (
        <div className="w-full max-w-[860px] px-4 sm:px-6 mx-auto">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Paso {stepIndex + 1} de {totalSteps}
          </div>
        </div>
      )}

      {/* Contenido de la pregunta, sin tarjetas y con variantes de columnas */}
      <div className="w-full max-w-[1100px] px-4 sm:px-6 mt-2 sm:mt-3 mx-auto" ref={contentRef}>
        {layout === 'single' && (
          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
            )}
            <div className="mt-3 sm:mt-4">
              {children}
            </div>
            <div className="pt-4 sm:pt-6">
              <div className="flex items-center justify-start gap-4">
                <div className="text-xs text-muted-foreground">Paso {stepIndex + 1} de {totalSteps}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onPrev} disabled={!onPrev}>Atrás</Button>
                  <ShimmerButton onClick={() => { if (onSaveContinue) { onSaveContinue(); } }}>
                    Guardar y Continuar
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {layout === 'two' && (
          <div className="grid md:grid-cols-[360px_1fr] gap-6">
            <div>
              {onPrev && (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground mb-3"
                  onClick={onPrev}
                  aria-label="Volver"
                >
                  ← Volver
                </button>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">{title}</h2>
              {description && (
                <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
              )}
            </div>
            <div>
              {children}
              <p className="text-xs text-muted-foreground mt-4">Tip: Presione Enter o use la barra flotante para avanzar.</p>
            </div>
          </div>
        )}

        {layout === 'three' && (
          <div className="grid md:grid-cols-[300px_1fr_300px] gap-6">
            <div>
              {onPrev && (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground mb-3"
                  onClick={onPrev}
                  aria-label="Volver"
                >
                  ← Volver
                </button>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">{title}</h2>
              {description && (
                <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
              )}
            </div>
            <div>
              {children}
              <p className="text-xs text-muted-foreground mt-4">Tip: Presione Enter o use la barra flotante para avanzar.</p>
            </div>
            <div>{aside}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeformQuestion;