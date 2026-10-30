// Menu do celular, sombra do topo e destaque da seção atual. O site funciona sem este arquivo.
(() => {
  const raiz = document.documentElement;
  raiz.classList.remove('no-js');
  raiz.classList.add('js');

  const topo = document.getElementById('topo');
  const botao = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const desktop = window.matchMedia('(min-width: 900px)');

  const definirMenu = (aberto) => {
    botao.setAttribute('aria-expanded', String(aberto));
    menu.classList.toggle('menu--aberto', aberto);
  };

  botao.addEventListener('click', () => definirMenu(botao.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) definirMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirMenu(false);
      botao.focus();
    }
  });
  desktop.addEventListener('change', () => definirMenu(false));

  const aoRolar = () => topo.classList.toggle('topo--rolou', window.scrollY > 8);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  if ('IntersectionObserver' in window) {
    const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
    const porId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        porId.get(e.target.id)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    porId.forEach((_, id) => { const s = document.getElementById(id); if (s) observador.observe(s); });
  }

  // Entrada das partes de cada seção: só esconde o que está prestes a entrar na tela.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !semMovimento) {
    const alvos = '.secao__cab > *, .sobre__texto > *, .sobre__figura, .ajuda__item, .tranquilo, .acompanhamento__lado > *, .passo, .galeria__item, .faq__item, .chamada';
    const candidatos = new Set();
    const marcados = new Set();
    let ultimo = window.scrollY;
    let salto = false;
    const mostrar = (el) => { if (salto) el.classList.add('sem-transicao'); el.classList.add('visivel'); marcados.delete(el); revelar.unobserve(el); };
    const revelar = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) mostrar(e.target);
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
    const atualizar = () => {
      const vh = window.innerHeight;
      salto = Math.abs(window.scrollY - ultimo) > vh * 1.2;
      ultimo = window.scrollY;
      candidatos.forEach((el) => {
        const topo = el.getBoundingClientRect().top;
        if (topo > vh && topo < vh * 2.5) {
          el.classList.add('revelar');
          candidatos.delete(el);
          marcados.add(el);
          revelar.observe(el);
        }
      });
      marcados.forEach((el) => { if (el.getBoundingClientRect().top < vh * 1.05) mostrar(el); });
    };
    document.querySelectorAll('main > section:not(.hero)').forEach((secao) => {
      const grupos = new Map();
      secao.querySelectorAll(alvos).forEach((el) => {
        const pai = el.parentElement;
        const n = grupos.get(pai) || 0;
        grupos.set(pai, n + 1);
        el.style.setProperty('--atraso', `${Math.min(n, 5) * 70}ms`);
        candidatos.add(el);
      });
    });
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }
})();
