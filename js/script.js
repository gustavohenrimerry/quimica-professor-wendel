console.log("Site Química com Professor Wendel carregado!");

window.addEventListener("load", () => {
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
});

const botaoSerie = document.querySelector(".botao");

if(botaoSerie){
    botaoSerie.addEventListener("click", () => {
        console.log("Aluno escolheu uma série para estudar!");
    });
}

function boasVindas(){
    console.log(
        "Bem-vindo ao laboratório virtual do Professor Wendel!"
    );
}

boasVindas();

async function fazerLoginProfessor(email, senha) {
    const { data, error } = await window.meuClienteSupabase.auth.signInWithPassword({
        email: email,
        password: senha,
    });

    if (error) {
        alert("Erro ao fazer login: " + error.message);
        return false;
    }

    alert("Login realizado com sucesso!");
    window.location.reload();
    return true;
}

async function fazerLogoutProfessor() {
    const { error } = await window.meuClienteSupabase.auth.signOut();
    if (!error) {
        alert("Logout realizado com sucesso!");
        window.location.reload();
    } else {
        alert("Erro ao sair: " + error.message);
    }
}

async function verificarSessaoProfessor() {
    const { data: { session } } = await window.meuClienteSupabase.auth.getSession();
    
    const botoesAdmin = document.querySelectorAll('.admin-only'); 

    if (session && session.user) {
        console.log("Professor logado:", session.user.email);
        
        botoesAdmin.forEach(el => el.style.display = 'block');
        
        return true;
    } else {
        console.log("Modo visitante / não logado");
        
        botoesAdmin.forEach(el => el.style.display = 'none');
        
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    verificarSessaoProfessor();
});