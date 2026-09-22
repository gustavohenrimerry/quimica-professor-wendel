let perguntasData = {};
let serieAtual = [];
let perguntaAtualIndex = 0;
let pontuacao = 0;

const telaInicio = document.getElementById("tela-inicio");
const telaQuiz = document.getElementById("tela-quiz");
const telaResultado = document.getElementById("tela-resultado");

const contadorPergunta = document.getElementById("contador-pergunta");
const perguntaTexto = document.getElementById("pergunta-texto");
const alternativasContainer = document.getElementById("alternativas-container");
const explicacaoContainer = document.getElementById("explicacao-container");
const explicacaoTexto = document.getElementById("explicacao-texto");
const btnProximo = document.getElementById("btn-proximo");
const btnReiniciar = document.getElementById("btn-reiniciar");

async function carregarPerguntas() {
    try {
        const resposta = await fetch("dados/perguntas.json");
        if (!resposta.ok) throw new Error("Erro ao carregar arquivo JSON de perguntas.");
        perguntasData = await resposta.json();
    } catch (erro) {
        console.error("Erro ao carregar as perguntas do JSON:", erro);
        perguntasData = {};
    }

    let perguntasAdmin = JSON.parse(localStorage.getItem("admin_quizzes")) || [];
    perguntasAdmin.forEach((q) => {
        if (!perguntasData[q.serie]) {
            perguntasData[q.serie] = [];
        }
        let indiceCorreto = q.alternativas.indexOf(q.correta);
        if (indiceCorreto === -1) indiceCorreto = 0;

        perguntasData[q.serie].push({
            pergunta: q.pergunta,
            alternativas: q.alternativas,
            resposta: indiceCorreto,
            explicacao: q.explicacao || "Sem explicação cadastrada.",
        });
    });
}

carregarPerguntas();

document.querySelectorAll(".btn-serie").forEach((botao) => {
    botao.addEventListener("click", (e) => {
        const serie = e.target.getAttribute("data-serie");

        if (!perguntasData[serie] || perguntasData[serie].length === 0) {
            alert("Ainda não há perguntas cadastradas para esta série!");
            return;
        }

        serieAtual = perguntasData[serie];
        perguntaAtualIndex = 0;
        pontuacao = 0;

        if (telaInicio) telaInicio.classList.add("oculto");
        if (telaQuiz) telaQuiz.classList.remove("oculto");

        mostrarPergunta();
    });
});

function mostrarPergunta() {
    resetarEstado();
    const currentPergunta = serieAtual[perguntaAtualIndex];

    if (contadorPergunta)
        contadorPergunta.innerText = `Pergunta ${perguntaAtualIndex + 1} de ${serieAtual.length}`;
    if (perguntaTexto) perguntaTexto.innerText = currentPergunta.pergunta;

    currentPergunta.alternativas.forEach((alternativa, index) => {
        const btn = document.createElement("button");
        btn.classList.add("btn-alternativa");
        btn.innerText = alternativa;
        btn.addEventListener("click", () => selecionarAlternativa(btn, index, currentPergunta));
        alternativasContainer.appendChild(btn);
    });
}

function resetarEstado() {
    if (btnProximo) btnProximo.classList.add("oculto");
    if (explicacaoContainer) explicacaoContainer.classList.add("oculto");
    if (alternativasContainer) alternativasContainer.innerHTML = "";
}

