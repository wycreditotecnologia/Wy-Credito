import React, { useEffect, useMemo, useState } from 'react';

// Componente de lista de opciones con letras (A, B, C, ...), estilo Typeform
// Uso básico:
// <LetteredOptions options={["Opción 1", "Opción 2"]} value={value} onChange={setValue} />
// - options puede ser array de strings o de objetos { id, label, description }
// - value puede ser el índice, el id del objeto o la propia opción (para strings)

const getLetter = (index) => String.fromCharCode(65 + index); // 65 => 'A'

const normalizeOptions = (options) => (
  (options || []).map((opt, idx) => (
    typeof opt === 'string'
      ? { key: idx, id: idx, label: opt, description: undefined }
      : { key: opt.id ?? idx, id: opt.id ?? idx, label: opt.label ?? String(opt), description: opt.description }
  ))
);

const isEqualValue = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  // Comparar por id si existen
  if (typeof a === 'object' && typeof b === 'object') {
    return a.id != null && b.id != null && a.id === b.id;
  }
  return false;
};

export default function LetteredOptions({
  options,
  value,
  defaultValue = null,
  onChange,
  disabled = false,
  className = '',
}) {
  const items = useMemo(() => normalizeOptions(options), [options]);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value !== undefined ? value : internal;

  const resolveSelectedIndex = () => {
    if (selected == null) return -1;
    // selected puede ser índice, id o objeto con id
    if (typeof selected === 'number') {
      return selected >= 0 && selected < items.length ? selected : -1;
    }
    const selectedId = typeof selected === 'object' ? selected.id : selected;
    return items.findIndex((it) => it.id === selectedId);
  };

  const selectedIndex = resolveSelectedIndex();

  const handleSelect = (index) => {
    const item = items[index];
    if (!item || disabled) return;
    const nextValue = item.id; // devolvemos id estable
    if (value === undefined) setInternal(nextValue);
    onChange && onChange(nextValue, item);
  };

  // Atajos de teclado: A/B/C... para seleccionar
  useEffect(() => {
    const handler = (e) => {
      if (disabled) return;
      const code = e.key.toUpperCase().charCodeAt(0);
      const index = code - 65; // 'A' => 0
      if (index >= 0 && index < items.length) {
        e.preventDefault();
        handleSelect(index);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, disabled]);

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {items.map((item, idx) => {
        const letter = getLetter(idx);
        const active = idx === selectedIndex;
        return (
          <button
            type="button"
            key={item.key}
            onClick={() => handleSelect(idx)}
            disabled={disabled}
            className={[
              'w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3 transition',
              active ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300',
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            aria-pressed={active}
          >
            <span
              className={[
                'inline-flex items-center justify-center h-7 w-7 rounded-md font-semibold',
                active ? 'bg-primary text-white' : 'bg-white text-gray-800 border border-gray-300',
              ].join(' ')}
              aria-hidden="true"
            >
              {letter}
            </span>
            <div className="flex-1">
              <div className="text-sm sm:text-base font-medium text-neutral-900">{item.label}</div>
              {item.description && (
                <div className="text-xs sm:text-sm text-neutral-600 mt-0.5">{item.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}