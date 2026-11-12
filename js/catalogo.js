const POR_PAGINA = 24;

const el = {
  form: document.getElementById("filtros"),
  pesquisa: document.getElementById("pesquisa"),
  genero: document.getElementById("genero"),
  ordem: document.getElementById("ordem"),
  lista: document.getElementById("livros"),
  estado: document.getElementById("estado"),
  mais: document.getElementById("mais"),
  maisBtn: document.getElementById("mais-btn"),
  vazio: document.getElementById("vazio"),
  limpar: document.getElementById("limpar"),
  mini: document.getElementById("mini-lista"),
  miniVazia: document.getElementById("mini-vazia"),
};

let resultados = [];
let mostrados = 0;

function preencherGeneros() {
  const generos = [...new Set(LIVROS.map((l) => l.genero))].sort((a, b) => a.localeCompare(b, "pt"));
  el.genero.insertAdjacentHTML("beforeend", generos.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join(""));
}

function filtrar() {
  const termo = normalizar(el.pesquisa.value.trim());
  const genero = el.genero.value;

  resultados = LIVROS.filter((l) => {
    const textoOk = !termo || normalizar(l.titulo).includes(termo) || normalizar(l.autor).includes(termo);
    const generoOk = !genero || l.genero === genero;
    return textoOk && generoOk;
  });

  const ordem = el.ordem.value;
  if (ordem === "avaliacao") resultados.sort((a, b) => b.nota - a.nota);
  else if (ordem === "titulo") resultados.sort((a, b) => a.titulo.localeCompare(b.titulo, "en"));
  else resultados.sort((a, b) => b.votos - a.votos);

  mostrados = 0;
  el.lista.innerHTML = "";
  desenharMais();

  const n = resultados.length;
  el.estado.textContent = n === 1 ? "1 livro encontrado" : n + " livros encontrados";
  el.vazio.hidden = n !== 0;
  el.limpar.hidden = !termo && !genero;
}

function htmlCartao(l) {
  return `<li class="livro-card">
    <a href="${linkLivro(l)}" tabindex="-1" aria-hidden="true">${htmlCapa(l)}</a>
    <div class="livro-card__corpo">
      <h3 class="livro-card__titulo"><a href="${linkLivro(l)}">${esc(l.titulo)}</a></h3>
      <p class="livro-card__autor">${esc(l.autor)}</p>
      <div class="livro-card__meta">
        <span class="etiqueta">${esc(l.genero)}</span>
        <span class="nota" title="Avaliação média">${l.nota.toFixed(2)}</span>
      </div>
      <details class="sinopse-curta">
        <summary>Ler sinopse</summary>
        <p>${esc(l.sinopse.length > 260 ? l.sinopse.slice(0, 260).replace(/\s\S*$/, "") + "…" : l.sinopse)}</p>
      </details>
      <div class="livro-card__acoes">
        <span data-botao="${esc(l.id)}">${htmlBotaoLista(l)}</span>
        <a class="btn btn--contorno btn--pequeno" href="${linkLivro(l)}">Ver detalhe</a>
      </div>
    </div>
  </li>`;
}

function desenharMais() {
  const bloco = resultados.slice(mostrados, mostrados + POR_PAGINA);
  el.lista.insertAdjacentHTML("beforeend", bloco.map(htmlCartao).join(""));
  mostrados += bloco.length;
  el.mais.hidden = mostrados >= resultados.length;
}

function desenharMini() {
  const ids = Lista.ids("quero");
  el.miniVazia.hidden = ids.length > 0;
  el.mini.innerHTML = ids.map((id) => {
    const l = livroPorId(id);
    if (!l) return "";
    return `<li class="mini-item">
      <a href="${linkLivro(l)}" tabindex="-1" aria-hidden="true">${htmlCapa(l)}</a>
      <div>
        <h3><a href="${linkLivro(l)}">${esc(l.titulo)}</a></h3>
        <p>${esc(l.autor)}</p>
        <button class="btn btn--contorno btn--pequeno" type="button" data-remover="${esc(id)}">Remover</button>
      </div>
    </li>`;
  }).join("");
}

el.form.addEventListener("submit", (e) => e.preventDefault());
el.pesquisa.addEventListener("input", filtrar);
el.genero.addEventListener("change", filtrar);
el.ordem.addEventListener("change", filtrar);
el.maisBtn.addEventListener("click", desenharMais);
el.limpar.addEventListener("click", () => {
  el.pesquisa.value = ""; el.genero.value = ""; filtrar(); el.pesquisa.focus();
});

el.lista.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-acao='adicionar']");
  if (!btn) return;
  const l = livroPorId(btn.dataset.id);
  Lista.adicionar(l.id);
  btn.closest("[data-botao]").innerHTML = htmlBotaoLista(l);
  desenharMini();
  anunciar(`"${l.titulo}" adicionado à lista Quero ler.`);
});

el.mini.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remover]");
  if (!btn) return;
  const l = livroPorId(btn.dataset.remover);
  Lista.remover(l.id);
  desenharMini();
  const alvo = el.lista.querySelector(`[data-botao="${CSS.escape(l.id)}"]`);
  if (alvo) alvo.innerHTML = htmlBotaoLista(l);
  anunciar(`"${l.titulo}" removido da lista.`);
});

preencherGeneros();
const params = new URLSearchParams(location.search);
if (params.get("genero")) el.genero.value = params.get("genero");
if (params.get("q")) el.pesquisa.value = params.get("q");
filtrar();
desenharMini();
