// ====== DATASET DEMO ======
const FRASES = [
  // Motivacionales
  { texto: "Haz hoy lo que otros no harán; mañana harás lo que otros no pueden.", autor: "Jerry Rice", categoria: "motivacionales" },
  { texto: "La disciplina es el puente entre metas y logros.", autor: "Jim Rohn", categoria: "motivacionales" },
  { texto: "Empieza donde estás, usa lo que tienes, haz lo que puedes.", autor: "Arthur Ashe", categoria: "motivacionales" },
  { texto: "La constancia convierte pasos pequeños en viajes enormes.", autor: "Anónimo", categoria: "motivacionales" },
  { texto: "No tienes que ser grande para empezar, pero debes empezar para ser grande.", autor: "Zig Ziglar", categoria: "motivacionales" },

  // Curiosidades
  { texto: "Las abejas pueden reconocer rostros humanos.", autor: "Dato curioso", categoria: "curiosidades" },
  { texto: "Los flamencos nacen grises; se vuelven rosados por su dieta.", autor: "Dato curioso", categoria: "curiosidades" },
  { texto: "La miel no caduca: se han encontrado tarros comestibles de hace miles de años.", autor: "Dato curioso", categoria: "curiosidades" },
  { texto: "Tu nariz puede recordar 50.000 aromas diferentes.", autor: "Dato curioso", categoria: "curiosidades" },
  { texto: "Los pulpos tienen tres corazones.", autor: "Dato curioso", categoria: "curiosidades" },

  // Inspiradoras
  { texto: "Donde hay amor y creatividad, nada puede salir mal.", autor: "Ella Fitzgerald", categoria: "inspiradoras" },
  { texto: "La simplicidad es la máxima sofisticación.", autor: "Leonardo da Vinci", categoria: "inspiradoras" },
  { texto: "La esperanza es un acto de valentía silencioso.", autor: "Anónimo", categoria: "inspiradoras" },
  { texto: "Busca la belleza en lo cotidiano.", autor: "Anónimo", categoria: "inspiradoras" },
  { texto: "La luz entra por las grietas.", autor: "Leonard Cohen", categoria: "inspiradoras" },

  // Sarcásticas
  { texto: "Claro que duermo bien: mi lista de pendientes me arrulla.", autor: "Anónimo", categoria: "sarcásticas" },
  { texto: "Procrastino, luego existo.", autor: "Anónimo", categoria: "sarcásticas" },
  { texto: "Me encanta madrugar… cuando se acaba.", autor: "Anónimo", categoria: "sarcásticas" },
  { texto: "Mi deporte favorito: esquivar responsabilidades.", autor: "Anónimo", categoria: "sarcásticas" },
  { texto: "Plan perfecto: no hacer nada y luego descansar.", autor: "Anónimo", categoria: "sarcásticas" },

  // Populares
  { texto: "Hazlo o no lo hagas, pero no lo intentes.", autor: "Yoda", categoria: "populares" },
  { texto: "El invierno se acerca.", autor: "Game of Thrones", categoria: "populares" },
  { texto: "La vida es como una caja de bombones.", autor: "Forrest Gump", categoria: "populares" },
  { texto: "Que la Fuerza te acompañe.", autor: "Star Wars", categoria: "populares" },
  { texto: "Houston, tenemos un problema.", autor: "Apolo 13", categoria: "populares" },
];

// ====== CLAVES DE LOCALSTORAGE ======
const LS_KEYS = {
  historial: 'historialFrases',
  categoria: 'categoriaActiva',
  ultima: 'ultimaFrase' // guarda {texto, autor, categoria}
};

// ====== ELEMENTOS DEL DOM ======
const phraseEl = document.getElementById('current-phrase');
const authorEl = document.getElementById('current-author');
const historyList = document.getElementById('phrase-history');

const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
const newBtn = document.getElementById('new-phrase');
const clearBtn = document.getElementById('clear-history');
const copyBtn = document.getElementById('copy-phrase');

// ====== ESTADO ======
let categoriaActiva = cargarCategoriaInicial();
let ultimaFraseMostrada = cargarUltimaFrase();
let historial = cargarHistorial();

// ====== INICIALIZACIÓN ======
activarCategoriaBtn(categoriaActiva);
renderHistory();

// si había última frase, la muestra al cargar
if (ultimaFraseMostrada) {
  mostrarFrase(ultimaFraseMostrada);
}

// ====== EVENTOS ======
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const nuevaCat = btn.dataset.category;
    categoriaActiva = nuevaCat;
    activarCategoriaBtn(nuevaCat);
    guardarCategoria();
  });
});

