import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, onSnapshot } from './firebase';

const loginArea = document.getElementById('loginArea');
const adminArea = document.getElementById('adminArea');
const userEmailSpan = document.getElementById('userEmail');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');

// Reels Links Management
const pTypeSelect = document.getElementById('pType') as HTMLSelectElement;
const singleVideoGroup = document.getElementById('singleVideoGroup');
const reelsLinksGroup = document.getElementById('reelsLinksGroup');
const reelsLinksList = document.getElementById('reelsLinksList');
const btnAddReelsLink = document.getElementById('btnAddReelsLink');
const btnClearReelsLinks = document.getElementById('btnClearReelsLinks');
const btnCancelProject = document.getElementById('btnCancelProject');

let currentReelsLinks: string[] = [];

btnClearReelsLinks?.addEventListener('click', () => {
    if (confirm('Deseja remover todos os links desta lista?')) {
        currentReelsLinks = [];
        renderReelsLinks();
    }
});

btnCancelProject?.addEventListener('click', () => {
    (document.getElementById('formProject') as HTMLFormElement).reset();
    currentReelsLinks = [];
    renderReelsLinks();
    singleVideoGroup?.classList.remove('hidden');
    reelsLinksGroup?.classList.add('hidden');
});

pTypeSelect?.addEventListener('change', () => {
    if (pTypeSelect.value === 'reels') {
        singleVideoGroup?.classList.add('hidden');
        reelsLinksGroup?.classList.remove('hidden');
    } else {
        singleVideoGroup?.classList.remove('hidden');
        reelsLinksGroup?.classList.add('hidden');
    }
});

btnAddReelsLink?.addEventListener('click', () => {
    currentReelsLinks.push('');
    renderReelsLinks();
});

function renderReelsLinks() {
    if (!reelsLinksList) return;
    reelsLinksList.innerHTML = '';
    
    currentReelsLinks.forEach((link, index) => {
        const item = document.createElement('div');
        item.className = 'reels-link-item';
        item.innerHTML = `
            <span style="font-weight: bold; color: #666;">#${index + 1}</span>
            <input type="text" value="${link}" placeholder="URL do Vídeo" data-index="${index}">
            <div class="reels-actions">
                <button type="button" class="btn-icon btn-up" title="Mover para cima">↑</button>
                <button type="button" class="btn-icon btn-down" title="Mover para baixo">↓</button>
                <button type="button" class="btn-icon btn-remove" style="color: red;" title="Remover">✕</button>
            </div>
        `;

        const input = item.querySelector('input');
        input?.addEventListener('input', (e) => {
            currentReelsLinks[index] = (e.target as HTMLInputElement).value;
        });

        item.querySelector('.btn-up')?.addEventListener('click', () => moveLink(index, -1));
        item.querySelector('.btn-down')?.addEventListener('click', () => moveLink(index, 1));
        item.querySelector('.btn-remove')?.addEventListener('click', () => {
            currentReelsLinks.splice(index, 1);
            renderReelsLinks();
        });

        reelsLinksList.appendChild(item);
    });
}

function moveLink(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentReelsLinks.length) {
        const temp = currentReelsLinks[index];
        currentReelsLinks[index] = currentReelsLinks[newIndex];
        currentReelsLinks[newIndex] = temp;
        renderReelsLinks();
        
        // Focus the moved input
        setTimeout(() => {
            const input = reelsLinksList?.querySelector(`input[data-index="${newIndex}"]`) as HTMLInputElement;
            input?.focus();
        }, 0);
    }
}

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin (you can add more robust check here)
        if (user.email === 'sinkando@gmail.com') {
            loginArea?.classList.add('hidden');
            adminArea?.classList.remove('hidden');
            if (userEmailSpan) userEmailSpan.textContent = user.email;
            loadData();
        } else {
            alert('Acesso negado. Apenas administradores podem acessar esta área.');
            signOut(auth);
        }
    } else {
        loginArea?.classList.remove('hidden');
        adminArea?.classList.add('hidden');
    }
});

btnLogin?.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider).catch(console.error);
});

btnLogout?.addEventListener('click', () => {
    signOut(auth).catch(console.error);
});

// Navigation
document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(target!)?.classList.add('active');
        btn.classList.add('active');
    });
});

