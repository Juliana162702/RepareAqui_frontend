const API_URL = 'http://localhost:3000/api';

const complaintFormContainer = document.getElementById('complaintFormContainer');
const newComplaintBtn = document.getElementById('newComplaintBtn');
const cancelBtn = document.getElementById('cancelBtn');

newComplaintBtn.addEventListener('click', () => {
    complaintFormContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

cancelBtn.addEventListener('click', () => {
    complaintFormContainer.classList.add('hidden');
    document.getElementById('complaintForm').reset();
});

async function loadResidentsWithComplaints() {
    try {
        const response = await fetch(`${API_URL}/residents`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const residents = await response.json();
        console.log('Residents:', residents);

        const residentsContainer = document.getElementById('residentsContainer');
        residentsContainer.innerHTML = '';

        if (residents.length === 0) {
            residentsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">info</span>
                    <p>Nenhuma reclamação registrada ainda</p>
                </div>
            `;
            return;
        }

        residents.forEach(resident => {
            const residentCard = document.createElement('div');
            residentCard.className = 'resident-card';

            residentCard.innerHTML = `
                <div class="resident-header">
                    <div class="resident-info">
                        <div class="resident-avatar">${getInitials(resident.name)}</div>
                        <div class="resident-details">
                            <h3>${resident.name}</h3>
                            <p>${resident.neighborhood}</p>
                        </div>
                    </div>
                    <div class="complaints-count">
                        ${resident.complaints?.length || 0} reclamação(ões)
                    </div>
                </div>
                <div class="complaints-list" id="complaints-${resident._id}"></div>
            `;

            residentsContainer.appendChild(residentCard);

            if (resident.complaints?.length > 0) {
                const complaintsList = document.getElementById(`complaints-${resident._id}`);
                resident.complaints.forEach(complaint => {
                    appendComplaint(complaint, complaintsList, resident._id);
                });
            }
        });
    } catch (error) {
        console.error('Erro ao carregar reclamações:', error);
        alert('Ocorreu um erro ao carregar as reclamações: ' + error.message);
    }
}

document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const complaintData = {
        type: document.getElementById('problemType').value,
        description: document.getElementById('description').value.trim(),
        location: document.getElementById('location').value.trim(),
        status: 'pendente'
    };

    const residentData = {
        name: document.getElementById('residentName').value.trim(),
        neighborhood: document.getElementById('neighborhood').value.trim(),
        complaints: [complaintData]
    };

    try {
        const response = await fetch(`${API_URL}/residents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(residentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro ao registrar:', errorText);
            throw new Error(errorText || 'Erro ao registrar');
        }

        const data = await response.json();
        loadResidentsWithComplaints();
        document.getElementById('complaintForm').reset();
        complaintFormContainer.classList.add('hidden');
        alert('Cadastro realizado com sucesso!');
    } catch (error) {
        console.error('Erro no cadastro:', error);
        alert('Erro ao registrar: ' + error.message);
    }
});

function appendComplaint(complaint, container, residentId) {
    console.log("Adicionando reclamação:", complaint);
    const complaintItem = document.createElement('div');
    complaintItem.className = 'complaint-item';

    const typeLabels = {
        'vazamento_agua': 'Vazamento de Água',
        'vazamento_esgoto': 'Vazamento de Esgoto',
        'falta_iluminacao': 'Falta de Iluminação',
        'buraco_rua': 'Buraco na Rua',
        'lixo_inadequado': 'Lixo em Local Inadequado',
        'outros': 'Outros'
    };

    const typeIcons = {
        'vazamento_agua': 'water_drop',
        'vazamento_esgoto': 'water',
        'falta_iluminacao': 'lightbulb',
        'buraco_rua': 'report',
        'lixo_inadequado': 'delete',
        'outros': 'help'
    };

    const statusColors = {
        'pendente': 'status-pendente',
        'em_andamento': 'status-em-andamento',
        'resolvido': 'status-resolvido'
    };

    const complaintDate = complaint.createdAt
        ? new Date(complaint.createdAt).toLocaleDateString('pt-BR')
        : 'Data não disponível';

    complaintItem.innerHTML = `
        <div class="complaint-header" onclick="toggleComplaintDetails(this)">
            <div class="complaint-type">
                <span class="material-icons">${typeIcons[complaint.type] || 'help'}</span>
                ${typeLabels[complaint.type] || complaint.type}
                <span class="status-badge ${statusColors[complaint.status] || 'status-pendente'}">
                    ${complaint.status || 'pendente'}
                </span>
            </div>
            <span class="material-icons arrow-icon">expand_more</span>
        </div>
        <div class="complaint-details">
            <div class="complaint-description"><p>${complaint.description}</p></div>
            <div class="complaint-meta">
                <span class="location">
                    <span class="material-icons">location_on</span>
                    ${complaint.location}
                </span>
                <span class="date">
                    <span class="material-icons">event</span>
                    ${complaintDate}
                </span>
            </div>
            <div class="complaint-actions">
                <button class="btn btn-secondary" onclick="editComplaint('${residentId}', '${complaint._id}')">
                    <span class="material-icons">edit</span> Editar
                </button>
                <button class="btn btn-danger" onclick="deleteComplaint('${residentId}', '${complaint._id}')">
                    <span class="material-icons">delete</span> Remover
                </button>
            </div>
        </div>
    `;

    container.appendChild(complaintItem);
}

function toggleComplaintDetails(header) {
    const details = header.nextElementSibling;
    const arrow = header.querySelector('.arrow-icon');

    details.classList.toggle('show');
    arrow.textContent = details.classList.contains('show') ? 'expand_less' : 'expand_more';
}

function getInitials(name) {
    if (!name) return '';
    return name.split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadResidentsWithComplaints();
});



