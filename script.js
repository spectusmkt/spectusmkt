/* =========================================================
   SPECTUS — configuração
   TROCAR: número de WhatsApp da agência (só dígitos, com DDI)
   ========================================================= */
const WHATSAPP = "5541988359774";

document.documentElement.classList.add("js");

// Ano no rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Links de WhatsApp
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Meta Pixel: dispara evento se o pixel carregou (bloqueadores não quebram o site)
const track = (ev, params) => { try { window.fbq && fbq("track", ev, params); } catch (e) {} };
const currentAud = () => (document.querySelector('[data-set-aud][aria-selected="true"]')?.dataset.setAud === "info" ? "infoproduto" : "negocio_local");
document.querySelectorAll(".js-whatsapp").forEach((a) => {
  a.href = waLink(a.dataset.msg || "Olá! Vim pelo site da Spectus.");
  a.target = "_blank";
  a.rel = "noopener";
  // Clique em qualquer botão de WhatsApp = Contact
  a.addEventListener("click", () => track("Contact", { content_name: a.classList.contains("sticky-cta") ? "whatsapp_fixo" : "whatsapp", content_category: currentAud() }));
});

// Seletor de público (negócio local × infoproduto)
// Link direto para anúncios: ?para=local  ou  ?para=infoproduto
const AUD = {
  local: {
    wa: "Olá! Tenho um negócio local e quero mais clientes. Vim pelo site da Spectus.",
    need: "Mais clientes para meu negócio local",
  },
  info: {
    wa: "Olá! Tenho um infoproduto e quero vender mais. Vim pelo site da Spectus.",
    need: "Vender mais meu infoproduto",
  },
};
// Frases que giram no balão da foto do hero (k = quem / v = frase)
const QUOTES = {
  local: [
    { k: "Isa Tacla · estúdio de tatuagem", v: "“A agenda dessa semana está cheia”" },
    { k: "Larissa Muse · massagista em Dubai", v: "“Tá uma loucura esse telefone”" },
    { k: "Paulo Braga · cliente Spectus", v: "“Está voltando 3 a 4 vezes mais”" },
    { k: "Loja de doces · Páscoa", v: "1.020 ovos de Páscoa vendidos" },
    { k: "Isa Tacla · estúdio de tatuagem", v: "“Tô feliz demais com os resultados”" },
  ],
  info: [
    { k: "Resultado real · infoproduto", v: "R$ 159 mil faturados em 30 dias" },
    { k: "Resultado real · low ticket", v: "298 vendas em 11 dias" },
    { k: "Wesley Schroeder · infoprodutor", v: "“Os criativos ficaram top”" },
    { k: "Cintya Soares · infoprodutora", v: "“Adoro seu trabalho”" },
  ],
};
const quoteCard = document.querySelector(".js-quotes");
let quoteTimer, quoteIdx = 0;
function showQuote(q) {
  quoteCard.querySelector(".float-card__k").textContent = q.k;
  quoteCard.querySelector(".float-card__v").textContent = q.v;
}
function startQuotes(aud) {
  clearInterval(quoteTimer);
  const list = QUOTES[aud];
  quoteIdx = 0;
  showQuote(list[0]);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  quoteTimer = setInterval(() => {
    quoteCard.classList.add("is-swapping");
    setTimeout(() => {
      quoteIdx = (quoteIdx + 1) % list.length;
      showQuote(list[quoteIdx]);
      quoteCard.classList.remove("is-swapping");
    }, 450);
  }, 4200);
}

const needSelect = document.getElementById("f-need");
let needTouched = false;
needSelect.addEventListener("change", () => { needTouched = true; });

