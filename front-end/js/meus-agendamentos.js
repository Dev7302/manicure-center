// meus-agendamentos.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/agendamentos/meus`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao carregar');
        const agendamentos = await response.json();
        exibirAgendamentos(agendamentos);
    } catch (error) {
        console.error(error);
        document.getElementById('agendamentos-lista').innerHTML = '<p class="error">Erro ao carregar agendamentos.</p>';
    }
});

function exibirAgendamentos(agendamentos) {
    const div = document.getElementById('agendamentos-lista');
    if (agendamentos.length === 0) {
        div.innerHTML = '<p>Você ainda não tem agendamentos.</p>';
        return;
    }

    const servicosMap = {
        'mao': 'Mão',
        'pe': 'Pé',
        'pe_spa': 'Pé com spa',
        'pe_mao_sem_spa': 'Pé e mão sem spa',
        'pe_mao_com_spa': 'Pé e mão com spa'
    };

    let html = '';
    agendamentos.forEach(a => {
        let dataStr = a.data;
        if (dataStr.includes('T')) dataStr = dataStr.split('T')[0];
        const partes = dataStr.split('-');
        const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

        const servicoNome = servicosMap[a.servico] || a.servico;

        html += `
            <div class="agendamento-item">
                <div>
                    <strong>${servicoNome}</strong> - ${dataFormatada} às ${a.horario}
                </div>
                <button class="cancelar-btn" data-id="${a.id}">Cancelar</button>
            </div>
        `;
    });
    div.innerHTML = html;

    // Adiciona eventos aos botões de cancelar
    document.querySelectorAll('.cancelar-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                await cancelarAgendamento(id);
            }
        });
    });
}

async function cancelarAgendamento(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/agendamentos/cancelar/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro);
        alert('✅ Agendamento cancelado!');
        location.reload();
    } catch (error) {
        alert('❌ ' + error.message);
    }
}