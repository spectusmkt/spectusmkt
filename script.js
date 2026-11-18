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
document.querySelectorAll(".js-whatsapp").forEach((a) => {
  a.href = waLink(a.dataset.msg || "Olá! Vim pelo site da Spectus.");
  a.target = "_blank";
  a.rel = "noopener";
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
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("para", aud === "info" ? "infoproduto" : "local");
    history.replaceState(null, "", url);
  }
}
document.querySelectorAll("[data-set-aud]").forEach((b) =>
  b.addEventListener("click", () => setAudience(b.dataset.setAud, { updateUrl: true }))
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

  window.open(waLink(msg), "_blank", "noopener");
});

form.querySelectorAll("input, select").forEach((el) =>
  el.addEventListener("input", () => el.closest(".field").classList.remove("is-invalid"))
);
