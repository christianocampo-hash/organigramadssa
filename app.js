const baseUrl = "";
const state = { data: null, fontScale: 1, highContrast: false };
const $ = (selector) => document.querySelector(selector);

const prettify = (text) => text.split(" ").map((word) => word.length <= 3 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

function flattenPeople(data) {
  const nested = data.subdirectorates.flatMap((unit) => unit.children || []);
  return [data.root, ...data.topDepartments, ...data.supportRoles, ...data.subdirectorates, ...nested];
}

function personCard(person, variant = "department", index = 0) {
  const placeholder = person.name.toLowerCase().includes("por actualizar") ? " is-placeholder" : "";
  const level = variant === "root" ? "Nivel directivo" : variant === "subdirector" ? "Nivel subdirección" : "Área institucional";
  return `<button class="org-card org-card--${variant}" style="--card-index:${index}" data-person-id="${person.id}" type="button" aria-label="Ver perfil: ${person.cargo}. ${person.name}">
    <span class="card-accent" aria-hidden="true"></span>
    <span class="org-card__eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${level}</span>
    <span class="org-card__title">${prettify(person.cargo)}</span>
    <span class="org-card__person${placeholder}"><img src="${person.photo}" alt="" class="avatar avatar--card"><span class="person-copy"><strong>${person.name}</strong><span>Ver ficha de cargo <span aria-hidden="true">→</span></span></span></span>
  </button>`;
}

function renderChart(data) {
  const top = data.topDepartments.map((person, index) => personCard(person, "department", index)).join("");
  const support = data.supportRoles.map((person, index) => personCard(person, "support", index)).join("");
  const branches = data.subdirectorates.map((person, index) => {
    const children = (person.children || []).map((child, childIndex) => personCard(child, "department", childIndex)).join("");
    return `<div class="branch">${personCard(person, "subdirector", index)}${children ? `<div class="branch-children">${children}</div>` : ""}</div>`;
  }).join("");
  $("#org-chart").innerHTML = `<div class="chart-level chart-level--root">${personCard(data.root, "root")}</div><div class="connector connector--down" aria-hidden="true"></div><div class="chart-level chart-level--top" aria-label="Departamentos asesores">${top}</div><div class="support-divider" aria-hidden="true"><span>Apoyo a la dirección</span></div><div class="chart-level chart-level--support">${support}</div><div class="section-divider" aria-hidden="true"><span>Gestión de la red y los recursos</span></div><div class="chart-level chart-level--branches">${branches}</div><div class="chart-footer-note"><span class="footer-dot"></span>Selecciona un recuadro para abrir la ficha de cargo<span class="footer-rule"></span></div>`;
}

function openProfile(person) {
  $("#profile-id").textContent = `ID / ${person.id}`;
  $("#profile-photo").src = person.photo;
  $("#profile-photo").alt = `Foto de ${person.name}`;
  $("#profile-unit").textContent = person.unit;
  $("#profile-title").textContent = prettify(person.cargo);
  $("#profile-name").textContent = person.name;
  $("#profile-bio").textContent = person.bio;
  const modal = $("#profile-modal");
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "");
  announce(`Perfil abierto: ${person.cargo}`);
}

function announce(message) { $("#announcer").textContent = message; }
function closeModal() { const modal = $("#profile-modal"); if (modal.open) modal.close(); else modal.removeAttribute("open"); }

function renderSearchResults(query) {
  const results = $("#search-results");
  const normalized = query.trim().toLowerCase();
  if (!normalized) { results.innerHTML = ""; return; }
  const matches = flattenPeople(state.data).filter((person) => `${person.name} ${person.cargo} ${person.unit}`.toLowerCase().includes(normalized)).slice(0, 6);
  results.innerHTML = matches.length ? matches.map((person) => `<button type="button" role="option" data-result-id="${person.id}"><strong>${person.name}</strong><span>${person.cargo}</span></button>`).join("") : `<p class="no-results">No hay coincidencias.</p>`;
}

function setFontScale(next) {
  state.fontScale = Math.min(1.3, Math.max(.9, Number(next.toFixed(2))));
  $("#app").style.setProperty("--font-scale", state.fontScale);
  $("#scale-readout").textContent = `${Math.round(state.fontScale * 100)}%`;
  announce(`Tamaño de texto: ${Math.round(state.fontScale * 100)} por ciento`);
}

function handleClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "font-down") setFontScale(state.fontScale - .1);
  if (action === "font-up") setFontScale(state.fontScale + .1);
  if (action === "contrast") {
    state.highContrast = !state.highContrast;
    $("#app").classList.toggle("high-contrast", state.highContrast);
    const button = event.target.closest("[data-action=contrast]");
    button.setAttribute("aria-pressed", String(state.highContrast));
    button.querySelector("span:nth-child(2)").textContent = state.highContrast ? "Contraste normal" : "Invertir colores";
    announce(state.highContrast ? "Alto contraste activado" : "Contraste normal activado");
  }
  if (action === "clear-search") { $("#search-directory").value = ""; renderSearchResults(""); }
  const card = event.target.closest("[data-person-id]");
  if (card) openProfile(flattenPeople(state.data).find((person) => person.id === card.dataset.personId));
  const result = event.target.closest("[data-result-id]");
  if (result) { openProfile(flattenPeople(state.data).find((person) => person.id === result.dataset.resultId)); $("#search-directory").value = ""; renderSearchResults(""); }
  if (action === "close-modal") closeModal();
}

async function init() {
  try {
    const response = await fetch(`${baseUrl}organigrama.json`);
    if (!response.ok) throw new Error("No se pudo cargar el JSON");
    state.data = await response.json();
    const count = flattenPeople(state.data).length;
    $("#hero-count").textContent = count;
    $("#footer-count").textContent = count;
    renderChart(state.data);
  } catch (error) {
    $("#org-chart").innerHTML = `<div class="error-state"><strong>No pudimos cargar el organigrama.</strong><span>Revisa que data/organigrama.json esté disponible.</span></div>`;
  }
}

document.addEventListener("click", handleClick);
$("#search-directory").addEventListener("input", (event) => renderSearchResults(event.target.value));
$("#profile-modal").addEventListener("click", (event) => { if (event.target === event.currentTarget) closeModal(); });
init();
