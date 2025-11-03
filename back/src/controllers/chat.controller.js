import { Op } from 'sequelize';
import { Product, Category } from '../models/index.js';
import { paymentsConfig } from '../config/payments.js';
import { aiSummarizeProducts, aiSummarizeCategoryTypes } from '../services/ai.service.js';

const productKeywords = [
  'producto','productos','precio','precios','valor','valores','oferta','ofertas','descuento','stock','disponible','buscar','ver','catalogo','catálogo','categoria','categoría',
  // Tipos comunes de artículos
  'remera','remeras','camiseta','camisetas','taza','tazas','gorra','gorras','buzo','buzos','hoodie','sudadera',
  'llavero','llaveros','figura','figuras','peluche','peluches','poster','posters','vaso','vasos',
  // Añadir familia genérica para clasificar consultas como “tienen ropa?”
  'ropa','prenda','prendas'
];
const paymentKeywords = [
  'pago','pagos','tarjeta','efectivo','transferencia','mercado pago','mp','cuotas','factura','comprobante'
];
const shippingKeywords = [
  'envio','envios','envío','envíos','entrega','entregas','delivery','envian','enviar','envias','envías','envio a domicilio','envios a domicilio','correo','mensajeria','mensajería','retiro','retirar','retiran'
];

function normalize(text) {
  return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Conversión sencilla singular/plural (heurística)
function toSingular(word) {
  if (!word) return word;
  if (word.endsWith('es')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}
function toPlural(word) {
  if (!word) return word;
  const last = word[word.length - 1];
  const vowels = new Set(['a','e','i','o','u']);
  if (vowels.has(last)) return word + 's';
  return word + 'es';
}

function extractMatches(message, keywords) {
  const m = normalize(message);
  return keywords.filter(k => m.includes(normalize(k)));
}

function classifyMessage(message) {
  const productMatches = extractMatches(message, productKeywords);
  const paymentMatches = extractMatches(message, paymentKeywords);
  const shippingMatches = extractMatches(message, shippingKeywords);

  const scores = {
    productos: productMatches.length,
    medios_pagos: paymentMatches.length,
    envios: shippingMatches.length,
  };

  let category = 'pregunta_no_valida';
  const maxScore = Math.max(scores.productos, scores.medios_pagos, scores.envios);
  if (maxScore > 0) {
    if (scores.productos === maxScore) category = 'productos';
    else if (scores.envios === maxScore) category = 'envios';
    else category = 'medios_pagos';
  }

  // Heurística extra: saludos + sustantivos de producto => productos
  const m = normalize(message);
  const greetings = ['hola','buenas','buenos dias','buenas tardes','buenas noches','qué tal','que tal'];
  const hasGreeting = greetings.some(g => m.includes(g));
  const tokens = m.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const productNouns = new Set([
    'remera','camiseta','taza','gorra','buzo','hoodie','sudadera','llavero','figura','peluche','poster','vaso'
  ]);
  const hasProductNoun = tokens.some(t => productNouns.has(t) || productNouns.has(toSingular(t)));

  if (category === 'pregunta_no_valida' && (hasProductNoun || (hasGreeting && hasProductNoun))) {
    category = 'productos';
    scores.productos += 1;
  }

  const matchedKeywords = [...new Set([...productMatches, ...paymentMatches, ...shippingMatches])];
  const confidence = Math.min(1, (scores.productos + scores.medios_pagos + scores.envios) / 4);

  return { category, matchedKeywords, confidence, scores };
}

async function handleProductsQuery(message) {
  const m = normalize(message);
  const categories = await Category.findAll({ where: { active: true }, attributes: ['id','name'] });

  // Detectar categoría mencionada en mensaje
  let selectedCategoryId = null;
  for (const c of categories) {
    const cname = normalize(c.name);
    if (cname && m.includes(cname)) { selectedCategoryId = c.id; break; }
  }

  // También buscar por palabras individuales de la categoría
  if (!selectedCategoryId) {
    for (const c of categories) {
      const cname = normalize(c.name);
      const categoryWords = cname.split(/\s+/);
      for (const word of categoryWords) {
        if (word.length >= 3 && m.includes(word)) {
          selectedCategoryId = c.id;
          break;
        }
      }
      if (selectedCategoryId) break;
    }
  }

  const isOffer = m.includes('oferta') || m.includes('ofertas') || m.includes('descuento');
  const requireStock = m.includes('stock') || m.includes('disponible');

  // Extraer términos de búsqueda útiles
  const stopwords = new Set([
    'de','la','el','los','las','y','o','para','en','con','sin',
    'un','una','unos','unas','que','del','hay',
    // Verbos y frases genéricas que no ayudan a buscar
    'tiene','tienen','tenes','tenés',
    'busco','buscar',
    'quiero','quisiera',
    'venden','vende'
  ]);
  const ignore = new Set(['producto','productos','precio','oferta','ofertas','descuento','stock','disponible','buscar','ver','catalogo','catálogo','categoria','categoría']);
  const categoryNames = new Set(categories.map(c => normalize(c.name)));
  // También agregar palabras individuales de categorías al set de nombres
  categories.forEach(c => {
    const cname = normalize(c.name);
    const words = cname.split(/\s+/);
    words.forEach(word => {
      if (word.length >= 3) categoryNames.add(word);
    });
  });
  const tokens = m.replace(/[^a-z0-9áéíóúñ\s]/g, ' ').split(/\s+/).filter(Boolean);
  const searchTerms = tokens.filter(t => t.length >= 3 && !stopwords.has(t) && !ignore.has(t) && !categoryNames.has(t));

  // Sinónimos y formas para categorías (ej: 'juego' -> 'juguetes')
  if (!selectedCategoryId) {
    const catMap = new Map(categories.map(c => [normalize(c.name), c.id]));
    const categorySynonyms = {
      'juego': 'juegos y coleccionables',
      'juegos': 'juegos y coleccionables',
      'juguete': 'juegos y coleccionables',
      'juguetes': 'juegos y coleccionables',
      'figura': 'figuras de coleccion',
      'figuras': 'figuras de coleccion',
      'comic': 'comics y mangas',
      'comics': 'comics y mangas',
      'manga': 'comics y mangas',
      'mangas': 'comics y mangas',
      'decoracion': 'decoracion',
      'accesorio': 'accesorios',
      'accesorios': 'accesorios',
      'ropa': 'ropa geek',
      'remera': 'ropa geek',
      'buzo': 'ropa geek',
      'camiseta': 'ropa geek'
    };
    for (const t of tokens) {
      const synTarget = categorySynonyms[t];
      if (synTarget && catMap.has(synTarget)) {
        selectedCategoryId = catMap.get(synTarget);
        break;
      }
    }
    // También intentar coincidencias por singular/plural exactos
    if (!selectedCategoryId) {
      for (const c of categories) {
        const cname = normalize(c.name);
        const cnameSing = toSingular(cname);
        if (tokens.includes(cnameSing) || tokens.includes(cname)) {
          selectedCategoryId = c.id;
          break;
        }
      }
    }
  }

  // Ampliar términos con sinónimos para dar “más libertad”
  const synonymMap = {
    remera: ['camiseta','playera','polera','franela','t-shirt'],
    camisetas: ['remera','playera'],
    buzo: ['hoodie','sudadera'],
    sudadera: ['buzo','hoodie'],
    gorra: ['cap'],
    taza: ['mug'],
    poster: ['póster','afiche','poster'],
    peluche: ['plush','muñeco'],
    llavero: ['keychain'],
    figura: ['action figure','estatua','coleccion'],
    vaso: ['cup']
  };
  const getSynonyms = (word) => {
    const w = normalize(toSingular(word));
    return synonymMap[w] || [];
  };

  const where = { active: true };
  if (isOffer) where.ofert = true;
  if (requireStock) where.stock = { [Op.gt]: 0 };
  if (selectedCategoryId) where.categoryId = selectedCategoryId;

  // Búsqueda textual por nombre y descripción con sinónimos
  const expandedSearchTerms = searchTerms.flatMap(term => {
    const base = Array.from(new Set([term, toSingular(term), toPlural(term)]));
    const syns = getSynonyms(term).flatMap(s => [s, toSingular(s), toPlural(s)]);
    return Array.from(new Set([...base, ...syns]));
  }).filter(v => v && v.length >= 3);

  if (expandedSearchTerms.length > 0) {
    where[Op.and] = expandedSearchTerms.map(v => ({
      [Op.or]: [
        { name: { [Op.like]: `%${v}%` } },
        { description: { [Op.like]: `%${v}%` } }
      ]
    }));
  }

  // Primera pasada: respetando categoría si se detectó
  let rows = await Product.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id','name'] }],
    limit: 40,
    order: [ ['ofert','DESC'], ['discount','DESC'], ['price','ASC'] ]
  });

  // Fallback: si no hay resultados y había categoría + términos, reintentar sin categoría
  if (rows.length === 0 && selectedCategoryId && expandedSearchTerms.length > 0) {
    const relaxedWhere = { ...where };
    delete relaxedWhere.categoryId;
    rows = await Product.findAll({
      where: relaxedWhere,
      include: [{ model: Category, as: 'category', attributes: ['id','name'] }],
      limit: 40,
      order: [ ['ofert','DESC'], ['discount','DESC'], ['price','ASC'] ]
    });
  }

  const items = rows.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    discount: p.discount,
    ofert: p.ofert,
    stock: p.stock,
    imagenPath: p.imagenPath,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
  }));

  let reply;
  if (items.length > 0) {
    reply = await aiSummarizeProducts(message, items);
  } else {
    reply = 'No encontré productos que coincidan con tu búsqueda. Puedes intentar con otra palabra clave o categoría.';
  }

  return { reply, data: { items, total: items.length } };
}

