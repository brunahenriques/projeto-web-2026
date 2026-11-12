const estante = document.getElementById("estante");
if (estante) {
  const top = [...LIVROS].sort((a, b) => b.votos - a.votos).slice(0, 18);
  estante.innerHTML = top.map((l) =>
    `<li><a class="lombada" href="${linkLivro(l)}" title="${esc(l.titulo)} · ${esc(l.autor)}">${esc(l.titulo.length > 34 ? l.titulo.slice(0, 32) + "…" : l.titulo)}</a></li>`
  ).join("");
}
