/**
 * utils.js - Funções Compartilhadas e Utilitárias
 * Química com Professor Wendel
 *
 * Centraliza autenticação, barra administrativa, manipulação de mídia,
 * comentários, animações e utilitários em um único arquivo reutilizável.
 */

// =============================================================================
// 1. AUTENTICAÇÃO E SESSÃO
// =============================================================================

/**
 * Verifica se o professor está autenticado no Supabase.
 * @returns {Promise<boolean>} Retorna true se houver sessão ativa de usuário.
 */
async function verificarSeProfessor() {
    try {
        if (!window.meuClienteSupabase) return false;
        const { data: { session }, error } = await window.meuClienteSupabase.auth.getSession();
        if (error) {
            console.warn("Erro ao obter sessão:", error.message);
            return false;
        }
        return !!(session && session.user);
    } catch (e) {
        console.error("Erro inesperado ao verificar sessão:", e);
        return false;
    }
}

/**
 * Solicita e-mail e senha por prompt e realiza login administrativo.
 * @returns {Promise<boolean>} True se o login foi concluído com sucesso.
 */
async function loginViaPainel() {
    if (!window.meuClienteSupabase) {
        alert("Serviço Supabase indisponível no momento.");
        return false;
    }

    const email = prompt("E-mail de acesso do professor:");
    if (!email) return false;

    const senha = prompt("Senha de acesso:");
    if (!senha) return false;

    const { data, error } = await window.meuClienteSupabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return false;
    }

    alert("Painel desbloqueado com sucesso!");
    window.location.reload();
    return true;
}

/**
 * Realiza login administrativo a partir dos inputs da barra admin (#email-prof e #senha-prof).
 */
async function entrarAdmin() {
    const inputEmail = document.getElementById("email-prof");
    const inputSenha = document.getElementById("senha-prof");

    if (!inputEmail || !inputSenha) {
        return await loginViaPainel();
    }

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
        alert("Preencha o e-mail e a senha!");
        return;
    }

    if (!window.meuClienteSupabase) {
        alert("Serviço Supabase indisponível no momento.");
        return;
    }

    const { error } = await window.meuClienteSupabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return;
    }

    alert("Login realizado com sucesso!");
    window.location.reload();
}

/**
 * Encerra a sessão do professor e recarrega a página.
 */
async function logoutProfessor() {
    if (!window.meuClienteSupabase) return;
    const { error } = await window.meuClienteSupabase.auth.signOut();
    if (error) {
        alert("Erro ao sair: " + error.message);
    } else {
        alert("Logout realizado com sucesso!");
        window.location.reload();
    }
}

// Alias para manter compatibilidade com botões onclick="sairAdmin()"
async function sairAdmin() {
    await logoutProfessor();
}

// =============================================================================
// 2. BARRA ADMINISTRATIVA (#barra-admin) E ELEMENTOS EXCLUSIVOS
// =============================================================================

/**
 * Inicializa a barra administrativa superior e ajusta visibilidade dos elementos admin.
 */
async function inicializarBarraAdmin() {
    const status = document.getElementById("status-admin");
    const blocoLogin = document.getElementById("bloco-login");
    const botoesAdmin = document.getElementById("botoes-admin");
    const botoesAdminGerais = document.querySelectorAll(".admin-only");

    const eProf = await verificarSeProfessor();

    if (eProf) {
        if (status) status.innerText = "🔓 Modo Professor Ativo";
        if (blocoLogin) blocoLogin.style.display = "none";
        if (botoesAdmin) botoesAdmin.style.display = "inline-block";
        botoesAdminGerais.forEach(el => el.style.display = "block");
    } else {
        if (status) status.innerText = "🔒 Modo Visitante";
        if (blocoLogin) blocoLogin.style.display = "inline-block";
        if (botoesAdmin) botoesAdmin.style.display = "none";
        botoesAdminGerais.forEach(el => el.style.display = "none");
    }
}

