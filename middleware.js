export const config = {
  matcher: ['/ca', '/ca/:path*', '/en', '/en/:path*', '/fr', '/fr/:path*'],
};

const SEO = {
  '/': {
    es: { title: 'Casanita · Trattoria en Vilassar de Mar', description: 'Cocina mediterránea con alma italiana en el centro de Vilassar de Mar. Comidas, cenas, cócteles y terraza. Reserva tu mesa en un minuto.' },
    ca: { title: 'Casanita · Trattoria a Vilassar de Mar', description: "Cuina mediterrània amb ànima italiana al centre de Vilassar de Mar. Dinars, sopars, còctels i terrassa. Reserva la teva taula en un minut." },
    en: { title: 'Casanita · Trattoria in Vilassar de Mar', description: 'Mediterranean cooking with an Italian soul in the heart of Vilassar de Mar. Lunch, dinner, cocktails and a terrace. Book your table in a minute.' },
    fr: { title: 'Casanita · Trattoria à Vilassar de Mar', description: "Cuisine méditerranéenne à l'âme italienne, au cœur de Vilassar de Mar. Déjeuners, dîners, cocktails et terrasse. Réservez votre table en une minute." },
  },
  '/carta': {
    es: { title: 'La carta · Casanita Vilassar', description: 'Entrantes, pastas, pizzas (también sin gluten), carnes, pescados, postres y cócteles. La carta de Casanita en Vilassar de Mar.' },
    ca: { title: 'La carta · Casanita Vilassar', description: 'Entrants, pastes, pizzes (també sense gluten), carns, peixos, postres i còctels. La carta de Casanita a Vilassar de Mar.' },
    en: { title: 'The Menu · Casanita Vilassar', description: "Starters, pasta, pizzas (gluten-free available), meat, fish, desserts and cocktails. Casanita's menu in Vilassar de Mar." },
    fr: { title: 'La carte · Casanita Vilassar', description: 'Entrées, pâtes, pizzas (sans gluten disponibles), viandes, poissons, desserts et cocktails. La carte de Casanita à Vilassar de Mar.' },
  },
  '/contacto': {
    es: { title: 'Contacto · Casanita Vilassar', description: 'Escríbenos para grupos, catering o pedidos, o envíanos tu candidatura para trabajar en Casanita, Vilassar de Mar.' },
    ca: { title: 'Contacte · Casanita Vilassar', description: "Escriu-nos per a grups, càtering o comandes, o envia'ns la teva candidatura per treballar a Casanita, Vilassar de Mar." },
    en: { title: 'Contact · Casanita Vilassar', description: 'Write to us for groups, catering or orders, or send us your application to work at Casanita, Vilassar de Mar.' },
    fr: { title: 'Contact · Casanita Vilassar', description: 'Écrivez-nous pour les groupes, le traiteur ou les commandes, ou envoyez-nous votre candidature pour travailler chez Casanita, Vilassar de Mar.' },
  },
  '/reserva': {
    es: { title: 'Reservar mesa · Casanita Vilassar', description: 'Reserva tu mesa en Casanita, Vilassar de Mar, en menos de un minuto. O llámanos al 605 25 12 87.' },
    ca: { title: 'Reservar taula · Casanita Vilassar', description: "Reserva la teva taula a Casanita, Vilassar de Mar, en menys d'un minut. O truca'ns al 605 25 12 87." },
    en: { title: 'Book a table · Casanita Vilassar', description: 'Book your table at Casanita, Vilassar de Mar, in under a minute. Or call us on 605 25 12 87.' },
    fr: { title: 'Réserver une table · Casanita Vilassar', description: "Réservez votre table chez Casanita, Vilassar de Mar, en moins d'une minute. Ou appelez-nous au 605 25 12 87." },
  },
};

const LOCALES = ['ca', 'en', 'fr'];

export default async function middleware(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const locale = segments[0];
  if (!LOCALES.includes(locale)) return fetch(request);

  const rest = '/' + segments.slice(1).join('/');
  const canonicalPath = rest === '/' ? '/' : rest.replace(/\/$/, '') || '/';
  const seo = SEO[canonicalPath];

  const originUrl = new URL(canonicalPath, url.origin);
  const originResponse = await fetch(originUrl);
  if (!originResponse.ok || !seo) return originResponse;

  const contentType = originResponse.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return originResponse;

  const { title, description } = seo[locale];
  const localizedUrl = url.toString();
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const escAttr = esc(title), escDesc = esc(description), escUrl = esc(localizedUrl);

  let html = await originResponse.text();
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escAttr}</title>`)
    .replace('<html>', `<html lang="${locale}">`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escDesc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escDesc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escUrl}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escAttr}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escDesc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escUrl}$2`);

  const headers = new Headers(originResponse.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');

  return new Response(html, { status: originResponse.status, headers });
}
