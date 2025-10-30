const pdfParse = require('pdf-parse');
const { rejectIfBot, setRobotsHeader } = require('./_bot');
const { createClient } = require('@supabase/supabase-js');

// Supabase admin client (service role)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function logEvent(entry) {
  try {
    if (!supabaseAdmin) return; // no bloquear flujo si no hay cliente
    await supabaseAdmin
      .from('orquestador_logs')
      .insert([entry]);
  } catch (_) {
    // No interrumpir el proceso por fallos de logging
  }
}

function classifyText(text) {
  const t = String(text || '').trim();
  if (!t) return 'NOISE';
  const valuePatterns = [
    /^\(?\s*[$€]?[-–]?\d{1,3}(?:[\.\s]\d{3})*(?:,\d+)?\s*\)?$/, // 1.234,00 ; (450.000)
    /^\(?\s*[$€]?[-–]?\d+(?:,\d+)?\s*\)?$/,                       // 1234,00 ; 708337481
    /^\(?\s*[$€]?[-–]?\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?\s*\)?$/ // 1,234.00 variant
  ];
  const isValue = valuePatterns.some((re) => re.test(t));
  if (isValue) return 'VALUE';
  const hasLetters = /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(t);
  const digitsRatio = (t.replace(/\D/g, '').length || 0) / t.length;
  if (hasLetters && digitsRatio < 0.5) return 'LABEL';
  return 'NOISE';
}

function associatePairs(blocks, yThreshold = 2.5) {
  const labels = blocks.filter((b) => b.type === 'LABEL');
  const values = blocks.filter((b) => b.type === 'VALUE');
  const pairs = [];
  for (const label of labels) {
    const sameLineValues = values.filter((v) => Math.abs(v.y - label.y) <= yThreshold);
    if (!sameLineValues.length) continue;
    const rightSide = sameLineValues
      .filter((v) => v.x >= label.x - 0.5)
      .sort((a, b) => (a.x - label.x) - (b.x - label.x));
    let candidate = rightSide[0];
    if (!candidate) {
      const alt = sameLineValues.sort((a, b) => Math.abs(a.x - label.x) - Math.abs(b.x - label.x));
      candidate = alt[0];
    }
    if (candidate) {
      pairs.push({
        label: label.text,
        value_raw: candidate.text,
        x: candidate.x,
        y: candidate.y,
      });
    }
  }
  return pairs;
}

// ----- FASE 2: Construcción de jerarquía (Stack por X) -----
function buildHierarchyFromPairs(pares, xEpsilon = 1.0) {
  const sorted = [...pares].sort((a, b) => a.y - b.y);
  const forest = [];
  const stack = [];

  for (const p of sorted) {
    const node = { label: p.label, value_raw: p.value_raw, x: p.x, y: p.y, children: [] };

    // Pop mientras el X actual sea menor (con tolerancia) que la cima
    while (stack.length && (node.x < stack[stack.length - 1].x - xEpsilon)) {
      stack.pop();
    }

    if (!stack.length) {
      forest.push(node);
      stack.push(node);
      continue;
    }

    const top = stack[stack.length - 1];
    if (node.x > top.x + xEpsilon) {
      // Hijo del top
      top.children.push(node);
      stack.push(node);
    } else if (Math.abs(node.x - top.x) <= xEpsilon) {
      // Hermano: adjuntar al padre si existe, si no al bosque
      if (stack.length >= 2) {
        const parent = stack[stack.length - 2];
        parent.children.push(node);
      } else {
        forest.push(node);
      }
      // Reemplazar el top lógico por el nuevo hermano
      stack[stack.length - 1] = node;
    } else {
      // Menor pero no suficiente para haber sido expulsado por el while: tratar como nivel superior
      forest.push(node);
      stack.length = 0;
      stack.push(node);
    }
  }

  return forest;
}

