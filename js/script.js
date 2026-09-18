/**
 * script.js - Lógica específica da Página Inicial (Home)
 * Química com Professor Wendel
 * 
 * As funções compartilhadas (autenticação, barra admin, utilitários) 
 * estão centralizadas em js/utils.js.
 */

console.log("Site Química com Professor Wendel carregado!");

/**
 * Exibe mensagem de boas-vindas no console do laboratório.
 */
function boasVindas() {
    console.log("Bem-vindo ao laboratório virtual do Professor Wendel!");
}

boasVindas();

/**
 * Interação do botão de escolha de série da página inicial.
 */
const botaoSerie = document.querySelector(".botao");
if (botaoSerie) {
    botaoSerie.addEventListener("click", () => {
        console.log("Aluno escolheu uma série para estudar!");
    });
}