function handlePaymentsQuery(message) {
  const m = normalize(message);
  const opts = paymentsConfig?.methods || [];
  const hasInstallments = opts.includes('cuotas') || opts.includes('mercado_pago');
  const reply = `Aceptamos: ${opts.join(', ')}${hasInstallments ? ' • Ofrecemos cuotas con Mercado Pago' : ''}.`;
  return { reply, data: { methods: opts, installments: !!hasInstallments } };
}

function handleShippingQuery(message) {
  const reply = '¡Hola! 👋 Por ahora, no tenemos implementado el servicio de envíos directos, ¡pero tenemos alternativas súper fáciles!\n\nPuedes retirar tu pedido en nuestra sucursal física o coordinar un servicio de mensajería o retiro con tu vendedor asignado. ¡Te esperamos!';
  return { reply, data: { shipping: { supported: false, alternatives: ['retiro en sucursal', 'coordinar mensajería con vendedor'] } } };
}

// Detectar preguntas de listado de categorías (ej: "qué categorías hay?", "ver categorías")
function isCategoriesListingMessage(message) {
  const m = normalize(message);
  const signals = [
    'categorias', // caso simple: mensaje corto
    'que categoria', 'que categorias',
    'categorias hay', 'categorias disponibles', 'categorias de la tienda',
    'lista de categoria', 'lista de categorias', 'ver categorias', 'ver categoria'
  ];
  return signals.some(sig => m.includes(sig));
}