// ----- Limpieza de valores numéricos -----
function cleanValue(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;

  const isNegative = /\(.*\)/.test(s) || /^\s*[-–]/.test(s);
  s = s.replace(/[$€\s]/g, '');
  s = s.replace(/[–]/g, '-');

  // Mantener solo dígitos y separadores . ,
  s = (s.match(/[0-9.,]+/g) || []).join('');
  if (!s) return null;

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let decimalSep = null;
  let thousandsSep = null;

  if (lastDot !== -1 && lastComma !== -1) {
    decimalSep = lastDot > lastComma ? '.' : ',';
    thousandsSep = decimalSep === '.' ? ',' : '.';
  } else if (lastDot !== -1) {
    const decimalsLen = s.length - lastDot - 1;
    decimalSep = (decimalsLen === 2 || decimalsLen === 3) ? '.' : null;
    thousandsSep = decimalSep ? null : '.';
  } else if (lastComma !== -1) {
    const decimalsLen = s.length - lastComma - 1;
    decimalSep = (decimalsLen === 2 || decimalsLen === 3) ? ',' : null;
    thousandsSep = decimalSep ? null : ',';
  }

  if (thousandsSep) {
    const re = new RegExp(`\\${thousandsSep}`, 'g');
    s = s.replace(re, '');
  }
  if (decimalSep) {
    const re = new RegExp(`\\${decimalSep}`);
    s = s.replace(re, '.');
  }

  let num = Number.parseFloat(s);
  if (Number.isNaN(num)) return null;
  num = Math.round(num);
  return isNegative ? -num : num;
}

// ----- Extracción de metadatos -----
function extractEstadoFinanciero(text) {
  const patterns = [
    /Estado\s+de\s+Situaci[óo]n\s+Financiera/i,
    /Estado\s+de\s+Resultados/i,
    /Estado\s+de\s+Flujo\s+de\s+Efectivo/i,
    /Estado\s+de\s+Cambios\s+en\s+el\s+Patrimonio/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      return m[0]
        .replace(/\s+/g, ' ')
        .replace(/Situaci[óo]n/i, 'Situacion')
        .trim();
    }
  }
  return 'Estado de Situacion Financiera';
}

