import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, onSnapshot } from './firebase';

const loginArea = document.getElementById('loginArea');
const adminArea = document.getElementById('adminArea');
const userEmailSpan = document.getElementById('userEmail');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');

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
                <button class="btn-delete" data-id="${docSnap.id}">Excluir</button>
            `;
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
    await setDoc(doc(db, 'projects', id), {
        title, type, mediaUrl: url, order
    });
    (e.target as HTMLFormElement).reset();
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