// Detectar preguntas de tipos de productos por categoría
function isCategoryTypesMessage(message) {
  const m = normalize(message);
  const signals = [
    'que tipos', 'que tipo', 'tipos de producto', 'tipos de productos',
    'tipos de articulo', 'tipos de articulos','que artículos hay en la tienda?','que articulos hay en ropa?',
    'que hay en', 'que puedo encontrar en', 'que se encuentra en', 'que venden en'
  ];
  return signals.some(sig => m.includes(sig));
}

async function handleCategoriesQuery() {
  const cats = await Category.findAll({ where: { active: true }, attributes: ['id','name'] });
  const names = cats.map(c => c.name);
  const reply = (cats.length > 0)
    ? `Tenemos ${cats.length} categorías: ${names.join(', ')}.`
    : 'No hay categorías disponibles por el momento.';
  return { reply, data: { categories: cats.map(c => ({ id: c.id, name: c.name })) } };
}

// Responder tipos de productos dentro de una categoría específica
async function handleCategoryTypesQuery(message) {
  const m = normalize(message);
  const categories = await Category.findAll({ where: { active: true }, attributes: ['id','name'] });

  let selected = null;
  // 1) Coincidencia directa por nombre de categoría en el mensaje
  for (const c of categories) {
    const cname = normalize(c.name);
    if (cname && m.includes(cname)) { selected = c; break; }
  }

  // 2) Sinónimos y formas comunes (singular/plural) de categorías
  if (!selected) {
    const catMap = new Map(categories.map(c => [normalize(c.name), c]));
    const tokens = m.replace(/[^a-z0-9áéíóúñ\s]/g, ' ').split(/\s+/).filter(Boolean);
    const categorySynonyms = {
      'juego': 'juegos y coleccionables',
      'juegos': 'juegos y coleccionables',
      'juguete': 'juegos y coleccionables',
      'juguetes': 'juegos y coleccionables',
      'figura': 'figuras de coleccion',
      'figuras': 'figuras de coleccion',
      'comic': 'comics y mangas',
      'comics': 'comics y mangas',
      'manga': 'comics y mangas',
      'mangas': 'comics y mangas',
      'decoracion': 'decoracion',
      'accesorio': 'accesorios',
      'accesorios': 'accesorios',
      'ropa': 'ropa geek',
      'remera': 'ropa geek',
      'buzo': 'ropa geek',
      'camiseta': 'ropa geek'
    };
    for (const t of tokens) {
      const synTarget = categorySynonyms[t];
      if (synTarget && catMap.has(synTarget)) {
        selected = catMap.get(synTarget);
        break;
      }
    }
    if (!selected) {
      for (const c of categories) {
        const cname = normalize(c.name);
        const cnameSing = toSingular(cname);
        if (tokens.includes(cnameSing) || tokens.includes(cname)) {
          selected = c;
          break;
        }
      }
    }
  }

  // 3) Si no se detecta categoría, devolver ayuda con ejemplos
  if (!selected) {
    const hintNames = categories.map(c => c.name).slice(0, 5);
    const reply = `Para decirte los tipos de artículos, indícame una categoría (por ejemplo: ${hintNames.join(', ')}).`;
    return { reply, data: { categories: categories.map(c => ({ id: c.id, name: c.name })) } };
  }

  // 4) Obtener productos de esa categoría y resumir tipos
  const rows = await Product.findAll({
    where: { active: true, categoryId: selected.id },
    include: [{ model: Category, as: 'category', attributes: ['id','name'] }],
    limit: 80,
    order: [ ['ofert','DESC'], ['discount','DESC'], ['price','ASC'] ]
  });

  const items = rows.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    discount: p.discount,
    ofert: p.ofert,
    stock: p.stock,
    imagenPath: p.imagenPath,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
  }));

  const reply = await aiSummarizeCategoryTypes(message, items, selected.name);
  return { reply, data: { category: { id: selected.id, name: selected.name } } };
}

