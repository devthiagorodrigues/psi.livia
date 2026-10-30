// Monta a pasta dist/ a partir de src/ + site.config.json.
//   npm run build      → versão de revisão (noindex, aceita campos vazios, avisa o que falta)
//   npm run producao   → versão publicável (falha se faltar domínio ou WhatsApp; libera indexação)
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(raiz, 'src');
const argSaida = process.argv.find((a) => a.startsWith('--out='));
const dist = argSaida ? path.resolve(argSaida.slice(6)) : path.join(raiz, 'dist');
const producao = process.argv.includes('--producao');

const argConfig = process.argv.find((a) => a.startsWith('--config='));
const cfg = JSON.parse(await readFile(argConfig ? path.resolve(argConfig.slice(9)) : path.join(raiz, 'site.config.json'), 'utf8'));
const txt = (v) => String(v ?? '').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- validação e valores derivados ----------
const pendencias = [];
const exigidos = { dominio: 'domínio', whatsapp: 'WhatsApp', crp: 'CRP', endereco: 'endereço', horarios: 'horários' };
for (const [k, nome] of Object.entries(exigidos)) if (!txt(cfg[k])) pendencias.push(nome);

if (producao) {
  const faltam = ['dominio', 'whatsapp'].filter((k) => !txt(cfg[k]));
  if (faltam.length) {
    console.error(`\n✖ Build de produção bloqueado. Preencha em site.config.json: ${faltam.join(', ')}\n`);
    process.exit(1);
  }
}

const dominio = (txt(cfg.dominio) || 'https://www.dominio-a-definir.com.br').replace(/\/+$/, '');
if (!/^https:\/\//.test(dominio)) {
  console.error('✖ "dominio" precisa começar com https://');
  process.exit(1);
}
const whats = txt(cfg.whatsapp).replace(/\D/g, '');
// "whatsappLink": false mostra o número como texto, sem nenhum botão ou link para o WhatsApp
const linkWhats = Boolean(whats) && cfg.whatsappLink !== false;
const mensagem = txt(cfg.mensagemWhatsapp);
const formatarFone = (n) => {
  const m = n.match(/^55(\d{2})(9?\d{4})(\d{4})$/);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : `+${n}`;
};

const dados = {
  dominio,
  canonical: `${dominio}/`,
  whatsapp: whats,
  whatsapp_href: linkWhats ? `https://wa.me/${whats}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}` : '',
  whatsapp_exibir: whats ? formatarFone(whats) : '',
  cta_href: linkWhats ? `https://wa.me/${whats}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}` : '#contato',
  crp: txt(cfg.crp).replace(/^CRP\s*/i, ''),
  endereco: txt(cfg.endereco),
  mapaUrl: txt(cfg.mapaUrl),
  horarios: txt(cfg.horarios),
  instagram: txt(cfg.instagram),
  googleSiteVerification: txt(cfg.googleSiteVerification),
  desenvolvedorUrl: txt(cfg.desenvolvedorUrl),
  ano: cfg.ano || new Date().getFullYear(),
};

// ---------- JSON-LD (somente dados confirmados) ----------
const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${dominio}/#site`,
      url: `${dominio}/`,
      name: 'Lívia Goulart — Psicologia Infantil',
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${dominio}/#servico`,
      name: 'Lívia Goulart — Psicologia Infantil',
      description: 'Psicologia infantil com escuta e acolhimento para crianças e suas famílias.',
      url: `${dominio}/`,
      image: `${dominio}/img/og-image.jpg`,
      logo: `${dominio}/img/logo-principal.png`,
      ...(dados.whatsapp ? { telephone: `+${dados.whatsapp}` } : {}),
      ...(dados.endereco ? { address: { '@type': 'PostalAddress', streetAddress: dados.endereco, addressCountry: 'BR' } } : {}),
      ...(dados.instagram ? { sameAs: [dados.instagram] } : {}),
    },
  ],
};
dados.jsonld = JSON.stringify(jsonld).replace(/</g, '\\u003c');
dados.robots = producao
  ? '<meta name="robots" content="index, follow, max-image-preview:large">'
  : '<meta name="robots" content="noindex, nofollow">';