newBtn.addEventListener('click', () => {
  const frase = obtenerFraseAleatoria(categoriaActiva);
  if (!frase) {
    phraseEl.textContent = "No hay frases disponibles en esta categoría (aún).";
    authorEl.textContent = "";
    return;
  }
  mostrarFrase(frase);
  ultimaFraseMostrada = frase;
  guardarUltimaFrase();

  pushToHistory(frase);
  guardarHistorial();
  renderHistory();
});

clearBtn.addEventListener('click', () => {
  historial = [];
  guardarHistorial();
  renderHistory();
  ultimaFraseMostrada = null;
  guardarUltimaFrase();

  phraseEl.textContent = 'Pulsa “Dime otra” para ver una nueva frase.';
  authorEl.textContent = '';
});

copyBtn.addEventListener('click', async () => {
  const texto = construirTextoParaCopiar();
  try {
    await navigator.clipboard.writeText(texto);
    feedbackCopiadoOk(copyBtn);
  } catch (e) {
    // Fallback si no hay Clipboard API
    copiarConFallback(texto);
    feedbackCopiadoOk(copyBtn);
  }
});

// ====== LÓGICA ======
function activarCategoriaBtn(cat) {
  categoryButtons.forEach(b => {
    const activa = b.dataset.category === cat;
    b.classList.toggle('active', activa);
    b.setAttribute('aria-pressed', activa ? 'true' : 'false');
  });
}

function filtrarPorCategoria(cat) {
  return FRASES.filter(f => f.categoria === cat);
}

function obtenerFraseAleatoria(cat) {
  const lista = filtrarPorCategoria(cat);
  if (lista.length === 0) return null;

  // Evitar repetir la misma frase inmediatamente
  let candidata = null;
  let intentos = 0;
  do {
    candidata = lista[Math.floor(Math.random() * lista.length)];
    intentos++;
    if (intentos > 10) break; // por si la categoría tiene 1 sola frase
  } while (ultimaFraseMostrada && candidata.texto === ultimaFraseMostrada.texto);

  return candidata;
}

function mostrarFrase({ texto, autor }) {
  phraseEl.textContent = texto;
  authorEl.textContent = autor ? `— ${autor}` : '';
}

function pushToHistory(frase) {
  historial.push({ ...frase, fecha: Date.now() });
}

function renderHistory() {
  historyList.innerHTML = '';
  if (historial.length === 0) {
    historyList.innerHTML = '<li style="opacity:.6">No hay frases todavía.</li>';
    return;
  }
  historial.slice().reverse().forEach(({ texto, autor, categoria }) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>[${formatearCategoria(categoria)}]</strong> ${texto}
      ${autor ? `<em style="opacity:.8"> — ${autor}</em>` : ''}
    `;
    historyList.appendChild(li);
  });
}

function formatearCategoria(cat) {
  switch (cat) {
    case 'motivacionales': return 'Motivacionales';
    case 'curiosidades':   return 'Curiosidades';
    case 'inspiradoras':   return 'Inspiradoras';
    case 'sarcásticas':    return 'Sarcásticas';
    case 'populares':      return 'Populares';
    default: return cat;
  }
}

function construirTextoParaCopiar() {
  const frase = phraseEl.textContent?.trim() || '';
  const autor = authorEl.textContent?.replace(/^—\s*/, '').trim() || '';
  return autor ? `${frase} — ${autor}` : frase;
}

function feedbackCopiadoOk(btn) {
  const textoOriginal = btn.textContent;

  // Cambiar el texto del botón
  btn.textContent = '✅ Copiado';
  btn.disabled = true;

  // Activar el brillo de la pantalla
  const screen = document.querySelector('.screen');
  screen.classList.add('flash');

  // Volver al estado original
  setTimeout(() => {
    btn.textContent = textoOriginal;
    btn.disabled = false;
    screen.classList.remove('flash');
  }, 1200);
}

function copiarConFallback(texto) {
  const area = document.createElement('textarea');
  area.value = texto;
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.focus();
  area.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(area);
}

// ====== LOCALSTORAGE: GUARDAR/CARGAR ======
function guardarHistorial() {
  try { localStorage.setItem(LS_KEYS.historial, JSON.stringify(historial)); } catch (e) {}
}

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(LS_KEYS.historial);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function guardarCategoria() {
  try { localStorage.setItem(LS_KEYS.categoria, categoriaActiva); } catch (e) {}
}

function cargarCategoriaInicial() {
  try {
    return localStorage.getItem(LS_KEYS.categoria) || 'motivacionales';
  } catch (e) {
    return 'motivacionales';
  }
}

function guardarUltimaFrase() {
  try {
    if (!ultimaFraseMostrada) {
      localStorage.removeItem(LS_KEYS.ultima);
      return;
    }
    localStorage.setItem(LS_KEYS.ultima, JSON.stringify(ultimaFraseMostrada));
  } catch (e) {}
}

function cargarUltimaFrase() {
  try {
    const raw = localStorage.getItem(LS_KEYS.ultima);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}