function setAudience(aud, { updateUrl = false } = {}) {
  if (!AUD[aud]) aud = "local";
  document.querySelectorAll("[data-aud]").forEach((el) => { el.hidden = el.dataset.aud !== aud; });
  document.querySelectorAll("[data-set-aud]").forEach((b) =>
    b.setAttribute("aria-selected", String(b.dataset.setAud === aud))
  );
  const heroWa = document.querySelector(".js-wa-hero");
  heroWa.dataset.msg = AUD[aud].wa;
  heroWa.href = waLink(AUD[aud].wa);
  if (!needTouched) needSelect.value = AUD[aud].need;
  startQuotes(aud);
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("para", aud === "info" ? "infoproduto" : "local");
    history.replaceState(null, "", url);
  }
}
document.querySelectorAll("[data-set-aud]").forEach((b) =>
  b.addEventListener("click", () => {
    setAudience(b.dataset.setAud, { updateUrl: true });
    try { window.fbq && fbq("trackCustom", "TrocouPublico", { publico: currentAud() }); } catch (e) {}
  })
);
const param = new URLSearchParams(location.search).get("para") || "";
setAudience(/^info/i.test(param) ? "info" : "local");

// Header com borda ao rolar + CTA fixo no mobile
const header = document.querySelector(".header");
const sticky = document.querySelector(".sticky-cta");
const hero = document.querySelector(".hero");
const final = document.getElementById("contato");
let finalVisible = false;

const onScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  const pastHero = hero.getBoundingClientRect().bottom < 0;
  sticky.classList.toggle("is-visible", pastHero && !finalVisible);
};
window.addEventListener("scroll", onScroll, { passive: true });

new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; onScroll(); }, { threshold: 0.1 }).observe(final);

// Animações de entrada
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// Lightbox dos prints
const lightbox = document.getElementById("lightbox");
const lbImgs = lightbox.querySelector(".lightbox__imgs");
document.querySelectorAll(".js-zoom").forEach((btn) =>
  btn.addEventListener("click", () => {
    const srcs = [btn.dataset.src, btn.dataset.src2].filter(Boolean);
    lbImgs.innerHTML = srcs.map((s) => `<img src="${s}" alt="">`).join("");
    lbImgs.classList.toggle("is-pair", srcs.length > 1);
    lightbox.showModal();
  })
);
lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

// Carrossel de depoimentos
document.querySelectorAll(".carousel").forEach((car) => {
  const track = car.querySelector(".carousel__track");
  const [prev, next] = car.querySelectorAll(".carousel__btn");
  const step = () => (track.querySelector(".slide")?.offsetWidth || 300) + 18;
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  const update = () => {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
  };
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
});

// Números que sobem ao aparecer na tela
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counters = document.querySelectorAll(".stat dd, .case__metrics strong");
const countUp = (el) => {
  const original = el.textContent;
  const m = original.match(/\d[\d.]*(,\d+)?/);
  if (!m) return;
  const decimals = m[1] ? m[1].length - 1 : 0;
  const target = parseFloat(m[0].replace(/\./g, "").replace(",", "."));
  const [before, after] = [original.slice(0, m.index), original.slice(m.index + m[0].length)];
  const fmt = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const dur = 1600, t0 = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = before + fmt(target * eased) + after;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = original;
  };
  requestAnimationFrame(tick);
};
if (!reduceMotion) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));
}

// Formulário → mensagem pronta no WhatsApp
const form = document.getElementById("lead-form");
const errorEl = form.querySelector(".form__error");

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const valid = input.value.trim() !== "";
    input.closest(".field").classList.toggle("is-invalid", !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    errorEl.textContent = "Preencha os três campos para continuar.";
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const data = new FormData(form);
  const msg =
    `Olá, Spectus! Quero um diagnóstico gratuito.\n\n` +
    `Nome: ${data.get("name").trim()}\n` +
    `Contato: ${data.get("contact").trim()}\n` +
    `Preciso de: ${data.get("need")}`;

  // Formulário enviado = Lead
  track("Lead", { content_name: "formulario_diagnostico", content_category: data.get("need") });
  window.open(waLink(msg), "_blank", "noopener");
});

form.querySelectorAll("input, select").forEach((el) =>
  el.addEventListener("input", () => el.closest(".field").classList.remove("is-invalid"))
);