function normalizeDateToISO(s) {
  if (!s) return null;
  s = s.trim();
  // YYYY-MM-DD
  let m = s.match(/(20\d{2})[-\/](\d{2})[-\/](\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD/MM/YYYY or DD-MM-YYYY
  m = s.match(/(\d{2})[-\/](\d{2})[-\/](20\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function extractFechaBalance(text) {
  const m = text.match(/(\d{4}[-\/]\d{2}[-\/]\d{2}|\d{2}[-\/]\d{2}[-\/]\d{4})/);
  return normalizeDateToISO(m ? m[0] : null);
}

function extractNit(text, pares) {
  let m = text.match(/N\s*I\s*T\s*[:\-]?\s*([0-9.,\-\s]{5,})/i);
  let raw = m ? m[1] : null;
  if (!raw && Array.isArray(pares)) {
    const p = pares.find((x) => /\bNIT\b/i.test(x.label));
    raw = p ? p.value_raw : null;
  }
  if (!raw) return null;
  const digits = (raw.match(/\d+/g) || []).join('');
  return digits ? Number.parseInt(digits, 10) : null;
}

function extractNombreEmpresa(pagesItems, text) {
  // Preferir Razón Social explícita
  let m = text.match(/Raz[oó]n\s+Social\s*[:\-]?\s*([A-Z0-9 .,&\-]{5,})/i);
  if (m) return m[1].trim();

  // Heurística: primera línea superior en página 1 que parezca nombre de empresa
  const firstPage = Array.isArray(pagesItems) && pagesItems.length ? pagesItems[0] : [];
  const sorted = [...firstPage].sort((a, b) => a.y - b.y);
  for (const it of sorted) {
    const t = String(it.text || '').trim();
    if (!t) continue;
    const isUpper = t === t.toUpperCase();
    const hasLetters = /[A-Za-zÁÉÍÓÚÑ]/.test(t);
    const hasDigits = /\d/.test(t);
    const forbidden = /(ESTADO|SITUACION|FINANCIERA|BALANCE|NIT|FECHA)/i;
    if (isUpper && hasLetters && !hasDigits && !forbidden.test(t) && t.length > 6) {
      return t.replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

// ----- Aplanamiento al molde estados_financieros -----
function flattenHierarchy(forest, meta) {
  const rows = [];
  const walk = (node, path) => {
    const newPath = [...path, node.label];
    if (node.value_raw != null && String(node.value_raw).trim() !== '') {
      const cleaned = cleanValue(node.value_raw);
      if (cleaned != null) {
        const mapping = {
          cuenta: newPath[0] || null,
          subcuenta: newPath[1] || null,
          subcuenta_1: newPath[2] || null,
          subcuenta_2: newPath[3] || null,
        };
        rows.push({
          solicitud_id: meta.solicitud_id,
          nombre_empresa: meta.nombre_empresa || null,
          nit: meta.nit || null,
          fecha_balance: meta.fecha_balance || null,
          estado_financiero: meta.estado_financiero || 'Estado de Situacion Financiera',
          ...mapping,
          valor: cleaned,
        });
      }
    }
    for (const ch of node.children || []) walk(ch, newPath);
  };
  for (const root of forest || []) walk(root, []);
  return rows;
}

module.exports = async function handler(req, res) {
  setRobotsHeader(res);
  if (rejectIfBot(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let payload = {};
  try {
    payload = req.body ?? {};
  } catch (_) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { fileUrl, solicitud_id } = payload || {};
  if (!fileUrl || !solicitud_id) {
    return res.status(400).json({ error: 'Missing `fileUrl` or `solicitud_id`' });
  }

  try {
    // Registro de inicio
    await logEvent({
      solicitud_id,
      step: 'extraccion_ia',
      status: 'iniciado',
      message: 'Iniciando extracción de PDF...',
      payload: { fileUrl },
    });
    const resp = await fetch(fileUrl);
    if (!resp.ok) {
      return res.status(400).json({ error: `Unable to fetch file: ${resp.status}` });
    }
    const ab = await resp.arrayBuffer();
    const buffer = Buffer.from(ab);

    const pagesItems = [];
    const data = await pdfParse(buffer, {
      pagerender: (pageData) => {
        return pageData.getTextContent().then((textContent) => {
          const items = (textContent.items || []).map((item) => {
            const tr = item.transform || [1, 0, 0, 1, 0, 0];
            const x = tr[4];
            const y = tr[5];
            return {
              text: String(item.str || ''),
              x,
              y,
              width: item.width,
              height: item.height,
              dir: item.dir,
            };
          });
          pagesItems.push(items);
          return items.map((i) => i.text).join(' ');
        });
      },
    });

    const blocks = [];
    pagesItems.forEach((items, pageIdx) => {
      items.forEach((it) => {
        const type = classifyText(it.text);
        if (type === 'NOISE') return;
        blocks.push({ text: it.text.trim(), x: it.x, y: it.y, page: pageIdx + 1, type });
      });
    });

    const pares = associatePairs(blocks);
    // FASE 2: Construir jerarquía y aplanar
    const forest = buildHierarchyFromPairs(pares);
    const paginas_procesadas = typeof data.numpages === 'number' ? data.numpages : pagesItems.length;
    const bloques_totales = blocks.length;

    // Metadatos del documento
    const fullText = String(data.text || '');
    const metaDoc = {
      solicitud_id,
      estado_financiero: extractEstadoFinanciero(fullText),
      nombre_empresa: extractNombreEmpresa(pagesItems, fullText),
      nit: extractNit(fullText, pares),
      fecha_balance: extractFechaBalance(fullText),
    };

    const rows = flattenHierarchy(forest, metaDoc);
    // Validación de esquema: conservar solo filas válidas
    const filasValidas = rows.filter((r) => {
      const hasSolicitud = !!r?.solicitud_id;
      const hasFecha = typeof r?.fecha_balance === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha_balance);
      const hasCuenta = r?.cuenta != null && String(r.cuenta).trim() !== '';
      const hasValor = typeof r?.valor === 'number' && !Number.isNaN(r.valor);
      return hasSolicitud && hasFecha && hasCuenta && hasValor;
    });

    // FASE 3: Insert masivo en Supabase
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not configured' });
    }
    try {
      if (filasValidas.length > 0) {
        const { error } = await supabaseAdmin
          .from('estados_financieros')
          .insert(filasValidas);
        if (error) {
          // Registro de error en insert
          await logEvent({
            solicitud_id,
            step: 'extraccion_ia',
            status: 'error',
            message: `Error en INSERT estados_financieros: ${error.message}`,
            payload: { filas_a_insertar: filasValidas.length, paginas_procesadas, bloques_totales },
          });
          return res.status(500).json({ error: error.message });
        }
      }

      // Registro de éxito
      await logEvent({
        solicitud_id,
        step: 'extraccion_ia',
        status: 'exito',
        message: 'Extracción e inserción completadas.',
        payload: { filas_insertadas: filasValidas.length, paginas_procesadas, bloques_totales },
      });
      return res.status(200).json({
        status: 'Éxito: Datos extraídos y guardados en Supabase.',
        solicitud_id,
        filas_insertadas: filasValidas.length,
      });
    } catch (e) {
      await logEvent({
        solicitud_id,
        step: 'extraccion_ia',
        status: 'error',
        message: e?.message || 'Insert failed',
        payload: {},
      });
      return res.status(500).json({ error: e?.message || 'Insert failed' });
    }
  } catch (err) {
    // Registro de error general
    await logEvent({
      solicitud_id,
      step: 'extraccion_ia',
      status: 'error',
      message: err?.message || 'Unexpected error',
      payload: {},
    });
    return res.status(500).json({ error: err?.message || 'Unexpected error' });
  }
};