/**
 * Abre o modal de nova curiosidade (utilizado na barra admin).
 */
function abrirModalCuriosidade() {
    const modal = document.getElementById("modal-curiosidade");
    if (modal) {
        modal.style.display = "block";
    } else {
        // Redireciona para o blog de curiosidades se estiver em subpáginas
        const destino = window.location.pathname.includes("/paginas/") ? "../index.html#secao-blog" : "index.html#secao-blog";
        window.location.href = destino;
    }
}

/**
 * Fecha o modal de nova curiosidade.
 */
function fecharModalCuriosidade() {
    const modal = document.getElementById("modal-curiosidade");
    if (modal) {
        modal.style.display = "none";
    }
}

/**
 * Salva ou emite aviso sobre adição de curiosidade no modal.
 */
function salvarCuriosidade() {
    alert("Para publicar ou gerenciar curiosidades de forma persistente, utilize o painel de conteúdos.");
    fecharModalCuriosidade();
}

// =============================================================================
// 3. MÍDIA E VÍDEOS
// =============================================================================

/**
 * Converte links convencionais do YouTube em URLs seguras para tags <iframe> (embed).
 * @param {string} url - Link do vídeo.
 * @returns {string} URL no formato embed.
 */
function converterParaEmbed(url) {
    if (!url) return "";
    if (url.includes("/embed/")) return url;

    let videoId = "";
    if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1]?.split("&")[0];
    }

    if (videoId) {
        return "https://www.youtube.com/embed/" + videoId;
    }
    return url;
}

// =============================================================================
// 4. TEMPO E FORMATAÇÃO
// =============================================================================

/**
 * Formata um timestamp para formato relativo amigável (ex: "há 5 minutos").
 * @param {number} timestamp - Timestamp em milissegundos.
 * @returns {string} Texto formatado.
 */
function calcularTempoRelativo(timestamp) {
    const agora = new Date().getTime();
    const diferencaSegundos = Math.floor((agora - timestamp) / 1000);

    if (diferencaSegundos < 60) return "agora mesmo";
    const diferencaMinutos = Math.floor(diferencaSegundos / 60);
    if (diferencaMinutos < 60) return "há " + diferencaMinutos + (diferencaMinutos === 1 ? " minuto" : " minutos");
    const diferencaHoras = Math.floor(diferencaMinutos / 60);
    if (diferencaHoras < 24) return "há " + diferencaHoras + (diferencaHoras === 1 ? " hora" : " horas");
    const diferencaDias = Math.floor(diferencaHoras / 24);
    return "há " + diferencaDias + (diferencaDias === 1 ? " dia" : " dias");
}

// =============================================================================
// 5. COMENTÁRIOS E INTERAÇÃO
// =============================================================================

/**
 * Aciona o envio do comentário ao pressionar a tecla Enter.
 * @param {KeyboardEvent} event
 * @param {string} idAutorElem - ID do input do autor.
 * @param {string} idInputElem - ID do input de texto do comentário.
 * @param {string|number} idItem - ID do card ou item comentado.
 */
function verificarEnter(event, idAutorElem, idInputElem, idItem) {
    if (event.key === "Enter") {
        event.preventDefault();
        if (typeof comentar === "function") {
            comentar(idAutorElem, idInputElem, idItem);
        }
    }
}

/**
 * Constrói e anexa visualmente um balão de comentário na lista especificada.
 * @param {HTMLElement} lista - Contêiner pai dos comentários.
 * @param {string} autor - Nome do autor do comentário.
 * @param {string} texto - Conteúdo do comentário.
 * @param {string} tempo - Texto formatado do tempo decorrido.
 * @param {string|number} param1 - Primeiro identificador (ex: id do card ou do item).
 * @param {string|number} param2 - Segundo identificador (ex: índice local ou id do comentário no banco).
 */
