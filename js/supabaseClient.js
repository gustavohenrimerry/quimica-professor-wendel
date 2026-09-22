const SUPABASE_URL = "https://ahstdxgglfgjfeuurkqg.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoc3RkeGdnbGZnamZldXVya3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NTY1ODIsImV4cCI6MjEwNDEzMjU4Mn0.4i7i3_w0n6VvrAXHduUMRKQPCQ6cR2SzAy7XCYtnUJY";

window.meuClienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = window.meuClienteSupabase;

window.EMAIL_PROFESSOR = "wendel@gmail.com";

async function obterSessao() {
    const {
        data: { session },
        error,
    } = await window.meuClienteSupabase.auth.getSession();

    if (error) {
        console.error("Erro ao verificar sessão:", error.message);

        return null;
    }

    return session;
}

async function obterUsuarioAtual() {
    const {
        data: { user },
        error,
    } = await window.meuClienteSupabase.auth.getUser();

    if (error) {
        console.error("Erro ao pegar usuário:", error.message);

        return null;
    }

    return user;
}

async function estaLogado() {
    const session = await obterSessao();

    return session !== null;
}

async function fazerLogin(email, senha) {
    const { data, error } = await window.meuClienteSupabase.auth.signInWithPassword({
        email: email,
        password: senha,
    });

    if (error) {
        console.error("Erro no login:", error.message);

        return {
            sucesso: false,
            erro: error.message,
        };
    }

    return {
        sucesso: true,
        usuario: data.user,
        sessao: data.session,
    };
}

async function fazerLogout() {
    const { error } = await window.meuClienteSupabase.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error.message);

        return false;
    }

    return true;
}

window.meuClienteSupabase.auth.onAuthStateChange((evento, session) => {
    console.log("Estado da autenticação:", evento);

    console.log("Sessão:", session);
});
