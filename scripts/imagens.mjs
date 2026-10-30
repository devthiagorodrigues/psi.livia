// Gera as versões otimizadas (AVIF/WebP, vários tamanhos), favicons e a imagem de compartilhamento.
// Os originais ficam intactos nas pastas do material da marca. Uso: npm run imagens
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');
const material = path.resolve(raiz, '..');
const kit = path.join(material, 'Livia_Goulart_Kit_Site');
const banco = path.join(material, 'Livia_Goulart_Banco_10_Imagens');
const saida = path.join(raiz, 'src', 'img');
await mkdir(saida, { recursive: true });

const CREME = '#FFF9ED';
const AMARELO = '#F2D981';
const CORAL = '#D85A49';

async function gerar(entrada, nome, larguras, { avif = true, qualidade = 72, preparar } = {}) {
  let base = sharp(entrada);
  if (preparar) base = await preparar(base);
  const buf = await base.png().toBuffer();
  for (const w of larguras) {
    const redim = () => sharp(buf).resize({ width: w, withoutEnlargement: true });
    await redim().webp({ quality: qualidade, effort: 5 }).toFile(path.join(saida, `${nome}-${w}.webp`));
    if (avif) await redim().avif({ quality: Math.max(qualidade - 18, 40), effort: 4 }).toFile(path.join(saida, `${nome}-${w}.avif`));
  }
  console.log('ok', nome, larguras.join('/'));
}

// Logos: recorta apenas a margem transparente, sem alterar proporção nem desenho.
const aparar = (b) => b.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 });
await gerar(path.join(kit, 'logos/logo-horizontal.png'), 'logo-horizontal', [360, 720], { avif: false, qualidade: 92, preparar: aparar });
await gerar(path.join(kit, 'logos/logo-vinho.png'), 'logo-vinho', [360, 720], { avif: false, qualidade: 92, preparar: aparar });
await sharp(path.join(kit, 'logos/logo-principal.png')).trim({ threshold: 8 }).resize({ width: 800 }).png().toFile(path.join(saida, 'logo-principal.png'));

// Ilustração com transparência
await gerar(path.join(kit, 'ilustracoes/criancas-leitura-brincadeira.png'), 'criancas', [480, 800, 1200], { qualidade: 82 });

// Retratos e ambientes
const horizontais = {
  'retrato-horizontal': '01-livia-retrato-horizontal.png',
  'recepcao': '03-recepcao.png',
  'sala-infantil': '04-sala-infantil.png',
  'espaco-familias': '05-espaco-familias.png',
  'canto-leitura': '06-canto-leitura.png',
  'materiais-ludicos': '07-materiais-ludicos.png',
  'ambiente': '08-ambiente-hero.png',
  'preparando-sala': '09-livia-preparando-sala.png',
  'conversa-responsavel': '10-livia-orientacao-familiar.png',
};
for (const [nome, arq] of Object.entries(horizontais)) {
  await gerar(path.join(banco, arq), nome, [480, 800, 1200]);
}
await gerar(path.join(banco, '02-livia-retrato-vertical.png'), 'retrato-vertical', [400, 640, 960]);

// Favicons a partir do coração (recorte quadrado, cantos arredondados)
const coracao = path.join(kit, 'icones/coracao.png');
const cantos = (t) => Buffer.from(`<svg width="${t}" height="${t}"><rect width="${t}" height="${t}" rx="${t * 0.22}"/></svg>`);
for (const [nome, t] of [['favicon-32', 32], ['favicon-192', 192], ['favicon-512', 512], ['apple-touch-icon', 180]]) {
  await sharp(coracao)
    .extract({ left: 110, top: 110, width: 1034, height: 1034 })
    .resize(t, t)
    .composite([{ input: cantos(t), blend: 'dest-in' }])
    .png()
    .toFile(path.join(saida, `${nome}.png`));
}

// Imagem de compartilhamento 1200×630 (logo + retrato em arco)
const L = 1200, A = 630;
const logo = await sharp(path.join(kit, 'logos/logo-principal.png')).trim({ threshold: 8 }).resize({ width: 520 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
const retrato = await sharp(path.join(banco, '02-livia-retrato-vertical.png'))
  .resize(380, 520, { fit: 'cover', position: 'top' })
  .composite([{ input: Buffer.from('<svg width="380" height="520"><path d="M0 520V190A190 190 0 0 1 380 190V520Z"/></svg>'), blend: 'dest-in' }])
  .png()
  .toBuffer();
const fundo = Buffer.from(`<svg width="${L}" height="${A}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${L}" height="${A}" fill="${CREME}"/>
  <circle cx="930" cy="150" r="190" fill="${AMARELO}"/>
  <path d="M1060 ${A}A150 150 0 0 1 1200 ${A - 150}V${A}Z" fill="${CORAL}"/>
  <text x="70" y="${A - 70}" font-family="Trebuchet MS, Arial, sans-serif" font-size="28" fill="#542D34">Cada criança tem seu tempo.</text>
</svg>`);
await sharp(fundo)
  .composite([
    { input: logo, left: 70, top: Math.round((A - logoMeta.height) / 2) - 40 },
    { input: retrato, left: 740, top: 70 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(saida, 'og-image.jpg'));
console.log('ok og-image + favicons');
