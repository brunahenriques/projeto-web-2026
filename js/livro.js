const raiz = document.getElementById("livro");
const id = new URLSearchParams(location.search).get("id");
const livro = id ? livroPorId(id) : null;

function htmlAcoes(l) {
  const estado = Lista.estado(l.id);
  if (estado === "lido") {
    return `<span class="btn btn--ok" role="status">✓ Já li este livro</span>
            <a class="btn btn--contorno" href="lista.html">Ver a minha lista</a>`;
  }
  if (estado === "quero") {
    return `<span class="btn btn--ok" role="status">✓ Na lista Quero ler</span>
            <button class="btn btn--contorno" type="button" data-acao="lido">Marcar como lido</button>
            <button class="btn btn--contorno" type="button" data-acao="remover">Remover da lista</button>`;
  }
  return `<button class="btn" type="button" data-acao="adicionar">Adicionar à lista</button>
          <button class="btn btn--contorno" type="button" data-acao="lido">Já li este livro</button>`;
}

function desenhar(l) {
  document.title = `${l.titulo} · CoverToCover`;
  const sugestoes = LIVROS.filter((x) => x.genero === l.genero && x.id !== l.id)
    .sort((a, b) => b.votos - a.votos).slice(0, 4);

  raiz.innerHTML = `
    <nav class="migalhas" aria-label="Localização">
      <a href="livros.html">Procurar livros</a> / <a href="livros.html?genero=${encodeURIComponent(l.genero)}">${esc(l.genero)}</a> / <span aria-current="page">${esc(l.titulo)}</span>
    </nav>
    <article class="detalhe">
      <div class="detalhe__capa">${htmlCapa(l)}</div>
      <header class="detalhe__cabecalho">
        <h1>${esc(l.titulo)}</h1>
        <p class="detalhe__autor">por ${esc(l.autor)}</p>
        ${l.serie ? `<p class="suave">${esc(l.serie)}</p>` : ""}
        <div class="detalhe__etiquetas">
          <a class="etiqueta" href="livros.html?genero=${encodeURIComponent(l.genero)}">${esc(l.genero)}</a>
          <span class="nota">${l.nota.toFixed(2)}</span>
        </div>
        <dl class="ficha">
          <div><dt>Páginas</dt><dd>${l.paginas || "—"}</dd></div>
          <div><dt>Avaliações</dt><dd>${l.votos.toLocaleString("pt-PT")}</dd></div>
          <div><dt>Idioma</dt><dd>Inglês</dd></div>
        </dl>
        <div class="detalhe__acoes" id="acoes">${htmlAcoes(l)}</div>
      </header>
      <section class="detalhe__corpo sinopse" aria-labelledby="t-sinopse">
        <h2 id="t-sinopse">Sinopse</h2>
        <p>${esc(l.sinopse)}</p>
        <p class="suave">Sinopse original em inglês.</p>
      </section>
    </article>
    <section class="sugestoes" aria-labelledby="t-sugestoes">
      <h2 id="t-sugestoes">Mais livros de ${esc(l.genero.toLowerCase())}</h2>
      <ul class="sugestoes__lista">
        ${sugestoes.map((s) => `<li class="sugestao"><a href="${linkLivro(s)}">${htmlCapa(s)}<h3>${esc(s.titulo)}</h3></a><p>${esc(s.autor)}</p></li>`).join("")}
      </ul>
    </section>`;

  raiz.querySelector("#acoes").addEventListener("click", (e) => {
    const acao = e.target.closest("[data-acao]");
    if (!acao) return;
    if (acao.dataset.acao === "adicionar") { Lista.adicionar(l.id); anunciar("Adicionado à lista Quero ler."); }
    if (acao.dataset.acao === "lido") { Lista.marcarLido(l.id); anunciar("Marcado como lido."); }
    if (acao.dataset.acao === "remover") { Lista.remover(l.id); anunciar("Removido da lista."); }
    raiz.querySelector("#acoes").innerHTML = htmlAcoes(l);
  });
}

if (livro) {
  desenhar(livro);
} else {
  document.title = "Livro não encontrado · CoverToCover";
  raiz.innerHTML = `<div class="vazio" style="margin-top:2rem">
    <h1>Livro não encontrado</h1>
    <p>O endereço não corresponde a nenhum livro do catálogo.</p>
    <a class="btn" href="livros.html">Voltar ao catálogo</a></div>`;
}