export async function processChatMessage(req, res) {
  const started = Date.now();
  try {
    const { message = '', userId = null, sessionId = null } = req.body || {};

    const classification = classifyMessage(message);
    let result = { reply: '', data: {} };

    if (classification.category === 'productos') {
      // Si el usuario pide ver categorías, responder listado de categorías
      if (isCategoriesListingMessage(message)) {
        result = await handleCategoriesQuery();
        classification.category = 'categorias';
      } else if (isCategoryTypesMessage(message)) {
        // Nueva lógica: tipos de productos dentro de una categoría
        result = await handleCategoryTypesQuery(message);
        classification.category = 'categorias';
      } else {
        result = await handleProductsQuery(message);
      }
    } else if (classification.category === 'medios_pagos') {
      result = handlePaymentsQuery(message);
    } else if (classification.category === 'envios') {
      result = handleShippingQuery(message);
    } else {
      // Fallback: primero ver si quiere listado de categorías
      if (isCategoriesListingMessage(message)) {
        result = await handleCategoriesQuery();
        classification.category = 'categorias';
      } else if (isCategoryTypesMessage(message)) {
        result = await handleCategoryTypesQuery(message);
        classification.category = 'categorias';
      } else {
        // Intentar búsqueda de productos por términos aunque no haya keywords
        const fallback = await handleProductsQuery(message);
        if (fallback?.data?.items && fallback.data.items.length > 0) {
          result = fallback;
          classification.category = 'productos';
        } else if (extractMatches(message, shippingKeywords).length > 0) {
          result = handleShippingQuery(message);
          classification.category = 'envios';
        } else {
          result.reply = 'Puedo ayudarte con productos del catálogo o medios de pago. ¿Qué estás buscando?';
          result.data = {};
        }
      }
    }

    const tookMs = Date.now() - started;
    return res.json({
      category: classification.category,
      reply: result.reply,
      data: result.data,
      meta: {
        matchedKeywords: classification.matchedKeywords,
        confidence: classification.confidence,
        tookMs,
        scores: classification.scores,
        userId,
        sessionId,
      }
    });
  } catch (err) {
    console.error('Error en /api/chat:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}