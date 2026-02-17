// admin.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Verifica se os botões existem antes de adicionar eventos
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnTodos = document.getElementById('btn-todos');

    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', filtrarPorData);
    } else {
        console.warn('Botão filtrar não encontrado');
    }
    if (btnTodos) {
        btnTodos.addEventListener('click', carregarTodos);
    } else {
        console.warn('Botão todos não encontrado');
    }

    // Carregar todos inicialmente
    await carregarTodos();
});

async function carregarTodos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/agendamentos/admin/todos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            document.getElementById('admin-content').innerHTML = '<p class="error">⛔ Acesso negado. Você não é administrador.</p>';
            return;
        }
        if (!response.ok) throw new Error('Erro ao carregar');

        const agendamentos = await response.json();
        exibirAgendamentos(agendamentos, 'Todos os agendamentos');
    } catch (error) {
        console.error(error);
        document.getElementById('admin-content').innerHTML = '<p class="error">Erro ao carregar agendamentos.</p>';
    }
}

async function filtrarPorData() {
    const data = document.getElementById('filtro-data').value;
    if (!data) {
        alert('Selecione uma data');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/agendamentos/admin/por-data/${data}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            document.getElementById('admin-content').innerHTML = '<p class="error">⛔ Acesso negado. Você não é administrador.</p>';
            return;
        }
        if (!response.ok) throw new Error('Erro ao carregar');

        const agendamentos = await response.json();
        const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');
        exibirAgendamentos(agendamentos, `Agendamentos para ${dataFormatada}`);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-content').innerHTML = '<p class="error">Erro ao carregar agendamentos.</p>';
    }
}

function exibirAgendamentos(agendamentos, titulo = '') {
    const div = document.getElementById('admin-content');
    if (!agendamentos || agendamentos.length === 0) {
        div.innerHTML = `<p>Nenhum agendamento encontrado.</p>`;
        return;
    }

    // Mapeamento dos serviços (mesmo do agendamento.js)
    const servicosMap = {
        'mao': 'Mão',
        'pe': 'Pé',
        'pe_spa': 'Pé com spa',
        'pe_mao_sem_spa': 'Pé e mão sem spa',
        'pe_mao_com_spa': 'Pé e mão com spa'
    };

    let html = `<h3>${titulo}</h3>`;
    html += `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Telefone</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th>Horário</th>
                </tr>
            </thead>
            <tbody>
    `;

    agendamentos.forEach(a => {
        // Formata data (supondo que a.data venha como YYYY-MM-DD)
        let dataStr = a.data;
        if (dataStr.includes('T')) dataStr = dataStr.split('T')[0];
        const [ano, mes, dia] = dataStr.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        // Nome do serviço traduzido
        const servicoNome = servicosMap[a.servico] || a.servico;

        html += `
            <tr>
                <td>${a.cliente}</td>
                <td>${a.telefone}</td>
                <td>${servicoNome}</td>
                <td>${dataFormatada}</td>
                <td>${a.horario}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    div.innerHTML = html;
}