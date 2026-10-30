# SEO e Search Console

## O que já está pronto no código

- `<title>` e meta description únicas, `lang="pt-BR"`, canonical, Open Graph e Twitter Card (imagem 1200×630 em `img/og-image.jpg`).
- Hierarquia de títulos: um `h1`, um `h2` por seção, `h3` nos itens.
- Dados estruturados (JSON-LD `WebSite` + `ProfessionalService`) com **somente** dados confirmados: telefone, endereço e Instagram só entram se estiverem em `site.config.json`.
- `sitemap.xml`, `robots.txt`, `site.webmanifest`, favicons e página `404.html` gerados no build.
- Textos alternativos em todas as imagens; imagens em AVIF/WebP com `srcset`, dimensões declaradas (sem salto de layout) e carregamento tardio fora da primeira dobra.
- Cabeçalhos de cache e segurança em `_headers` (Netlify/Cloudflare Pages; em outros servidores, replicar na configuração).

## Fluxo de publicação

1. Preencher `site.config.json` (ao menos `dominio` e `whatsapp`).
2. `npm run producao` → gera `dist/` com `index, follow`, canonical e sitemap no domínio real. O comando **falha** se faltar domínio ou WhatsApp.
3. Enviar o conteúdo de `dist/` para a hospedagem e apontar o domínio `.com.br`.
4. Conferir `https://SEU-DOMINIO/robots.txt` e `https://SEU-DOMINIO/sitemap.xml`.

## Search Console (precisa de domínio publicado e acesso à conta Google)

**Não foi executado.** Depende de alguém com acesso à conta Google da Lívia (ou da Thiago Labs, se for gerenciar).

1. Acessar <https://search.google.com/search-console> e adicionar a propriedade.
   - **Domínio** (recomendado): verificação por registro TXT no DNS do `.com.br`.
   - **Prefixo de URL**: verificação por meta tag. Copiar só o valor de `content` e colar em `googleSiteVerification` no `site.config.json`, rodar `npm run producao` e republicar.
2. Em *Sitemaps*, enviar `sitemap.xml`.
3. Em *Inspeção de URL*, testar a página inicial e pedir indexação.
4. Depois de alguns dias, conferir *Páginas* e *Experiência* (Core Web Vitals).

## Depois de publicar

- Validar o JSON-LD em <https://validator.schema.org>.
- Testar o compartilhamento do link no WhatsApp para ver a imagem de pré-visualização.
- Se houver endereço real, criar/reivindicar o perfil no Google Meu Negócio com os mesmos dados do site.