// Load Data
function loadData() {
    // Projects
    onSnapshot(query(collection(db, 'projects'), orderBy('order')), (snapshot) => {
        const list = document.getElementById('listProjetos');
        if (!list) return;
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const item = document.createElement('div');
            item.className = 'data-item';
            item.innerHTML = `
                <span>${p.title} (${p.type})</span>
                <div class="reels-actions">
                    <button class="btn-icon btn-edit" data-id="${docSnap.id}">Editar</button>
                    <button class="btn-delete" data-id="${docSnap.id}">Excluir</button>
                </div>
            `;
            
            item.querySelector('.btn-edit')?.addEventListener('click', () => {
                (document.getElementById('pTitle') as HTMLInputElement).value = p.title;
                (document.getElementById('pType') as HTMLSelectElement).value = p.type;
                (document.getElementById('pOrder') as HTMLInputElement).value = p.order;
                
                if (p.type === 'reels') {
                    singleVideoGroup?.classList.add('hidden');
                    reelsLinksGroup?.classList.remove('hidden');
                    currentReelsLinks = p.mediaUrl ? p.mediaUrl.split(',') : [];
                    renderReelsLinks();
                } else {
                    singleVideoGroup?.classList.remove('hidden');
                    reelsLinksGroup?.classList.add('hidden');
                    (document.getElementById('pUrl') as HTMLInputElement).value = p.mediaUrl || '';
                }
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            item.querySelector('.btn-delete')?.addEventListener('click', () => {
                if (confirm('Tem certeza?')) deleteDoc(doc(db, 'projects', docSnap.id));
            });
            list.appendChild(item);
        });
    });

    // Testimonials
    onSnapshot(query(collection(db, 'testimonials'), orderBy('order')), (snapshot) => {
        const list = document.getElementById('listDepoimentos');
        if (!list) return;
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            const item = document.createElement('div');
            item.className = 'data-item';
            item.innerHTML = `
                <span>${t.author}</span>
                <button class="btn-delete" data-id="${docSnap.id}">Excluir</button>
            `;
            item.querySelector('.btn-delete')?.addEventListener('click', () => {
                if (confirm('Tem certeza?')) deleteDoc(doc(db, 'testimonials', docSnap.id));
            });
            list.appendChild(item);
        });
    });

    // Services
    onSnapshot(query(collection(db, 'services'), orderBy('order')), (snapshot) => {
        const list = document.getElementById('listServicos');
        if (!list) return;
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const s = docSnap.data();
            const item = document.createElement('div');
            item.className = 'data-item';
            item.innerHTML = `
                <span>${s.title}</span>
                <button class="btn-delete" data-id="${docSnap.id}">Excluir</button>
            `;
            item.querySelector('.btn-delete')?.addEventListener('click', () => {
                if (confirm('Tem certeza?')) deleteDoc(doc(db, 'services', docSnap.id));
            });
            list.appendChild(item);
        });
    });

    // Settings
    onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const heroInput = document.getElementById('sHeroVideo') as HTMLInputElement;
            const waInput = document.getElementById('sWhatsapp') as HTMLInputElement;
            if (heroInput) heroInput.value = data.heroVideoUrl || '';
            if (waInput) waInput.value = data.whatsappNumber || '';
        }
    });
}

// Forms
document.getElementById('formProject')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = (document.getElementById('pTitle') as HTMLInputElement).value;
    const type = (document.getElementById('pType') as HTMLSelectElement).value;
    const url = (document.getElementById('pUrl') as HTMLInputElement).value;
    const order = parseInt((document.getElementById('pOrder') as HTMLInputElement).value);

    const id = title.toLowerCase().replace(/\s+/g, '-');
    
    const projectData: any = {
        title, type, order
    };

    if (type === 'reels') {
        // Filter out empty links
        projectData.mediaUrl = currentReelsLinks.filter(l => l.trim() !== '').join(',');
    } else {
        projectData.mediaUrl = url;
    }

    await setDoc(doc(db, 'projects', id), projectData);
    
    (e.target as HTMLFormElement).reset();
    currentReelsLinks = [];
    renderReelsLinks();
    alert('Projeto salvo com sucesso!');
});

document.getElementById('formSettings')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const heroVideoUrl = (document.getElementById('sHeroVideo') as HTMLInputElement).value;
    const whatsappNumber = (document.getElementById('sWhatsapp') as HTMLInputElement).value;

    await setDoc(doc(db, 'settings', 'global'), {
        heroVideoUrl, whatsappNumber
    }, { merge: true });
    alert('Configurações salvas!');
});