async function adicionarElementoComentario(lista, autor, texto, tempo, param1, param2) {
    if (!lista) return;

    const eProfessor = await verificarSeProfessor();

    const novoComentario = document.createElement("div");
    novoComentario.style.background = "#2a2a2a";
    novoComentario.style.borderLeft = "4px solid #16a34a";
    novoComentario.style.padding = "6px 10px";
    novoComentario.style.borderRadius = "4px";
    novoComentario.style.marginTop = "6px";
    novoComentario.style.fontSize = "13px";

    const cabecalho = document.createElement("div");
    cabecalho.style.display = "flex";
    cabecalho.style.justifyContent = "space-between";
    cabecalho.style.marginBottom = "4px";

    const autorSpan = document.createElement("span");
    autorSpan.innerText = "👤 " + (autor || "Visitante");
    autorSpan.style.fontWeight = "bold";
    autorSpan.style.color = "#4ade80";

    const horaSpan = document.createElement("span");
    horaSpan.innerText = tempo;
    horaSpan.style.fontSize = "11px";
    horaSpan.style.color = "#aaa";

    cabecalho.appendChild(autorSpan);
    cabecalho.appendChild(horaSpan);

    const corpo = document.createElement("div");
    corpo.style.display = "flex";
    corpo.style.justifyContent = "space-between";
    corpo.style.alignItems = "center";

    const textoSpan = document.createElement("span");
    textoSpan.innerText = texto;
    textoSpan.style.wordBreak = "break-word";
    textoSpan.style.marginRight = "8px";
    textoSpan.style.color = "#fff";

    const acoesDiv = document.createElement("div");
    acoesDiv.style.display = "flex";
    acoesDiv.style.gap = "4px";
    acoesDiv.style.whiteSpace = "nowrap";

    const btnEditar = document.createElement("button");
    btnEditar.innerText = "✏️";
    btnEditar.style.background = "#374151";
    btnEditar.style.color = "white";
    btnEditar.style.border = "none";
    btnEditar.style.padding = "3px 6px";
    btnEditar.style.borderRadius = "3px";
    btnEditar.style.cursor = "pointer";
    btnEditar.style.fontSize = "11px";
    btnEditar.title = "Editar comentário";
    btnEditar.onclick = function () {
        if (typeof editarComentario === "function") {
            editarComentario(param1, param2);
        }
    };
    acoesDiv.appendChild(btnEditar);

    if (eProfessor) {
        const btnExcluir = document.createElement("button");
        btnExcluir.innerText = "🗑️";
        btnExcluir.style.background = "#b91c1c";
        btnExcluir.style.color = "white";
        btnExcluir.style.border = "none";
        btnExcluir.style.padding = "3px 6px";
        btnExcluir.style.borderRadius = "3px";
        btnExcluir.style.cursor = "pointer";
        btnExcluir.style.fontSize = "11px";
        btnExcluir.title = "Apagar comentário (Modo Professor)";
        btnExcluir.onclick = function () {
            if (typeof excluirComentario === "function") {
                excluirComentario(param1, param2);
            }
        };
        acoesDiv.appendChild(btnExcluir);
    }

    corpo.appendChild(textoSpan);
    corpo.appendChild(acoesDiv);

    novoComentario.appendChild(cabecalho);
    novoComentario.appendChild(corpo);
    lista.appendChild(novoComentario);
}

// =============================================================================
// 6. ANIMAÇÕES DE INTERFACE
// =============================================================================

/**
 * Anima todas as tags <section> da página com efeito suave de entrada.
 */
function animarSecoes() {
    const elementos = document.querySelectorAll("section");
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = "0";
        elemento.style.transform = "translateY(30px)";

        setTimeout(() => {
            elemento.style.transition = "0.8s";
            elemento.style.opacity = "1";
            elemento.style.transform = "translateY(0)";
        }, index * 200);
    });
}

// =============================================================================
// 7. INICIALIZADORES AUTOMÁTICOS
// =============================================================================

window.addEventListener("load", () => {
    animarSecoes();
});

document.addEventListener("DOMContentLoaded", () => {
    inicializarBarraAdmin();
});
