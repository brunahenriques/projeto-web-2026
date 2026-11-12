document.documentElement.classList.add("js");

const Guardar = {
  ler(chave, defeito) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : defeito;
    } catch (e) {
      return defeito;
    }
  },
  escrever(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {  }
  },
};

const Lista = {
  chave: "ctc_lista",
  todos() { return Guardar.ler(this.chave, {}); },
  estado(id) { const l = this.todos()[id]; return l ? l.estado : null; },
  nota(id) { const l = this.todos()[id]; return l ? l.nota || 0 : 0; },
  adicionar(id) {
    const l = this.todos();
    if (!l[id]) l[id] = { estado: "quero", nota: 0 };
    Guardar.escrever(this.chave, l);
    atualizarContador();
  },
  marcarLido(id) {
    const l = this.todos();
    l[id] = { estado: "lido", nota: (l[id] && l[id].nota) || 0 };
    Guardar.escrever(this.chave, l);
    atualizarContador();
  },
  voltarAQuero(id) {
    const l = this.todos();
    if (l[id]) l[id].estado = "quero";
    Guardar.escrever(this.chave, l);
    atualizarContador();
  },
  classificar(id, nota) {
    const l = this.todos();
    if (l[id]) l[id].nota = nota;
    Guardar.escrever(this.chave, l);
  },
  remover(id) {
    const l = this.todos();
    delete l[id];
    Guardar.escrever(this.chave, l);
    atualizarContador();
  },
  ids(estado) {
    const l = this.todos();
    return Object.keys(l).filter((id) => l[id].estado === estado);
  },
  quantos(estado) { return this.ids(estado).length; },
};

function esc(texto) {
  const d = document.createElement("div");
  d.textContent = texto == null ? "" : String(texto);
  return d.innerHTML;
}
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function livroPorId(id) { return LIVROS.find((l) => l.id === id); }
function linkLivro(l) { return "livro.html?id=" + encodeURIComponent(l.id); }

function htmlCapa(l) {
  return `<span class="capa">
    <span class="capa__fallback" aria-hidden="true">${esc(l.titulo)}</span>
    <img src="${esc(l.capa)}" alt="Capa de ${esc(l.titulo)}" width="200" height="300"
         loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">
  </span>`;
}

function anunciar(mensagem) {
  const zona = document.getElementById("aviso");
  if (zona) { zona.textContent = ""; setTimeout(() => (zona.textContent = mensagem), 50); }
}

function atualizarContador() {
  const n = Lista.quantos("quero");
  document.querySelectorAll("[data-contador]").forEach((el) => {
    el.textContent = n;
    el.dataset.zero = n === 0;
  });
}

function iniciarMenu() {
  const botao = document.getElementById("menu-btn");
  const menu = document.getElementById("menu-principal");
  if (!botao || !menu) return;

  const ecraLargo = window.matchMedia("(min-width: 900px)");
  function definir(aberto) {
    botao.setAttribute("aria-expanded", aberto);
    menu.hidden = !aberto;
  }
  definir(false);
  botao.addEventListener("click", () => definir(menu.hidden));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { definir(false); botao.focus(); } });
  ecraLargo.addEventListener("change", () => definir(false));
}

function iniciarSessao() {
  const sessao = Guardar.ler("ctc_sessao", null);
  const link = document.querySelector("[data-link-sessao]");
  if (sessao && link) {
    link.textContent = "Sair (" + sessao.nome.split(" ")[0] + ")";
    link.href = "index.html?sair=1";
  }
  if (new URLSearchParams(location.search).get("sair")) {
    Guardar.escrever("ctc_sessao", null);
    history.replaceState(null, "", "index.html");
    location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();
  iniciarSessao();
  atualizarContador();
});

function htmlBotaoLista(l) {
  const estado = Lista.estado(l.id);
  if (estado === "quero") return `<button class="btn btn--ok btn--pequeno" type="button" data-acao="adicionado" disabled>✓ Na lista</button>`;
  if (estado === "lido") return `<button class="btn btn--ok btn--pequeno" type="button" disabled>✓ Já li</button>`;
  return `<button class="btn btn--pequeno" type="button" data-acao="adicionar" data-id="${esc(l.id)}">Adicionar à lista</button>`;
}
