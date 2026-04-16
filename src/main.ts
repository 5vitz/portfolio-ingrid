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
    const container = document.getElementById('dynamicProjectsContainer');
    if (!container) return;

    // Filter projects that are not hardcoded (if any) or just render all
    container.innerHTML = projects.map(p => {
        if (p.type === 'reels') {
            const links = p.mediaUrl ? p.mediaUrl.split(',') : [];
            return `
                <section id="project-${p.id}" class="project-detail">
                    <div class="project-content project-reel-layout">
                        <div class="project-image">
                            <div class="reels-wrapper">
                                <div class="swiper reels-container">
                                    <div class="swiper-wrapper">
                                        ${links.map(link => `
                                            <div class="swiper-slide reels-slide">
                                                <div class="reels-overlay"></div>
                                                <iframe class="reels-video reels-media" data-src="${link}" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                                                <div class="swipe-hint">Arraste para cima ↕</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="project-header">
                        <button class="btn-close" onclick="hideProject()">✕ Fechar Projeto</button>
                    </div>
                </section>
            `;
        } else {
            return `
                <section id="project-${p.id}" class="project-detail">
                    <div class="project-header">
                        <h2>${p.title}</h2>
                        <button class="btn-close" onclick="hideProject()">✕ Fechar Projeto</button>
                    </div>
                    <div class="project-content">
                        <div class="project-image">
                            <iframe class="project-video" style="width:100%; aspect-ratio:16/9; border:none; border-radius:12px;" 
                                src="${p.mediaUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                        </div>
                    </div>
                </section>
            `;
        }
    }).join('');
}

// Start
initDynamicContent();

// Expose to window for inline scripts
(window as any).openQuickView = (id: string) => {
    const p = projects.find(proj => proj.id === id);
    if (!p) return;

    // Update the global projectsData used by the inline script
    (window as any).projectsData = (window as any).projectsData || {};
    (window as any).projectsData[id] = {
        title: p.title,
        desc: p.description || '',
        image: p.thumbnail || 'https://picsum.photos/seed/' + p.id + '/800/400',
        mediaUrl: p.mediaUrl,
        type: p.type
    };

    // Call the original openQuickView if it exists
    if (typeof (window as any).originalOpenQuickView === 'function') {
        (window as any).originalOpenQuickView(id);
    }
};