// ---------- macro de imagem responsiva ----------
const larguras = { 'retrato-vertical': [400, 640, 960] };
const padrao = [480, 800, 1200];
const dimensoes = { 'retrato-vertical': [960, 1440] };
function imagem(args) {
  const [nome, alt = '', sizes = '100vw', classe = '', carga = 'lazy', pos = ''] = args.split('|').map((s) => s.trim());
  const ws = larguras[nome] || padrao;
  const [w, h] = dimensoes[nome] || [1200, 800];
  const set = (ext) => ws.map((x) => `img/${nome}-${x}.${ext} ${x}w`).join(', ');
  const meio = ws[Math.floor(ws.length / 2)];
  const eager = carga === 'eager';
  return `<picture>
              <source type="image/avif" srcset="${set('avif')}" sizes="${esc(sizes)}">
              <source type="image/webp" srcset="${set('webp')}" sizes="${esc(sizes)}">
              <img src="img/${nome}-${meio}.webp" width="${w}" height="${h}" alt="${esc(alt)}"${classe ? ` class="${classe}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"${eager ? ' fetchpriority="high"' : ''}${pos ? ` style="object-position:${esc(pos)}"` : ''}>
            </picture>`;
}

// ---------- template ----------
function renderizar(html) {
  html = html.replace(/\[\[img ([^\]]+)\]\]/g, (_, a) => imagem(a));
  // condicionais simples (sem aninhamento do mesmo nome): {{#if x}}...{{else}}...{{/if}}
  const cond = /\{\{#if (\w+)\}\}((?:(?!\{\{#if)[\s\S])*?)(?:\{\{else\}\}((?:(?!\{\{#if)[\s\S])*?))?\{\{\/if\}\}/;
  let anterior;
  do {
    anterior = html;
    html = html.replace(cond, (_, k, a, b = '') => (dados[k] ? a : b));
  } while (html !== anterior);
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => dados[k] ?? '');
  html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(dados[k] ?? ''));
  return html;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const item of ['css', 'js', 'fonts', 'img', 'site.webmanifest']) {
  await cp(path.join(src, item), path.join(dist, item), { recursive: true });
}
await rm(path.join(dist, 'fonts', 'nunito-latin-ext-wght-normal.woff2'), { force: true });
for (const pagina of ['index.html', 'privacidade.html', '404.html']) {
  await writeFile(path.join(dist, pagina), renderizar(await readFile(path.join(src, pagina), 'utf8')));
}

const hoje = new Date().toISOString().slice(0, 10);
await writeFile(path.join(dist, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${dominio}/</loc>
    <lastmod>${hoje}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);
await writeFile(path.join(dist, 'robots.txt'),
  producao
    ? `User-agent: *\nAllow: /\n\nSitemap: ${dominio}/sitemap.xml\n`
    : `# Versão de revisão: não indexar\nUser-agent: *\nDisallow: /\n`);
await writeFile(path.join(dist, '_headers'),
`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=31536000, immutable
/css/*
  Cache-Control: public, max-age=86400
/js/*
  Cache-Control: public, max-age=86400
`);

// ---------- relatório ----------
const total = async (dir) => {
  let n = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    n += e.isDirectory() ? await total(p) : (await readFile(p)).length;
  }
  return n;
};
console.log(`\n✔ ${producao ? 'Build de PRODUÇÃO' : 'Build de REVISÃO (noindex)'} em dist/  (${(await total(dist) / 1024 / 1024).toFixed(1)} MB)`);
if (pendencias.length) console.log(`⚠ Pendências em site.config.json: ${pendencias.join(', ')}`);
if (!txt(cfg.dominio)) console.log('⚠ Domínio vazio: canonical, sitemap e og:image usam um endereço provisório.');
