import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, '..', p);

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8');
const { render } = await import(toAbsolute('dist-ssr/entry-server.js'));

// Read mock sculptures
const mockFile = fs.readFileSync(toAbsolute('src/services/mockData.ts'), 'utf-8');
const jsonMatch = mockFile.match(/INITIAL_MOCK_SCULPTURES:\s*Sculpture\[\]\s*=\s*(\[[\s\S]*?\]);/);
let sculptures = [];
if (jsonMatch) {
  try {
    sculptures = JSON.parse(jsonMatch[1]);
  } catch {
    console.warn('Failed to parse mockData as JSON, using fallback regex');
  }
}

const DOMAIN = 'https://rustamzhuraiev.art';

const routes = [
  {
    url: '/',
    title: "Рустам Жураєв | Галерея наївної кам'яної скульптури",
    description: "Онлайн-галерея оригінальних кам'яних скульптур Рустама Жураєва у традиції українського наїву. Пісковик, мармур, базальт, габро — унікальні екземпляри (1/1).",
    image: '/sculptures/anhelyk.webp',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Рустам Жураєв",
      "jobTitle": "Скульптор",
      "description": "Скульптор у традиції українського наївного мистецтва. Оригінальна авторська кам'яна пластика ручної роботи (1/1).",
      "url": `${DOMAIN}/`,
      "sameAs": [
        "https://t.me/naive_sculptures",
        "https://www.youtube.com/watch?v=2qI5Dl5ZJ5o"
      ]
    }
  },
  {
    url: '/archive',
    title: "Колекційний архів робіт | Рустам Жураєв",
    description: "Архів кам'яних скульптур Рустама Жураєва, що знайшли свій дім у приватних колекціях. Можливість замовити авторську варіацію твору.",
    image: '/sculptures/anhelyk.webp',
  },
  {
    url: '/about',
    title: "Про автора — Рустам Жураєв | Наївна скульптура",
    description: "Біографія та творчий шлях скульптора Рустама Жураєва. Праця з диким каменем, виставка «Першообрази» у Львові, філософія наївного мистецтва.",
    image: '/author/rustam-zhuraiev.webp',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Рустам Жураєв",
      "jobTitle": "Скульптор",
      "description": "Український скульптор у стилі наївного мистецтва. Персональні кам'яні скульптури, виставка Першообрази у Львові.",
      "url": `${DOMAIN}/about`,
      "image": `${DOMAIN}/author/rustam-zhuraiev.webp`,
      "sameAs": [
        "https://t.me/naive_sculptures",
        "https://www.youtube.com/watch?v=2qI5Dl5ZJ5o",
        "https://risu.ua/pershoobrazi-u-lvovi-predstavlena-vistavka-skulptur-rustama-zhurayeva_n165335"
      ]
    }
  },
  {
    url: '/contact',
    title: "Контакти майстерні | Рустам Жураєв",
    description: "Зв'яжіться зі скульптором Рустамом Жураєвим у Telegram або електронною поштою для придбання та узгодження доставки кам'яних скульптур.",
    image: '/sculptures/anhelyk.webp',
  },
  {
    url: '/404',
    title: "Сторінку не знайдено (404) | Рустам Жураєв",
    description: "Сторінку не знайдено в онлайн-галереї Рустама Жураєва.",
    noindex: true,
  }
];

// Add each sculpture
for (const s of sculptures) {
  const isAvailable = s.status === 'AVAILABLE';
  routes.push({
    url: `/sculpture/${s.slug}`,
    title: `${s.title_ua} | Рустам Жураєв`,
    description: `${s.title_ua} (${s.year}) — ${s.edition_ua || 'унікальний оригінал 1/1'}. ${s.material_ua}. ${s.story_ua ? s.story_ua.slice(0, 140) + '...' : ''}`,
    image: s.photos?.[0]?.url || '/sculptures/anhelyk.webp',
    type: 'article',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "VisualArtwork",
      "name": s.title_ua,
      "alternateName": s.title_en,
      "artist": {
        "@type": "Person",
        "name": "Рустам Жураєв"
      },
      "artMedium": s.material_ua,
      "artform": "Sculpture",
      "description": s.story_ua,
      "image": s.photos?.[0]?.url ? `${DOMAIN}${s.photos[0].url}` : undefined,
      "width": {
        "@type": "Distance",
        "name": `${s.dimensions?.width_cm || ''} см`
      },
      "height": {
        "@type": "Distance",
        "name": `${s.dimensions?.height_cm || ''} см`
      },
      "depth": {
        "@type": "Distance",
        "name": `${s.dimensions?.depth_cm || ''} см`
      },
      "offers": {
        "@type": "Offer",
        "price": s.price_uah,
        "priceCurrency": "UAH",
        "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
      }
    }
  });
}

// Clean template from default static meta tags to avoid duplication
let cleanTemplate = template
  .replace(/<title>.*?<\/title>/, '<!--TITLE-->')
  .replace(/<meta name="description".*?\/>/g, '')
  .replace(/<link rel="canonical".*?\/>/g, '')
  .replace(/<meta property="og:.*?\/>/g, '')
  .replace(/<meta name="twitter:.*?\/>/g, '')
  .replace(/<script type="application\/ld\+json">.*?<\/script>/gs, '');

console.log(`Starting SSG Pre-rendering for ${routes.length} pages...`);

for (const route of routes) {
  const { html: appHtml } = render(route.url);

  let pageHtml = cleanTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );

  // Replace Title
  pageHtml = pageHtml.replace('<!--TITLE-->', `<title>${route.title}</title>`);

  // Build Head tags
  const canonicalUrl = `${DOMAIN}${route.url === '/' ? '' : route.url}`;
  const imagePath = route.image || '/sculptures/anhelyk.webp';
  const imageUrl = imagePath.startsWith('http') ? imagePath : `${DOMAIN}${imagePath}`;

  let headTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${route.type || 'website'}" />
    <meta property="og:site_name" content="Рустам Жураєв | Галерея наївного мистецтва" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  if (route.noindex) {
    headTags += `\n    <meta name="robots" content="noindex, nofollow" />`;
  }

  if (route.jsonLd) {
    headTags += `\n    <script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`;
  }

  // Inject before </head>
  pageHtml = pageHtml.replace('</head>', `${headTags}\n  </head>`);

  // Target path
  let filePath;
  if (route.url === '/') {
    filePath = toAbsolute('dist/index.html');
  } else if (route.url === '/404') {
    filePath = toAbsolute('dist/404.html');
  } else {
    const routeDir = toAbsolute(`dist${route.url}`);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    filePath = path.join(routeDir, 'index.html');
  }

  fs.writeFileSync(filePath, pageHtml, 'utf-8');
  console.log(`✓ Pre-rendered: ${route.url} -> ${path.relative(toAbsolute('dist'), filePath)} (${(pageHtml.length / 1024).toFixed(1)} KB)`);
}

console.log('SSG Pre-rendering completed successfully!');
