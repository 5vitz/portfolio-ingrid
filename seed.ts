import { db } from './src/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const initialProjects = [
  {
    id: 'project-1',
    title: 'Expedição BAHIA',
    category: 'Produção Executiva',
    type: 'video',
    mediaUrl: 'https://drive.google.com/file/d/1FznByPJf4W0r8TFft3uG4GkDTK4d1-a0/preview',
    order: 1
  },
  {
    id: 'project-2',
    title: 'Reels Estratégicos',
    category: 'Estratégia & Conteúdo',
    type: 'reels',
    order: 2,
    reelsData: [
      {
        videoUrl: 'https://www.youtube.com/embed/S_8-C7v_8yE',
        title: 'Estratégia de Marca',
        description: 'Como posicionar sua marca de forma autêntica.',
        tags: ['Estratégia', 'Branding']
      },
      {
        videoUrl: 'https://www.youtube.com/embed/L_jWHffIx5E',
        title: 'Gestão de Conteúdo',
        description: 'Planejamento e consistência nas redes.',
        tags: ['Gestão', 'Social Media']
      }
    ]
  }
];

const initialTestimonials = [
  {
    id: 't1',
    author: 'Paulo Buzzo',
    role: 'Gestor Comercial | Growth',
    text: 'Tive a honra de ter a Ingrid na equipe comercial da Audaar. Ela muito além do esperado...',
    photoUrl: 'https://drive.google.com/thumbnail?id=1gOBdoaCX4zcS1xfMYbi-LTtZ_2WFeIva&sz=w400',
    order: 1
  },
  {
    id: 't2',
    author: 'Karina Redivo',
    role: 'Coordenadora de Marketing',
    text: 'A Ingrid é uma profissional multifuncional, muito dedicada, organizada...',
    photoUrl: 'https://drive.google.com/thumbnail?id=1BkSIA3AFFHwMutkS8FVjOnImhIkPq92A&sz=w400',
    order: 2
  }
];

const initialServices = [
  {
    id: 's1',
    title: 'Estratégia & Posicionamento',
    order: 1,
    items: ['Planejamento estratégico de conteúdo', 'Definição de pilares narrativos', 'Análise de audiência']
  }
];

const initialSettings = {
  logoName: 'Ingrid Sinkovitz',
  logoSubtitle: 'Estratégia | Planejamento | Gestão',
  contactEmail: 'ingridsinkovitz@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/ingridsinkovitz/',
  whatsappNumber: '+55 27 99919-3525'
};

async function seed() {
  console.log('Seeding data...');
  
  for (const p of initialProjects) {
    await setDoc(doc(db, 'projects', p.id), p);
  }
  
  for (const t of initialTestimonials) {
    await setDoc(doc(db, 'testimonials', t.id), t);
  }
  
  for (const s of initialServices) {
    await setDoc(doc(db, 'services', s.id), s);
  }
  
  await setDoc(doc(db, 'settings', 'global'), initialSettings);
  
  console.log('Seeding complete!');
}

seed().catch(console.error);
