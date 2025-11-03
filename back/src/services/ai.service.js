let openaiClient = null;

function defaultSummary(query, items) {
  if (!items || items.length === 0) {
    return 'No encontré productos para esa búsqueda.';
  }
  const offers = items.filter(i => i.ofert || (i.discount && i.discount > 0)).length;
  const offerText = offers > 0 ? ` Hay ${offers} en oferta.` : '';
  const countText = `Encontré ${items.length} productos.`;
  return `${countText}${offerText}`.trim();
}

export async function aiSummarizeProducts(query, items) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return defaultSummary(query, items);
    }
    if (!openaiClient) {
      const OpenAI = (await import('openai')).default;
      openaiClient = new OpenAI({ apiKey: key });
    }

    const sample = items.slice(0, 6).map(i => {
      const parts = [i.name];
      // Eliminado el precio de la muestra para no inducir a la IA
      if (i.discount && i.discount > 0) parts.push(`${i.discount}% off`);
      if (i.category?.name) parts.push(`(${i.category.name})`);
      return parts.join(' ');
    }).join('\n');

    const prompt = [
      'Eres un asistente de tienda online en español.',
      `El usuario preguntó: "${(query || '').toString()}"`,
      'Resume en 1–2 frases los resultados sin inventar datos.',
      'No menciones precios ni rangos de precios. Destaca la cantidad encontrada y si hay ofertas.',
      'Listado (primeros):',
      sample
    ].join('\n');

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente útil que responde en español de forma breve y clara.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 120
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    return text || defaultSummary(query, items);
  } catch (err) {
    console.error('AI summarize error:', err);
    return defaultSummary(query, items);
  }
}

// --- NUEVO: resumen de tipos de artículos por categoría ---
function defaultCategoryTypesSummary(query, items, categoryName) {
  const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const toSingular = (w) => {
    if (!w) return w;
    if (w.endsWith('es')) return w.slice(0, -2);
    if (w.endsWith('s')) return w.slice(0, -1);
    return w;
  };
  const stop = new Set(['de','la','el','los','las','y','o','para','en','con','sin','un','una','unos','unas','que','del','por','al','geek','coleccion','coleccionables','juegos','figuras','comics','mangas','decoracion','accesorios']);
  const brands = new Set(['super','mario','harry','potter','marvel','dc','star','wars','pokemon','dragon','ball','naruto','one','piece']);
  const freq = new Map();
  for (const it of items) {
    const n = normalize(it.name);
    for (const t of n.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)) {
      if (t.length < 3) continue;
      if (stop.has(t) || brands.has(t)) continue;
      const k = toSingular(t);
      freq.set(k, (freq.get(k) || 0) + 1);
    }
  }
  const sorted = Array.from(freq.entries()).sort((a,b) => b[1]-a[1]).map(([w]) => w);
  const types = sorted.filter((_,i) => i < 8);
  if (types.length === 0) {
    return items && items.length > 0
      ? `En ${categoryName} encontrarás varios tipos de artículos como los mostrados.`
      : `No encontré productos en la categoría ${categoryName}.`;
  }
  return `En ${categoryName} encontrarás productos como: ${types.join(', ')}.`;
}

export async function aiSummarizeCategoryTypes(query, items, categoryName) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return defaultCategoryTypesSummary(query, items, categoryName);
    }
    if (!openaiClient) {
      const OpenAI = (await import('openai')).default;
      openaiClient = new OpenAI({ apiKey: key });
    }

    const sample = items.slice(0, 12).map(i => {
      const parts = [i.name];
      if (i.description) parts.push(i.description);
      if (i.category?.name) parts.push(`(${i.category.name})`);
      return parts.join(' ');
    }).join('\n');

    const prompt = [
      'Eres un asistente de tienda online en español.',
      `El usuario preguntó: "${(query || '').toString()}"`,
      `Basándote en los NOMBRES y DESCRIPCIONES de los productos de la categoría "${categoryName}", indica los TIPOS de artículos que se encuentran (ej. gorra, taza, llavero, figura).`,
      'No inventes tipos que no estén sugeridos por los datos. Devuelve 1–2 frases con 5–8 tipos en singular separados por coma.',
      'Listado de muestra:',
      sample
    ].join('\n');

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente útil que responde en español de forma breve y clara.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 160
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    return text || defaultCategoryTypesSummary(query, items, categoryName);
  } catch (err) {
    console.error('AI summarize types error:', err);
    return defaultCategoryTypesSummary(query, items, categoryName);
  }
}