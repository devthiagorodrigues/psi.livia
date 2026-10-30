# Lívia Goulart — Psicologia Infantil

Site de página única com seis seções (abertura, sobre, como posso ajudar, acompanhamento, espaço, dúvidas e contato). HTML, CSS e um JavaScript pequeno, sem framework e sem dependências no navegador.

## Estrutura

```
site.config.json      contatos e dados confirmados (WhatsApp, CRP, endereço, horários, domínio)
src/index.html        conteúdo da página (textos editáveis aqui)
src/css/styles.css    identidade visual, tokens de cor no :root
src/js/main.js        menu do celular e destaque da seção atual
src/img, src/fonts    imagens otimizadas e Nunito
scripts/imagens.mjs   gera AVIF/WebP, favicons e og-image a partir do material original
scripts/build.mjs     monta dist/ (injeta config, sitemap, robots, JSON-LD)
docs/                 pendências e passo a passo de SEO
```

## Comandos

```bash
npm install            # só para regenerar imagens (sharp)
npm run build          # dist/ de revisão: noindex, aceita campos vazios
npm run producao       # dist/ publicável: exige domínio e WhatsApp, libera indexação
npm run preview        # build + servidor local em http://127.0.0.1:4173
npm run imagens        # regenera src/img a partir das pastas originais
```

## Como editar

- **Contatos e CRP:** `site.config.json`. Campos vazios aparecem como "a confirmar".
- **Textos:** `src/index.html`. Trechos que dependem de validação da profissional estão marcados com comentários `VALIDAR` (removidos do HTML publicado).
- **Cores:** variáveis no início de `src/css/styles.css`.

Leia `docs/PENDENCIAS.md` antes de publicar.