function selecionarAlternativa(botaoSelecionado, indiceEscolhido, perguntaObj) {
    const botoes = alternativasContainer.querySelectorAll(".btn-alternativa");
    const indiceCorreto = perguntaObj.resposta;

    botoes.forEach((btn) => (btn.disabled = true));

    if (indiceEscolhido === indiceCorreto) {
        botaoSelecionado.classList.add("correta");
        pontuacao++;
        if (explicacaoTexto)
            explicacaoTexto.innerHTML = `<strong>✨ Resposta Correta!</strong><br>${perguntaObj.explicacao}`;
        if (explicacaoContainer) {
            explicacaoContainer.style.background = "#d4edda";
            explicacaoContainer.style.borderColor = "#28a745";
            explicacaoContainer.style.color = "#155724";
        }
    } else {
        botaoSelecionado.classList.add("errada");
        if (botoes[indiceCorreto]) {
            botoes[indiceCorreto].classList.add("correta");
        }

        if (explicacaoTexto)
            explicacaoTexto.innerHTML = `<strong>❌ Resposta Incorreta!</strong><br>A alternativa certa era: <em>"${perguntaObj.alternativas[indiceCorreto]}"</em><br><br><strong>💡 Explicação:</strong> ${perguntaObj.explicacao}`;
        if (explicacaoContainer) {
            explicacaoContainer.style.background = "#f8d7da";
            explicacaoContainer.style.borderColor = "#dc3545";
            explicacaoContainer.style.color = "#721c24";
        }
    }

    if (explicacaoContainer) explicacaoContainer.classList.remove("oculto");
    if (btnProximo) btnProximo.classList.remove("oculto");

    if (perguntaAtualIndex === serieAtual.length - 1) {
        if (btnProximo) btnProximo.innerText = "Ver Resultado";
    } else {
        if (btnProximo) btnProximo.innerText = "Próxima Pergunta";
    }
}

if (btnProximo) {
    btnProximo.addEventListener("click", () => {
        perguntaAtualIndex++;
        if (perguntaAtualIndex < serieAtual.length) {
            mostrarPergunta();
        } else {
            mostrarResultado();
        }
    });
}

function mostrarResultado() {
    if (telaQuiz) telaQuiz.classList.add("oculto");
    if (telaResultado) telaResultado.classList.remove("oculto");

    const resultadoTexto = document.getElementById("resultado-texto");
    if (resultadoTexto) {
        resultadoTexto.innerText = `Você acertou ${pontuacao} de ${serieAtual.length} perguntas!`;
    }
}

if (btnReiniciar) {
    btnReiniciar.addEventListener("click", () => {
        if (telaResultado) telaResultado.classList.add("oculto");
        if (telaInicio) telaInicio.classList.remove("oculto");
    });
}

async function toggleModoProfessorGlobal() {
    const body = document.body;
    const btn = document.getElementById("btn-painel-global");

    if (!window.meuClienteSupabase) return;

    const {
        data: { session },
    } = await window.meuClienteSupabase.auth.getSession();

    if (!session) {
        alert("🔐 Você precisa fazer login como professor.");
        window.location.href = "../../login.html";
        return;
    }

    const emailUsuario = session.user.email?.toLowerCase();

    if (window.EMAIL_PROFESSOR && emailUsuario !== window.EMAIL_PROFESSOR.toLowerCase()) {
        alert("⛔ Este painel é exclusivo para o Professor.");
        return;
    }

    body.classList.toggle("modo-professor-ativo");

    if (body.classList.contains("modo-professor-ativo")) {
        if (btn) {
            btn.innerText = "🔑 Painel do Professor (Ativo)";
            btn.style.color = "#4CAF50";
        }
        if (typeof carregarDadosPainelProfessor === "function") {
            await carregarDadosPainelProfessor();
        }
    } else {
        if (btn) {
            btn.innerText = "🔑 Painel do Professor";
            btn.style.color = "#ffeb3b";
        }
    }
}

async function carregarDadosPainelProfessor() {
    const perguntasAdmin = JSON.parse(localStorage.getItem("admin_quizzes")) || [];
    console.log(
        `Painel do professor ativo. ${perguntasAdmin.length} pergunta(s) customizada(s) carregada(s).`,
    );
}

async function verificarLogin() {
    if (!window.meuClienteSupabase) return;

    const {
        data: { session },
    } = await window.meuClienteSupabase.auth.getSession();

    const status = document.getElementById("status-login");
    const login = document.getElementById("link-login");
    const sairBtn = document.getElementById("btn-sair");

    if (session) {
        if (status) status.textContent = "👤 " + (session.user.email || "Usuário");
        if (login) login.style.display = "none";
        if (sairBtn) sairBtn.style.display = "inline-block";
    } else {
        if (status) status.textContent = "Visitante";
        if (login) login.style.display = "inline-block";
        if (sairBtn) sairBtn.style.display = "none";
    }
}

async function sair() {
    if (!window.meuClienteSupabase) return;
    const { error } = await window.meuClienteSupabase.auth.signOut();
    if (error) {
        alert("Erro ao sair: " + error.message);
        return;
    }
    window.location.href = "../../login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    verificarLogin();

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", sair);
    }
});
