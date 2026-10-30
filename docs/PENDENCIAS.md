# Pendências para revisão antes de publicar

Lista do que depende da Lívia, do domínio ou de confirmação. Os dados de contato abaixo estão preenchidos com **valores fictícios de exemplo**. Troque pelos reais antes de publicar. Se algum campo ficar vazio, a página mostra **"a confirmar"** e o botão fica desativado.

## 1. Dados de contato e identificação (preencher em `site.config.json`)

| Campo | Valor atual (exemplo) | Onde aparece |
|---|---|---|
| `dominio` | vazio (o build usa um endereço provisório) | canonical, sitemap, robots, og:image, JSON-LD |
| `whatsapp` | 5511900000000 | botões "Conversar sobre o atendimento" e painel de contato |
| `crp` | 06/000000 | seção "Oi, eu sou a Lívia" e rodapé |
| `endereco` / `mapaUrl` | Rua dos Ipês Dourados, 100, sala 1 — Jardim Aurora, São Paulo/SP (fictício, sem link de mapa) | painel de contato e JSON-LD |
| `horarios` | Segunda a sexta, 9h às 19h · Sábado, 9h às 12h | painel de contato |
| `instagram` | vazio (opcional; o item some do painel) | painel de contato e JSON-LD |
| `googleSiteVerification` | vazio (opcional) | meta tag do Search Console |

Também são exemplos: faixa etária (3 a 12 anos), duração das sessões (50 min), recibo para reembolso, atendimento online só para orientação aos responsáveis e a resposta sobre sigilo, todos na seção de perguntas frequentes.

## 2. Conteúdo que a Lívia precisa validar

Os textos foram escritos a partir do direcionamento editorial do briefing. Nenhum currículo, formação, tempo de carreira, especialização ou abordagem terapêutica foi atribuído a ela.

- **Campos de atuação** (seção "Como posso ajudar"): emoções, mudanças na rotina, convivência em casa e na escola, orientação aos responsáveis. Confirmar se todos são atendidos e se os exemplos citados (escola nova, mudança de casa, chegada de irmão, separação) podem ficar.
- **Fluxo do acompanhamento** (seção "Como funciona"): primeiro contato → conversa com os responsáveis → acolhimento da criança → participação da família. Confirmar a ordem, se a primeira conversa é só com os responsáveis e como é a rotina de devolutivas à família.
- **Perguntas frequentes**, respostas que afirmam algo sobre o atendimento:
  - participação dos responsáveis e "forma e frequência combinadas desde o início";
  - primeira conversa com os responsáveis;
  - faixa etária ("conte a idade no primeiro contato");
  - valores, horários e convênios "combinados no primeiro contato".
- **Texto em primeira pessoa** (seção "Oi, eu sou a Lívia"): a Lívia deve aprovar o tom e as frases ("sem pressa e sem julgamento", "Ninguém precisa ter todas as respostas para começar").
- **Mensagem pré-preenchida do WhatsApp** (`mensagemWhatsapp`).
- **Aviso do rodapé**: "caráter informativo… em emergência, ligue 192 (SAMU)". Conferir com a profissional e, se ela preferir, acrescentar o CVV (188).
- Sugestão não incluída: pergunta sobre **sigilo**. É uma dúvida comum de responsáveis, mas a resposta precisa seguir o Código de Ética e a prática dela. Adicionar só com texto aprovado.

## 3. Imagens

- Retratos e ambientes estão em `src/img`. Para trocar por fotos reais, substitua os arquivos ou rode `npm run imagens` com os novos originais e revise os textos alternativos.
- As logos são PNG, não vetores. Foram apenas aparadas na margem transparente, sem alterar proporção nem desenho. Para impressão em grande formato é preciso vetorizar.

## 4. Publicação (depende de domínio, hospedagem e acesso à conta)

- Registro do domínio `.com.br`, hospedagem e apontamento de DNS: **não executados**.
- Search Console: **não configurado**. Passo a passo em `docs/SEO-E-SEARCH-CONSOLE.md`.
- Kit de Lançamento (duas artes, vídeo de até 30 s e guia de divulgação) são entregáveis comerciais da Thiago Labs e **não fazem parte deste código**.
- O `npm run build` gera uma versão de revisão com `noindex`; só `npm run producao` libera a indexação.

## 5. Decisões de design a conferir

- Cor `#A93F30` (coral escurecido): usada só em apoio quando o coral puro não atinge contraste mínimo de texto pequeno. O coral aprovado `#D85A49` fica em formas e detalhes (3,7:1 sobre creme, bom para elementos grandes, insuficiente para texto pequeno).
- Tons claros derivados da paleta (`#FBF0C9`, `#F8DDD6`) para fundos de cartões.
- Fonte Nunito hospedada junto com o site (sem requisição ao Google Fonts).
- O site não usa cookies, analytics nem rastreadores, então não há banner de consentimento. Se for incluir Analytics ou Pixel, será preciso aviso de privacidade.
