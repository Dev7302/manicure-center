// agendamento.js
let horarioSelecionado = '';

// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ agendamento.js carregado');

    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.min = hoje;
        dataInput.value = hoje;
        dataInput.addEventListener('change', carregarHorarios);
        carregarHorarios(); // Carrega horários do dia atual
    } else {
        console.error('❌ Elemento #data não encontrado');
    }

    const btnConfirmar = document.getElementById('btnConfirmar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmar);
        console.log('✅ Botão confirmar configurado');
    } else {
        console.error('❌ Botão #btnConfirmar não encontrado');
    }

    // Carrega informações do usuário (se existir)
    carregarUserInfo();
});

function carregarUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (!userInfo) return;
    const token = localStorage.getItem('token');
    if (!token) {
        userInfo.innerHTML = '<p>🔓 Você não está logado. <a href="login.html" style="color:#ff4d6d;">Login</a></p>';
        return;
    }
    fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Token inválido');
        return res.json();
    })
    .then(user => {
        userInfo.innerHTML = `
            <span>👋 Olá, ${user.nome}!</span>
            <button onclick="logout()">Sair</button>
        `;
    })
    .catch(() => {
        localStorage.removeItem('token');
        userInfo.innerHTML = '<p>⏰ Sessão expirada. <a href="login.html" style="color:#ff4d6d;">Login</a></p>';
    });
}

function carregarHorarios() {
    console.log('🔄 Carregando horários...');
    const data = document.getElementById('data').value;
    if (!data) return;

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${API_URL}/agendamentos/horarios/${data}`, { headers })
        .then(res => {
            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
            return res.json();
        })
        .then(dados => {
            console.log('📊 Horários recebidos:', dados);
            const div = document.getElementById('horarios');
            if (!div) return;
            div.innerHTML = '';

            // Verifica se a data selecionada é hoje
            const hoje = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
            const isHoje = (data === hoje);

            // Obtém a hora atual (apenas hora, sem minutos, para simplificar)
            const agora = new Date();
            const horaAtual = agora.getHours(); // 0-23

            // Converte os ocupados para HH:MM
            const ocupadosFormatados = dados.ocupados.map(h => h.substring(0, 5));

            // Gera botões para cada horário das 8h às 18h
            for (let h = 8; h <= 18; h++) {
                const horaStr = h.toString().padStart(2, '0') + ':00';
                const btn = document.createElement('button');
                btn.classList.add('horario-btn');
                btn.innerText = horaStr;

                let desabilitado = false;

                // Se for hoje e o horário já passou, desabilita
                if (isHoje && h < horaAtual) {
                    desabilitado = true;
                    btn.classList.add('ocupado'); // opcional, para dar estilo
                }

                // Se o horário estiver ocupado no banco, desabilita também
                if (ocupadosFormatados.includes(horaStr)) {
                    desabilitado = true;
                    btn.classList.add('ocupado');
                }

                if (desabilitado) {
                    btn.disabled = true;
                } else {
                    btn.onclick = () => selecionarHorario(horaStr, btn);
                }

                div.appendChild(btn);
            }
        })
        .catch(err => {
            console.error('❌ Erro ao carregar horários:', err);
            const div = document.getElementById('horarios');
            if (div) div.innerHTML = '<p class="error">Erro ao carregar horários</p>';
        });
}

function selecionarHorario(hora, btn) {
    console.log('🕐 Horário selecionado:', hora);
    horarioSelecionado = hora;
    document.querySelectorAll('#horarios button').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
}

function confirmar() {
    console.log('🚀 Função confirmar executada');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para agendar.');
        window.location.href = 'login.html';
        return;
    }

    const servicoSelect = document.getElementById('servico');
    if (!servicoSelect) {
        alert('Erro: serviço não encontrado.');
        return;
    }
    const servico = servicoSelect.value;
    const duracao = Number(servicoSelect.selectedOptions[0].dataset.duracao);
    const data = document.getElementById('data').value;
    const hora = horarioSelecionado;

    console.log('📦 Dados do agendamento:', { servico, duracao, data, hora });

    if (!data || !hora) {
        alert('Selecione uma data e um horário.');
        return;
    }

    fetch(`${API_URL}/agendamentos/criar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ servico, data, hora, duracao })
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro no servidor');
        return data;
    })
    .then(data => {
        console.log('✅ Resposta do servidor:', data);
        alert('✅ ' + (data.mensagem || 'Agendamento confirmado!'));
        carregarHorarios(); // Recarrega a lista
        horarioSelecionado = '';
    })
    .catch(err => {
        console.error('❌ Erro no agendamento:', err);
        alert('❌ ' + err.message);
    });
}

// Função de logout (chamada pelo botão)
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}