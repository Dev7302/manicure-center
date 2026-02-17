// auth.js
const API_URL = 'https://manicure-center-production.up.railway.app/api';

function showMessage(elementId, message, isError = true) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.className = isError ? 'error' : 'success';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, telefone, senha })
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage('message', 'Cadastro realizado! Redirecionando...', false);
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    showMessage('message', data.erro || 'Erro ao cadastrar');
                }
            } catch (error) {
                showMessage('message', 'Erro de conexão');
            }
        });
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    showMessage('message', 'Login bem-sucedido! Redirecionando...', false);
                    setTimeout(() => window.location.href = 'index.html', 2000);
                } else {
                    showMessage('message', data.erro || 'Erro ao fazer login');
                }
            } catch (error) {
                showMessage('message', 'Erro de conexão');
            }
        });
    }

    // Carregar informações do usuário (para qualquer página que tenha #user-info)
    carregarUserInfo();
});

async function carregarUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (!userInfo) return;

    const token = localStorage.getItem('token');
    if (!token) {
        userInfo.innerHTML = '<p>🔓 Você não está logado. <a href="login.html">Login</a></p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Token inválido');
        const user = await response.json();

        userInfo.innerHTML = `
            <span>👋 Olá, ${user.nome}!</span>
            <button onclick="logout()">Sair</button>
        `;

        // Se for admin, exibe o link Admin
        if (user.is_admin) {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) adminLink.style.display = 'inline-block';
        }
    } catch (error) {
        localStorage.removeItem('token');
        userInfo.innerHTML = '<p>⏰ Sessão expirada. <a href="login.html">Login</a></p>';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}