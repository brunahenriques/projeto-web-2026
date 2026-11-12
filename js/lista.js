const zona = document.getElementById("lista-itens");
const vazio = document.getElementById("lista-vazia");
const separadores = document.querySelectorAll("[role='tab']");
let separadorAtual = "quero";

function htmlEstrelas(l) {
  const nota = Lista.nota(l.id);
  let botoes = "";
  for (let i = 1; i <= 5; i++) {
    botoes += `<button class="estrela${i <= nota ? " ativa" : ""}" type="button" data-estrela="${i}"
      aria-label="${i} ${i === 1 ? "estrela" : "estrelas"}" aria-pressed="${i === nota}">★</button>`;
  }
  return `<div class="estrelas" role="group" aria-label="A tua classificação"><span class="estrelas__rotulo">A tua nota:</span>${botoes}</div>`;
}

function htmlItem(l) {
  const lido = separadorAtual === "lido";
  return `<li class="livro-card" data-id="${esc(l.id)}">
    <a href="${linkLivro(l)}" tabindex="-1" aria-hidden="true">${htmlCapa(l)}</a>
    <div class="livro-card__corpo">
      <h3 class="livro-card__titulo"><a href="${linkLivro(l)}">${esc(l.titulo)}</a></h3>
      <p class="livro-card__autor">${esc(l.autor)}</p>
      <div class="livro-card__meta"><span class="etiqueta">${esc(l.genero)}</span></div>
      ${lido ? htmlEstrelas(l) : ""}
      <div class="livro-card__acoes">
        ${lido
          ? `<button class="btn btn--contorno btn--pequeno" type="button" data-acao="voltar">Voltar a Quero ler</button>`
          : `<button class="btn btn--pequeno" type="button" data-acao="lido">Marcar como lido</button>`}
        <button class="btn btn--contorno btn--pequeno" type="button" data-acao="remover">Remover</button>
      </div>
    </div>
  </li>`;
}

function desenhar() {
  const ids = Lista.ids(separadorAtual);
  zona.innerHTML = ids.map((id) => livroPorId(id)).filter(Boolean).map(htmlItem).join("");
  vazio.hidden = ids.length > 0;
  vazio.querySelector("p").textContent = separadorAtual === "quero"
    ? "Ainda não guardaste nenhum livro para ler. Explora o catálogo e carrega em “Adicionar à lista”."
    : "Ainda não marcaste nenhum livro como lido.";
  document.getElementById("n-quero").textContent = Lista.quantos("quero");
  document.getElementById("n-lido").textContent = Lista.quantos("lido");
}

separadores.forEach((s) => s.addEventListener("click", () => {
  separadorAtual = s.dataset.estado;
  separadores.forEach((x) => x.setAttribute("aria-selected", x === s));
  desenhar();
}));

zona.addEventListener("click", (e) => {
  const item = e.target.closest("[data-id]");
  if (!item) return;
  const l = livroPorId(item.dataset.id);
  const acao = e.target.closest("[data-acao]");
  const estrela = e.target.closest("[data-estrela]");

  if (estrela) {
    const n = Number(estrela.dataset.estrela);
    Lista.classificar(l.id, n === Lista.nota(l.id) ? 0 : n);
    desenhar();
    anunciar(`Classificação de "${l.titulo}" guardada.`);
    return;
  }
  if (!acao) return;
  if (acao.dataset.acao === "lido") { Lista.marcarLido(l.id); anunciar(`"${l.titulo}" marcado como lido.`); }
  if (acao.dataset.acao === "voltar") { Lista.voltarAQuero(l.id); anunciar(`"${l.titulo}" voltou a Quero ler.`); }
  if (acao.dataset.acao === "remover") { Lista.remover(l.id); anunciar(`"${l.titulo}" removido.`); }
  desenhar();
});

desenhar();
