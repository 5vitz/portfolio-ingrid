import { db, onSnapshot, collection, query, orderBy, doc } from './firebase';

// State
let projects: any[] = [];
let testimonials: any[] = [];
let settings: any = {};

// Initialize dynamic content
function initDynamicContent() {
    // Fetch Settings
    onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
        if (docSnap.exists()) {
            settings = docSnap.data();
            updateSettingsUI();
        }
    });

    // Fetch Projects
    onSnapshot(query(collection(db, 'projects'), orderBy('order')), (snapshot) => {
        projects = [];
        snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
        renderProjects();
    });

    // Fetch Testimonials
    onSnapshot(query(collection(db, 'testimonials'), orderBy('order')), (snapshot) => {
        testimonials = [];
        snapshot.forEach(doc => testimonials.push({ id: doc.id, ...doc.data() }));
        renderTestimonials();
    });
}

function updateSettingsUI() {
    if (settings.logoName) {
        document.querySelectorAll('.logo-name').forEach(el => el.textContent = settings.logoName);
    }
    if (settings.whatsappNumber) {
        const waLink = document.querySelector('a[href^="https://wa.me/"]') as HTMLAnchorElement;
        if (waLink) {
            waLink.href = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`;
            waLink.textContent = settings.whatsappNumber;
        }
    }
}

function renderProjects() {
    const gallery = document.querySelector('.gallery-grid');
    if (!gallery) return;
    
    gallery.innerHTML = projects.map(p => `
        <div class="gallery-item" onclick="openQuickView('${p.id}')">
            <img src="${p.thumbnail || 'https://picsum.photos/seed/' + p.id + '/600/600'}" alt="${p.title}">
            <div class="gallery-item-overlay">
                <div class="gallery-item-title">${p.title}</div>
            </div>
        </div>
    `).join('');

    // Also update the project detail sections
    updateProjectDetails();
}

function renderTestimonials() {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid) return;

    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-item">
            <img src="${t.photoUrl}" alt="${t.author}" class="testimonial-photo" referrerPolicy="no-referrer">
            <p class="testimonial-text">"${t.text}"</p>
            <span class="testimonial-author">${t.author} - ${t.role}</span>
        </div>
    `).join('');
}

function updateProjectDetails() {
    // This would dynamically create or update the <section class="project-detail"> elements
    // For now, we'll keep the existing ones but we should ideally generate them
}

// Start
initDynamicContent();

// Expose to window for inline scripts
(window as any).openQuickView = (id: string) => {
    // Implement or call existing openQuickView
    console.log("Opening quick view for:", id);
    // For now, we'll let the existing inline script handle it if it's still there
};
