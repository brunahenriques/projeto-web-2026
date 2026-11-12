function resumo(texto) {
  let h = 5381;
  for (const c of texto) h = (h * 33) ^ c.charCodeAt(0);
  return String(h >>> 0);
}

function mostrarErro(campo, mensagem) {
  const erro = document.getElementById(campo.id + "-erro");
  campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
  if (erro) erro.textContent = mensagem || "";
}

function aviso(form, tipo, texto) {
  const caixa = form.querySelector(".aviso-form");
  caixa.className = "aviso-form mensagem mensagem--" + tipo;
  caixa.textContent = texto;
  caixa.hidden = false;
}

const formRegisto = document.getElementById("form-registo");
if (formRegisto) {
  formRegisto.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = formRegisto.elements;
    let ok = true;

    const regras = [
      [f.nome, f.nome.value.trim().length >= 2, "Escreve o teu nome."],
      [f.email, f.email.validity.valid && f.email.value.includes("."), "Escreve um email válido, por exemplo ana@email.pt."],
      [f.senha, f.senha.value.length >= 6, "A palavra-passe precisa de pelo menos 6 caracteres."],
      [f.senha2, f.senha2.value === f.senha.value && f.senha2.value !== "", "As palavras-passe não coincidem."],
    ];
    regras.forEach(([campo, valido, msg]) => { mostrarErro(campo, valido ? "" : msg); if (!valido) ok = false; });
    if (!f.termos.checked) { ok = false; aviso(formRegisto, "erro", "Aceita os termos para criar a conta."); }
    if (!ok) { formRegisto.querySelector("[aria-invalid='true']")?.focus(); return; }

    const utilizadores = Guardar.ler("ctc_utilizadores", {});
    const email = f.email.value.trim().toLowerCase();
    if (utilizadores[email]) {
      mostrarErro(f.email, "Já existe uma conta com este email.");
      f.email.focus();
      return;
    }
    utilizadores[email] = { nome: f.nome.value.trim(), senha: resumo(f.senha.value) };
    Guardar.escrever("ctc_utilizadores", utilizadores);
    Guardar.escrever("ctc_sessao", { email, nome: utilizadores[email].nome });
    aviso(formRegisto, "ok", "Conta criada! A abrir o catálogo…");
    setTimeout(() => (location.href = "livros.html"), 900);
  });
}

const formLogin = document.getElementById("form-login");
if (formLogin) {
  const sessao = Guardar.ler("ctc_sessao", null);
  if (sessao) {
    document.getElementById("login-ola").textContent = `Já tens sessão iniciada como ${sessao.nome}.`;
    document.getElementById("login-ola").hidden = false;
  }
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = formLogin.elements;
    const utilizadores = Guardar.ler("ctc_utilizadores", {});
    const u = utilizadores[f.email.value.trim().toLowerCase()];
    mostrarErro(f.email, f.email.value.trim() ? "" : "Escreve o teu email.");
    mostrarErro(f.senha, f.senha.value ? "" : "Escreve a tua palavra-passe.");
    if (!f.email.value.trim() || !f.senha.value) return;

    if (!u || u.senha !== resumo(f.senha.value)) {
      aviso(formLogin, "erro", "Email ou palavra-passe incorretos. Ainda não tens conta? Cria uma em baixo.");
      return;
    }
    Guardar.escrever("ctc_sessao", { email: f.email.value.trim().toLowerCase(), nome: u.nome });
    aviso(formLogin, "ok", `Bem-vindo(a), ${u.nome.split(" ")[0]}! A abrir o catálogo…`);
    setTimeout(() => (location.href = "livros.html"), 700);
  });
}

const esqueci = document.getElementById("esqueci");
if (esqueci && formLogin) {
  esqueci.addEventListener("click", (e) => {
    e.preventDefault();
    aviso(formLogin, "erro", "A recuperação de palavra-passe não está disponível na versão de demonstração.");
  });
}
