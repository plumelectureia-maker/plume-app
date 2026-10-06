import * as B from './backend.js';
import './style.css';
const A={};

/* ===== utilitaires ===== */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fr-FR').format(Math.round(n));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pl=(n,w)=>fmt(n)+' '+w+(n>1?'s':'');
const fr=t=>String(t==null?'':t).replace(/^— /,'—\u00A0').replace(/ ([?!:;»])/g,'\u00A0$1').replace(/« /g,'«\u00A0');
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h);};
const wc=t=>((t||'').trim().match(/\S+/g)||[]).length;
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const p2=n=>String(n).padStart(2,'0');
const mondayKey=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());};
const monthKey=()=>{const d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1);};
const resetLabel=()=>{const d=new Date();return '1er '+MOIS[(d.getMonth()+1)%12];};
const dateFr=t=>{const d=new Date(t);const m=MOIS[d.getMonth()];return d.getDate()+' '+(m.length>4?m.slice(0,4)+'.':m);};

/* ===== icônes ===== */
const I=p=>'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const IC={
 feather:I('<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>'),
 compass:I('<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>'),
 pen:I('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
 chart:I('<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'),
 user:I('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
 mark:I('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
 back:I('<path d="m15 18-6-6 6-6"/>'),
 next:I('<path d="m9 18 6-6-6-6"/>'),
 x:I('<path d="M18 6 6 18M6 6l12 12"/>'),
 check:I('<path d="M20 6 9 17l-5-5"/>'),
 lock:I('<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
 cap:I('<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 up:I('<path d="m7 17 10-10M8 7h9v9"/>'),
 down:I('<path d="m7 7 10 10M17 8v9H8"/>'),
 flat:I('<path d="M5 12h14M15 8l4 4-4 4"/>')
};
const IX={
 home:I('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
 compass:IC.compass,feather:IC.feather,user:IC.user,lock:IC.lock,cap:IC.cap,next:IC.next,check:IC.check,mark:IC.mark,plus:IC.plus,back:IC.back,x:IC.x,
 ring:I('<path d="M21 12a9 9 0 1 1-6.2-8.56"/><path d="M21 4.5V9h-4.5"/>'),
 flame:I('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
 sparkles:I('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>'),
 target:I('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
 brain:I('<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>'),
 hourglass:I('<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.41L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.41L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>'),
 globe:I('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
 book:I('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
 search:I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
 clock:I('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
 bulb:I('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>'),
 list:I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
 eyeoff:I('<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/>'),
 eye:I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
 moon:I('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
 trash:I('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
 users:I('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
 chat:I('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>'),
 zap:I('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
 scan:I('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>'),
 branch:I('<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
 pulse:I('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
 orb:I('<circle cx="12" cy="11" r="7"/><path d="M8 21h8"/><path d="M12 8v6M9 11h6"/>'),
 heart:I('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>'),
 star:I('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'),
 aa:I('<path d="M3 18 8.5 5 14 18M5 14h7M15 18l3.5-8 3.5 8M16.2 15.5h4.6"/>'),
 pen:IC.pen,compassAlt:IC.compass
};


/* ===== données ===== */
const PLANS={
 free:{id:'free',nom:'Gratuit',prixTxt:'0 €',budget:3,points:['3 chapitres de lecture par semaine','1 histoire publiée au total','Accès aux cours de l’école d’écriture','3 crédits de coach IA par mois pour essayer']},
 plus:{id:'plus',nom:'Plume +',prixTxt:'4,99 €/mois',budget:50,points:['Lecture et publication illimitées','50 crédits de coach IA par mois','Diagnostic sur ton propre texte']},
 pp:{id:'pp',nom:'Plume ++',prixTxt:'9,99 €/mois',budget:200,points:['Lecture et publication illimitées','200 crédits de coach IA par mois','Pour analyser et t’entraîner chaque semaine']}
};
const COST={single:1,exercise:1,global:4};
const cr=n=>pl(n,'crédit');
const CREDIT_HELP='Une analyse d’une compétence ou une correction d’exercice coûte 1 crédit, l’analyse des 7 compétences en coûte 4.';

const COMPS=[
 {id:'personnages',nom:'Personnages',
  objectif:'Construire des personnages autonomes, désirants et capables de décisions coûteuses.',
  methode:'Avant d’écrire une scène, note en une phrase ce que ton personnage veut maintenant, puis ce qu’il est prêt à perdre pour l’obtenir. Écris ensuite la scène depuis ce désir.',
  question:'Quelle décision ton personnage prend-il ici, et qu’est-ce que cela va lui coûter ?',
  exercice:'Choisis un personnage secondaire de ton manuscrit. Écris une scène de 200 mots où il prend une décision qui contrarie le héros, sans jamais expliquer ses raisons.',
  grille:['Le personnage veut quelque chose de précis','Il agit au lieu de subir','Ses choix ont un coût visible','Sa façon de parler ou d’agir le distingue des autres']},
 {id:'dialogues',nom:'Dialogues',
  objectif:'Travailler la voix, l’intention, le sous-texte et les conflits implicites.',
  methode:'Donne à chaque personnage un but caché dans la conversation. Ce qu’il dit sert ce but, rarement ce qu’il pense vraiment.',
  question:'Que veut vraiment chaque personnage quand il prend la parole ?',
  exercice:'Écris un dialogue de douze répliques où deux personnages parlent d’un repas alors qu’ils se disputent à cause d’autre chose. Interdiction de nommer le vrai sujet.',
  grille:['Chaque réplique poursuit une intention','Le sous-texte porte le conflit','Les voix se distinguent à l’oreille','Les silences et les gestes complètent les mots']},
 {id:'tension',nom:'Tension',
  objectif:'Installer l’urgence, différer les réponses et augmenter le coût des choix.',
  methode:'Pose une question au lecteur, puis retarde la réponse en compliquant le choix du personnage. Chaque obstacle doit coûter quelque chose.',
  question:'Qu’est-ce que le lecteur attend de savoir, et pourquoi doit-il encore attendre ?',
  exercice:'Prends une scène où un personnage doit annoncer une mauvaise nouvelle. Écris-la en ajoutant trois obstacles qui retardent l’annonce, du plus léger au plus cruel.',
  grille:['Une question dramatique est posée','La réponse est différée','Chaque obstacle augmente le coût du choix','La scène ne se conclut pas trop vite']},
 {id:'descriptions',nom:'Descriptions',
  objectif:'Décrire à travers la perception et l’émotion du personnage.',
  methode:'Ne décris pas ce qu’une caméra verrait : décris ce que ton personnage remarque en premier. Ce détail dit déjà ce qu’il ressent.',
  question:'Que remarque ton personnage, et que révèle ce détail de son état d’esprit ?',
  exercice:'Décris la même cuisine deux fois, en 100 mots : vue par quelqu’un qui vient de recevoir une promotion, puis par quelqu’un qui vient d’être quitté.',
  grille:['La description passe par un point de vue','Plusieurs sens sont sollicités','Les détails révèlent une émotion','Aucun décor n’est listé sans fonction']},
 {id:'rythme',nom:'Rythme',
  objectif:'Alterner accélération, scène, ellipse et moments de respiration.',
  methode:'Après un pic d’intensité, laisse respirer le lecteur. Raccourcis tes phrases quand l’action monte, allonge-les quand le personnage observe ou réfléchit.',
  question:'Où le lecteur peut-il souffler, et où doit-il courir ?',
  exercice:'Réécris une scène d’action de 150 mots en variant volontairement la longueur des phrases, puis ajoute un paragraphe de respiration de trois phrases.',
  grille:['La longueur des phrases varie','Les scènes et les ellipses sont dosées','Les moments forts sont suivis d’une respiration','Le lecteur ne s’ennuie pas et ne s’essouffle pas']},
 {id:'structure',nom:'Structure',
  objectif:'Relier les scènes par la causalité et préparer les étapes de l’intrigue.',
  methode:'Entre deux scènes, cherche « donc » ou « mais ». Si tu ne trouves que « et puis », la scène ne fait pas avancer l’histoire.',
  question:'Quelle conséquence de la scène précédente déclenche celle-ci ?',
  exercice:'Liste les cinq dernières scènes de ton manuscrit et relie-les par « donc » ou « mais ». Repère le maillon qui ne tient pas, puis réécris son ouverture.',
  grille:['Chaque scène a sa cause dans la précédente','Les étapes de l’intrigue sont préparées','Les enjeux montent au fil des scènes','Aucune scène ne peut être retirée sans conséquence']},
 {id:'foreshadowing',nom:'Foreshadowing',
  objectif:'Semer des indices naturels qui préparent les révélations.',
  methode:'Écris ta révélation, puis remonte dans le texte et cache-en trois indices dans des détails ordinaires. Le lecteur doit pouvoir se dire, après coup : « Bien sûr ».',
  question:'Quel détail banal de ce chapitre prendra tout son sens plus tard ?',
  exercice:'Choisis une révélation de ton histoire. Écris trois courtes phrases qui la préparent sans la trahir, dans trois scènes différentes.',
  grille:['Les indices paraissent ordinaires','Ils reviennent au moment utile','La révélation semble inévitable après coup','Rien n’est annoncé trop lourdement']}
];


const EXOS=[
 {id:'p1',comp:'personnages',titre:'Le désir caché',min:10,mots:150,tags:['veut','désir','implicite'],
  consigne:'Écris la scène d’un personnage qui veut absolument quelque chose sans le dire à personne. Le lecteur doit le deviner par ses gestes et ses choix. Interdit d’écrire « il voulait ».'},
 {id:'p2',comp:'personnages',titre:'Un choix qui coûte',min:10,mots:150,tags:['choix','décision','coût'],
  consigne:'Ton personnage doit choisir entre deux choses qui comptent pour lui. Écris la scène du choix et montre, dans la dernière phrase, ce qu’il perd.'},
 {id:'p3',comp:'personnages',titre:'La voix de l’autre',min:8,mots:120,tags:['voix','distingue','ressemblent'],
  consigne:'Écris deux répliques du même personnage : la première à un inconnu, la seconde à quelqu’un qu’il aime. Sa façon de parler doit changer sans que tu le dises.'},
 {id:'d1',comp:'dialogues',titre:'Parler d’autre chose',min:10,mots:150,tags:['sous-texte','explique','information'],
  consigne:'Deux personnages parlent de nourriture pendant qu’ils se disputent. Douze répliques au maximum. Le vrai sujet de la dispute n’est jamais nommé.'},
 {id:'d2',comp:'dialogues',titre:'Le silence qui répond',min:8,mots:120,tags:['silence','geste'],
  consigne:'Écris un dialogue dans lequel l’un des personnages ne répond jamais avec des mots. Remplace ses réponses par des gestes et des silences que l’autre interprète.'},
 {id:'d3',comp:'dialogues',titre:'Trois voix',min:12,mots:180,tags:['voix','ressemblent','distingu'],
  consigne:'Trois amis choisissent un restaurant. Sans écrire « dit-il » ni « répondit-elle », le lecteur doit reconnaître qui parle. Donne à chacun un tic de langage différent.'},
 {id:'t1',comp:'tension',titre:'Ralentir le conflit',min:12,mots:180,tags:['conflit','vite','résous','rapide'],
  consigne:'Reprends une dispute de ton manuscrit, ou invente-en une. Interdit de la résoudre : écris trois obstacles qui empêchent les personnages de conclure, et termine la scène sans réponse.'},
 {id:'t2',comp:'tension',titre:'Le compte à rebours',min:8,mots:120,tags:['urgence','temps','retomb'],
  consigne:'Écris une scène où un personnage doit prendre une décision avant une heure précise. Mentionne l’heure trois fois, sans jamais écrire « il stressait ».'},
 {id:'t3',comp:'tension',titre:'La réponse retardée',min:10,mots:150,tags:['réponse','attente','différ'],
  consigne:'Un personnage pose une question importante. Écris les cinq minutes suivantes sans que la réponse arrive. Que fait-il en attendant ?'},
 {id:'de1',comp:'descriptions',titre:'Le premier détail',min:8,mots:120,tags:['surface','caméra','remarque'],
  consigne:'Décris une pièce vue par quelqu’un qui vient d’apprendre une mauvaise nouvelle. Choisis trois détails seulement et ne nomme jamais l’émotion.'},
 {id:'de2',comp:'descriptions',titre:'Sans les yeux',min:8,mots:120,tags:['sens','sensori','odeur'],
  consigne:'Décris un marché en utilisant l’ouïe, l’odorat et le toucher, mais pas la vue.'},
 {id:'de3',comp:'descriptions',titre:'Le même escalier',min:10,mots:150,tags:['point de vue','émotion','décor'],
  consigne:'Décris le même escalier monté par un candidat qui va passer un entretien, puis par un enfant qui rentre de l’école. Ce sont les mêmes marches, mais pas les mêmes mots.'},
 {id:'r1',comp:'rythme',titre:'Accélérer',min:8,mots:120,tags:['phrases','même longueur','monoton'],
  consigne:'Écris une poursuite en phrases de moins de sept mots, puis une seule phrase longue qui laisse le lecteur reprendre son souffle.'},
 {id:'r2',comp:'rythme',titre:'L’ellipse',min:10,mots:150,tags:['ellipse','lent','traîn'],
  consigne:'Raconte une journée entière en 120 mots en sautant les moments sans importance. Chaque saut doit passer inaperçu.'},
 {id:'r3',comp:'rythme',titre:'La respiration',min:8,mots:100,tags:['respir','souffle','pic'],
  consigne:'Après un moment fort (une gifle, une chute, une révélation), écris un paragraphe calme de trois phrases qui laisse résonner ce qui vient d’arriver.'},
 {id:'s1',comp:'structure',titre:'Donc et mais',min:10,mots:120,tags:['cause','enchaîn','et puis'],
  consigne:'Écris trois scènes de trois lignes chacune. Entre elles, seuls « donc » et « mais » sont autorisés. Aucun « et puis ».'},
 {id:'s2',comp:'structure',titre:'La cause cachée',min:10,mots:120,tags:['conséquence','préparé','cause'],
  consigne:'Écris la première ligne d’une scène qui n’existe que parce que la précédente s’est mal terminée. Puis écris la dernière ligne de cette scène précédente.'},
 {id:'s3',comp:'structure',titre:'Le point de bascule',min:15,mots:180,tags:['intrigue','bascule','étapes'],
  consigne:'Résume ton histoire en cinq phrases. Repère la scène qui change tout et écris son ouverture en 80 mots.'},
 {id:'f1',comp:'foreshadowing',titre:'Trois indices',min:12,mots:150,tags:['indice','révélation','préparé'],
  consigne:'Écris ta révélation en une phrase. Puis cache trois indices dans trois objets du quotidien, sans jamais l’annoncer.'},
 {id:'f2',comp:'foreshadowing',titre:'L’objet qui reviendra',min:10,mots:150,tags:['objet','détail','reviendra'],
  consigne:'Introduis un objet banal dans une scène, sans le mettre en avant. Écris ensuite, beaucoup plus tard dans l’histoire, la scène où il devient essentiel.'},
 {id:'f3',comp:'foreshadowing',titre:'Le détail qui cloche',min:10,mots:150,tags:['ordinaire','faux','lourd'],
  consigne:'Écris une scène ordinaire dans laquelle un seul détail est à peine faux. Le lecteur ne doit le remarquer qu’après la révélation.'}
];

const REACTS={love:{e:'😍',l:'J’adore'},frisson:{e:'😱',l:'Frisson'},emu:{e:'😢',l:'Émouvant'},drole:{e:'😂',l:'Drôle'},decroche:{e:'🥱',l:'Je décroche'}};
const R_OLD={touche:'love',souffle:'frisson',belle:'frisson',tension:'frisson'};
const migrateReacts=o=>{Object.keys(o.reactions||{}).forEach(k=>{if(R_OLD[o.reactions[k]])o.reactions[k]=R_OLD[o.reactions[k]];});return o;};
const RSIZES=[15,16.5,18,20,22.5];
const RFONTS={literata:['Classique',"'Literata',Georgia,serif"],lora:['Élégante',"'Lora',Georgia,serif"],atkinson:['Très lisible',"'Atkinson Hyperlegible',system-ui,sans-serif"],sans:['Moderne',"'Hanken Grotesk',system-ui,sans-serif"]};
const rprefs=()=>{const r=S.read||{};return {size:clamp(r.size==null?2:r.size,0,RSIZES.length-1),font:RFONTS[r.font]?r.font:'literata'};};
const DEF_C1='#4B1A57',DEF_C2='#8A4B93';
const recolor=st=>st.c1==='#2F3A8F'?Object.assign({},st,{c1:DEF_C1,c2:DEF_C2}):st;
const GENRES_EDIT=['Romance','Fantasy','Science-fiction','Thriller','Mystère','Horreur','Drame','Aventure','Action','Fantastique','Historique','Humour','Jeunesse','Fanfiction','Poésie','Nouvelles','Spirituel','Non-fiction'];
const LEVELS=[[0,'Encre naissante'],[35,'Encre régulière'],[50,'Encre affirmée'],[65,'Encre assurée'],[80,'Encre maîtrisée']];

const AUTHORS=[
 {id:'a1',nom:'Inès Caradec',abonnes:1240},
 {id:'a2',nom:'Malo Devaux',abonnes:860},
 {id:'a3',nom:'Anaïs Rouvière',abonnes:2015},
 {id:'a4',nom:'Karim Belhadj',abonnes:640},
 {id:'a5',nom:'Camille Ferrand',abonnes:320},
 {id:'a6',nom:'Sacha Lin',abonnes:410}
];

/* ===== v3 : école d'écriture enrichie, défis, mini-leçons ===== */
const CX={
 personnages:{c:'#B4607A',ic:'users',tag:'Nuancer les motivations',court:'Donne à tes personnages un désir, une peur et une contradiction.',levier:'Donner un désir à tes personnages',
  mt:'Le désir avant la scène',mp:['Un désir précis, formulable en une phrase','Une action qui le sert, même maladroitement','Un coût visible quand il l’obtient ou le rate'],
  diag:'L’IA repère le désir, l’action et le coût de chaque personnage dans ta scène.'},
 dialogues:{c:'#7D63B8',ic:'chat',tag:'Faire entendre le sous-texte',court:'Fais parler les intentions, pas les informations.',levier:'Faire parler le non-dit',
  mt:'Le but caché',mp:['Chaque personnage veut quelque chose de l’autre','Ce qui est dit sert ce but, rarement la vérité','Un silence ou une esquive porte le vrai sujet'],
  diag:'L’IA distingue exposition, voix, intention et sous-texte dans chaque échange.'},
 tension:{c:'#C98A2E',ic:'zap',tag:'Escalader la menace',court:'Transforme une inquiétude en choix impossible.',levier:'Retarder la réponse pour faire monter la pression',
  mt:'La réponse retardée',mp:['Une question posée tôt dans la scène','Une réponse retardée par une complication','Un coût qui grandit à chaque retard'],
  diag:'L’IA mesure la question posée, le retard de la réponse et le coût du choix.'},
 descriptions:{c:'#5E9C75',ic:'scan',tag:'Filtrer par le point de vue',court:'Décris ce que ton personnage remarquerait, pas tout ce qui existe.',levier:'Décrire par le regard de ton personnage',
  mt:'Le regard qui filtre',mp:['Un point de vue clair : qui regarde ?','Trois détails choisis, pas un inventaire','Une émotion révélée par ce qu’il remarque'],
  diag:'L’IA vérifie le point de vue, le choix des détails et l’émotion qu’ils portent.'},
 structure:{c:'#5B87A5',ic:'branch',tag:'Relier cause et conséquence',court:'Fais en sorte que chaque scène change la suivante.',levier:'Relier tes scènes par la causalité',
  mt:'La bascule de scène',desc:'Une scène forte part d’une situation, rencontre une complication et se termine sur un changement. La scène suivante existe à cause de cette bascule, pas seulement après elle.',
  mp:['Un objectif de scène formulable','Une complication causée par une action','Une sortie différente de la situation d’entrée'],
  diag:'L’IA vérifie objectif, conflit, bascule et causalité avec la scène suivante.'},
 rythme:{c:'#CF6B66',ic:'pulse',tag:'Alterner pression et respiration',court:'Contrôle la vitesse par les phrases, les actions et les pauses.',levier:'Alterner action et respiration',
  mt:'Souffler pour accélérer',mp:['Des phrases longues pour poser le calme','Des phrases courtes quand tout se précipite','Une pause juste avant le moment qui compte'],
  diag:'L’IA compare la vitesse de tes phrases à ce que la scène demande.'},
 foreshadowing:{c:'#8A5FB5',ic:'orb',tag:'Semer sans révéler',court:'Prépare les révélations sans rendre leur issue prévisible.',levier:'Semer des indices naturels',
  mt:'Le présage à double sens',desc:'Un bon présage possède un sens immédiat qui suffit à la scène, puis un second sens révélé plus tard. Le lecteur doit pouvoir le reconnaître après coup sans avoir deviné toute l’issue.',
  mp:['Un détail ordinaire, planté sans insistance','Un sens immédiat qui suffit à la scène','Un second sens révélé après coup'],
  diag:'L’IA cherche les indices posés, leur naturel et leur double sens.'}
};
COMPS.forEach(c=>{Object.assign(c,CX[c.id]);if(!c.desc)c.desc=c.methode;});

const LESSONS=[
 {id:'promesse',t:'La promesse dramatique',teaser:'Ce que ton premier chapitre promet silencieusement au lecteur, et comment tenir cette promesse.',comp:'structure',
  corps:['Dès les premières pages, ton lecteur reçoit une promesse : un genre, un ton, une question. Un mystère promet une réponse, une romance promet un rapprochement, un thriller promet un danger qui grandit.','Tu n’as pas besoin de l’annoncer. Un objet étrange, un silence de trop ou un personnage qui ment suffisent à poser la promesse.','Ensuite, chaque chapitre doit la faire avancer, la compliquer ou la renverser. La rompre sans raison déçoit. La tenir de façon inattendue donne le sentiment d’une histoire inévitable.'],
  points:['Repère la question que pose ton premier chapitre','Fais-la revenir sous une autre forme au chapitre suivant','Réponds-y d’une manière que le lecteur n’avait pas prévue']}
].concat(COMPS.map(c=>({id:c.id,t:c.mt,teaser:c.court,comp:c.id,corps:[c.desc],points:c.mp})));

const CHALLENGES=[
 {t:'Rends un silence mémorable',d:'Écris 100 mots de dialogue où le non-dit compte plus que les paroles.',comp:'dialogues'},
 {t:'Un désir sans le dire',d:'Écris 100 mots où un personnage veut quelque chose sans jamais le formuler.',comp:'personnages'},
 {t:'Fais monter la pression',d:'Écris 100 mots où une réponse attendue est repoussée trois fois.',comp:'tension'},
 {t:'Regarde comme lui',d:'Décris une pièce en 100 mots à travers l’inquiétude d’un personnage, sans nommer l’inquiétude.',comp:'descriptions'},
 {t:'Cause et conséquence',d:'Écris 100 mots où une décision de la première phrase change tout dans la dernière.',comp:'structure'},
 {t:'Respire avant le choc',d:'Écris 100 mots : trois phrases longues et calmes, puis une seule, très courte, qui casse tout.',comp:'rythme'},
 {t:'Sème un indice',d:'Écris 100 mots où un objet banal prend un second sens que le lecteur ne comprendra que plus tard.',comp:'foreshadowing'}
];

const STORIES=[
 {id:'s1',titre:'La Dernière Marée',auteurId:'a1',genre:'Mystère',lectures:12480,c1:'#1E3A5F',c2:'#2F6A94',motif:'maree',
  resume:'À la mort de son grand-père, Nolwenn revient sur l’île Sainte-Odile pour vider le phare. Personne n’a remonté le mécanisme depuis des mois, pourtant la lampe tourne encore chaque nuit.',
  chapitres:[
   {titre:'Une lampe sans gardien',texte:[
    'Le bateau ne s’arrêtait plus à Sainte-Odile qu’à marée haute, et Nolwenn dut sauter sur le quai avant que la coque ne s’éloigne. Elle n’avait pris qu’un sac. Pour vider le phare d’un homme qui n’avait jamais rien jeté, elle savait déjà que ce serait trop peu.',
    'La porte cédait sous l’épaule, comme toujours. À l’intérieur, l’odeur de tabac froid et d’huile de lin l’attendait, intacte, et elle dut s’appuyer un instant contre le mur. Grand-père avait rangé ses lunettes sur la table, pliées, comme s’il comptait revenir les chercher.',
    'C’est à minuit qu’elle entendit le mécanisme. Un cliquetis régulier, tout là-haut. Elle monta les deux cent quatorze marches sans reprendre son souffle. Le grand miroir tournait, lentement, et le faisceau balayait la mer. Sur le tableau de service, la clé de remontage pendait à son clou, couverte de poussière. Personne n’y avait touché depuis des mois.']},
   {titre:'Le carnet des marées',texte:[
    'Au matin, Nolwenn avait décidé de ne rien croire. Un ressort à long débit, un contrepoids astucieux : son grand-père aurait ri de la voir chercher un fantôme là où il y avait de la mécanique. Elle démonta la plaque du socle et ne trouva que de la graisse séchée.',
    'Le carnet était glissé derrière, dans un sachet de toile cirée. Des colonnes de dates, de hauteurs d’eau, et une seule phrase répétée en marge, d’une écriture qu’elle ne connaissait pas : « Elle est revenue ce soir. »',
    'La dernière entrée datait de la veille de la mort de son grand-père. Nolwenn relut la phrase trois fois, puis referma le carnet et regarda par la fenêtre. Sur la digue, quelqu’un venait d’allumer une cigarette.']}]},
 {id:'s2',titre:'Sous la peau du papier',auteurId:'a2',genre:'Romance',lectures:8213,c1:'#6B2D3E',c2:'#A04760',motif:'papier',
  resume:'Restauratrice de documents anciens, Jeanne reçoit une lettre déchirée en quatre. Celui qui la lui confie pose une seule condition : qu’elle ne la lise pas.',
  chapitres:[
   {titre:'Quatre morceaux',texte:[
    'Jeanne travaillait toujours avec les stores à demi baissés : la lumière directe fatigue les fibres, et les fibres, contrairement aux gens, ne se plaignent jamais. Ce jeudi-là, la sonnette retentit à seize heures onze. Elle ne l’entendit qu’à la troisième fois.',
    'L’homme sur le seuil tenait une pochette de carton contre lui, à deux mains, comme on porte un oiseau blessé.',
    '— C’est une lettre, dit-il. Elle a été déchirée. Je voudrais que vous la remettiez en état.',
    '— Quand l’avez-vous reçue ?',
    '— Il y a onze ans.',
    'Il posa la pochette sur l’établi, sans l’ouvrir. « Une condition, ajouta-t-il. Vous ne la lisez pas. » Jeanne sourit poliment. Elle avait déjà entendu cette phrase, prononcée par des gens qui espéraient qu’on la désobéisse.']},
   {titre:'L’encre qui déborde',texte:[
    'Elle ne lut rien le premier jour. Elle lava, elle sépara, elle mesura le pH de chaque fragment avec l’application sérieuse de qui ne veut pas être surpris. L’encre était d’un bleu ancien, un bleu de plume, qui avait bavé aux endroits où le papier avait été serré dans un poing.',
    'Le deuxième jour, elle assembla le premier coin. Un prénom apparut, à l’envers : le sien. Jeanne posa la pince à épiler très doucement, comme on pose une arme, et fixa l’établi pendant un long moment avant de rappeler l’homme.']}]},
 {id:'s3',jaquette:'/covers/falaise.jpg',titre:'Les Saisons de Verre',auteurId:'a3',genre:'Fantasy',lectures:15302,c1:'#1F5F5B',c2:'#2F7A6D',motif:'verre',
  resume:'À Vitrelle, chaque saison dort dans une jarre de verre gardée par une famille. Le matin du solstice, la jarre de l’hiver est vide.',
  chapitres:[
   {titre:'Le solstice sans neige',texte:[
    'À Vitrelle, on ne dit pas « l’hiver arrive ». On dit « les Aubrac ouvrent la jarre ». Depuis neuf générations, cette famille gardait sous la halle du marché quatre jarres de verre soufflé : le printemps, où bruissait un vent tiède ; l’été, si chaud qu’on le maniait avec des gants de cuir ; l’automne, qui sentait la châtaigne brûlée ; et l’hiver.',
    'Ce matin-là, Iris Aubrac, douze ans, souleva le bouchon de cire de la quatrième jarre, comme son père le lui avait appris. Rien n’en sortit. Pas un souffle, pas un flocon, pas ce froid qui mordait les dents. Seulement l’écho de sa propre respiration au fond du verre.',
    'Derrière elle, la halle s’était tue. Les commerçants la regardaient. Iris comprit deux choses en même temps : que l’hiver avait disparu, et que, dans quelques secondes, on allait chercher à qui en faire porter la faute.']},
   {titre:'La cire brisée',texte:[
    'On enferma Iris dans la remise aux poids, pour sa sécurité, disait-on. Elle passa l’après-midi à observer la jarre qu’on avait posée devant elle comme une pièce à conviction. Le verre était intact. Le bouchon n’avait pas été forcé. Pourtant, la cire portait, sur le bord, une minuscule empreinte de doigt.',
    'Une empreinte trop petite pour un adulte. Iris posa son propre pouce dessus et le trouva un peu plus gros. Quelqu’un d’aussi jeune qu’elle, ou plus jeune encore, avait ouvert la jarre avant elle, et l’avait refermée avec soin.']}]},
 {id:'s4',jaquette:'/covers/paris.jpg',titre:'Ligne 9, dernier départ',auteurId:'a4',genre:'Thriller',lectures:6190,c1:'#232946',c2:'#4A4E8A',motif:'metro',
  resume:'Sur la ligne 9, le conducteur du dernier métro entend frapper contre la cloison de la voiture de queue. Elle est vide. Elle l’est aussi sur les caméras.',
  chapitres:[
   {titre:'23 h 47',texte:[
    'Depuis onze ans, Sofiane connaissait chaque grincement de la ligne 9. Celui de la courbe avant République, le soupir des freins à Oberkampf, le silence particulier des stations fermées. Ce soir-là, à 23 h 47, il entendit un bruit qu’il ne connaissait pas.',
    'Trois coups, secs, contre la cloison arrière de sa cabine. Pas contre une vitre : contre le métal. Il tourna la tête. Derrière lui, la porte de communication était verrouillée, comme toujours. Il n’y avait personne à bord, il l’avait vérifié à Nation.',
    'Trois coups encore. Plus lents. Sofiane regarda l’écran de surveillance. Les six voitures, vides, baignaient dans une lumière pâle. Sur le siège du fond de la dernière, un manteau rouge était posé. Il ne l’avait pas vu à Nation.']},
   {titre:'Le manteau rouge',texte:[
    'Sofiane n’était pas censé quitter sa cabine. Le règlement était clair là-dessus, et il l’avait toujours respecté, sauf une fois, dix ans plus tôt, dont il n’aimait pas parler. Il garda la main sur le levier, laissa le métro glisser jusqu’à la station suivante et ouvrit les portes.',
    'Le quai était désert. Il compta jusqu’à vingt, referma les portes, repartit. À Saint-Ambroise, le manteau rouge n’était plus sur le siège. Sur la vitre, en revanche, quelqu’un avait écrit dans la buée : « Tu t’en souviens ? »']}]},
 {id:'s5',titre:'Ce que dit le silence',auteurId:'a5',genre:'Drame',lectures:3467,c1:'#5A3E2B',c2:'#8A5E3B',motif:'silence',
  resume:'Pour la première fois depuis l’enterrement, les Morel se retrouvent autour d’une même table. Personne ne parle de la chaise vide, et c’est exactement de cela qu’ils parlent.',
  chapitres:[
   {titre:'Le gratin',texte:[
    '— Tu reprends du gratin ? demanda Hélène.',
    '— Non, merci.',
    '— Il est meilleur que d’habitude, pourtant.',
    '— Il est très bien.',
    'Marc ne leva pas les yeux de son assiette. À l’autre bout de la table, Zoé faisait rouler une bille de pain entre ses doigts. Personne ne regardait la chaise du bout, celle qui avait un coussin en trop.',
    '— Il fait froid pour un mois de septembre, dit Hélène.',
    '— Oui.',
    '— Ils annoncent de la pluie jusqu’à jeudi.',
    '— Tu me passes le sel ? demanda Marc.',
    'Elle le lui tendit sans le regarder. Leurs doigts ne se touchèrent pas. C’était devenu un art, chez eux, de ne pas se toucher.']},
   {titre:'Le coussin',texte:[
    '— On pourrait la ranger, dit enfin Zoé.',
    'Le mot tomba au milieu de la table comme un verre. Hélène se leva pour chercher la carafe qui était déjà devant elle.',
    '— Ranger quoi ? demanda Marc, très calme.',
    '— Rien. Laisse tomber.',
    '— Non, vas-y. Ranger quoi ?',
    'Zoé regarda sa mère, qui regardait la carafe. Puis elle regarda le coussin en trop, et elle dit, d’une voix qui ne tremblait pas :',
    '— Le coussin. Il est mal placé.']}]},
 {id:'s6',jaquette:'/covers/orbite.jpg',titre:'Nos corps en orbite',auteurId:'a6',genre:'Science-fiction',lectures:0,c1:'#1B2150',c2:'#3B4DB0',motif:'maree',
  resume:'À 400 kilomètres de la Terre, deux astronautes découvrent qu’un message d’amour peut aussi être un signal de détresse.',
  chapitres:[
   {titre:'Le signal',texte:[
    'À 400 kilomètres de la Terre, le silence n’avait jamais été total. Il y avait le souffle des ventilateurs, le claquement des pompes et, ce matin-là, autre chose : une pulsation brève, régulière, qui revenait toutes les quarante secondes dans le casque d’Ilo.',
    '— Tu l’entends aussi ? demanda-t-il. Maren leva les yeux de son écran. Elle avait cet air qu’ont les gens qui connaissent déjà la réponse et espèrent se tromper. — Depuis hier soir, dit-elle. Je n’ai rien voulu dire.',
    'Sur la console, la courbe dessinait trois longues ondes, puis une courte. Trois, une. Trois, une. Ilo sentit sa gorge se serrer : c’était le rythme qu’elle tapotait sur la table le jour où elle lui avait dit je t’aime, six mois plus tôt, au bord d’un autre océan, bien plus bas.']},
   {titre:'Le message',texte:[
    'Ils passèrent la nuit à décoder. Maren refusait de dormir, Ilo refusait de la laisser seule devant l’écran. À l’aube, le texte apparut, ligne après ligne, dans une langue qu’ils connaissaient tous les deux sans l’avoir jamais apprise.',
    '« Si tu lis ceci, je ne suis pas revenue. » Maren se figea. La signature était la sienne, ou celle d’une Maren qui n’avait pas encore vécu ce que la station allait lui faire vivre.',
    '— Un message d’amour, murmura Ilo. — Non, dit-elle d’une voix blanche. Un signal de détresse. Les deux, peut-être. C’est la même chose quand on est assez loin pour que personne n’entende la différence.']}
  ]}
];

const MOTIFS={
 maree:'<path d="M0 104q12.5-9 25 0t25 0 25 0 25 0v36H0z" fill-opacity=".3" stroke="none"/><path d="M0 118q12.5-9 25 0t25 0 25 0 25 0v22H0z" fill-opacity=".45" stroke="none"/><rect x="58" y="34" width="9" height="52" rx="1" stroke="none" fill-opacity=".85"/><path d="M62 30 100 10v30z" fill-opacity=".2" stroke="none"/>',
 papier:'<g transform="rotate(-7 50 61)"><rect x="24" y="26" width="52" height="70" rx="2" fill-opacity=".22" stroke="none"/><path d="M34 44h30M34 54h24M34 64h28M34 74h18" fill="none" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M56 26l6 12-8 8 8 10-6 14" fill="none" stroke-width="2" opacity=".85"/></g>',
 verre:'<circle cx="32" cy="40" r="14" fill-opacity=".2" stroke="none"/><circle cx="68" cy="40" r="14" fill-opacity=".34" stroke="none"/><circle cx="32" cy="78" r="14" fill-opacity=".34" stroke="none"/><circle cx="68" cy="78" r="14" fill-opacity=".14" stroke="none"/>',
 metro:'<path d="M38 140 46 22M62 140 54 22" fill="none" stroke-width="3"/><path d="M33 120h34M35 100h30M37 82h26M39 66h22M41 52h18" fill="none" stroke-width="2" opacity=".55"/>',
 silence:'<ellipse cx="50" cy="86" rx="32" ry="11" fill-opacity=".28" stroke="none"/><circle cx="22" cy="62" r="6" fill-opacity=".55" stroke="none"/><circle cx="78" cy="62" r="6" fill-opacity=".55" stroke="none"/><circle cx="50" cy="46" r="6" fill="none" stroke-width="2" stroke-dasharray="3 3"/>',
 plume:'<g transform="translate(24 34) scale(2.2)" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></g>'
};

const SEED_COMMENTS={
 s1:[{n:'Léa P.',t:'La clé qui pend à son clou, couverte de poussière : j’ai eu un frisson.'},{n:'Thomas',t:'Le carnet arrive juste au bon moment. J’attends la suite.'}],
 s2:[{n:'Marion',t:'« Une condition, vous ne la lisez pas » : impossible de ne pas lire la suite.'}],
 s3:[{n:'Yanis',t:'L’idée des jarres est superbe. Cette petite empreinte sur la cire, quel indice !'}],
 s4:[{n:'Chloé',t:'Je ne prendrai plus jamais le dernier métro.'}],
 s5:[{n:'Antoine',t:'Tout passe par ce qui n’est pas dit. La scène du sel est parfaite.'}]
};

const SEED_CH_COMMENTS={
 's1:0':[{n:'Léa P.',t:'Fin de chapitre glaçante, j’ai relu la dernière phrase deux fois.'}],
 's1:1':[{n:'Thomas',t:'Cette cigarette sur la digue… je n’ai pas dormi.'}],
 's2:0':[{n:'Marion',t:'Cette condition posée dès la première scène, quelle idée.'}],
 's3:0':[{n:'Yanis',t:'La jarre vide, la halle qui se tait : très fort.'}],
 's4:0':[{n:'Chloé',t:'Le manteau rouge à Nation ! Je regarde mon métro autrement.'}],
 's5:0':[{n:'Antoine',t:'Ils parlent de météo, mais tout est dit.'}]
};

/* ===== état ===== */
const KEY='plume.proto.v1';
function seed(){
  const now=Date.now();
  return {
    user:null,plan:'free',genres:[],genresAsked:false,lib:{status:{},lists:[],pos:{}},
    xp:0,streak:{last:'',n:0},day:{d:'',words:0},week:{k:'',words:0,days:[],ex:0,reads:0,ch:0},challenge:{d:'',state:''},lessons:{},bible:{},prefs:{coach:true,signals:true,goal:500,nFollow:true,nComment:true,nChapter:true},annSeen:0,readSeen:{},exoXP:{},pubXP:{},
    credits:{month:monthKey(),used:0},
    reads:{week:mondayKey(),ids:[]},
    saved:[],following:[],reactions:{},
    comments:JSON.parse(JSON.stringify(SEED_COMMENTS)),chComments:JSON.parse(JSON.stringify(SEED_CH_COMMENTS)),likes:{},
    manuscripts:[{id:'m1',titre:'La maison du Vallon',genre:'Drame',resume:'Deux enfants héritent d’une maison qu’aucun des deux ne sait comment quitter.',published:false,active:0,
      chapitres:[{id:'c1',titre:'La clé sur la table',texte:'Élise posa la clé sur la table.\n\n— Tu veux vendre la maison ? demanda-t-elle.\n\nPaul ne leva pas les yeux de son téléphone.\n\n— Oui. Maman n’y habite plus, Élise.\n\n— Mais c’est la maison de papa.\n\n— Je sais.\n\nIl y eut un silence. Puis Paul soupira.\n\n— D’accord, on ne la vend pas.\n\nÉlise sourit, soulagée. Ils burent leur café et parlèrent d’autre chose. Dehors, le ciel était gris. Elle se dit que tout s’était bien passé, et que ce n’était finalement pas si compliqué.'}]}],
    exos:{},exDraft:{},exDone:{},exHist:{},coachExos:[],keepData:true,theme:'auto',
    profile:{
      scores:{personnages:58,dialogues:46,tension:52,descriptions:61,rythme:49,structure:55,foreshadowing:38},
      prev:{personnages:50,dialogues:44,tension:41,descriptions:55,rythme:47,structure:45,foreshadowing:30},
      trend:{personnages:'hausse',dialogues:'stable',tension:'hausse',descriptions:'hausse',rythme:'stable',structure:'hausse',foreshadowing:'hausse'},
      history:[
        {id:'h2',comp:'tension',score:57,appreciation:'La question tient, la réponse vient trop vite.',titre:'Chapitre 4',quand:now-12*864e5,src:'demo'},
        {id:'h1',comp:'personnages',score:60,appreciation:'Ton personnage veut enfin quelque chose.',titre:'Chapitre 2',quand:now-30*864e5,src:'demo'}],
      memory:[
        {comp:'tension',note:'Tu résous souvent tes conflits en deux ou trois répliques. Prochain objectif : la patience dramatique.',quand:now-12*864e5},
        {comp:'descriptions',note:'Tes descriptions restent à la surface : décris ce que ton personnage remarque, pas ce qu’une caméra verrait.',quand:now-30*864e5}]
    }
  };
}
const ZERO=()=>COMPS.reduce((o,c)=>{o[c.id]=0;return o;},{});
const STABLE=()=>COMPS.reduce((o,c)=>{o[c.id]='stable';return o;},{});
// Compte tout neuf : aucune histoire, aucun historique, aucune note du coach, forfait Gratuit.
function freshAccount(){
  const o=seed();
  Object.assign(o,{v:2,plan:'free',genres:[],genresAsked:false,lib:{status:{},lists:[],pos:{}},manuscripts:[],saved:[],following:[],reactions:{},likes:{},comments:{},chComments:{},
    exos:{},exDraft:{},exDone:{},exHist:{},coachExos:[],credits:{month:monthKey(),used:0},reads:{week:mondayKey(),ids:[]}});
  o.profile={scores:ZERO(),prev:ZERO(),trend:STABLE(),history:[],memory:[]};
  return o;
}
// Retire d'un ancien compte les données de démonstration qui y avaient été copiées.
function stripDemo(o){
  const demo=seed(),P=o.profile;
  if(P){
    P.history=(P.history||[]).filter(h=>h.src!=='demo');
    P.memory=(P.memory||[]).filter(m=>!demo.profile.memory.some(d=>(m.note||'').slice(0,40)===d.note.slice(0,40)));
    const sameAsDemo=COMPS.every(c=>P.scores&&P.scores[c.id]===demo.profile.scores[c.id]);
    if(!P.history.length&&sameAsDemo){P.scores=ZERO();P.prev=ZERO();P.trend=STABLE();}
  }
  const dm=demo.manuscripts[0];
  o.manuscripts=(o.manuscripts||[]).filter(m=>!(m.id===dm.id&&m.titre===dm.titre&&m.chapitres.length===1&&m.chapitres[0].texte===dm.chapitres[0].texte));
  return o;
}
let S=deviceTheme(load());
let SYNC_OFF=false,NOTICE='';
let STATS={},SESSION=null,BLOCKED=new Map(),HIDDEN_MINE=new Set(),REMOTE_STORIES=[],SHARED_CM={},RC={},LIKES={},READS={},FOLL={},SLIKES={},FAVS={},lastRC=0,mutSeq=0;
const bump=(o,k,d)=>{o[k]=Math.max(0,(o[k]||0)+d);};
IX.bell=I('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>');
IX.calendar=I('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>');
IX.history=I('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>');
IX.download=I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>');
IX.wifioff=I('<path d="m2 2 20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="M12 20h.01"/>');
// ===== historique des versions d'un chapitre =====
const VERS={},GVK='plume.versions.guest';let snapT=null;
const VWHY={auto:'enregistrée automatiquement',manuelle:'enregistrée par toi','avant analyse':'avant une analyse du coach','avant restauration':'avant une restauration'};
const gvAll=()=>{try{return JSON.parse(localStorage.getItem(GVK)||'{}');}catch(e){return {};}};
const vKey=(msId,ch)=>msId+':'+ch;
async function vList(msId,ch,force){
  const k=vKey(msId,ch);if(!force&&VERS[k])return VERS[k];
  let l=[];
  if(SESSION){try{l=await B.loadVersions(SESSION.user.id,msId,ch);}catch(e){l=VERS[k]||[];}}
  else l=gvAll()[k]||[];
  VERS[k]=l;return l;
}
async function vStore(msId,ch,snaps){
  const k=vKey(msId,ch);VERS[k]=snaps;
  if(SESSION){try{await B.saveVersions(SESSION.user.id,msId,ch,snaps);}catch(e){console.error(e);}}
  else{const g=gvAll();g[k]=snaps;try{localStorage.setItem(GVK,JSON.stringify(g));}catch(e){}}
}
async function takeSnapshot(m,ch,why,force){
  const c=m&&m.chapitres[ch];if(!c)return false;const txt=c.texte||'';
  if(!txt.trim())return false;
  const list=await vList(m.id,ch),last=list[0];
  if(last&&last.texte===txt)return false;
  if(!force){
    if(last&&(Date.now()-last.t<10*60000||Math.abs(wc(txt)-last.mots)<20))return false;
    if(!last&&wc(txt)<30)return false;
  }
  await vStore(m.id,ch,[{t:Date.now(),texte:txt.slice(0,80000),mots:wc(txt),why:why||'auto'}].concat(list).slice(0,SESSION?12:5));
  return true;
}
function diffText(a,b){
  const A=String(a).split(/\s+/).filter(Boolean),B=String(b).split(/\s+/).filter(Boolean),n=A.length,m=B.length;
  if(n*m>6e6)return null;
  const w=m+1,dp=new Uint16Array((n+1)*w);
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i*w+j]=A[i]===B[j]?dp[(i+1)*w+j+1]+1:Math.max(dp[(i+1)*w+j],dp[i*w+j+1]);
  let i=0,j=0,add=0,del=0,keep=0;const html=[];
  while(i<n&&j<m){
    if(A[i]===B[j]){html.push(esc(A[i]));i++;j++;keep++;}
    else if(dp[(i+1)*w+j]>=dp[i*w+j+1]){html.push('<del>'+esc(A[i])+'</del>');i++;del++;}
    else{html.push('<ins>'+esc(B[j])+'</ins>');j++;add++;}
  }
  while(i<n){html.push('<del>'+esc(A[i++])+'</del>');del++;}
  while(j<m){html.push('<ins>'+esc(B[j++])+'</ins>');add++;}
  return {html:html.join(' '),add:add,del:del,keep:n?Math.round(keep/n*100):100};
}
A['versions-open']=async()=>{
  const m=curMs();if(!m)return;const ch=clamp(m.active||0,0,m.chapitres.length-1);
  UI.vs={msId:m.id,ch:ch,loading:true,list:[],view:null};openSheet('versions');
  const l=await vList(m.id,ch,true);if(!UI.vs)return;UI.vs.list=l;UI.vs.loading=false;renderSheet();
};
A['v-save']=async()=>{
  const V=UI.vs,m=V&&getMs(V.msId);if(!m)return;
  const ok=await takeSnapshot(m,V.ch,'manuelle',true);
  if(!ok)return toast('Rien de nouveau à enregistrer : ce texte est déjà dans la dernière version.');
  V.list=await vList(V.msId,V.ch);renderSheet();toast('Version enregistrée.');
};
A['v-view']=d=>{UI.vs.view=+d.i;renderSheet();};
A['v-list']=()=>{UI.vs.view=null;renderSheet();};
A['v-restore']=async d=>{
  const V=UI.vs,m=V&&getMs(V.msId),c=m&&m.chapitres[V.ch],sn=V&&V.list[+d.i];if(!sn||!c)return;
  await takeSnapshot(m,V.ch,'avant restauration',true);
  c.texte=sn.texte;m.upd=Date.now();save();closeSheet();render();
  toast('Version du '+fmtWhen(sn.t)+' restaurée. L’ancien texte reste dans l’historique.');
};
// ===== notifications =====
let NOTIFS=[],ANN=[],notifTimer=null;
const NKIND={follow:'nFollow',comment:'nComment',chapter:'nChapter',story:'nChapter'};
const notifOn=n=>{const k=NKIND[n.kind];return !k||S.prefs[k]!==false;};
const notifUnread=()=>NOTIFS.filter(n=>!n.read&&notifOn(n)).length+ANN.filter(a=>a.id>(S.annSeen||0)).length;
function bellBtn(){
  if(!SESSION)return '';const n=notifUnread();
  return '<button class="iconbtn bellbtn" data-a="notifs-open" aria-label="Notifications'+(n?' ('+n+' non lue'+(n>1?'s':'')+')':'')+'">'+IX.bell+(n?'<i class="nbadge">'+(n>9?'9+':n)+'</i>':'')+'</button>';
}
function updateBadge(){const el=document.querySelector('.bellbtn');if(el)el.outerHTML=bellBtn();}
const topName=()=>UI.stack.length?UI.stack[UI.stack.length-1].name:'tab:'+UI.tab;
async function refreshNotifs(){
  if(!SESSION||SYNC_OFF)return;
  try{const r=await B.loadNotifications();NOTIFS=r.notifs;ANN=r.announcements;}catch(e){return;}
  if(topName()==='notifs'&&!UI.sheet)render();else updateBadge();
}
function startNotifPoll(){stopNotifPoll();refreshNotifs();notifTimer=setInterval(()=>{if(document.visibilityState==='visible')refreshNotifs();},60000);}
function stopNotifPoll(){clearInterval(notifTimer);notifTimer=null;NOTIFS=[];ANN=[];}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshNotifs();});
function ago(ts){
  const d=(Date.now()-new Date(ts).getTime())/1000;
  if(d<60)return 'à l’instant';if(d<3600)return 'il y a '+Math.floor(d/60)+' min';if(d<86400)return 'il y a '+Math.floor(d/3600)+' h';
  if(d<172800)return 'hier';if(d<604800)return 'il y a '+Math.floor(d/86400)+' j';return dateFr(new Date(ts).getTime());
}
function nText(n){
  const a=esc(n.actor_name||'Quelqu’un'),t='« '+esc(n.story_title||'ton histoire')+' »';
  if(n.kind==='follow')return '<b>'+a+'</b> te suit désormais.';
  if(n.kind==='comment')return '<b>'+a+'</b> a commenté '+t+(n.body?' : « '+esc(n.body)+' »':'.');
  if(n.kind==='chapter')return 'Nouveau chapitre de '+t+', par <b>'+a+'</b>.';
  if(n.kind==='story')return '<b>'+a+'</b> a publié '+t+'.';
  if(n.kind==='moderation')return 'Ton histoire '+t+' a été masquée après plusieurs signalements. Elle est en cours de vérification.';
  if(n.kind==='restored')return 'Ton histoire '+t+' est de nouveau visible.';
  return '';
}
const NICON={follow:'users',comment:'pen',chapter:'sparkles',story:'sparkles',moderation:'flag',restored:'check'};
function vNotifs(){
  if(!SESSION)return topBack('Notifications')+'<section class="pad"><p class="empty">Connecte-toi pour suivre tes abonnés, tes commentaires et les nouveaux chapitres.</p><button class="btn block" data-a="login-go">Se connecter</button></section>';
  const items=NOTIFS.filter(notifOn).map(n=>({t:new Date(n.visible_at).getTime(),n:n})).concat(ANN.map(a=>({t:new Date(a.created_at).getTime(),a:a}))).sort((x,y)=>y.t-x.t);
  const rows=items.map(it=>it.n
    ?'<button class="card nitem'+(it.n.read?'':' unread')+'" data-a="notif-go" data-id="'+it.n.id+'">'+tile(NICON[it.n.kind]||'sparkles',null,'lil')+'<span class="ltxt"><span>'+nText(it.n)+'</span><span class="small muted">'+ago(it.n.visible_at)+'</span></span>'+(it.n.read?'':'<i class="udot" aria-label="Non lue"></i>')+'</button>'
    :'<div class="card nitem'+(it.a.id>(S.annSeen||0)?' unread':'')+'">'+tile('sparkles',null,'amber')+'<span class="ltxt"><b>'+esc(it.a.title)+'</b>'+(it.a.body?'<span>'+esc(it.a.body)+'</span>':'')+'<span class="small muted">Annonce de l’équipe Plume · '+ago(it.a.created_at)+'</span></span></div>').join('');
  const sw=(k,t,d)=>'<div class="rowitem pref"><span class="ltxt"><b>'+t+'</b><span class="small muted">'+d+'</span></span><button class="switch" role="switch" aria-checked="'+(S.prefs[k]!==false)+'" aria-label="'+t+'" data-a="pref" data-k="'+k+'"></button></div>';
  return topBack('Notifications','<button class="link" data-a="notifs-readall">Tout marquer comme lu</button>')+'<section class="pad">'+(rows||'<p class="empty">Rien de neuf pour l’instant. Les nouveaux abonnés, commentaires et chapitres apparaîtront ici.</p>')+
    '<h2 class="h2">Ce que je veux recevoir</h2><div class="card rows">'+sw('nFollow','Nouveaux abonnés','Quand quelqu’un te suit')+sw('nComment','Commentaires','Sur tes histoires')+sw('nChapter','Nouveaux chapitres','Des auteurs que tu suis')+'</div></section>';
}
A['notifs-open']=()=>{go('notifs');refreshNotifs();if(ANN.length){S.annSeen=Math.max.apply(null,ANN.map(a=>a.id));}};
A['notifs-readall']=async()=>{const ids=NOTIFS.filter(n=>!n.read).map(n=>n.id);NOTIFS.forEach(n=>{n.read=true;});if(ANN.length)S.annSeen=Math.max.apply(null,ANN.map(a=>a.id));save();render();try{await B.markNotifsRead(ids);}catch(e){console.error(e);}};
A['notif-go']=d=>{
  const n=NOTIFS.find(x=>String(x.id)===String(d.id));if(!n)return;
  if(!n.read){n.read=true;B.markNotifsRead([n.id]);}
  if(n.kind==='follow'){render();return go('talents');}
  if(n.kind==='moderation'||n.kind==='restored'){const m=S.manuscripts.find(x=>SESSION&&B.remoteId(x.id,SESSION.user.id)===n.story_id);if(m)return go('publish',{id:m.id});}
  const st=findStory(n.story_id);if(st)return go('story',{id:st.id});
  render();toast('Cette histoire n’est plus disponible.');
};
// ===== hors connexion et histoires téléchargées =====
const DLK='plume.offline',DLMAX=4*1024*1024;
const dlAll=()=>{try{return JSON.parse(localStorage.getItem(DLK)||'{}');}catch(e){return {};}};
const dlHas=id=>!!dlAll()[id];
const dlStories=()=>Object.keys(dlAll()).map(k=>dlAll()[k].story);
function dlSave(o){try{const x=JSON.stringify(o);if(x.length>DLMAX)return false;localStorage.setItem(DLK,x);return true;}catch(e){return false;}}
let OFFLINE=typeof navigator!=='undefined'&&navigator.onLine===false,BOOT_OFFLINE=false;
function syncOffbar(){
  let b=document.getElementById('offbar');
  if(!b){b=document.createElement('div');b.id='offbar';b.className='offbar';b.setAttribute('role','status');document.body.appendChild(b);}
  b.hidden=!OFFLINE;b.innerHTML=OFFLINE?IX.wifioff+'<span>Hors connexion : tu peux lire tes histoires téléchargées.</span>':'';
}
window.addEventListener('offline',()=>{OFFLINE=true;syncOffbar();});
window.addEventListener('online',()=>{OFFLINE=false;syncOffbar();if(BOOT_OFFLINE){location.reload();}else{toast('De nouveau en ligne.');refreshNotifs();}});
IX.more=I('<circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/><circle cx="5" cy="12" r="1.3"/>');
IX.lib=I('<path d="M4 19V5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/>');
IX.flag=I('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>');
IX.ban=I('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>');
const SI={
  eye:I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  heart:I('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>'),
  star:I('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>')
};
const statItem=(cls,ic,n,one,many)=>'<span class="si '+cls+'" title="'+n+' '+(n>1?many:one)+'">'+ic+'<b>'+fmt(n)+'</b><span class="vh">'+(n>1?many:one)+'</span></span>';
const statLine=id=>'<span class="sline">'+statItem('s-eye',SI.eye,READS[id]||0,'lecteur','lecteurs')+statItem('s-heart',SI.heart,SLIKES[id]||0,'J’aime','J’aime')+statItem('s-star',SI.star,FAVS[id]||0,'favori','favoris')+'</span>';
async function refreshCounts(force){
  if(!force&&Date.now()-lastRC<15000)return;lastRC=Date.now();
  const seq=mutSeq;
  let c;try{c=await B.loadCounts();}catch(e){return console.error(e);}
  // une action de l'utilisateur est partie pendant le chargement : ces totaux sont peut-être périmés, on recharge un peu plus tard
  if(seq!==mutSeq){setTimeout(()=>refreshCounts(true),1500);return;}
  READS=c.reads;FOLL=c.follows;SLIKES=c.likes;FAVS=c.favs;
  const top=UI.stack.length?UI.stack[UI.stack.length-1].name:'tab:'+UI.tab;
  if(top!=='reader'&&top!=='editor'&&!UI.sheet)render();
}
const needLogin=m=>{toast(m);go('login');};const EXT_AUTHORS={};
const userObj=se=>({name:B.userName(se),email:se.user.email,mode:'compte Plume (e-mail et mot de passe)'});
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const o=migrateReacts(Object.assign(seed(),JSON.parse(raw)));o.plan='free';o.user=null;return fixState(o);}}catch(e){}return seed();}
function deviceTheme(o){try{const t=localStorage.getItem('plume.theme');if(t==='light'||t==='dark'||t==='auto')o.theme=t;}catch(e){}return o;}
let saveT;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('plume.theme',S.theme||'auto');if(!SESSION)localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}},250);
  if(SESSION&&!SYNC_OFF){B.saveState(SESSION.user.id,S);B.syncPublished(SESSION.user.id,S.user?S.user.name:B.userName(SESSION),S.manuscripts.filter(m=>m.published).map(m=>({story:msToStory(m),publishAt:m.publishAt||null})));}}
function rollover(){
  if(S.reads.week!==mondayKey())S.reads={week:mondayKey(),ids:[]};
  if(!S.credits||S.credits.month!==monthKey())S.credits={month:monthKey(),used:0};
}
const UI={tab:'decouvrir',q:'',cq:'',cgenre:'Tout',csort:'pop',genre:'Tout',ecrireTab:'ms',exFilter:'reco',stack:[],sheet:null,genre:'Tout',reader:{sel:null},coach:null,planSel:'plus',login:{name:'',email:'',pass:'',mode:'signup',busy:false}};

/* ===== aides métier ===== */
const allStories=()=>STORIES.concat(REMOTE_STORIES.filter(r=>(!SESSION||r.authorUid!==SESSION.user.id)&&!BLOCKED.has(r.authorUid)&&!r.hidden),S.manuscripts.filter(m=>m.published&&!isScheduled(m)).map(m=>{const st=msToStory(m);if(SESSION)st.id=B.remoteId(m.id,SESSION.user.id);return st;}))
  .map(st=>Object.assign({},st,{lectures:READS[st.id]||0}));
const authorsAll=()=>{const seen={},ext=[];REMOTE_STORIES.forEach(r=>{if((!SESSION||r.authorUid!==SESSION.user.id)&&!BLOCKED.has(r.authorUid)&&!seen[r.auteurId]){seen[r.auteurId]=1;ext.push({id:r.auteurId,nom:EXT_AUTHORS[r.auteurId]});}});return ext.concat(AUTHORS);};
function msToStory(m){
  return {id:m.id,titre:m.titre||'Sans titre',auteurId:'me',genre:m.genre||'Drame',resume:m.resume||'Une histoire écrite sur Plume.',
    c1:DEF_C1,c2:DEF_C2,motif:'plume',lectures:0,mine:true,jaquette:m.jaquette||null,
    chapitres:m.chapitres.map(c=>({titre:c.titre,texte:c.texte.split(/\n+/).map(s=>s.trim()).filter(Boolean)}))};
}
const isScheduled=m=>!!(m.published&&m.publishAt&&m.publishAt>Date.now());
const toLocalInput=ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16);};
const fmtWhen=ts=>{const d=new Date(ts);return d.getDate()+' '+MOIS[d.getMonth()]+' à '+String(d.getHours()).padStart(2,'0')+'h'+String(d.getMinutes()).padStart(2,'0');};
const findStory=id=>allStories().find(s=>s.id===id)||dlStories().find(s=>s.id===id);
const authorName=id=>id==='me'?((S.user&&S.user.name)||'Toi'):(EXT_AUTHORS[id]||(AUTHORS.find(a=>a.id===id)||{nom:''}).nom);
const cmFor=(key,ch)=>((ch?SEED_CH_COMMENTS:SEED_COMMENTS)[key]||[]).concat((SHARED_CM[(ch?'c:':'s:')+key]||[]).filter(c=>!(c.uid&&BLOCKED.has(c.uid))));
const getMs=id=>S.manuscripts.find(m=>m.id===id);
const curP=()=>UI.stack.length?UI.stack[UI.stack.length-1].p:{};
const curMs=()=>getMs(curP().id);
const curCh=()=>{const m=curMs();return m.chapitres[clamp(m.active||0,0,m.chapitres.length-1)];};
const avg=o=>COMPS.reduce((a,c)=>a+(o[c.id]||0),0)/COMPS.length;
function level(){const a=avg(S.profile.scores);let i=0;LEVELS.forEach((l,k)=>{if(a>=l[0])i=k;});return {n:i+1,nom:LEVELS[i][1],moy:Math.round(a),prev:Math.round(avg(S.profile.prev))};}
/* ===== v3 : XP, régularité, objectifs de la semaine ===== */
const dayKey=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const dayOff=n=>{const d=new Date();d.setDate(d.getDate()+n);return dayKey(d);};
const dayOfYear=()=>{const n=new Date();return Math.floor((n-new Date(n.getFullYear(),0,0))/864e5);};
const XP_TITLES=['Plume naissante','Plume curieuse','Plume appliquée','Plume assurée','Plume inspirée','Plume audacieuse','Plume affûtée','Plume singulière','Plume maîtresse','Grande plume'];
const xpAt=n=>60*n*(n-1);
function xpInfo(){
  const xp=S.xp||0;let n=1;while(xp>=xpAt(n+1))n++;
  const lo=xpAt(n),hi=xpAt(n+1);
  return {n:n,xp:xp,nom:XP_TITLES[Math.min(n-1,XP_TITLES.length-1)],pct:Math.round((xp-lo)/(hi-lo)*100),left:hi-xp};
}
function fixState(o){
  const d=seed();
  ['xp','streak','day','week','challenge','lessons','bible','prefs','readSeen','exoXP','pubXP','genres','genresAsked','annSeen','lib'].forEach(k=>{if(o[k]==null)o[k]=d[k];});
  o.prefs=Object.assign({coach:true,signals:true,goal:500,nFollow:true,nComment:true,nChapter:true},o.prefs);
  return o;
}
function ensureDay(){
  const t=dayKey(),wk=mondayKey();
  if(!S.day||S.day.d!==t)S.day={d:t,words:0};
  if(!S.week||S.week.k!==wk)S.week={k:wk,words:0,days:[],ex:0,reads:0,ch:0};
}
function activity(){
  ensureDay();const t=dayKey();
  if(S.streak.last!==t){S.streak.n=(S.streak.last===dayOff(-1))?S.streak.n+1:1;S.streak.last=t;}
  if(!S.week.days.includes(t))S.week.days.push(t);
}
const streakNow=()=>{ensureDay();return (S.streak.last===dayKey()||S.streak.last===dayOff(-1))?S.streak.n:0;};
function addXP(n,msg){
  if(!n)return;
  const before=xpInfo().n;S.xp=(S.xp||0)+n;const x=xpInfo();
  toast(x.n>before?'Niveau '+x.n+' : '+x.nom+' ! (+'+n+' XP)':'+'+n+' XP'+(msg?', '+msg:''));
}
function addWords(n){
  ensureDay();if(n<=0)return;
  const prev=S.day.words;S.day.words+=n;S.week.words+=n;
  if(S.day.words>=20)activity();
  if(prev<2000){const g=Math.floor(Math.min(S.day.words,2000)/20)-Math.floor(prev/20);if(g>0)S.xp=(S.xp||0)+g;}
}
const OBJ=[
 ['jours','Écrire 3 jours cette semaine',()=>S.week.days.length>=3,()=>S.week.days.length+'/3'],
 ['mots','Écrire 1 500 mots',()=>S.week.words>=1500,()=>fmt(Math.min(S.week.words,1500))+'/1 500'],
 ['exo','Faire 1 exercice',()=>S.week.ex>=1,()=>Math.min(S.week.ex,1)+'/1'],
 ['lire','Lire 2 chapitres',()=>S.week.reads>=2,()=>Math.min(S.week.reads,2)+'/2'],
 ['defi','Relever 1 défi du jour',()=>S.week.ch>=1,()=>Math.min(S.week.ch,1)+'/1']
];
const objDone=()=>{ensureDay();return OBJ.filter(o=>o[2]()).length;};
const lastMs=()=>S.manuscripts.slice().sort((a,b)=>(b.upd||0)-(a.upd||0))[0]||null;
const activeCh=m=>m?m.chapitres[clamp(m.active||0,0,m.chapitres.length-1)]:null;
const todayLesson=()=>LESSONS[dayOfYear()%LESSONS.length];
const todayChallenge=()=>{const c=CHALLENGES[dayOfYear()%CHALLENGES.length];return Object.assign({id:'dc'+dayKey(),xp:50,mots:100},c);};
const weakestOrFirst=()=>hasDiag()?weakest():COMPS[0];
const readMin=s=>Math.max(1,Math.round(s.chapitres.reduce((a,c)=>a+wc(Array.isArray(c.texte)?c.texte.join(' '):c.texte),0)/200));
const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const bibleOf=id=>{S.bible=S.bible||{};return S.bible[id]=S.bible[id]||{persos:[],acte:'I',notesActe:'',idees:[],chrono:[]};};
const weakest=()=>COMPS.slice().sort((a,b)=>S.profile.scores[a.id]-S.profile.scores[b.id])[0];
const compOf=id=>COMPS.find(c=>c.id===id);
const budgetLeft=()=>Math.max(0,PLANS[S.plan].budget-S.credits.used);
const syncCredits=()=>{const c=B.lastCredits();if(c){S.credits={month:monthKey(),used:c.used};}};

function avatar(name,size){return '<span class="av" style="--s:'+size+'px;--h:'+([300,320,340,15,40,280][hash(name)%6])+'">'+esc((name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase())+'</span>';}
function cover(st,cls){if(st.jaquette)return '<div class="cover img '+(cls||'')+'"><img src="'+esc(st.jaquette)+'" alt="" loading="lazy"></div>';return '<div class="cover '+(cls||'')+'" style="--c1:'+st.c1+';--c2:'+st.c2+'"><svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" fill="currentColor" stroke="currentColor" aria-hidden="true">'+(MOTIFS[st.motif]||'')+'</svg><span class="ct">'+esc(st.titre)+'</span></div>';}
function radar(){
  const cx=170,cy=158,R=92,n=COMPS.length;
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*R*v/100,cy+Math.sin(a)*R*v/100];};
  const f=x=>x.toFixed(1);
  const poly=o=>COMPS.map((c,i)=>pt(i,o[c.id]||0).map(f).join(',')).join(' ');
  const rings=[25,50,75,100].map(v=>'<polygon points="'+COMPS.map((c,i)=>pt(i,v).map(f).join(',')).join(' ')+'" fill="none" stroke="var(--carreau)" stroke-width="1"/>').join('');
  const axes=COMPS.map((c,i)=>{const p=pt(i,100);return '<line x1="'+cx+'" y1="'+cy+'" x2="'+f(p[0])+'" y2="'+f(p[1])+'" stroke="var(--carreau)" stroke-width="1"/>';}).join('');
  const labels=COMPS.map((c,i)=>{const p=pt(i,124);const an=p[0]<cx-6?'end':(p[0]>cx+6?'start':'middle');return '<text x="'+f(p[0])+'" y="'+f(p[1]+4)+'" text-anchor="'+an+'" class="rl">'+esc(c.nom)+'</text>';}).join('');
  const dots=COMPS.map((c,i)=>{const p=pt(i,S.profile.scores[c.id]||0);return '<circle cx="'+f(p[0])+'" cy="'+f(p[1])+'" r="3.5" fill="var(--bleu)"/>';}).join('');
  return '<svg viewBox="0 0 340 320" class="radar" role="img" aria-label="Radar des sept compétences d’écriture">'+rings+axes+(hasDiag()?'<polygon points="'+poly(S.profile.prev)+'" fill="none" stroke="var(--rouge)" stroke-width="1.5" stroke-dasharray="4 3"/>':'')+'<polygon points="'+poly(S.profile.scores)+'" fill="var(--bleu)" fill-opacity=".16" stroke="var(--bleu)" stroke-width="2"/>'+dots+labels+'</svg>';
}

/* ===== coach : analyse locale (repli) ===== */
const toks=t=>(t.toLowerCase().match(/\p{L}+/gu)||[]);
const stemCount=(tk,st)=>tk.filter(w=>st.some(s=>w.startsWith(s))).length;
const DEC=['décid','choisi','refus','voulai','voulu','voul','veu','accept','renonc','exig','promi'];
const SENS=['odeur','parfum','goût','saveur','bruit','silence','murmur','grinc','lumi','ombre','froid','chaud','glac','humid','brûl','rugue','doux','douc','amer','sucr','tiède','frisson','lueur','poussi'];
const CAUS=/(?<!\p{L})(parce que|donc|car|mais|pourtant|puisque|à cause|du coup)(?!\p{L})/giu;
const HINT=/(?<!\p{L})(pourtant|étrange|bizarre|curieu\p{L}*|comme si|sans savoir|sans le savoir|plus tard|un jour|remarqu\p{L}*|détail)(?!\p{L})/giu;
function metrics(text){
  const tk=toks(text),n=tk.length;
  const sents=text.replace(/\s+/g,' ').split(/(?<=[.!?…])\s+/).map(s=>s.trim()).filter(Boolean);
  const lens=sents.map(s=>toks(s).length).filter(x=>x>0);
  const av=lens.length?lens.reduce((a,b)=>a+b,0)/lens.length:0;
  const varc=lens.length?Math.sqrt(lens.reduce((a,b)=>a+(b-av)*(b-av),0)/lens.length):0;
  const lines=text.split(/\n+/).map(l=>l.trim()).filter(Boolean);
  const dial=lines.filter(l=>/^(—|–|-|«)/.test(l)).length;
  const low=text.toLowerCase();
  return {n,avg:av,varc,short:lens.filter(x=>x<=6).length,q:(text.match(/\?/g)||[]).length,ratio:lines.length?dial/lines.length:0,
    dec:stemCount(tk,DEC),sens:stemCount(tk,SENS),caus:(low.match(CAUS)||[]).length,hint:(low.match(HINT)||[]).length};
}
const per=(m,x)=>m.n?x*100/m.n:0;
const LOC={
 personnages:{f:m=>per(m,m.dec)/1.5,fact:m=>pl(m.dec,'marqueur')+' de désir ou de décision',ok:'Tes personnages veulent et décident : c’est ce qui les rend vivants.',ko:'Les désirs restent implicites. Écris ce que le personnage veut maintenant, puis ce qu’il risque de perdre.'},
 dialogues:{f:m=>1-Math.abs(m.ratio-.4)/.4,fact:m=>Math.round(m.ratio*100)+' % des lignes sont des répliques',ok:'L’équilibre entre dialogue et narration est sain.',ko:'Le rapport entre dialogue et narration est déséquilibré : cherche le sous-texte, pas seulement l’information.'},
 tension:{f:m=>(m.n?m.short/Math.max(1,m.n/12):0)*.5+per(m,m.q)*.25,fact:m=>pl(m.short,'phrase')+' courte'+(m.short>1?'s':'')+' et '+pl(m.q,'question'),ok:'Tu resserres au bon moment et tu poses des questions au lecteur.',ko:'La tension retombe vite : retarde la réponse et augmente le coût du choix avant de conclure.'},
 descriptions:{f:m=>per(m,m.sens)/3,fact:m=>pl(m.sens,'repère')+' sensoriel'+(m.sens>1?'s':'')+' pour '+pl(m.n,'mot'),ok:'On voit, on entend, on sent à travers ton personnage.',ko:'Les descriptions restent générales. Choisis ce que ton personnage remarque en premier et ce que cela révèle de lui.'},
 rythme:{f:m=>m.varc/8,fact:m=>'longueur moyenne de '+Math.round(m.avg)+' mots par phrase, écart de '+m.varc.toFixed(1).replace('.',','),ok:'Tes phrases alternent courtes et longues : le lecteur respire.',ko:'Les phrases ont presque toutes la même longueur : alterne accélérations et respirations.'},
 structure:{f:m=>per(m,m.caus)/2.5,fact:m=>pl(m.caus,'connecteur')+' de cause ou d’opposition',ok:'Tes événements s’enchaînent par cause et conséquence.',ko:'Peu de liens de cause à effet : entre deux scènes, cherche « donc » ou « mais », pas « et puis ».'},
 foreshadowing:{f:m=>per(m,m.hint)/1.2,fact:m=>pl(m.hint,'signal')+' d’attente ou d’indice',ok:'Tu sèmes des détails qui pourront servir plus tard.',ko:'Peu d’indices : note ta révélation, puis cache-en trois dans des détails ordinaires.'}
};
function localCoach(comp,text){
  const m=metrics(text),L=LOC[comp.id],v=clamp(L.f(m),0,1),good=v>=.55;
  return {score:Math.round(30+60*v),appreciation:good?'Bonne base, continue.':'Une piste claire à creuser.',
    diagnostic:'Analyse statistique du texte : '+L.fact(m)+'. Ce calcul donne une première idée, mais il ne remplace pas la lecture du coach IA.',
    forces:good?[L.ok]:[],attention:good?'':L.ko,questions:[comp.question],exercice:comp.exercice,lecon:comp.methode,
    memoire:'Sur « '+comp.nom+' » : '+L.fact(m)+'.',tendance:'stable'};
}

/* ===== coach : IA ===== */
let sampleP=null,sampleFn=null,HAS_AI=null;
function getSample(){
  if(!sampleP){
    sampleP=(async()=>{try{return (await B.coachAvailable())?{json:(p,o)=>B.coachJson(p,o&&o.signal)}:null;}catch(e){return null;}})()
      .then(f=>{sampleFn=f;HAS_AI=!!f;if(UI.sheet&&UI.sheet.name==='coach'&&UI.coach&&UI.coach.phase==='choose')renderSheet();return f;});
  }
  return sampleP;
}
function buildPrompt(comp,text,title,consigne){
  const P=S.profile,mem=P.memory.filter(x=>x.comp===comp.id).slice(0,3).map(x=>'- '+x.note).join('\n')||'- (aucune note pour l’instant)';
  const last=P.history.filter(h=>h.comp===comp.id).slice(0,2).map(h=>'- '+dateFr(h.quand)+' : '+h.score+'/100, « '+h.appreciation+' »').join('\n')||'- (aucun diagnostic précédent)';
  return 'Tu es le coach éditorial de Plume, une application d’écriture de fiction. Tu es un professeur d’écriture bienveillant et exigeant. Tu n’écris JAMAIS l’histoire à la place de l’auteur et tu ne proposes pas de réécriture de phrases entières : tu expliques, tu poses des questions, tu proposes des exercices. Tu tutoies l’auteur et tu réponds en français.\n\n'+
  'Compétence analysée : '+comp.nom+'. Objectif : '+comp.objectif+'\nGrille d’analyse : '+comp.grille.join(' ; ')+'.\n\n'+
  'Contexte longitudinal de l’auteur'+((S.user&&S.user.name)?' ('+S.user.name+')':'')+' :\n- Score actuel dans cette compétence : '+(P.scores[comp.id]?P.scores[comp.id]+'/100 (il y a trois mois : '+P.prev[comp.id]+'/100)':'aucun, c’est sa première analyse')+'\n- Notes de mémoire du coach :\n'+mem+'\n- Derniers diagnostics :\n'+last+'\n\n'+
  (consigne?'Consigne de l’exercice donnée à l’auteur : '+consigne+'\nVérifie aussi si la consigne est respectée.\n\n':'')+
  'Texte à analyser ('+title+') :\n"""\n'+text.slice(0,9000)+'\n"""\n\n'+
  'Réponds uniquement avec un objet JSON de cette forme (cite de courts passages du texte pour appuyer le diagnostic) :\n'+
  '{"score": entier de 0 à 100 pour cette compétence dans ce texte, "appreciation": "une phrase très courte, 12 mots maximum, comme une remarque écrite en marge", "diagnostic": "3 à 4 phrases précises", "forces": ["1 à 3 forces observées"], "attention": "le point d’attention principal", "questions": ["2 ou 3 questions que l’auteur doit se poser"], "exercice": "un exercice court et concret", "lecon": "une mini-leçon de 2 phrases", "memoire": "une phrase décrivant l’habitude d’écriture observée, à retenir pour les prochaines séances", "tendance": "hausse" ou "stable" ou "baisse" par rapport aux diagnostics précédents}';
}
function normalize(r){
  if(!r||typeof r!=='object')return null;
  const arr=x=>Array.isArray(x)?x.map(String).filter(Boolean):(x?[String(x)]:[]);
  const o={score:clamp(Math.round(Number(r.score)||50),0,100),appreciation:String(r.appreciation||''),diagnostic:String(r.diagnostic||''),
    forces:arr(r.forces).slice(0,3),attention:String(r.attention||''),questions:arr(r.questions).slice(0,3),exercice:String(r.exercice||''),
    lecon:String(r.lecon||''),memoire:String(r.memoire||''),tendance:['hausse','stable','baisse'].includes(r.tendance)?r.tendance:'stable'};
  return (o.diagnostic||o.forces.length)?o:null;
}
const ERR={
 budget:'Tu as utilisé tous tes crédits de coach ce mois-ci. Ils reviennent le '+resetLabel()+'.',
 rate_limited:'Trop d’analyses en peu de temps, ou limite d’usage atteinte. Réessaie un peu plus tard.',
 session_expired:'Ta session a expiré. Reconnecte-toi à Claude, puis réessaie.',
 invalid_json:'Le coach a répondu dans un format inattendu. Réessaie.',
 prompt_too_large:'Ce texte est trop long pour une seule analyse. Analyse un chapitre plus court.',
 empty_completion:'Le coach n’a rien renvoyé. Réessaie.'
};
const NO_AI=['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'];
function openCoach(o){
  if(!SESSION){toast('Connecte-toi pour utiliser tes crédits de coach.');return go('login');}
  if((o.text||'').trim().length<60)return toast('Écris au moins quelques phrases avant de lancer une analyse.');
  rollover();
  if(budgetLeft()<=0)return openSheet('budget');
  UI.coach={text:o.text,title:o.title,compId:o.compId||weakest().id,phase:'choose',mode:'single',fixed:!!o.fixed,exId:o.exId||null,consigne:o.consigne||''};
  openSheet('coach');getSample();
  if(o.fixed)runCoach();
}
async function runCoach(){
  const C=UI.coach,comp=compOf(C.compId);
  C.phase='loading';C.err=null;C.ctl=new AbortController();renderSheet();
  const prompt=buildPrompt(comp,C.text,C.title,C.consigne);
  const sample=await getSample();
  if(UI.coach!==C||C.phase!=='loading')return;
  if(!sample){finish(localCoach(comp,C.text),'local','Le coach IA n’est pas disponible pour le moment : analyse locale simplifiée.',0);return;}
  try{
    const raw=await sample.json(prompt,{signal:C.ctl.signal,modelTier:'default'});
    if(UI.coach!==C||C.phase!=='loading')return;
    const res=normalize(raw);
    if(!res){C.phase='error';C.err=ERR.invalid_json;renderSheet();return;}
    finish(res,'ia','',prompt.length);
  }catch(e){
    if(UI.coach!==C)return;
    const code=e&&e.code;
    if(code==='cancelled'){C.phase='choose';renderSheet();return;}
    if(code==='budget'){syncCredits();save();C.phase='error';C.errKind='budget';C.err=ERR.budget;renderSheet();return;}
    if(NO_AI.includes(code)){sampleP=Promise.resolve(null);sampleFn=null;HAS_AI=false;finish(localCoach(comp,C.text),'local','Le coach IA est réservé aux abonnements activés : analyse locale simplifiée.',0);return;}
    C.phase='error';C.err=ERR[code]||'Le coach n’a pas pu répondre pour le moment.';renderSheet();
  }
}
function finish(res,src,note,promptLen){
  const C=UI.coach,comp=compOf(C.compId),P=S.profile;
  const old=P.scores[comp.id],nw=old?Math.round(old*.65+res.score*.35):Math.max(1,res.score);if(!old)P.prev[comp.id]=nw;
  let xpGain=20;if(C.exId)xpGain=S.exDone[C.exId]?10:35;else if(C.fixed&&C.compId){const k='co'+C.compId;xpGain=S.exoXP[k]!==dayKey()?35:0;S.exoXP[k]=dayKey();}
  if(C.exId||C.fixed){ensureDay();S.week.ex++;}activity();
  const tokens=src==='ia'?(C.exId?COST.exercise:COST.single):0;
  P.scores[comp.id]=nw;P.trend[comp.id]=res.tendance;
  P.history.unshift({id:'h'+Date.now(),comp:comp.id,score:res.score,appreciation:res.appreciation||'Diagnostic enregistré.',titre:C.title,quand:Date.now(),src});
  if(res.memoire)P.memory.unshift({comp:comp.id,note:res.memoire,quand:Date.now()});
  P.history=P.history.slice(0,30);P.memory=P.memory.slice(0,12);
  rollover();S.credits.used+=tokens;if(src==='ia')syncCredits();save();
  if(C.exId){const at={score:res.score,app:res.appreciation||'',when:Date.now()};S.exDone[C.exId]=at;S.exHist=S.exHist||{};(S.exHist[C.exId]=S.exHist[C.exId]||[]).push(at);S.exHist[C.exId]=S.exHist[C.exId].slice(-20);save();}
  Object.assign(C,{phase:'result',mode:'single',res,src,note,tokens,oldScore:old,newScore:nw});
  if(xpGain){S.xp=(S.xp||0)+xpGain;save();}
  renderSheet();
  if(C.exId)render();
}

/* ===== coach : analyse globale des 7 compétences ===== */
function buildGlobalPrompt(text,title){
  const P=S.profile;
  const grid=COMPS.map(c=>'- '+c.id+' ('+c.nom+') : '+c.objectif+' Grille : '+c.grille.join(' ; ')+'.').join('\n');
  const ctx=COMPS.map(c=>{const m=P.memory.find(x=>x.comp===c.id);return '- '+c.id+' : score '+(P.scores[c.id]?P.scores[c.id]+'/100 (il y a trois mois : '+P.prev[c.id]+'/100)':'aucun (première analyse)')+'. Note du coach : '+(m?m.note:'aucune')+'.';}).join('\n');
  return 'Tu es le coach éditorial de Plume, une application d’écriture de fiction. Tu es un professeur d’écriture bienveillant et exigeant. Tu n’écris JAMAIS l’histoire à la place de l’auteur et tu ne proposes pas de réécriture de phrases entières : tu expliques, tu poses des questions, tu proposes des exercices. Tu tutoies l’auteur et tu réponds en français.\n\n'+
  'Mission : analyse globale. Évalue le texte ci-dessous sur les 7 compétences suivantes.\n'+grid+'\n\n'+
  'Contexte longitudinal de l’auteur'+((S.user&&S.user.name)?' ('+S.user.name+')':'')+' :\n'+ctx+'\n\n'+
  'Texte à analyser ('+title+') :\n\"\"\"\n'+text.slice(0,9000)+'\n\"\"\"\n\n'+
  'Sois concis : 2 phrases maximum par champ texte, en citant de courts passages du texte quand c’est utile. Réponds uniquement avec un objet JSON de cette forme :\n'+
  '{\"appreciation\": \"une phrase très courte, 12 mots maximum, comme une remarque écrite en marge\", \"synthese\": \"3 à 4 phrases sur l’ensemble du texte\", \"priorite\": \"id de la compétence à travailler en premier\", \"competences\": [{\"id\": \"personnages\", \"score\": entier de 0 à 100, \"diagnostic\": \"...\", \"force\": \"...\", \"attention\": \"...\", \"exercice\": \"un exercice court et concret\", \"memoire\": \"une phrase sur l’habitude d’écriture observée\", \"tendance\": \"hausse\" ou \"stable\" ou \"baisse\"}, ... ]}\n'+
  'Le tableau \"competences\" contient exactement 7 entrées, dans cet ordre : personnages, dialogues, tension, descriptions, rythme, structure, foreshadowing.';
}
function normalizeGlobal(r){
  if(!r||typeof r!=='object'||!Array.isArray(r.competences))return null;
  const items=[];
  COMPS.forEach(c=>{
    const x=r.competences.find(y=>y&&y.id===c.id);if(!x)return;
    items.push({id:c.id,score:clamp(Math.round(Number(x.score)||50),0,100),diagnostic:String(x.diagnostic||''),force:String(x.force||''),attention:String(x.attention||''),
      exercice:String(x.exercice||''),memoire:String(x.memoire||''),tendance:['hausse','stable','baisse'].includes(x.tendance)?x.tendance:'stable'});
  });
  if(items.length<4)return null;
  const score=Math.round(items.reduce((a,b)=>a+b.score,0)/items.length);
  const low=items.slice().sort((a,b)=>a.score-b.score)[0].id;
  return {items,score,appreciation:String(r.appreciation||''),synthese:String(r.synthese||''),priorite:items.some(i=>i.id===r.priorite)?r.priorite:low};
}
function localGlobal(text){
  const m=metrics(text);
  const items=COMPS.map(c=>{
    const L=LOC[c.id],v=clamp(L.f(m),0,1),good=v>=.55;
    return {id:c.id,score:Math.round(30+60*v),diagnostic:'Repère statistique : '+L.fact(m)+'.',force:good?L.ok:'',attention:good?'':L.ko,exercice:c.exercice,memoire:'Sur « '+c.nom+' » : '+L.fact(m)+'.',tendance:'stable'};
  });
  const score=Math.round(items.reduce((a,b)=>a+b.score,0)/items.length);
  const low=items.slice().sort((a,b)=>a.score-b.score)[0];
  return {items,score,appreciation:score>=60?'Une base solide, à affiner.':'Plusieurs pistes à creuser.',
    synthese:'Analyse statistique simplifiée du texte sur les sept compétences. Elle donne des repères chiffrés, mais elle ne remplace pas la lecture du coach IA.',priorite:low.id};
}
async function runGlobal(){
  const C=UI.coach;
  C.mode='global';C.phase='loading';C.err=null;C.errKind=null;C.ctl=new AbortController();renderSheet();
  const prompt=buildGlobalPrompt(C.text,C.title);
  const sample=await getSample();
  if(UI.coach!==C||C.phase!=='loading')return;
  if(!sample){finishGlobal(localGlobal(C.text),'local','Le coach IA n’est pas disponible pour le moment : analyse locale simplifiée.',0);return;}
  const need=COST.global;
  if(budgetLeft()<need){
    C.phase='error';C.errKind='budget';
    C.err='Il te reste '+cr(budgetLeft())+' ce mois-ci, et l’analyse des 7 compétences en coûte '+need+'. Analyse une compétence à la fois (1 crédit), ou passe à un forfait supérieur.';
    renderSheet();return;
  }
  try{
    const raw=await sample.json(prompt,{signal:C.ctl.signal,modelTier:'default'});
    if(UI.coach!==C||C.phase!=='loading')return;
    const res=normalizeGlobal(raw);
    if(!res){C.phase='error';C.err=ERR.invalid_json;renderSheet();return;}
    finishGlobal(res,'ia','',prompt.length);
  }catch(e){
    if(UI.coach!==C)return;
    const code=e&&e.code;
    if(code==='cancelled'){C.phase='choose';renderSheet();return;}
    if(code==='budget'){syncCredits();save();C.phase='error';C.errKind='budget';C.err=ERR.budget;renderSheet();return;}
    if(NO_AI.includes(code)){sampleP=Promise.resolve(null);sampleFn=null;HAS_AI=false;finishGlobal(localGlobal(C.text),'local','Le coach IA est réservé aux abonnements activés : analyse locale simplifiée.',0);return;}
    C.phase='error';C.err=ERR[code]||'Le coach n’a pas pu répondre pour le moment.';renderSheet();
  }
}
function finishGlobal(res,src,note,promptLen){
  const C=UI.coach,P=S.profile,tokens=src==='ia'?COST.global:0,olds={};
  res.items.forEach(i=>{const old=P.scores[i.id];olds[i.id]=old;P.scores[i.id]=old?Math.round(old*.65+i.score*.35):Math.max(1,i.score);if(!old)P.prev[i.id]=P.scores[i.id];P.trend[i.id]=i.tendance;});
  P.history.unshift({id:'h'+Date.now(),comp:'global',score:res.score,appreciation:res.appreciation||'Analyse globale enregistrée.',titre:C.title,quand:Date.now(),src});
  res.items.slice().sort((a,b)=>a.score-b.score).slice(0,2).forEach(i=>{if(i.memoire)P.memory.unshift({comp:i.id,note:i.memoire,quand:Date.now()});});
  P.history=P.history.slice(0,30);P.memory=P.memory.slice(0,12);
  rollover();S.credits.used+=tokens;if(src==='ia')syncCredits();save();
  Object.assign(C,{phase:'result',mode:'global',res,src,note,tokens,olds});
  activity();S.xp=(S.xp||0)+40;save();
  renderSheet();
}

/* ===== écrans ===== */
const topBack=(title,right)=>'<header class="top"><button class="iconbtn" data-a="back" aria-label="Retour">'+IC.back+'</button><b class="top-title">'+esc(title)+'</b>'+(right||'<span class="sp"></span>')+'</header>';
const LOGO='<img class="logo logo-l" src="/logo.png" alt="" width="96" height="96"><img class="logo logo-d" src="/logo-dark.png" alt="" width="96" height="96">';
const brandTop=right=>'<header class="top"><div class="brand">'+LOGO+'<span>Plume</span></div>'+(right||'')+'</header>';
const hasDiag=()=>S.profile.history.length>0;
const deltaChip=d=>!d?'':'<span class="delta '+(d>=0?'pos':'neg')+'">'+(d>0?'+':(d<0?'−':''))+Math.abs(d)+' pts</span>';

function storyRow(s){
  const saved=S.saved.includes(s.id);
  return '<div class="srow"><button class="rowmain" data-a="story" data-id="'+s.id+'">'+cover(s,'mini')+'<span class="sinfo"><b>'+esc(s.titre)+'</b><span class="small">'+esc(authorName(s.auteurId))+'</span><span class="small muted">'+esc(s.genre)+', '+pl(s.chapitres.length,'chapitre')+'</span>'+statLine(s.id)+'</span></button>'+
    '<button class="iconbtn'+(saved?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+saved+'" aria-label="Ajouter '+esc(s.titre)+' aux favoris">'+IC.mark+'</button></div>';
}


/* ===== v3 : Accueil, Découvrir, Talents ===== */
const tile=(ic,cx,cls)=>'<span class="tile'+(cls?' '+cls:'')+'"'+(cx?' style="--cx:'+cx+'"':'')+'>'+IX[ic]+'</span>';
const chev='<span class="chev" aria-hidden="true">'+IX.next+'</span>';

function storyCard(s){
  const saved=S.saved.includes(s.id);
  return '<article class="scard"><button class="plain scov" data-a="story" data-id="'+s.id+'" aria-label="Ouvrir '+esc(s.titre)+'">'+cover(s,'sc')+'</button>'+
  '<div class="sbody"><span class="gchip">'+esc(s.genre)+'</span><button class="plain stitle" data-a="story" data-id="'+s.id+'">'+esc(s.titre)+'</button><p class="by">par '+esc(authorName(s.auteurId))+'</p><p class="sres">'+esc(fr(s.resume))+'</p>'+
  '<div class="smeta">'+statLine(s.id)+'<span class="si s-clock" title="'+readMin(s)+' minutes de lecture">'+IX.clock+'<b>'+readMin(s)+'</b> min</span><button class="iconbtn'+(saved?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+saved+'" aria-label="Ajouter '+esc(s.titre)+' aux favoris">'+IC.mark+'</button></div></div></article>';
}
const byPop=s=>(READS[s.id]||0)+3*(SLIKES[s.id]||0)+5*(FAVS[s.id]||0);
function railCard(s){
  return '<button class="rcard" role="listitem" data-a="story" data-id="'+s.id+'">'+cover(s,'sc')+'<span class="rgenre">'+esc(s.genre)+'</span><b>'+esc(s.titre)+'</b><span class="rmeta"><span class="si s-eye">'+SI.eye+'<b>'+fmt(READS[s.id]||0)+'</b></span><span class="si s-heart">'+SI.heart+'<b>'+fmt(SLIKES[s.id]||0)+'</b></span></span></button>';
}
function discoverRows(){
  const all=allStories(),pref=S.genres||[],rows=[];
  const add=(t,list,g)=>{if(list.length)rows.push({t:t,list:list,g:g||null});};
  if(pref.length)add('Meilleurs choix pour toi',all.filter(x=>pref.includes(x.genre)).sort((a,b)=>byPop(b)-byPop(a)));
  const keys=Object.keys(S.readSeen||{}),last=keys.length?findStory(keys[keys.length-1].split(':')[0]):null;
  if(last)add('Car tu as lu « '+last.titre+' »',all.filter(x=>x.genre===last.genre&&x.id!==last.id));
  add('Nouveautés',all.slice().reverse().slice(0,10));
  Array.from(new Set(all.map(x=>x.genre))).sort((a,b)=>(pref.includes(b)?1:0)-(pref.includes(a)?1:0)).forEach(g=>add(g,all.filter(x=>x.genre===g),g));
  return rows;
}
function discoverRails(){
  return discoverRows().map(r=>'<section class="rail-sec"><h2 class="h2 row-between">'+esc(r.t)+(r.g?'<button class="link" data-a="genre" data-g="'+esc(r.g)+'">Voir tout</button>':'')+'</h2><div class="hscroll rail" role="list" aria-label="'+esc(r.t)+'">'+r.list.map(railCard).join('')+'</div></section>').join('');
}
const rankCard=(s,i)=>'<button class="tcard" role="listitem" data-a="story" data-id="'+s.id+'"><span class="rank" aria-hidden="true">'+(i+1)+'</span><span class="tbody">'+cover(s,'sc')+'<b><span class="vh">N° '+(i+1)+', </span>'+esc(s.titre)+'</b><span class="rmeta"><span class="si s-eye">'+SI.eye+'<b>'+fmt(READS[s.id]||0)+'</b></span><span class="si s-heart">'+SI.heart+'<b>'+fmt(SLIKES[s.id]||0)+'</b></span></span></span></button>';
function catalogList(){
  const q=norm(UI.cq||'').trim(),g=UI.cgenre||'Tout',so=UI.csort||'pop';
  let list=allStories().filter(s=>(g==='Tout'||s.genre===g)&&(!q||norm([s.titre,authorName(s.auteurId),s.genre,s.resume].join(' ')).includes(q)));
  if(so==='pop')list=list.slice().sort((a,b)=>byPop(b)-byPop(a));else if(so==='new')list=list.slice().reverse();else list=list.slice().sort((a,b)=>a.titre.localeCompare(b.titre,'fr'));
  return '<p class="small muted ccount">'+pl(list.length,'histoire')+'</p>'+(list.length?list.map(storyCard).join(''):'<p class="empty">'+(q?'Aucune histoire ne correspond à « '+esc(UI.cq)+' ».':'Aucune histoire dans ce genre pour l’instant.')+'</p>');
}
function vCatalogue(){
  const all=allStories(),genres=['Tout'].concat(Array.from(new Set(all.map(s=>s.genre)))),g=UI.cgenre||'Tout',so=UI.csort||'pop';
  return '<section class="pad dhead"><p class="eyebrow">LE CATALOGUE</p><h1 class="hh">Toutes les histoires.</h1>'+
  '<label class="search">'+IX.search+'<input id="cq" type="search" placeholder="Titre, auteur, univers…" value="'+esc(UI.cq||'')+'" data-in="csearch" aria-label="Rechercher une histoire" autocomplete="off"></label>'+
  '<div class="chips" role="group" aria-label="Genres">'+genres.map(x=>'<button class="chip'+(g===x?' on':'')+'" data-a="cgenre" data-g="'+esc(x)+'" aria-pressed="'+(g===x)+'">'+(x==='Tout'?'Tous les genres':esc(x))+'</button>').join('')+'</div>'+
  '<div class="seg cseg" role="group" aria-label="Trier par">'+[['pop','Populaires'],['new','Nouveautés'],['az','A–Z']].map(x=>'<button data-a="csort" data-v="'+x[0]+'" aria-pressed="'+(so===x[0])+'">'+x[1]+'</button>').join('')+'</div>'+
  '<div id="clist">'+catalogList()+'</div></section>';
}
function vDecouvrir(){
  rollover();
  const u=S.user,first=u?String(u.name).split(' ')[0].toUpperCase():'',all=allStories();
  const quota=S.plan==='free'?'<p class="small muted quota">Lecture gratuite : '+S.reads.ids.length+'/3 chapitres cette semaine · <button class="link" data-a="plans-open">Voir Plume +</button></p>':'';
  const top=all.slice().sort((a,b)=>byPop(b)-byPop(a)).slice(0,10);
  const top10=top.length>=3?'<section class="rail-sec"><h2 class="h2">Tendances <span class="top10tag">Top 10</span></h2><div class="hscroll rail top" role="list" aria-label="Top 10 des tendances">'+top.map(rankCard).join('')+'</div></section>':'';
  const n=authorsAll().length;
  return '<header class="hello pad"><span class="hl">'+LOGO+'</span><div class="ht"><p class="eyebrow">'+(u?'BONJOUR, '+esc(first):'BIENVENUE SUR PLUME')+'</p><h1 class="hh">Quelle sera ta prochaine lecture ?</h1></div><span class="hacts">'+(typeof bellBtn==='function'?bellBtn():'')+'</span></header>'+
  '<section class="pad"><button class="search ghostsearch" data-a="tab" data-t="catalogue">'+IX.search+'<span>Titre, auteur, univers…</span></button>'+quota+'</section>'+
  homeCont()+
  '<section class="pad railwrap">'+top10+discoverRails()+
  '<button class="card talents" data-a="talents-open">'+tile('sparkles',null,'white')+'<span class="ltxt"><span class="eyebrow amberE">TALENTS ÉMERGENTS</span><b>'+pl(n,'plume')+' à lire avant tout le monde</b><span class="small muted">Sélectionnées pour leur voix singulière et leur progression.</span></span></button></section>';
}

function vGenres(){
  const sel=UI.gsel||(UI.gsel=(S.genres||[]).slice());
  return topBack('Mes genres')+'<section class="pad gsec"><h1 class="hh">Quels sont tes 3 genres préférés de lecture ?</h1><p class="muted">Choisis au moins 1 genre pour commencer à recevoir des recommandations personnalisées.</p>'+
  '<div class="chips wrap gpick" role="group" aria-label="Genres">'+GENRES_EDIT.map(g=>'<button class="chip big'+(sel.includes(g)?' on':'')+'" data-a="gpick" data-g="'+esc(g)+'" aria-pressed="'+sel.includes(g)+'">'+esc(g)+'</button>').join('')+'</div>'+
  '<p class="small muted gcount">'+sel.length+' sur 3 choisis</p></section>'+
  '<div class="gbar"><button class="btn block" data-a="gdone"'+(sel.length?'':' disabled')+'>Continuer</button><button class="link" data-a="gskip">Passer pour l’instant</button></div>';
}
function vBlocked(){
  const rows=Array.from(BLOCKED.entries()).map(e=>'<div class="card arow">'+avatar(e[1],44)+'<span class="atxt"><b>'+esc(e[1])+'</b><span class="small muted">Ses histoires et ses commentaires sont masqués pour toi.</span></span><button class="btn sm sec" data-a="unblock" data-uid="'+esc(e[0])+'">Débloquer</button></div>').join('');
  return topBack('Utilisateurs bloqués')+'<section class="pad">'+(rows||'<p class="empty">Tu n’as bloqué personne.</p>')+'</section>';
}
function vNewPass(){
  const N=UI.np||(UI.np={a:'',b:'',busy:false});
  return topBack('Nouveau mot de passe')+'<section class="pad login"><h1 class="h1">Choisis un nouveau mot de passe</h1><p class="muted">Au moins 6 caractères.</p>'+
  '<label class="field"><span>Nouveau mot de passe</span><input id="np-a" type="password" autocomplete="new-password" data-in="np-a" data-enter="pw-save" value="'+esc(N.a)+'"></label>'+
  '<label class="field"><span>Confirme le mot de passe</span><input id="np-b" type="password" autocomplete="new-password" data-in="np-b" data-enter="pw-save" value="'+esc(N.b)+'"></label>'+
  '<button class="btn block" data-a="pw-save"'+(N.busy?' disabled':'')+'>'+(N.busy?'Enregistrement…':'Enregistrer')+'</button></section>';
}
const LIBLABEL={reading:'En cours',toread:'À lire',done:'Terminé'};
const libStatus=id=>S.lib.status[id]||'';
const libPos=id=>S.lib.pos[id]||null;
const storyProg=s=>{const p=libPos(s.id);if(!p)return 0;return Math.round(Math.min(1,(p.ch+(p.f||0))/s.chapitres.length)*100);};
const libByStatus=st=>Object.keys(S.lib.status).filter(id=>S.lib.status[id]===st).map(findStory).filter(Boolean);
function libRow(s,listId){
  const st=libStatus(s.id),p=libPos(s.id),pr=storyProg(s);
  return '<div class="card lrow"><button class="plain lmain" data-a="story" data-id="'+s.id+'">'+cover(s,'mini')+'<span class="ltxt"><b>'+esc(s.titre)+'</b><span class="small muted">'+esc(authorName(s.auteurId))+' · '+esc(s.genre)+'</span>'+
    (p&&st!=='toread'?'<span class="bar" aria-hidden="true"><i style="width:'+pr+'%"></i></span><span class="small muted">Chapitre '+(p.ch+1)+' sur '+s.chapitres.length+' · '+pr+' %</span>':'')+'</span></button>'+
    (st==='reading'&&p?'<button class="btn sm" data-a="read" data-id="'+s.id+'" data-ch="'+p.ch+'" data-f="'+(p.f||0)+'">Continuer</button>':'')+
    (listId?'<button class="iconbtn sm" data-a="list-toggle" data-l="'+listId+'" data-id="'+s.id+'" aria-label="Retirer du dossier">'+IX.trash+'</button>':'<button class="iconbtn sm" data-a="lib-sheet" data-id="'+s.id+'" aria-label="Gérer dans ma bibliothèque">'+IX.more+'</button>')+'</div>';
}
function vBiblio(){
  const tab=UI.libTab||'reading';
  const reading=libByStatus('reading').sort((a,b)=>((libPos(b.id)||{}).t||0)-((libPos(a.id)||{}).t||0));
  const data={reading:reading,toread:libByStatus('toread'),done:libByStatus('done'),fav:S.saved.map(findStory).filter(Boolean),dl:dlStories().map(x=>findStory(x.id)||x)};
  const tabs=[['reading','En cours'],['toread','À lire'],['done','Terminés'],['fav','Favoris'],['dl','Téléchargées'],['lists','Dossiers']];
  const EMPTY={reading:'Tes lectures en cours apparaîtront ici dès que tu ouvriras un chapitre.',toread:'Ajoute des histoires « À lire » depuis leur fiche.',done:'Les histoires que tu as terminées arriveront ici.',fav:'Touche l’étoile d’une histoire pour la retrouver ici.',dl:'Télécharge une histoire depuis sa fiche pour la lire sans connexion.'};
  let body;
  if(tab==='lists'){
    body='<div class="cm-row"><input class="cm-in" id="list-name" maxlength="40" placeholder="Nouveau dossier (ex. À lire cet été)" aria-label="Nom du nouveau dossier" data-enter="list-new"><button class="btn sm" data-a="list-new">Créer</button></div>'+
      (S.lib.lists.length?S.lib.lists.map(l=>{const ss=l.ids.map(findStory).filter(Boolean);return '<section class="lst"><div class="row-between"><h3 class="h3">'+esc(l.nom)+' <span class="small muted">('+ss.length+')</span></h3><button class="iconbtn sm" data-a="list-del" data-l="'+l.id+'" aria-label="Supprimer le dossier '+esc(l.nom)+'">'+IX.trash+'</button></div>'+(ss.length?ss.map(x=>libRow(x,l.id)).join(''):'<p class="small muted">Dossier vide. Ajoute des histoires depuis leur fiche.</p>')+'</section>';}).join(''):'<p class="empty">Crée un dossier pour ranger tes histoires comme tu veux : par envie, par thème, par saison.</p>');
  }else body=data[tab].length?data[tab].map(x=>libRow(x)).join(''):'<p class="empty">'+EMPTY[tab]+'</p>';
  return '<section class="pad dhead"><p class="eyebrow">MA BIBLIOTHÈQUE</p><h1 class="hh">Tes lectures, rangées comme tu veux.</h1><div class="chips" role="tablist" aria-label="Sections de la bibliothèque">'+tabs.map(t=>'<button class="chip'+(tab===t[0]?' on':'')+'" role="tab" aria-selected="'+(tab===t[0])+'" data-a="lib-tab" data-t="'+t[0]+'">'+t[1]+(t[0]==='lists'?(S.lib.lists.length?' '+S.lib.lists.length:''):(data[t[0]].length?' '+data[t[0]].length:''))+'</button>').join('')+'</div><div class="libbody">'+body+'</div></section>';
}
function homeCont(){
  const reading=libByStatus('reading').filter(x=>libPos(x.id)).sort((a,b)=>libPos(b.id).t-libPos(a.id).t),c=reading[0];if(!c)return '';
  const p=libPos(c.id);
  return '<section class="pad"><h2 class="h2 row-between">Continue ta lecture <button class="link" data-a="lib-open" data-t="reading">Ma bibliothèque</button></h2><button class="card lcont" data-a="read" data-id="'+c.id+'" data-ch="'+p.ch+'" data-f="'+(p.f||0)+'">'+cover(c,'mini')+'<span class="ltxt"><b>'+esc(c.titre)+'</b><span class="small muted">Chapitre '+(p.ch+1)+' sur '+c.chapitres.length+' · '+storyProg(c)+' %</span><span class="bar" aria-hidden="true"><i style="width:'+storyProg(c)+'%"></i></span></span><span class="btn sm">Continuer</span></button></section>';
}
function homeStats(){
  const pubs=S.manuscripts.filter(m=>m.published);if(!pubs.length||!SESSION)return '';
  const m=pubs[pubs.length-1],n=pubs.reduce((a,x)=>a+(READS[B.remoteId(x.id,SESSION.user.id)]||0),0);
  return '<button class="card statc" data-a="stats-open" data-id="'+m.id+'" style="margin-top:12px">'+tile('users',null,'lil')+'<span class="ltxt"><b>Mes lecteurs</b><span class="small muted">'+pl(n,'lecteur')+' · statistiques de « '+esc(m.titre||'Sans titre')+' »</span></span>'+chev+'</button>';
}
function statsMin(){return 5;}
function vStats(p){
  const m=getMs(p.id);if(!m)return topBack('Statistiques')+'<p class="empty">Ce manuscrit est introuvable.</p>';
  if(!SESSION)return topBack('Statistiques')+'<section class="pad"><p class="empty">Connecte-toi pour suivre tes lecteurs.</p><button class="btn block" data-a="login-go">Se connecter</button></section>';
  if(!m.published)return topBack('Statistiques')+'<section class="pad"><p class="empty">Publie ton histoire pour voir tes lecteurs, leurs réactions et la courbe de rétention.</p><button class="btn block" data-a="publish-open" data-id="'+m.id+'">Préparer la publication</button></section>';
  const st=STATS[p.id],sid=B.remoteId(m.id,SESSION.user.id);
  if(!st||st.loading)return topBack('Statistiques')+'<section class="pad"><p class="eyebrow">STATISTIQUES</p><h1 class="hh">'+esc(m.titre||'Sans titre')+'</h1><p class="muted" style="margin-top:14px">Chargement de tes chiffres…</p></section>';
  if(!st.ok)return topBack('Statistiques')+'<section class="pad"><p class="empty">Les statistiques n’ont pas pu être chargées.</p><button class="btn block" data-a="stats-open" data-id="'+m.id+'">Réessayer</button></section>';
  const ch=st.chapters,sum=k=>ch.reduce((a,c)=>a+c[k],0),first=ch[0]?ch[0].reads:0;
  const readers=READS[sid]||0,foll=FOLL['ext:'+SESSION.user.id]||0;
  const pct=st.d14>0?Math.round((st.d7-st.d14)/st.d14*100):null;
  const trend=pct!==null?'<span class="trendchip '+(pct>=0?'up':'down')+'">'+(pct>=0?'+':'−')+Math.abs(pct)+' % cette semaine</span>':(st.d7>0?'<span class="trendchip up">'+pl(st.d7,'lecture')+' cette semaine</span>':'<span class="trendchip">Aucune lecture cette semaine</span>');
  const kp=(n,l)=>'<div class="kpi"><b>'+kfmt(n)+'</b><span>'+l+'</span></div>';
  let flag=-1;const rows=ch.map((c,i)=>{
    const ret=first?c.reads/first*100:0,prev=i?(first?ch[i-1].reads/first*100:0):100,drop=i>0&&first>=statsMin()&&(prev-ret)>=25;
    if(drop&&flag<0)flag=i;
    return '<div class="ret'+(drop?' warn':'')+'"><div class="row-between"><b>Chapitre '+(i+1)+(drop?' ⚠':'')+'</b><span>'+(first>=statsMin()?Math.round(ret)+' %':pl(c.reads,'lecteur'))+'</span></div><span class="bar" aria-hidden="true"><i style="width:'+Math.min(100,Math.round(ret))+'%"></i></span><span class="small muted">'+esc(m.chapitres[i].titre||'')+' · '+pl(c.reads,'lecteur')+' · '+fmt(c.likes)+' J’aime · '+pl(c.comments,'commentaire')+'</span></div>';
  }).join('');
  let insight;
  if(first<statsMin())insight='<div class="card insight"><b>Pas encore assez de lecteurs</b><span class="small muted">La courbe de rétention devient fiable à partir de '+statsMin()+' lecteurs au chapitre 1. Tu en as '+first+'.</span></div>';
  else if(flag>=0){
    const a=Math.round(ch[flag-1].reads/first*100),b=Math.round(ch[flag].reads/first*100);
    insight='<div class="card insight warn"><b>Perte inhabituelle de lecteurs au chapitre '+(flag+1)+'</b><span class="small muted">Tu passes de '+a+' % à '+b+' % des lecteurs du chapitre 1. Un coup d’œil du coach peut t’aider à comprendre pourquoi.</span><button class="btn sm" data-a="stats-analyse" data-id="'+m.id+'" data-ch="'+flag+'">Analyser le chapitre '+(flag+1)+' ('+cr(COST.single)+')</button></div>';
  }else insight='<div class="card insight ok"><b>Aucune chute inhabituelle</b><span class="small muted">Tes lecteurs avancent bien d’un chapitre à l’autre.</span></div>';
  return topBack('Statistiques')+'<section class="pad"><p class="eyebrow">STATISTIQUES</p><h1 class="hh">'+esc(m.titre||'Sans titre')+'</h1><div style="margin:10px 0 14px">'+trend+'</div>'+
   '<div class="kpis">'+kp(readers,'Lecteurs')+kp(sum('reads'),'Lectures')+kp(sum('likes'),'J’aime')+kp(st.storyComments+sum('comments'),'Commentaires')+kp(FAVS[sid]||0,'Favoris')+kp(foll,'Abonnés')+'</div>'+
   '<h2 class="h2">Courbe de rétention</h2><p class="small muted" style="margin-bottom:8px">Part des lecteurs du chapitre 1 qui arrivent à chaque chapitre.</p>'+insight+'<div class="retlist">'+rows+'</div></section>';
}
function vTalents(){
  const au=authorsAll(),stories=allStories();
  return topBack('Talents émergents')+'<section class="pad"><p class="eyebrow amberE">TALENTS ÉMERGENTS</p><h1 class="hh">'+pl(au.length,'plume')+' à lire avant tout le monde</h1><p class="muted" style="margin:6px 0 16px">Sélectionnées pour leur voix singulière et leur progression.</p>'+
  au.map(a=>{const on=S.following.includes(a.id),n=stories.filter(s=>s.auteurId===a.id).length;
    return '<div class="card arow">'+avatar(a.nom,52)+'<span class="atxt"><b>'+esc(a.nom)+'</b><span class="small muted">'+pl(FOLL[a.id]||0,'abonné')+', '+pl(n,'histoire')+'</span></span><button class="btn sm'+(on?' sec':'')+'" data-a="follow" data-id="'+a.id+'" aria-pressed="'+on+'">'+(on?'Suivi':'Suivre')+'</button></div>';}).join('')+'</section>';
}
function vSaved(){
  const list=S.saved.map(findStory).filter(Boolean);
  return topBack('Histoires sauvegardées')+'<section class="pad"><h1 class="hh">Tes favoris</h1>'+(list.length?list.map(storyCard).join(''):'<p class="empty">Aucun favori pour l’instant. Touche le signet d’une histoire pour la retrouver ici.</p>')+'</section>';
}
function vFollowing(){
  const au=authorsAll().filter(a=>S.following.includes(a.id));
  return topBack('Auteurs suivis')+'<section class="pad"><h1 class="hh">Les plumes que tu suis</h1>'+(au.length?au.map(a=>'<div class="card arow">'+avatar(a.nom,52)+'<span class="atxt"><b>'+esc(a.nom)+'</b><span class="small muted">'+pl(FOLL[a.id]||0,'abonné')+'</span></span><button class="btn sm sec" data-a="follow" data-id="'+a.id+'" aria-pressed="true">Suivi</button></div>').join(''):'<p class="empty">Tu ne suis personne pour l’instant. Les talents émergents t’attendent dans Découvrir.</p>')+'</section>';
}

/* ===== v3 : Écrire, boussole, leçon, publication, éditeur ===== */
function vEcrire(){
  ensureDay();
  const m=lastMs(),goal=S.prefs.goal,dw=S.day.words,free=S.plan==='free',les=todayLesson();
  const bib=m?bibleOf(m.id):null;
  let main;
  if(m){
    const c=activeCh(m),ex=String(c.texte||'').replace(/\s+/g,' ').trim();
    main='<div class="card mcard"><button class="mmain" data-a="ms-open" data-id="'+m.id+'"><span class="row-between"><span class="gchip'+(m.published?'':' priv')+'">'+(m.published?IX.globe+(isScheduled(m)?'Programmée · '+fmtWhen(m.publishAt):'Publié'):IX.lock+'Brouillon privé')+'</span><span class="saved">'+(SESSION?'Sauvegardé':'Sur cet appareil')+'</span></span>'+
      '<b class="ptitle">'+esc(m.titre||'Sans titre')+'</b><span class="psub">'+esc(c.titre)+'</span><span class="excerpt">'+esc(ex.slice(0,150))+(ex.length>150?'…':'')+'</span>'+
      '<span class="prog"><b class="bignum">'+fmt(dw)+'</b><span class="bar amber" aria-hidden="true"><i style="width:'+Math.min(100,dw/goal*100)+'%"></i></span></span><span class="row-between small muted"><span>mots aujourd’hui</span><span>Objectif '+fmt(goal)+'</span></span></button>'+
      '<button class="link pub" data-a="publish-open" data-id="'+m.id+'">'+IX.globe+'Préparer la publication</button></div>';
  }else main='<div class="card mcard"><b class="ptitle">Ton premier manuscrit t’attend</b><span class="psub">Écris quelques lignes, Plume s’occupe du reste.</span><button class="btn" data-a="ms-new">'+IX.plus+'Nouveau manuscrit</button></div>';
  const offer=free
    ?'<div class="card offer">'+IX.lock+'<span class="ltxt"><b>Offre gratuite</b><span class="small muted">1 publication · '+cr(budgetLeft())+' de coach offerts</span></span><button class="link" data-a="plans-open">Voir Plume +</button></div>'
    :'<div class="card offer">'+IX.sparkles+'<span class="ltxt"><b>'+esc(PLANS[S.plan].nom)+'</b><span class="small muted">'+cr(budgetLeft())+' de coach ce mois-ci</span></span><button class="link" data-a="go-account">Mon espace</button></div>';
  const bs=[['persos','users','Personnages',pl(bib?bib.persos.length:0,'fiche')],['structure','branch','Structure',bib?'Acte '+bib.acte:'Acte I'],['idees','bulb','Idées',pl(bib?bib.idees.length:0,'note')],['chrono','list','Chronologie',pl(bib?bib.chrono.length:0,'repère')]];
  const rows=S.manuscripts.map(x=>{
    const w=x.chapitres.reduce((a,c)=>a+wc(c.texte),0);
    return '<button class="ms" data-a="ms-open" data-id="'+x.id+'"><span class="mi"><b>'+esc(x.titre||'Sans titre')+'</b><span class="small muted">'+pl(w,'mot')+', '+pl(x.chapitres.length,'chapitre')+'</span></span><span class="pill'+(x.published?' pub':'')+'">'+(x.published?(isScheduled(x)?'Programmée':'Publié'):'Brouillon')+'</span></button>';
  }).join('');
  return '<section class="pad"><div class="row-between top-hero"><div><p class="eyebrow">TON ATELIER</p><h1 class="hh">Écris. Apprends. Recommence.</h1></div><button class="sprintbtn" data-a="sprint-open" aria-label="Sprint d’écriture chronométré">'+IX.hourglass+'</button></div>'+main+offer+
  '<h2 class="h2">La boussole de ton histoire</h2><div class="compass">'+bs.map(b=>'<button class="cpi" data-a="boussole-open" data-t="'+b[0]+'"><span class="cpi-i">'+IX[b[1]]+'</span><b>'+b[2]+'</b><span class="small muted">'+b[3]+'</span></button>').join('')+'</div>'+
  homeStats()+'<h2 class="h2">Mes manuscrits</h2><div>'+rows+'</div><div class="btns"><button class="btn block" data-a="ms-new">'+IC.plus+'Nouveau manuscrit</button></div>'+
'</section>';
}

function vExLib(){return topBack('S’exercer à écrire')+'<section class="pad"><h1 class="hh">Exercices guidés</h1></section>'+vExercices();}

function vBoussole(p){
  const m=getMs(p.id)||lastMs();
  if(!m)return topBack('Boussole')+'<section class="pad"><p class="empty">Crée d’abord un manuscrit pour utiliser la boussole.</p></section>';
  const b=bibleOf(m.id),t=UI.bTab||'persos';
  const tabs=[['persos','Personnages'],['structure','Structure'],['idees','Idées'],['chrono','Chronologie']];
  const del=(k,i)=>'<button class="iconbtn" data-a="b-del" data-k="'+k+'" data-i="'+i+'" aria-label="Supprimer">'+IX.trash+'</button>';
  const add=(ph1,ph2,k,label)=>'<div class="card bform"><input id="b-a" class="line-in" placeholder="'+ph1+'" maxlength="80" data-enter="b-add" data-k="'+k+'" aria-label="'+ph1+'">'+(ph2?'<input id="b-b" class="line-in" placeholder="'+ph2+'" maxlength="200" data-enter="b-add" data-k="'+k+'" aria-label="'+ph2+'">':'')+'<button class="btn sm" data-a="b-add" data-k="'+k+'">'+label+'</button></div>';
  let body='';
  if(t==='persos')body=(b.persos.length?b.persos.map((x,i)=>'<div class="card brow"><span class="ltxt"><b>'+esc(x.nom)+'</b><span class="small muted">'+esc(x.note)+'</span></span>'+del('persos',i)+'</div>').join(''):'<p class="empty">Aucune fiche. Note le désir, la peur et la contradiction de chaque personnage.</p>')+add('Nom du personnage','Désir, peur, contradiction…','persos','Ajouter une fiche');
  else if(t==='structure')body='<div class="card"><p class="eyebrow">OÙ EN ES-TU ?</p><div class="seg" role="group" aria-label="Acte">'+['I','II','III'].map(a=>'<button data-a="b-acte" data-v="'+a+'" aria-pressed="'+(b.acte===a)+'">Acte '+a+'</button>').join('')+'</div><label class="small muted" for="b-notes" style="display:block;margin:14px 0 6px">Notes de structure</label><textarea id="b-notes" class="ta" data-in="b-notes" placeholder="Situation de départ, bascule, résolution…" aria-label="Notes de structure">'+esc(b.notesActe||'')+'</textarea></div>';
  else if(t==='idees')body=(b.idees.length?b.idees.map((x,i)=>'<div class="card brow"><span class="ltxt"><b>'+esc(x)+'</b></span>'+del('idees',i)+'</div>').join(''):'<p class="empty">Aucune note. Garde ici tes idées avant qu’elles ne s’envolent.</p>')+add('Une idée, un détail, une réplique…','','idees','Ajouter une note');
  else body=(b.chrono.length?b.chrono.map((x,i)=>'<div class="card brow"><span class="ltxt"><b>'+esc(x.quand)+'</b><span class="small muted">'+esc(x.quoi)+'</span></span>'+del('chrono',i)+'</div>').join(''):'<p class="empty">Aucun repère. Note les dates et les événements qui rythment ton récit.</p>')+add('Quand ? (ex. Nuit du 14 mars)','Que se passe-t-il ?','chrono','Ajouter un repère');
  return topBack('La boussole')+'<section class="pad"><p class="eyebrow">'+esc((m.titre||'Sans titre').toUpperCase())+'</p><h1 class="hh">La boussole de ton histoire</h1>'+
  '<div class="seg" role="group" aria-label="Section" style="margin:14px 0">'+tabs.map(x=>'<button data-a="boussole-tab" data-t="'+x[0]+'" aria-pressed="'+(t===x[0])+'">'+x[1]+'</button>').join('')+'</div>'+body+'</section>';
}

function vLesson(p){
  const L=LESSONS.find(x=>x.id===p.id);if(!L)return topBack('Mini-leçon')+'<p class="empty">Leçon introuvable.</p>';
  const done=!!S.lessons[L.id],c=L.comp?compOf(L.comp):null;
  return topBack('Mini-leçon')+'<section class="pad"><p class="eyebrow">MINI-LEÇON · 3 MIN</p><h1 class="hh">'+esc(L.t)+'</h1><p class="muted" style="margin:6px 0 16px">'+esc(L.teaser)+'</p>'+
  '<div class="card method">'+L.corps.map(x=>'<p>'+esc(fr(x))+'</p>').join('')+'<ol class="mpts">'+L.points.map((x,i)=>'<li><span class="num">'+(i+1)+'</span><b>'+esc(x)+'</b></li>').join('')+'</ol></div>'+
  '<div class="btns">'+(done?'<span class="link ok">'+IX.check+'Leçon terminée</span>':'<button class="btn block" data-a="lesson-done" data-id="'+L.id+'">J’ai lu la leçon (+20 XP)</button>')+(c?'<button class="btn sec block" data-a="atelier" data-id="'+c.id+'">Ouvrir l’atelier '+esc(c.nom)+'</button>':'')+'</div></section>';
}

function vPublish(p){
  const m=getMs(p.id);if(!m)return topBack('Publication')+'<p class="empty">Ce manuscrit est introuvable.</p>';
  const words=wc(m.chapitres.map(c=>c.texte).join(' ')),pubs=S.manuscripts.filter(x=>x.published).length;
  const checks=[
    ['Au moins 10 mots écrits',words>=10,true,pl(words,'mot')+' pour l’instant'],
    ['Un titre',!!(m.titre||'').trim()&&m.titre!=='Sans titre',false,'Visible dans Découvrir'],
    ['Un synopsis d’au moins 40 caractères',(m.resume||'').trim().length>=40,false,'Il donne envie de lire le premier chapitre'],
    ['Une jaquette',!!m.jaquette,false,'Sinon, une couverture par défaut est utilisée']
  ];
  return topBack('Préparer la publication')+'<section class="pad">'+(SESSION&&HIDDEN_MINE.has(B.remoteId(m.id,SESSION.user.id))?'<div class="note or">Cette histoire a été masquée suite à plusieurs signalements : elle n’apparaît plus dans Découvrir le temps d’une vérification.</div>':'')+'<p class="eyebrow">VÉRIFIE AVANT DE PUBLIER</p><h1 class="hh">'+esc(m.titre||'Sans titre')+'</h1><p class="muted" style="margin:6px 0 14px">Vérifie les informations avant de rendre cette histoire visible par la communauté. Tu pourras la retirer à tout moment.</p>'+
  '<div class="card">'+checks.map(c=>'<div class="chk"><span class="chk-i'+(c[1]?' ok':'')+'">'+(c[1]?IX.check:'')+'</span><span class="ltxt"><b>'+c[0]+(c[2]?' <em class="req">requis</em>':'')+'</b><span class="small muted">'+c[3]+'</span></span></div>').join('')+'</div>'+
  ''+(m.published&&SESSION?'<button class="btn sec block" data-a="stats-open" data-id="'+m.id+'" style="margin-top:14px">'+IX.users+'Voir mes statistiques</button>':'')+'<h2 class="h2">Titre</h2><input class="line-in field" id="ms-title" value="'+esc(m.titre)+'" data-in="ms-title" maxlength="80" aria-label="Titre">'+
  '<h2 class="h2">Genre</h2><select class="sel-in field" data-in="ms-genre" aria-label="Genre">'+GENRES_EDIT.map(g=>'<option'+(g===m.genre?' selected':'')+'>'+g+'</option>').join('')+'</select>'+
  '<h2 class="h2">Synopsis</h2><textarea class="ta" data-in="ms-resume" maxlength="400" placeholder="En deux ou trois phrases, de quoi parle ton histoire ?" aria-label="Synopsis">'+esc(m.resume||'')+'</textarea>'+
  '<h2 class="h2">Jaquette</h2><div class="jq">'+cover(msToStory(m),'mini')+'<div><span class="small muted">'+(m.jaquette?'Ta jaquette personnalisée.':'Couverture par défaut. Tu peux ajouter ta propre image.')+'</span><div class="jq-btns"><button class="btn sm sec" data-a="ms-cover">'+(UI.coverBusy?'Envoi…':(m.jaquette?'Changer':'Ajouter une jaquette'))+'</button>'+(m.jaquette?'<button class="btn sm ghost" data-a="ms-cover-rm">Retirer</button>':'')+'</div></div><input type="file" accept="image/*" id="cover-in" data-in="cover-file" hidden></div>'+
  (S.plan==='free'&&!m.published?'<p class="small muted" style="margin-top:14px">Avec le forfait Gratuit, tu peux publier 1 histoire au total ('+pubs+' sur 1 aujourd’hui).</p>':'')+
  pubControls(m)+'</section>';
}
function pubControls(m){
  if(isScheduled(m))return '<div class="note sched">'+IX.calendar+'<span>Programmée pour le <b>'+fmtWhen(m.publishAt)+'</b>. Personne d’autre que toi ne la voit jusque-là.</span></div>'+(B.schedulingAvailable()?'':'<div class="note or">La programmation n’est pas encore activée sur le serveur : ton histoire n’a pas été envoyée. Elle partira dès l’activation.</div>')+
    '<div class="btns"><button class="btn block" data-a="ms-publish" data-id="'+m.id+'" data-now="1">'+IX.globe+'Publier maintenant</button><button class="btn sec block" data-a="ms-publish" data-id="'+m.id+'">Annuler la programmation</button></div>';
  if(m.published)return '<div class="btns"><button class="btn block sec" data-a="ms-publish" data-id="'+m.id+'">Retirer de Découvrir</button></div>';
  const later=UI.pubMode==='later';
  return '<h2 class="h2">Quand ?</h2><div class="seg" role="group" aria-label="Moment de publication"><button data-a="pub-mode" data-v="now" aria-pressed="'+!later+'">Maintenant</button><button data-a="pub-mode" data-v="later" aria-pressed="'+later+'">Programmer</button></div>'+
    (later?'<label class="field"><span>Date et heure de publication</span><input type="datetime-local" id="pub-when" data-in="pub-when" min="'+toLocalInput(Date.now()+10*60000)+'" value="'+esc(UI.pubWhen||'')+'"></label><p class="small muted">Entre 5 minutes et 90 jours. À l’heure dite, l’histoire apparaît dans Découvrir et tes abonnés sont prévenus.</p><div class="btns"><button class="btn block" data-a="ms-schedule" data-id="'+m.id+'">'+IX.calendar+'Programmer la publication</button></div>'
      :'<div class="btns"><button class="btn block" data-a="ms-publish" data-id="'+m.id+'">'+IX.globe+'Publier cette histoire</button></div>');
}

function vEditor(p){
  const m=getMs(p.id);if(!m)return topBack('Manuscrit')+'<p class="empty">Ce manuscrit est introuvable.</p>';
  const act=clamp(m.active||0,0,m.chapitres.length-1),c=m.chapitres[act],goal=S.prefs.goal,w=wc(c.texte),focus=!!UI.focus;
  const sc=compOf(UI.editComp)||weakestOrFirst();
  const head='<header class="edtop"><button class="iconbtn" data-a="back" aria-label="Retour">'+IC.back+'</button><span class="savedot"><i></i>'+(SESSION?'Enregistré sur ton compte':'Enregistré sur cet appareil')+'</span><span class="edact"><button class="iconbtn" data-a="versions-open" aria-label="Versions du chapitre">'+IX.history+'</button><button class="iconbtn" data-a="coach-open" aria-label="Demander au coach">'+IX.sparkles+'</button><button class="iconbtn" data-a="focus-toggle" aria-pressed="'+focus+'" aria-label="Mode concentration">'+(focus?IX.eye:IX.eyeoff)+'</button></span></header>';
  const meta=focus?'':'<div class="pad edhead"><input class="title-in big" id="ms-title" value="'+esc(m.titre)+'" data-in="ms-title" maxlength="80" aria-label="Titre du manuscrit">'+
    '<input class="line-in chap" id="ch-title" value="'+esc(c.titre)+'" data-in="ch-title" maxlength="80" aria-label="Titre du chapitre">'+
    '<div class="chips" role="group" aria-label="Chapitres">'+m.chapitres.map((ch,i)=>'<button class="chip'+(i===act?' on':'')+'" data-a="ms-ch" data-i="'+i+'">Chapitre '+(i+1)+'</button>').join('')+'<button class="chip" data-a="ms-addch">'+IC.plus+'Chapitre</button></div>'+
    '<label class="intent">'+IX.compass+'<span>Intention actuelle :</span><textarea id="ch-intent" class="autog" rows="1" data-in="ch-intent" maxlength="140" placeholder="ce que la scène change" aria-label="Intention de la scène">'+esc(c.intention||'')+'</textarea></label>'+
    '<div class="row-between pubrow"><span class="small muted">'+(m.published?'Publié dans Découvrir':'Brouillon privé')+'</span><button class="link" data-a="publish-open" data-id="'+m.id+'">'+IX.globe+'Préparer la publication</button></div></div>';
  const aide=(focus||!S.prefs.coach)?'':'<div class="pad aide"><div class="row-between"><b class="h3">Aide ciblée</b><span class="small muted">Cours accessibles</span></div>'+
    '<div class="ctabs" role="group" aria-label="Compétence">'+COMPS.map(x=>'<button class="ctab'+(x.id===sc.id?' on':'')+'" style="--cx:'+x.c+'" data-a="edit-comp" data-id="'+x.id+'" aria-pressed="'+(x.id===sc.id)+'">'+IX[x.ic]+'<span>'+esc(x.nom)+'</span></button>').join('')+'</div>'+
    '<div class="card mpanel" style="--cx:'+sc.c+'"><span class="mhead">'+IX[sc.ic]+'Méthode · '+esc(sc.nom)+'</span><p>'+esc(fr(sc.desc))+'</p><p class="q">'+esc(fr(sc.question))+'</p><button class="link" data-a="atelier" data-id="'+sc.id+'">Ouvrir l’atelier</button></div><button class="btn block" data-a="coach-open2">'+IC.cap+'Demander au coach'+(S.plan==='free'?'':' ('+cr(COST.single)+')')+'</button></div>';
  return head+meta+'<textarea class="ta write" id="ms-text" data-in="ms-text" placeholder="Écris ta scène ici…" spellcheck="true" lang="fr" aria-label="Texte du chapitre">'+esc(c.texte)+'</textarea>'+aide+
  '<div class="edbar"><div class="wcrow"><span class="wcn" id="wc">'+pl(w,'mot')+'</span><span class="bar amber" aria-hidden="true"><i id="wcbar" style="width:'+Math.min(100,w/goal*100)+'%"></i></span><span class="small muted">objectif '+fmt(goal)+'</span></div></div>';
}

/* ===== v3 : Progrès, atelier, profil ===== */
const kfmt=n=>n>=1000?(n/1000).toFixed(1).replace('.',',')+' k':String(n);
function vProgression(){
  ensureDay();
  const dc=todayChallenge(),dcs=S.challenge.d===dc.id?S.challenge.state:'',les=todayLesson(),stk=streakNow();
  const x=xpInfo(),w=weakestOrFirst(),L=level(),d=L.moy-L.prev,diag=S.profile.history.length;
  const C=326.7;
  const ring='<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="Niveau '+x.n+'"><circle cx="60" cy="60" r="52" class="rt"/><circle cx="60" cy="60" r="52" class="rf" style="stroke-dasharray:'+(C*Math.max(3,x.pct)/100).toFixed(1)+' '+C+'"/><text x="60" y="64" text-anchor="middle" class="rn">'+x.n+'</text><text x="60" y="84" text-anchor="middle" class="rl">NIVEAU</text></svg>';
  const reco='<button class="card reco" data-a="atelier" data-id="'+w.id+'">'+tile('sparkles',null,'white')+'<span class="ltxt"><span class="eyebrow amberE">RECOMMANDÉ PAR PLUME</span><b>Renforce '+esc(w.nom.toLowerCase())+'</b><span class="small muted">'+esc(noteFor(w.id)||w.court)+'</span></span>'+chev+'</button>';
  const atl=COMPS.map(c=>{
    const sc=S.profile.scores[c.id],dv=sc-S.profile.prev[c.id];
    return '<button class="card acard" data-a="atelier" data-id="'+c.id+'" style="--cx:'+c.c+'">'+tile(c.ic,c.c)+'<span class="atxt"><span class="row-between"><b class="aname">'+esc(c.nom)+'</b><span class="ascore">'+(sc?sc:'–')+deltaChip(dv)+'</span></span><span class="atag">'+esc(c.tag)+'</span><span class="small muted">'+esc(c.court)+'</span><span class="bar cx" aria-hidden="true"><i style="width:'+sc+'%"></i></span></span></button>';
  }).join('');
  const mentor=S.plan==='free'
    ?'<div class="card mentor">'+tile(budgetLeft()>0?'sparkles':'lock',null,'lil')+'<span class="ltxt"><b>'+(budgetLeft()>0?'Mentor IA : '+cr(budgetLeft())+' offerts':'Mentor IA avec Plume +')+'</b><span class="small muted">'+(budgetLeft()>0?'Essaie le coach sur ton propre texte. Avec Plume +, tu as '+cr(PLANS.plus.budget)+' par mois.':'Tes crédits gratuits du mois sont utilisés. Les cours restent accessibles.')+'</span></span><button class="link" data-a="plans-open">Voir Plume +</button></div>'
    :'<div class="card mentor">'+tile('sparkles',null,'lil')+'<span class="ltxt"><b>Mentor IA actif</b><span class="small muted">'+cr(budgetLeft())+' de coach ce mois-ci. Lance une analyse depuis l’éditeur ou un atelier.</span></span></div>';
  const mem=S.profile.memory.slice(0,2).map(m=>'<div class="mem"><p class="hand">'+esc(fr(m.note))+'</p><p class="small muted">'+esc(compOf(m.comp).nom)+', '+dateFr(m.quand)+'</p></div>').join('');
  const hist=S.profile.history.slice(0,5).map(h=>'<div class="hist"><span class="hs">'+h.score+'</span><div><p><b>'+esc(h.comp==='global'?'Analyse globale':compOf(h.comp).nom)+'</b>, '+esc(h.titre)+'</p><p class="muted">'+esc(fr(h.appreciation))+'</p><p class="small muted">'+dateFr(h.quand)+(h.src==='local'?', analyse locale':'')+'</p></div></div>').join('');
  return '<section class="pad"><div class="row-between top-hero"><div><p class="eyebrow">S’EXERCER</p><h1 class="hh">Une compétence, une méthode.</h1></div><button class="flamechip" data-a="obj-open" aria-label="Régularité : '+pl(stk,'jour')+'">'+IX.flame+'<b>'+stk+'</b></button></div><p class="muted" style="margin:8px 0 16px">Chaque atelier travaille un mécanisme différent sur ton propre manuscrit.</p>'+
  '<div class="card levelc">'+ring+'<div class="lt"><span class="gchip amberc">'+IX.feather+esc(x.nom)+'</span><b class="xpbig">'+fmt(x.xp)+' XP accumulés</b><span class="bar amber" aria-hidden="true"><i style="width:'+x.pct+'%"></i></span><span class="small muted">'+pl(diag,'diagnostic')+(diag?' · évolution suivie depuis 3 mois':' · premier diagnostic à venir')+'</span></div></div>'+reco+
  '<h2 class="h2">Défi du jour</h2><div class="card dcard">'+tile('zap',null,'amber')+'<div class="dtxt"><span class="eyebrow amberE">+'+dc.xp+' XP</span><b>'+esc(dc.t)+'</b><span class="small muted">'+esc(dc.d)+'</span></div>'+(dcs==='done'?'<span class="link ok">'+IX.check+'Relevé</span>':'<button class="link" data-a="dc-accept">'+(dcs==='accepted'?'Reprendre':'Accepter')+'</button>')+'</div>'+
  '<button class="card lesson" data-a="lesson-open" data-id="'+les.id+'" style="margin-top:12px">'+tile('cap',null,'lil')+'<span class="ltxt"><span class="eyebrow">MINI-LEÇON · 3 MIN</span><b>'+esc(les.t)+'</b><span class="small muted">'+esc(les.teaser)+'</span></span>'+chev+'</button>'+
  '<h2 class="h2">Choisis ton atelier</h2>'+atl+
  '<button class="card lever" data-a="exlib-open" style="margin-top:14px">'+tile('pen',null,'lil')+'<span class="ltxt"><b>Bibliothèque d’exercices</b><span class="small muted">'+EXOS.length+' exercices guidés, corrigés par le coach autant de fois que tu veux.</span></span>'+chev+'</button>'+mentor+
  '<h2 class="h2">Cette semaine</h2><div class="wstats"><div class="card ws">'+IX.aa+'<b>'+fmt(S.week.words)+'</b><span class="small muted">mots écrits</span></div><div class="card ws">'+IX.flame+'<b>'+pl(streakNow(),'jour')+'</b><span class="small muted">de régularité</span></div><button class="card ws" data-a="obj-open">'+IX.target+'<b>'+objDone()+'/'+OBJ.length+'</b><span class="small muted">objectifs</span></button></div>'+
  '<h2 class="h2">Ton profil d’écriture</h2>'+
  (hasDiag()?'<p class="small '+(d>=0?'pos':'neg')+'">'+(d>0?'+':(d<0?'−':''))+Math.abs(d)+' points par rapport au niveau observé il y a trois mois ('+L.prev+').</p>':'<p class="small muted">Aucun diagnostic pour l’instant : tes scores apparaîtront après ta première analyse par le coach.</p>')+
  radar()+'<div class="legend"><span><i></i>Aujourd’hui</span>'+(hasDiag()?'<span><i class="off"></i>Il y a trois mois</span>':'')+'</div>'+
  '<h2 class="h2">Ce que le coach a retenu</h2>'+(mem||'<p class="muted">Le coach notera tes habitudes d’écriture après ton premier diagnostic.</p>')+
  '<h2 class="h2">Historique des diagnostics</h2>'+(hist||'<p class="muted">Aucun diagnostic pour l’instant.</p>')+
  (SESSION?'':'<p class="small muted" style="margin-top:14px">Les scores de départ sont des données de démonstration. Ils évoluent avec chaque diagnostic.</p>')+'</section>';
}

function vAtelier(p){
  const c=compOf(p.id);if(!c)return topBack('Atelier')+'<p class="empty">Atelier introuvable.</p>';
  const sc=S.profile.scores[c.id],dv=sc-S.profile.prev[c.id],mem=noteFor(c.id),m=lastMs(),ch=activeCh(m);
  const n=S.profile.history.filter(h=>h.comp===c.id||h.comp==='global').length;
  const free=S.plan==='free'&&budgetLeft()<=0,trial=S.plan==='free'&&!free?'<span class="small trial">Crédits offerts : '+cr(budgetLeft())+' ce mois-ci.</span>':'',draft=S.exos[c.id]||'';
  const where=ch?'<p class="applyto">Applique-le à « '+esc((m.titre||'Sans titre')+' · '+ch.titre)+' ».</p>':'';
  return topBack('Atelier '+c.nom)+'<section class="pad" style="--cx:'+c.c+'">'+
  '<div class="hero"><span class="tile big white">'+IX[c.ic]+'</span><div class="htx"><span class="gchip cxchip">'+esc(c.tag.toUpperCase())+'</span><h1 class="hh">'+esc(c.nom)+'</h1><p class="muted">'+esc(c.court)+'</p><b class="hsc">'+(sc?sc:'–')+deltaChip(dv)+'</b></div></div>'+
  '<div class="card qcard">'+IX.target+'<span class="ltxt"><span class="eyebrow">QUESTION POUR TON CHAPITRE</span><b>'+esc(fr(c.question))+'</b></span></div>'+
  '<div class="card memc">'+IX.brain+'<span class="ltxt"><span class="eyebrow amberE">MÉMOIRE DU COACH · '+pl(n,'ANALYSE')+'</span><b>'+esc(fr(mem||'Le coach notera ici ce qu’il remarque dans tes textes, dès ta première analyse.'))+'</b></span></div>'+
  '<div class="card method"><span class="eyebrow">LA MÉTHODE</span><h2 class="mt">'+esc(c.mt)+'</h2><p>'+esc(fr(c.desc))+'</p><ol class="mpts">'+c.mp.map((x,i)=>'<li><span class="num">'+(i+1)+'</span><b>'+esc(x)+'</b></li>').join('')+'</ol></div>'+
  '<div class="card excard"><div class="row-between"><span class="exh">'+tile('pen',null,'lil')+'<span><span class="eyebrow">EXERCICE GUIDÉ · 10 MIN</span><b class="exn">À toi de jouer</b></span></span><span class="xpchip">+35 XP</span></div>'+
  '<p class="extxt">'+esc(fr(c.exercice))+'</p>'+where+
  '<textarea class="ta" data-in="exo" data-id="'+c.id+'" placeholder="Écris ton exercice ici…" spellcheck="true" lang="fr" aria-label="Ton exercice">'+esc(draft)+'</textarea>'+
  '<div class="btns"><button class="btn block" data-a="exo-done" data-id="'+c.id+'">'+IX.hourglass+'J’ai fait l’exercice (+35 XP)</button><button class="btn sec block" data-a="exo-run" data-id="'+c.id+'">'+IC.cap+'Faire corriger par le coach'+(free?'':' ('+cr(COST.exercise)+')')+'</button></div></div>'+
  '<p class="eyebrow" style="margin-top:22px">MENTOR IA</p><h2 class="h2 sparkh">Un retour sur ton texte, pas un texte à ta place.'+IX.sparkles+'</h2>'+
  (free?'<div class="card lockc"><span class="lockic">'+IX.lock+'</span><b>Diagnostic '+esc(c.nom.toLowerCase())+' avec Plume +</b><span class="small muted">Tes crédits gratuits du mois sont utilisés. '+esc(c.diag)+'</span><button class="btn sm" data-a="plans-open">Voir Plume +</button></div>'
    :'<div class="card lockc"><span class="lockic ok">'+IX.sparkles+'</span><b>Diagnostic '+esc(c.nom.toLowerCase())+'</b><span class="small muted">'+esc(c.diag)+'</span><button class="btn sm" data-a="atelier-diag" data-id="'+c.id+'">Analyser ma scène ('+cr(COST.single)+')</button>'+trial+'</div>')+
  '<h2 class="h2">Grille d’analyse</h2><ul class="gr">'+c.grille.map(g=>'<li>'+IC.check+'<span>'+esc(g)+'</span></li>').join('')+'</ul></section>'+
  '<nav class="atabs" aria-label="Ateliers">'+COMPS.map(x=>'<button class="atab'+(x.id===c.id?' on':'')+'" style="--cx:'+x.c+'" data-a="atelier-sw" data-id="'+x.id+'" aria-current="'+(x.id===c.id)+'">'+IX[x.ic]+'<span>'+esc(x.nom)+'</span></button>').join('')+'</nav>';
}

function vProfil(){
  ensureDay();
  const u=S.user,x=xpInfo(),pl_=PLANS[S.plan],pubs=S.manuscripts.filter(m=>m.published),diag=S.profile.history.length;
  const name=u?u.name:'Invité',handle=u?'@'+norm(name).replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,''):'@invite';
  const reads=pubs.reduce((a,m)=>a+(READS[SESSION?B.remoteId(m.id,SESSION.user.id):m.id]||0),0);
  const memo=S.profile.memory[0],ord=COMPS.slice().sort((a,b)=>S.profile.scores[b.id]-S.profile.scores[a.id]);
  const bars=COMPS.map(c=>{const sc=S.profile.scores[c.id],dv=sc-S.profile.prev[c.id];
    return '<button class="trow" data-a="atelier" data-id="'+c.id+'" style="--cx:'+c.c+'">'+tile(c.ic,c.c)+'<span class="tr"><span class="row-between"><b>'+esc(c.nom)+'</b><span class="ascore">'+deltaChip(dv)+(sc?sc:'–')+'</span></span><span class="bar cx" aria-hidden="true"><i style="width:'+sc+'%"></i></span></span></button>';}).join('');
  const goal=S.prefs.goal;
  const works=S.manuscripts.map(m=>{
    const w=m.chapitres.reduce((a,c)=>a+wc(c.texte),0),pct=Math.min(100,Math.round(w/(goal*m.chapitres.length)*100)),r=READS[SESSION?B.remoteId(m.id,SESSION.user.id):m.id]||0;
    return '<button class="card work" data-a="ms-open" data-id="'+m.id+'">'+tile(m.published?'globe':'book',null,m.published?'sage':'lil')+'<span class="ltxt"><b>'+esc(m.titre||'Sans titre')+'</b><span class="small muted">'+pl(m.chapitres.length,'chapitre')+' · '+(m.published?(isScheduled(m)?'Programmée le '+fmtWhen(m.publishAt):'Publiée'):'Brouillon privé')+'</span></span><span class="gchip '+(m.published?'sagec':'')+'">'+(m.published?pl(r,'lecture'):pct+' %')+'</span></button>'+(m.published&&SESSION?'<button class="link wstats" data-a="stats-open" data-id="'+m.id+'">'+IX.users+'Statistiques</button>':'');}).join('');
  const sw=(k,t,d)=>'<div class="rowitem pref"><span class="ltxt"><b>'+t+'</b><span class="small muted">'+d+'</span></span><button class="switch" role="switch" aria-checked="'+!!S.prefs[k]+'" aria-label="'+t+'" data-a="pref" data-k="'+k+'"></button></div>';
  return '<header class="phead pad">'+avatar(name,72)+'<div class="pn"><h1 class="hh">'+esc(name)+'</h1><p class="small muted">'+esc(handle)+(u?'':' · Mode découverte')+'</p><span class="gchip amberc lvlp">'+IX.feather+'Niveau '+x.n+' · '+esc(x.nom)+'</span></div>'+(u?'':'<button class="link" data-a="login-go">Se connecter</button>')+'</header>'+
  '<section class="pad">'+(S.bio?'<p class="bio">'+esc(S.bio)+' <button class="link small" data-a="bio-open">Modifier</button></p>':'<button class="bio add" data-a="bio-open">Ajoute une phrase qui te présente.</button>')+
  (u?'<button class="card cta" data-a="go-account">'+tile('user',null,'white')+'<span class="ltxt"><b>Mon espace client</b><span class="small muted">'+esc(u.email)+'</span></span>'+chev+'</button>'
    :'<button class="card cta" data-a="login-go">'+tile('user',null,'white')+'<span class="ltxt"><b>Crée ton espace client</b><span class="small muted">Connecte-toi pour synchroniser ton profil, tes manuscrits et tes abonnements.</span></span>'+chev+'</button>')+
  '<div class="card planc">'+tile('feather',null,'white')+'<span class="ltxt"><b>'+(S.plan==='free'?'Offre gratuite':esc(pl_.nom))+'</b><span class="small muted">'+(S.plan==='free'?pubs.length+'/1 publication · '+S.reads.ids.length+'/3 chapitres cette semaine · '+cr(budgetLeft())+' de coach':cr(budgetLeft())+' de coach ce mois-ci')+'</span></span><button class="link" data-a="plans-open">'+(S.plan==='free'?'Passer à Plume +':'Voir les forfaits')+'</button></div>'+
  '<div class="statsp"><div><b>'+S.manuscripts.length+'</b><span>Histoires</span></div><div><b>'+kfmt(reads)+'</b><span>Lecteurs</span></div><div><b>'+fmt(x.xp)+'</b><span>XP</span></div></div>'+
  '<h2 class="h2 row-between">Ma transformation <button class="link" data-a="tab" data-t="exercer">Voir les ateliers</button></h2>'+
  '<div class="card transf"><div class="row-between"><div><span class="eyebrow">DEPUIS 3 MOIS</span><h3 class="th">'+(diag?'Tu n’écris plus comme avant.':'Ta transformation commence ici.')+'</h3></div><span class="gchip sagec">'+pl(diag,'diagnostic')+'</span></div>'+bars+'</div>'+
  '<div class="card memc">'+IX.brain+'<span class="ltxt"><span class="eyebrow amberE">CE QUE TON COACH A APPRIS</span><b>'+esc(fr(memo?memo.note:'Le coach notera tes habitudes d’écriture après ton premier diagnostic.'))+'</b>'+(diag?'<span class="small muted">Point fort : '+esc(ord[0].nom)+' · Priorité : '+esc(ord[ord.length-1].nom)+'</span>':'')+'</span></div>'+
  '<h2 class="h2 row-between">Mes œuvres '+(S.manuscripts.length?'<button class="link" data-a="publish-last">'+IX.globe+'Publier une histoire</button>':'')+'</h2>'+(works||'<p class="empty">Tes histoires apparaîtront ici dès ton premier manuscrit.</p>')+
  '<h2 class="h2">Mon espace lecteur</h2><div class="card rows"><button class="rowitem" data-a="lib-open" data-t="reading">'+IX.lib+'<b>Ma bibliothèque</b><span class="cnt">'+(libByStatus('reading').length+libByStatus('toread').length+libByStatus('done').length)+'</span></button><button class="rowitem" data-a="saved-open">'+IC.mark+'<b>Histoires sauvegardées</b><span class="cnt">'+S.saved.length+'</span></button><button class="rowitem" data-a="following-open">'+IX.users+'<b>Auteurs suivis</b><span class="cnt">'+S.following.length+'</span></button><button class="rowitem" data-a="genres-open">'+IX.compass+'<b>Genres préférés</b><span class="cnt gl">'+((S.genres||[]).length?esc(S.genres.join(', ')):'À choisir')+'</span></button>'+(SESSION?'<button class="rowitem" data-a="blocked-open">'+IX.ban+'<b>Utilisateurs bloqués</b><span class="cnt">'+BLOCKED.size+'</span></button>':'')+'</div>'+
  '<h2 class="h2">Préférences</h2><div class="card rows">'+sw('coach','Conseils du coach','Recevoir des questions pendant l’écriture')+sw('signals','Signaux de lecture','Voir où les lecteurs réagissent ou décrochent')+
  '<div class="rowitem col"><b>Objectif de mots par jour</b><div class="seg" role="group" aria-label="Objectif de mots">'+[250,500,750,1000].map(g=>'<button data-a="goal" data-v="'+g+'" aria-pressed="'+(S.prefs.goal===g)+'">'+g+'</button>').join('')+'</div></div>'+
  '<div class="rowitem col"><b>Apparence</b><div class="seg" role="group" aria-label="Thème">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(t=>'<button data-a="theme" data-v="'+t[0]+'" aria-pressed="'+(S.theme===t[0])+'">'+t[1]+'</button>').join('')+'</div></div></div></section>';
}

function vStory(p){
  const s=findStory(p.id);if(!s)return topBack('Histoire')+'<p class="empty">Cette histoire n’est plus disponible.</p>';
  const saved=S.saved.includes(s.id),au=authorsAll().find(a=>a.id===s.auteurId),foll=au&&S.following.includes(au.id),cms=cmFor(s.id),pos=libPos(s.id),lst=libStatus(s.id);
  const chs=s.chapitres.map((c,i)=>{
    const key=s.id+':'+i,read=S.reads.ids.includes(key),locked=S.plan==='free'&&!read&&S.reads.ids.length>=3;
    return '<li><button data-a="read" data-id="'+s.id+'" data-ch="'+i+'"><span class="num">'+(i+1)+'</span><span>'+esc(c.titre)+'</span><span class="st">'+(locked?IC.lock:(read?IC.check:''))+'</span></button></li>';
  }).join('');
  const flag=s.authorUid&&!s.mine?'<button class="iconbtn" data-a="report-open" data-type="story" data-id="'+s.id+'" data-uid="'+s.authorUid+'" data-name="'+esc(authorName(s.auteurId))+'" aria-label="Signaler ou bloquer">'+IX.flag+'</button>':'';
  return topBack('Histoire','<span class="topacts">'+flag+'<button class="iconbtn'+(saved?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+saved+'" aria-label="Ajouter l’histoire aux favoris">'+IC.mark+'</button></span>')+
  '<section class="pad story-head">'+cover(s,'big')+'<div><h1 class="h1">'+esc(s.titre)+'</h1><p>'+esc(authorName(s.auteurId))+'</p><p class="small muted">'+esc(s.genre)+', '+pl(s.chapitres.length,'chapitre')+'</p><p>'+statLine(s.id)+'</p></div></section>'+
  '<section class="pad"><p class="synopsis">'+esc(fr(s.resume))+'</p><div class="btns">'+(pos?'<button class="btn" data-a="read" data-id="'+s.id+'" data-ch="'+pos.ch+'" data-f="'+(pos.f||0)+'">Continuer · chapitre '+(pos.ch+1)+'</button>':'<button class="btn" data-a="read" data-id="'+s.id+'" data-ch="0">Lire le chapitre 1</button>')+'<button class="btn sec" data-a="lib-sheet" data-id="'+s.id+'">'+IX.lib+(lst?esc(LIBLABEL[lst]):'Ma bibliothèque')+'</button>'+(s.mine?'':'<button class="btn sec" data-a="dl-toggle" data-id="'+s.id+'" aria-pressed="'+dlHas(s.id)+'">'+IX.download+(dlHas(s.id)?'Téléchargée':'Télécharger')+'</button>')+
  (au?'<button class="btn sec" data-a="follow" data-id="'+au.id+'" aria-pressed="'+!!foll+'">'+(foll?'Suivi':'Suivre '+esc(au.nom.split(' ')[0]))+'</button>':'')+'</div></section>'+
  '<section class="pad"><h2 class="h2">Chapitres</h2><ol class="chlist">'+chs+'</ol></section>'+
  '<section class="pad"><h2 class="h2">Commentaires</h2>'+(cms.length?cms.map(cmHtml).join(''):'<p class="muted">Aucun commentaire. Lance la conversation.</p>')+
  '<div class="cm-row"><input class="cm-in" id="cm-input" maxlength="280" placeholder="Ajouter un commentaire" aria-label="Ajouter un commentaire" data-enter="comment" data-id="'+s.id+'"><button class="btn sm" data-a="comment" data-id="'+s.id+'">Publier</button></div></section>';
}

const rbtn=(k,on,action,n)=>'<button class="rbtn'+(on?' on':'')+'" data-a="'+action+'" data-r="'+k+'" aria-pressed="'+on+'"><span class="re" aria-hidden="true">'+REACTS[k].e+'</span><span class="rl2">'+esc(REACTS[k].l)+'</span>'+(n?'<b class="rn">'+fmt(n)+'</b>':'')+'</button>';
const rcounts=key=>{if(!S.prefs.signals)return '';const c=RC[key]||{},ks=Object.keys(REACTS).filter(k=>c[k]>0);return ks.length?'<span class="rcnt">'+ks.map(k=>'<span><span class="re" aria-hidden="true">'+REACTS[k].e+'</span>'+fmt(c[k])+'</span>').join('')+'</span>':'';};
function vReader(p){
  const s=findStory(p.id);if(!s)return topBack('Lecture')+'<p class="empty">Cette histoire n’est plus disponible.</p>';
  const ci=clamp(p.ch,0,s.chapitres.length-1),ch=s.chapitres[ci],R=UI.reader,last=ci===s.chapitres.length-1;
  const key=i=>s.id+':'+ci+':'+i;
  const paras=ch.texte.map((t,i)=>{
    const r=REACTS[S.reactions[key(i)]];
    return '<p class="rp'+(R.sel===i?' sel':'')+'" data-a="para" data-i="'+i+'" tabindex="0" role="button">'+esc(fr(t))+(r?'<span class="rtag"><span class="re" aria-hidden="true">'+r.e+'</span>'+esc(r.l)+'</span>':'')+rcounts(key(i))+'</p>';
  }).join('');
  let dock;
  if(R.sel!=null){
    dock='<div class="dock react"><div class="rhead"><span class="small muted">Ta réaction à ce passage</span><button class="iconbtn" data-a="unsel" aria-label="Fermer">'+IC.x+'</button></div><div class="rc">'+Object.keys(REACTS).map(k=>rbtn(k,S.reactions[key(R.sel)]===k,'react',(RC[key(R.sel)]||{})[k])).join('')+'</div></div>';
  }else{
    dock='<div class="dock"><button class="btn sec" data-a="chnav" data-d="-1"'+(ci===0?' disabled':'')+'>Précédent</button>'+(last?'<button class="btn grow" data-a="back">Terminer</button>':'<button class="btn grow" data-a="chnav" data-d="1">Chapitre suivant</button>')+'</div>';
  }
  const ck=s.id+':'+ci,cr=S.reactions[ck],lk=!!S.likes[ck],fav=S.saved.includes(s.id),cc=cmFor(ck,true);
  const likeN=LIKES[ck]||0;
  const chReact='<div class="creact"><p class="h3">Ce chapitre t’a fait quoi ?</p><div class="rc">'+Object.keys(REACTS).map(k=>rbtn(k,cr===k,'creact',(RC[ck]||{})[k])).join('')+'</div>'+
   '<div class="acts"><button class="act'+(lk?' on':'')+'" data-a="like" aria-pressed="'+lk+'"><span class="re" aria-hidden="true">👍</span><span>J’aime</span><b>'+fmt(likeN)+'</b></button>'+
   '<button class="act'+(fav?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+fav+'">'+IC.mark+'<span>'+(fav?'Dans tes favoris':'Ajouter aux favoris')+'</span></button></div></div>'+
   '<section class="chcm"><h2 class="h2">Commentaires sur ce chapitre'+(cc.length?' ('+cc.length+')':'')+'</h2>'+(cc.length?cc.map(cmHtml).join(''):'<p class="muted">Sois le premier à commenter ce chapitre.</p>')+
   '<div class="cm-row"><input class="cm-in" id="chcm-input" maxlength="280" placeholder="Ajouter un commentaire" aria-label="Ajouter un commentaire sur ce chapitre" data-enter="chcomment"><button class="btn sm" data-a="chcomment">Publier</button></div></section>';
  const rp=rprefs();
  return topBack(s.titre,'<button class="iconbtn aa" data-a="read-prefs" aria-label="Taille et police du texte">Aa</button>')+'<div class="rprogbar" aria-hidden="true"><i id="rprog"></i></div><article class="reader" style="--rfs:'+RSIZES[rp.size]+'px;--rff:'+esc(RFONTS[rp.font][1])+'"><h1 class="h1">'+esc(ch.titre)+'</h1><p class="small muted meta">Chapitre '+(ci+1)+' sur '+s.chapitres.length+'</p><p class="rhint">Touche un paragraphe pour réagir <span class="rh-e">'+Object.keys(REACTS).map(k=>'<span class="re" aria-hidden="true">'+REACTS[k].e+'</span>').join(' ')+'</span></p>'+paras+chReact+
  (S.plan==='free'?'<p class="small muted reads-note">Chapitres lus cette semaine : '+S.reads.ids.length+' sur 3, le compteur repart lundi.</p>':'')+'</article>'+dock;
}

/* ===== s'exercer à écrire ===== */
const sortedComps=()=>COMPS.slice().sort((a,b)=>S.profile.scores[a.id]-S.profile.scores[b.id]);
function roleOf(compId){
  if(!hasDiag())return {cls:'',label:'Pour démarrer',rank:-1};
  const s=sortedComps(),i=s.findIndex(c=>c.id===compId);
  if(i===0||i===1)return {cls:'r',label:'À travailler',rank:i};
  if(i===s.length-1)return {cls:'g',label:'Point fort',rank:i};
  return {cls:'',label:'Libre',rank:i};
}
const noteFor=id=>{const m=S.profile.memory.find(x=>x.comp===id);return m?m.note:'';};
function exPri(e){const n=noteFor(e.comp).toLowerCase();return (S.exDone[e.id]?0:2)+(n&&e.tags.some(t=>n.includes(t))?3:0);}
function pickEx(comp,n){
  return EXOS.filter(e=>e.comp===comp.id).map(e=>({e,p:exPri(e)}))
    .sort((a,b)=>b.p-a.p||((S.exDone[a.e.id]?S.exDone[a.e.id].when:0)-(S.exDone[b.e.id]?S.exDone[b.e.id].when:0)))
    .slice(0,n).map(x=>x.e);
}
function program(){
  const s=sortedComps(),out=[];
  pickEx(s[0],2).forEach(e=>out.push(e));
  pickEx(s[1],1).forEach(e=>out.push(e));
  pickEx(s[s.length-1],1).forEach(e=>out.push(e));
  return out;
}
function exCard(e){
  const c=compOf(e.comp),r=roleOf(e.comp),d=S.exDone[e.id];
  return '<button class="exc" data-a="exo-open" data-id="'+e.id+'"><span class="exc-top"><span class="exc-l"><span class="tagc '+r.cls+'">'+r.label+'</span><span class="exc-c">'+esc(c.nom)+'</span></span>'+
    (d?'<span class="tagc g">'+IC.check+'Corrigé, '+d.score+'/100</span>':'<span class="small muted">À faire</span>')+'</span>'+
    '<span class="exc-t">'+esc(e.titre)+'</span><span class="exc-p">'+esc(fr(e.consigne))+'</span><span class="small muted">'+e.min+' min, environ '+e.mots+' mots</span></button>';
}
function vExercices(){
  const s=sortedComps(),weak=s.slice(0,2),strong=s.slice(-2).reverse(),f=UI.exFilter;
  const note=noteFor(weak[0].id)?{c:weak[0],t:noteFor(weak[0].id)}:(S.profile.memory[0]?{c:compOf(S.profile.memory[0].comp),t:S.profile.memory[0].note}:null);
  const list=f==='reco'?program():EXOS.filter(e=>e.comp===f);
  const doneList=f==='reco'?EXOS.filter(e=>S.exDone[e.id]&&!list.includes(e)).sort((a,b)=>S.exDone[b.id].when-S.exDone[a.id].when).slice(0,5):[];
  const chips='<div class="chips" role="group" aria-label="Exercices par compétence"><button class="chip'+(f==='reco'?' on':'')+'" data-a="exf" data-f="reco" aria-pressed="'+(f==='reco')+'">Pour toi</button>'+
    COMPS.map(c=>'<button class="chip'+(f===c.id?' on':'')+'" data-a="exf" data-f="'+c.id+'" aria-pressed="'+(f===c.id)+'">'+esc(c.nom)+'</button>').join('')+'</div>';
  return '<section class="pad"><p class="muted">Des exercices choisis d’après ce que le coach a repéré dans tes textes. Tu écris, il corrige.</p>'+
  (!hasDiag()?'<h2 class="h2">Ton profil d’écriture</h2><p class="muted">Il apparaîtra après ta première analyse par le coach. En attendant, voici des exercices pour démarrer.</p></section>':'<h2 class="h2">Ton profil d’écriture</h2><div class="prof2"><div><h3 class="h3">À travailler</h3><div class="tags">'+weak.map(c=>'<span class="tagc r">'+esc(c.nom)+' <b>'+S.profile.scores[c.id]+'</b></span>').join('')+'</div></div>'+
  '<div><h3 class="h3">Points forts</h3><div class="tags">'+strong.map(c=>'<span class="tagc g">'+esc(c.nom)+' <b>'+S.profile.scores[c.id]+'</b></span>').join('')+'</div></div></div>'+
  (note?'<div class="mem"><p class="hand">'+esc(fr(note.t))+'</p><p class="small muted">Noté par le coach sur '+esc(note.c.nom)+'</p></div>':'')+
  '<p class="small muted">Ces repères viennent des diagnostics du coach et se mettent à jour à chaque correction.</p></section>')+
  '<section class="pad"><h2 class="h2">'+(f==='reco'?(hasDiag()?'Ton programme du moment':'Pour démarrer'):'Exercices de '+esc(compOf(f).nom))+'</h2>'+chips+
  (f==='reco'&&hasDiag()?'<p class="small muted">Deux exercices pour ta compétence la plus basse, un pour la deuxième, un pour consolider ton point fort.</p>':'')+
  '<div>'+list.map(exCard).join('')+'</div></section>'+
  ((f==='reco'&&(S.coachExos||[]).length)?'<section class="pad"><h2 class="h2">Exercices proposés par le coach</h2><div>'+S.coachExos.slice(0,10).map(exCard).join('')+'</div></section>':'')+
  (doneList.length?'<section class="pad"><h2 class="h2">Exercices corrigés</h2><div>'+doneList.map(exCard).join('')+'</div></section>':'');
}
const dailyEx=()=>{const c=todayChallenge();return {id:c.id,comp:c.comp,titre:c.t,min:5,mots:c.mots,tags:[],consigne:c.d,daily:true,xp:c.xp};};
const findEx=id=>EXOS.find(x=>x.id===id)||(S.coachExos||[]).find(x=>x.id===id)||(id===todayChallenge().id?dailyEx():null);
function exWcText(e,t){return pl(wc(t),'mot')+', vise environ '+e.mots+'.';}
function vExercice(p){
  const e=findEx(p.id);if(!e)return topBack('Exercice')+'<p class="empty">Exercice introuvable.</p>';
  const c=compOf(e.comp),r=roleOf(e.comp),sc=S.profile.scores[c.id],d=S.exDone[e.id],n=noteFor(c.id),draft=S.exDraft[e.id]||'';
  const hist=(S.exHist&&S.exHist[e.id])||[];
  const why=e.daily?'Le défi du jour : une courte écriture pour garder le rythme et gagner '+e.xp+' XP.':!hasDiag()&&!e.fromCoach?'Un bon exercice pour démarrer : il donnera au coach de la matière à analyser.':e.fromCoach?'Proposé par le coach après l’analyse de « '+e.source+' », pour travailler '+c.nom+' ('+sc+').':r.rank===0?c.nom+' est ta compétence la plus basse ('+sc+').':(r.rank===1?c.nom+' est ta deuxième compétence la plus basse ('+sc+').':(r.cls==='g'?c.nom+' est ton point fort ('+sc+') : cet exercice te pousse à le consolider.':'Tu es à '+sc+' en '+c.nom+'.'));
  return topBack('Exercice')+'<section class="pad"><div class="exc-l"><span class="tagc '+r.cls+'">'+r.label+'</span><span class="exc-c">'+esc(c.nom)+'</span></div>'+
  '<h1 class="h1">'+esc(e.titre)+'</h1><p class="small muted">'+e.min+' min, environ '+e.mots+' mots</p>'+
  '<div class="why"><p><b>Pourquoi cet exercice</b></p><p>'+esc(why)+'</p>'+(n?'<p class="hand">'+esc(fr(n))+'</p>':'')+'</div>'+
  '<h2 class="h2">Consigne</h2><p class="consigne">'+esc(fr(e.consigne))+'</p>'+
  '<h2 class="h2">Le conseil du coach</h2><p>'+esc(fr(c.methode))+'</p>'+
  '<h2 class="h2">Ton texte</h2><textarea class="ta seyes" data-in="exd" data-id="'+e.id+'" placeholder="Écris ton exercice ici…" spellcheck="true" lang="fr" aria-label="Ton texte pour l’exercice">'+esc(draft)+'</textarea>'+
  '<p class="small muted" id="exwc" style="margin-top:8px">'+esc(exWcText(e,draft))+'</p>'+
  (d?'<div class="note"><b>Dernière correction : '+d.score+'/100.</b> '+esc(fr(d.app))+(hist.length>1?'<br><span class="small">Tes '+hist.length+' corrections : '+hist.map(h=>h.score).join(' → ')+'</span>':'')+'<br><span class="small">Tu peux réécrire ton texte et le faire corriger à nouveau, autant de fois que tu veux.</span></div>':'')+
  (e.daily?(S.challenge.d===e.id&&S.challenge.state==='done'?'<p class="ok-line">'+IX.check+'Défi relevé aujourd’hui</p>':'<div class="btns"><button class="btn block" data-a="dc-done" data-id="'+e.id+'">'+IX.check+'Valider mon défi (+'+e.xp+' XP)</button></div>'):'')+
  '<div class="btns"><button class="btn block'+(e.daily?' sec':'')+'" data-a="exd-run" data-id="'+e.id+'">'+IC.cap+(d?'Faire corriger à nouveau':'Faire corriger par le coach')+' ('+cr(COST.exercise)+')'+'</button></div>'+
  '<p class="small muted credit-note">Chaque correction coûte '+cr(COST.exercise)+'. Il te reste '+cr(budgetLeft())+' ce mois-ci'+(S.plan==='free'?' (crédits offerts). Avec Plume +, tu en as '+PLANS.plus.budget+' par mois':', tu peux te faire corriger autant de fois que tu veux tant qu’il t’en reste')+'.</p></section>';
}






function vAccount(){
  const u=S.user;
  if(!u)return topBack('Espace client')+'<section class="pad"><p class="empty">Tu n’es pas connecté.</p><button class="btn block" data-a="login-go">Se connecter</button></section>';
  const pl_=PLANS[S.plan],budget=pl_.budget,used=S.credits.used,pct=budget?Math.min(100,used/budget*100):0;
  return topBack('Espace client')+'<section class="pad acc-head">'+avatar(u.name,64)+'<div><h1 class="h1" style="margin:0">'+esc(u.name)+'</h1><p class="muted">'+esc(u.email)+'</p><p class="small muted">Connexion : '+esc(u.mode)+'</p></div></section>'+
  '<section class="pad"><h2 class="h2">Abonnement</h2><div class="panel"><div class="split"><b>'+esc(pl_.nom)+'</b><span>'+esc(pl_.prixTxt)+'</span></div><p class="small muted">'+(S.plan==='free'?'Lecture limitée à 3 chapitres par semaine, 1 histoire publiée et 3 crédits de coach par mois.':'Lecture et publication illimitées.')+'</p><button class="btn sec block" data-a="plans-open">Voir les forfaits</button></div></section>'+
  '<section class="pad"><h2 class="h2">Budget du coach IA</h2><div class="panel">'+(budget
    ?'<div class="split"><b>'+cr(Math.max(0,budget-used))+' restants</b><span class="small muted">sur '+fmt(budget)+'</span></div><div class="bar'+(pct>90?' hot':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+budget+'" aria-valuenow="'+Math.min(used,budget)+'"><i style="width:'+pct+'%"></i></div><p class="small muted" style="margin-top:10px">'+cr(used)+' utilisés ce mois-ci. Tes crédits reviennent le '+resetLabel()+'.</p><p class="small muted" style="margin-top:6px">'+CREDIT_HELP+'</p>'
    :'<p class="small muted">Le forfait Gratuit ne comprend pas de diagnostic personnalisé. Plume + offre 50 crédits par mois, Plume ++ en offre 200. '+CREDIT_HELP+'</p>')+'</div></section>'+
  '<section class="pad"><h2 class="h2">Achats et données</h2><button class="rowitem" data-a="restore"><span>Restaurer les achats Google Play<small>Relit tes abonnements depuis Google Play.</small></span>'+IC.next+'</button>'+
'</section>'+
  '<section class="pad"><button class="btn danger block" data-a="logout">Se déconnecter</button></section>'+
  '<section class="pad"><h2 class="h2">Zone sensible</h2><button class="btn danger-o block" data-a="delete-open">Supprimer mon compte</button><p class="small muted" style="margin-top:8px">Efface définitivement ton compte, tes histoires publiées, tes commentaires et ta progression.</p></section>';
}

function vPlans(){
  const sel=UI.planSel||S.plan;
  const cards=['free','plus','pp'].map(id=>{
    const p=PLANS[id];
    return '<div class="plan" role="radio" tabindex="0" aria-checked="'+(sel===id)+'" data-a="plan-pick" data-id="'+id+'"><span class="radio" aria-hidden="true"></span><div class="pl-main"><div class="pl-top"><span class="pl-name">'+esc(p.nom)+'</span><span class="pl-price">'+esc(p.prixTxt)+'</span></div><ul>'+p.points.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(S.plan===id?'<span class="tag">Forfait actuel</span>':'')+'</div></div>';
  }).join('');
  const label=sel===S.plan?'Forfait actuel':(sel==='free'?'Forfait Gratuit':'Paiement bientôt disponible');
  return topBack('Forfaits')+'<section class="pad"><h1 class="h1">Choisis ton forfait</h1><p class="muted">Dès Plume +, la lecture et la publication restent illimitées, même quand ton budget de coach est épuisé.</p>'+
  '<div class="note or">Le paiement en ligne arrive bientôt. En attendant, tout le monde commence avec le forfait Gratuit.</div>'+
  '<div class="plans" role="radiogroup" aria-label="Forfaits">'+cards+'</div><div class="btns"><button class="btn block" data-a="plan-go" disabled'+'>'+esc(label)+'</button></div>'+
  '<p class="small muted" style="margin-top:12px">Le compteur de lecture gratuit repart chaque lundi. Le budget de coach IA repart le 1er de chaque mois.</p></section>';
}

function vLogin(){
  const L=UI.login,dis=L.busy?' disabled':'',up=L.mode!=='signin';
  return topBack('Connexion')+'<section class="pad login"><div class="brand big">'+LOGO+'<span>Plume</span></div><h1 class="h1">'+(up?'Crée ton espace client':'Content de te revoir')+'</h1><p class="muted">Retrouve ton abonnement, ton budget de coach et tes manuscrits.</p>'+
  (up?'<label class="field"><span>Prénom</span><input id="lg-name" data-in="lg-name" data-enter="login-submit" autocomplete="given-name" value="'+esc(L.name)+'"'+dis+'></label>':'')+
  '<label class="field"><span>Adresse e-mail</span><input id="lg-mail" type="email" inputmode="email" autocomplete="email" data-in="lg-mail" data-enter="login-submit" value="'+esc(L.email)+'"'+dis+'></label>'+
  '<label class="field"><span>Mot de passe</span><input id="lg-pass" type="password" autocomplete="'+(up?'new-password':'current-password')+'" data-in="lg-pass" data-enter="login-submit" value="'+esc(L.pass)+'"'+dis+'></label>'+
  '<button class="btn block" data-a="login-submit"'+dis+'>'+(L.busy?'Connexion en cours…':(up?'Créer mon compte':'Se connecter'))+'</button>'+
  (up?'':'<button class="link center" data-a="pw-forgot"'+dis+'>Mot de passe oublié ?</button>')+
  '<button class="btn ghost block" data-a="login-mode"'+dis+'>'+(up?'J’ai déjà un compte':'Créer un compte')+'</button>'+
  '<button class="btn ghost block" data-a="back"'+dis+'>Continuer en mode découverte</button>'+
  '<p class="small muted">'+(up?'Au moins 6 caractères pour le mot de passe. ':'')+'Tes manuscrits et ta progression sont sauvegardés sur ton compte.</p></section>';
}

/* ===== feuilles ===== */
const closeBtn='<button class="iconbtn" data-a="sheet-close" aria-label="Fermer">'+IC.x+'</button>';
const TEND={hausse:['en hausse',IC.up],stable:['stable',IC.flat],baisse:['en baisse',IC.down]};
const REPORT_REASONS=[['sexuel','Contenu sexuel ou inapproprié'],['violence','Violence ou haine'],['harcelement','Harcèlement'],['spam','Spam ou publicité'],['plagiat','Plagiat ou droit d’auteur'],['autre','Autre']];
const SHEET_LABEL={versions:'Versions du chapitre',report:'Signaler',delete:'Supprimer mon compte',objectifs:'Objectifs de la semaine',sprint:'Sprint d’écriture',bio:'Ta présentation',paywall:'Réservé aux abonnements',budget:'Crédits du coach IA',lecture:'Affichage du texte',coach:'Coach d’écriture',confirm:'Confirmation'};
function coachGlobalResult(C){
  const r=C.res,prio=compOf(r.priorite),pi=r.items.find(i=>i.id===r.priorite);
  const rows=r.items.map(i=>{
    const c=compOf(i.id),t=TEND[i.tendance],star=i.id===r.priorite;
    return '<details class="cd"'+(star?' open':'')+'><summary><span class="chev">'+IC.next+'</span><span class="cn">'+esc(c.nom)+(star?'<em class="prio">Priorité</em>':'')+'</span><span class="cs">'+i.score+'</span><span class="bar" aria-hidden="true"><i style="width:'+i.score+'%"></i></span></summary><div class="cb">'+
      (i.diagnostic?'<p>'+esc(fr(i.diagnostic))+'</p>':'')+
      (i.force?'<p class="g"><b>Ce qui fonctionne.</b> '+esc(fr(i.force))+'</p>':'')+
      (i.attention?'<p class="r"><b>À travailler.</b> '+esc(fr(i.attention))+'</p>':'')+
      (i.exercice?'<p><b>Exercice.</b> '+esc(fr(i.exercice))+'</p>'+'<button class="btn sm cx-go" data-a="cx-start" data-id="'+i.id+'">'+IC.pen+'Faire cet exercice</button>':'')+
      '<p class="small muted">'+(C.olds[i.id]?'Ton score passe de '+C.olds[i.id]+' à '+S.profile.scores[i.id]+', tendance '+t[0]+'.':'Ton premier score : '+S.profile.scores[i.id]+'.')+'</p></div></details>';
  }).join('');
  return '<div class="sheet-head"><h2 class="h2">Copie corrigée, analyse globale</h2>'+closeBtn+'</div>'+
  '<div class="paper seyes"><div class="pp-head"><div class="stamp"><svg viewBox="0 0 96 96" aria-hidden="true"><path d="M48 6C72 5 91 24 90 49c-1 24-20 42-44 41C22 89 5 70 6 46 7 23 26 7 50 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span class="n">'+r.score+'</span><span class="d">sur 100</span></div><div><p class="hand ap">'+esc(fr(r.appreciation||'Analyse globale terminée.'))+'</p><span class="tend">Moyenne des '+r.items.length+' compétences</span></div></div>'+
  (r.synthese?'<h3>Synthèse</h3><p>'+esc(fr(r.synthese))+'</p>':'')+
  (pi?'<h3 class="r">À travailler en priorité</h3><p class="att"><b>'+esc(prio.nom)+'.</b> '+esc(fr(pi.attention||pi.diagnostic))+'</p>':'')+'</div>'+
  '<h3 class="h3 gtitle">Détail par compétence</h3><div>'+rows+'</div>'+
  '<p class="small muted" style="margin-top:14px">'+(C.note?esc(C.note)+' ':'')+'Tes scores sont mis à jour pour les '+r.items.length+' compétences analysées. Analyse ajoutée à ton profil.'+(C.src==='ia'?' Cette analyse a utilisé '+cr(C.tokens)+', il t’en reste '+budgetLeft()+' ce mois-ci.':' Aucun crédit utilisé.')+'</p>'+
  '<div class="btns"><button class="btn" data-a="coach-progress">Voir ma progression</button><button class="btn sec" data-a="sheet-close">Fermer</button></div>';
}
const SHEETS={
 paywall:p=>{
  const T={
   coach:['Le coach est réservé aux abonnements','Le diagnostic personnalisé analyse ton propre texte. Il est inclus dans Plume + et Plume ++. Les cours de l’école d’écriture restent gratuits.'],
   publish:['Une seule histoire publiée en gratuit','Plume + et Plume ++ te permettent de publier autant d’histoires que tu veux.'],
   read:['Tes 3 chapitres de la semaine sont lus','Le compteur gratuit repart lundi. Avec Plume +, la lecture est illimitée.']}[p.why];
  return '<div class="sheet-head"><h2 class="h2">'+T[0]+'</h2>'+closeBtn+'</div><p>'+T[1]+'</p><div class="btns"><button class="btn" data-a="to-plans">Voir les forfaits</button><button class="btn sec" data-a="sheet-close">Plus tard</button></div>';
 },
 budget:()=>'<div class="sheet-head"><h2 class="h2">Plus de crédits ce mois-ci</h2>'+closeBtn+'</div><p>Tu as utilisé tes '+cr(PLANS[S.plan].budget)+' de ce mois-ci. Ils reviennent le '+resetLabel()+'. La lecture et la publication restent disponibles.</p>'+(S.plan==='free'?'<p>Avec Plume +, tu as '+cr(PLANS.plus.budget)+' de coach chaque mois pour analyser tes chapitres et t’entraîner autant que tu veux.</p>':'')+'<div class="btns">'+(S.plan==='free'?'<button class="btn" data-a="to-plans">Découvrir Plume +</button>':'')+(S.plan==='plus'?'<button class="btn" data-a="upgrade">Passer à Plume ++</button>':'')+'<button class="btn sec" data-a="sheet-close">Fermer</button></div>',
 lecture:()=>{
  const rp=rprefs();
  return '<div class="sheet-head"><h2 class="h2">Affichage du texte</h2>'+closeBtn+'</div>'+
  '<h3 class="h3">Thème</h3><div class="seg" role="group" aria-label="Thème">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(t=>'<button data-a="theme" data-v="'+t[0]+'" aria-pressed="'+(S.theme===t[0])+'">'+t[1]+'</button>').join('')+'</div>'+
  '<h3 class="h3" style="margin-top:16px">Taille</h3><div class="rsize"><button class="btn sec" data-a="rsize" data-d="-1" aria-label="Plus petit"'+(rp.size===0?' disabled':'')+'><span style="font-size:14px">A</span></button>'+
  '<div class="rdots" aria-hidden="true">'+RSIZES.map((x,i)=>'<i class="'+(i<=rp.size?'on':'')+'"></i>').join('')+'</div>'+
  '<button class="btn sec" data-a="rsize" data-d="1" aria-label="Plus grand"'+(rp.size===RSIZES.length-1?' disabled':'')+'><span style="font-size:22px">A</span></button></div>'+
  '<h3 class="h3" style="margin-top:16px">Police</h3><div class="rfonts" role="radiogroup" aria-label="Police">'+Object.keys(RFONTS).map(k=>'<button class="rfont'+(rp.font===k?' on':'')+'" role="radio" aria-checked="'+(rp.font===k)+'" data-a="rfont" data-f="'+k+'" style="font-family:'+esc(RFONTS[k][1])+'"><b>'+RFONTS[k][0]+'</b><span>Il était une fois, au bord de la mer…</span></button>').join('')+'</div>'+
  '<div class="btns"><button class="btn block" data-a="sheet-close">OK</button></div>';
 },
 objectifs:()=>{
  ensureDay();
  return '<div class="sheet-head"><h2 class="h2">Objectifs de la semaine</h2>'+closeBtn+'</div>'+
  '<p class="muted">Régularité : <b>'+pl(streakNow(),'jour')+'</b> d’affilée. Chaque jour où tu écris, relèves un défi ou travailles un atelier la prolonge.</p>'+
  '<div class="card rows" style="margin-top:12px">'+OBJ.map(o=>'<div class="rowitem"><span class="chk-i'+(o[2]()?' ok':'')+'">'+(o[2]()?IX.check:'')+'</span><b>'+o[1]+'</b><span class="cnt">'+o[3]()+'</span></div>').join('')+'</div>'+
  '<div class="btns"><button class="btn block" data-a="sheet-close">OK</button></div>';
 },
 sprint:()=>{
  const sp=UI.sprint;
  if(sp)return '<div class="sheet-head"><h2 class="h2">Sprint d’écriture</h2>'+closeBtn+'</div><div class="sprint-run"><b id="sp-time" class="sp-time">'+fmtT(Math.max(0,Math.ceil((sp.end-Date.now())/1000)))+'</b><p class="muted">Écris sans te relire. Tu peux fermer cette fenêtre : le sprint continue et te le dira à la fin.</p></div><div class="btns"><button class="btn sec block" data-a="sprint-stop">Arrêter le sprint</button></div>';
  return '<div class="sheet-head"><h2 class="h2">Sprint d’écriture</h2>'+closeBtn+'</div><p class="muted">Un minuteur pour écrire sans t’arrêter. À la fin, tu gagnes des XP et ta régularité avance.</p>'+
  '<div class="sprint-opts">'+[5,10,15,25].map(m=>'<button class="card sp-opt" data-a="sprint-start" data-m="'+m+'"><b>'+m+' min</b><span class="small muted">+'+(m*3)+' XP</span></button>').join('')+'</div>';
 },
 bio:()=>'<div class="sheet-head"><h2 class="h2">Ta présentation</h2>'+closeBtn+'</div><p class="muted">Une ou deux phrases qui disent quelle autrice ou quel auteur tu es.</p><textarea id="bio-in" class="ta" maxlength="160" placeholder="J’écris des histoires où…" aria-label="Ta présentation">'+esc(S.bio||'')+'</textarea><div class="btns"><button class="btn block" data-a="bio-save">Enregistrer</button></div>',
 versions:()=>{
  const V=UI.vs||{},m=getMs(V.msId),c=m&&m.chapitres[V.ch];
  const head='<div class="sheet-head"><h2 class="h2">Versions du chapitre</h2>'+closeBtn+'</div>';
  if(!c)return head+'<p>Chapitre introuvable.</p>';
  if(V.loading)return head+'<p class="muted">Chargement de l’historique…</p>';
  if(V.view!=null){
    const sn=V.list[V.view];if(!sn)return head;
    const d=diffText(sn.texte,c.texte||'');
    return head+'<p class="small muted">'+esc(fmtWhen(sn.t))+' · '+pl(sn.mots,'mot')+' · '+esc(VWHY[sn.why]||sn.why)+'</p>'+(d?'<p class="dsum"><ins>+'+d.add+' mots ajoutés</ins> · <del>−'+d.del+' mots supprimés</del> · '+d.keep+' % de cette version conservé</p><div class="diff">'+d.html+'</div>':'<p class="muted">Texte trop long pour une comparaison mot à mot.</p>')+'<div class="btns"><button class="btn" data-a="v-restore" data-i="'+V.view+'">Restaurer cette version</button><button class="btn sec" data-a="v-list">Retour</button></div>';
  }
  const rows=V.list.map((sn,i)=>{const dm=wc(c.texte||'')-sn.mots;return '<div class="vrow"><div><b>'+esc(fmtWhen(sn.t))+'</b><span class="small muted">'+pl(sn.mots,'mot')+' · '+esc(VWHY[sn.why]||sn.why)+(dm?' · texte actuel : '+(dm>0?'+':'−')+Math.abs(dm)+' mots':'')+'</span></div><button class="btn sm sec" data-a="v-view" data-i="'+i+'">Comparer</button></div>';}).join('');
  return head+'<p class="small muted">Plume garde jusqu’à '+(SESSION?12:5)+' versions de ce chapitre : une avant chaque analyse du coach, une de temps en temps pendant que tu écris, et celles que tu enregistres.'+(SESSION?'':' Connecte-toi pour les retrouver sur tous tes appareils.')+'</p>'+(rows||'<p class="empty">Aucune version enregistrée pour l’instant.</p>')+'<div class="btns"><button class="btn block" data-a="v-save">'+IX.history+'Enregistrer une version maintenant</button></div>';
 },
 libadd:p=>{
  const s=findStory(p.id),st=libStatus(p.id);if(!s)return '<p>Histoire introuvable.</p>';
  return '<div class="sheet-head"><h2 class="h2">Ma bibliothèque</h2>'+closeBtn+'</div><p class="small muted">'+esc(s.titre)+'</p>'+
   '<div class="reasons" role="radiogroup" aria-label="Statut de lecture">'+['toread','reading','done'].map(k=>'<button class="reason'+(st===k?' on':'')+'" role="radio" aria-checked="'+(st===k)+'" data-a="lib-set" data-id="'+s.id+'" data-st="'+k+'">'+LIBLABEL[k]+'</button>').join('')+(st?'<button class="reason" data-a="lib-set" data-id="'+s.id+'" data-st="">Retirer de ma bibliothèque</button>':'')+'</div>'+
   '<h3 class="h3">Mes dossiers</h3><div class="reasons">'+S.lib.lists.map(l=>{const on=l.ids.includes(s.id);return '<button class="reason'+(on?' on':'')+'" role="checkbox" aria-checked="'+on+'" data-a="list-toggle" data-l="'+l.id+'" data-id="'+s.id+'">'+esc(l.nom)+' <span class="small muted">('+l.ids.length+')</span></button>';}).join('')+'</div>'+
   '<div class="cm-row"><input class="cm-in" id="list-name" maxlength="40" placeholder="Nouveau dossier" aria-label="Nom du nouveau dossier" data-enter="list-new" data-id="'+s.id+'"><button class="btn sm" data-a="list-new" data-id="'+s.id+'">Créer</button></div>';
 },
 report:p=>{
  const sel=p.reason;
  return '<div class="sheet-head"><h2 class="h2">Signaler</h2>'+closeBtn+'</div><p class="small muted">Dis-nous ce qui ne va pas. Quand trois personnes différentes signalent un même contenu, il est masqué en attendant une vérification.</p>'+
   '<div class="reasons" role="radiogroup" aria-label="Motif du signalement">'+REPORT_REASONS.map(r=>'<button class="reason'+(sel===r[0]?' on':'')+'" role="radio" aria-checked="'+(sel===r[0])+'" data-a="report-reason" data-r="'+r[0]+'">'+esc(r[1])+'</button>').join('')+'</div>'+
   '<textarea class="ta" data-in="rep-details" maxlength="500" placeholder="Précisions (facultatif)" aria-label="Précisions">'+esc(UI.repDetails||'')+'</textarea>'+
   '<div class="btns"><button class="btn" data-a="report-send"'+(sel?'':' disabled')+'>Envoyer le signalement</button>'+(p.uid?'<button class="btn sec" data-a="block-user" data-uid="'+esc(p.uid)+'" data-name="'+esc(p.name||'')+'">'+IX.ban+'Bloquer '+esc(p.name||'cet utilisateur')+'</button>':'')+'</div>';
 },
 delete:()=>'<div class="sheet-head"><h2 class="h2">Supprimer mon compte</h2>'+closeBtn+'</div><p>Cette action est <b>définitive</b>. Elle efface ton compte, tes histoires publiées, tes commentaires, tes favoris et toute ta progression, sur tous tes appareils.</p><label class="field"><span>Pour confirmer, écris SUPPRIMER</span><input id="del-confirm" data-in="del-confirm" autocomplete="off" autocapitalize="characters"></label><div class="btns"><button class="btn danger" id="del-yes" data-a="delete-yes" disabled>Supprimer définitivement</button><button class="btn sec" data-a="sheet-close">Annuler</button></div>',
 confirm:p=>{
  const T=p.kind==='dellist'?['Supprimer ce dossier ?','Le dossier « '+p.nom+' » sera supprimé. Les histoires restent dans ta bibliothèque.','Supprimer']:p.kind==='logout'
   ?['Se déconnecter ?','Tes manuscrits et ta progression sont sauvegardés sur ton compte. Tu les retrouveras en te reconnectant.','Se déconnecter']
   :['Réinitialiser la démo ?','Tes manuscrits, ta progression et tes réglages locaux reviennent aux données de démonstration.','Réinitialiser'];
  return '<h2 class="h2">'+T[0]+'</h2><p>'+T[1]+'</p><div class="btns"><button class="btn danger" data-a="confirm-yes" data-k="'+p.kind+'"'+(p.l?' data-l="'+esc(p.l)+'"':'')+'>'+T[2]+'</button><button class="btn sec" data-a="sheet-close">Annuler</button></div>';
 },
 coach:()=>{
  const C=UI.coach,comp=compOf(C.compId),w=weakest();
  if(C.phase==='loading')return '<div class="loading"><div class="pen"></div><p class="hand">Le coach lit ton texte…</p>'+(C.mode==='global'?'<p class="small muted" style="margin:-8px 0 18px">Sept compétences à passer en revue : cela peut prendre une minute.</p>':'')+'<button class="btn sec" data-a="coach-stop">Arrêter</button></div>';
  if(C.phase==='error'){
    const bud=C.errKind==='budget';
    return '<div class="sheet-head"><h2 class="h2">'+(bud?'Budget insuffisant':'Analyse interrompue')+'</h2>'+closeBtn+'</div><p>'+esc(C.err)+'</p><div class="btns">'+(bud
      ?'<button class="btn" data-a="coach-back">Choisir une compétence</button>'+(S.plan==='plus'?'<button class="btn sec" data-a="upgrade">Voir Plume ++</button>':'<button class="btn sec" data-a="sheet-close">Fermer</button>')
      :'<button class="btn" data-a="coach-retry">Réessayer</button><button class="btn sec" data-a="coach-local">Analyse locale simplifiée</button>')+'</div>';
  }
  if(C.phase==='result'&&C.mode==='global')return coachGlobalResult(C);
  if(C.phase==='result'){
    const r=C.res,t=TEND[r.tendance];
    return '<div class="sheet-head"><h2 class="h2">Copie corrigée, '+esc(comp.nom)+'</h2>'+closeBtn+'</div>'+
    '<div class="paper seyes"><div class="pp-head"><div class="stamp"><svg viewBox="0 0 96 96" aria-hidden="true"><path d="M48 6C72 5 91 24 90 49c-1 24-20 42-44 41C22 89 5 70 6 46 7 23 26 7 50 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span class="n">'+r.score+'</span><span class="d">sur 100</span></div><div><p class="hand ap">'+esc(fr(r.appreciation||'Diagnostic terminé.'))+'</p><span class="tend '+r.tendance+'">'+t[1]+esc(t[0])+'</span></div></div>'+
    (r.diagnostic?'<h3>Diagnostic</h3><p>'+esc(fr(r.diagnostic))+'</p>':'')+
    (r.forces.length?'<h3 class="g">Ce qui fonctionne</h3><ul class="g">'+r.forces.map(f=>'<li>'+esc(fr(f))+'</li>').join('')+'</ul>':'')+
    (r.attention?'<h3 class="r">Point d’attention</h3><p class="att">'+esc(fr(r.attention))+'</p>':'')+
    (r.questions.length?'<h3>Questions à te poser</h3><ul>'+r.questions.map(q=>'<li>'+esc(fr(q))+'</li>').join('')+'</ul>':'')+
    (r.exercice?'<h3>Exercice</h3><p>'+esc(fr(r.exercice))+'</p>'+'<button class="btn sm cx-go" data-a="cx-start" data-id="'+comp.id+'">'+IC.pen+'Faire cet exercice</button>':'')+
    (r.lecon?'<h3>Leçon</h3><p>'+esc(fr(r.lecon))+'</p>':'')+
    (r.memoire?'<h3>Ce que le coach retient</h3><p class="hand">'+esc(fr(r.memoire))+'</p>':'')+'</div>'+
    '<p class="small muted">'+(C.note?esc(C.note)+' ':'')+(C.oldScore?'Ton score en '+esc(comp.nom)+' passe de '+C.oldScore+' à '+C.newScore+'.':'Ton premier score en '+esc(comp.nom)+' : '+C.newScore+'.')+' Diagnostic ajouté à ton profil.'+(C.src==='ia'?' Cette analyse a utilisé '+cr(C.tokens)+', il t’en reste '+budgetLeft()+' ce mois-ci.':' Aucun crédit utilisé.')+'</p>'+
    (C.exId?'<div class="btns"><button class="btn" data-a="sheet-close">'+IC.pen+'Retravailler mon texte</button><button class="btn sec" data-a="coach-progress">Voir ma progression</button></div>'
      :'<div class="btns"><button class="btn" data-a="coach-progress">Voir ma progression</button><button class="btn sec" data-a="sheet-close">Fermer</button></div>');
  }
  const ai=HAS_AI===true?'Analyse par le coach IA.':(HAS_AI===false?'Le coach IA n’est pas disponible pour le moment : une analyse locale simplifiée sera utilisée.':'Connexion au coach IA…');
  return '<div class="sheet-head"><h2 class="h2">Coach d’écriture</h2>'+closeBtn+'</div>'+
  '<p class="muted">Le coach lit « '+esc(C.title)+' », t’explique ce qui marche et ce qui manque, puis te propose un exercice. Il n’écrit jamais la suite à ta place.</p>'+
  '<h3 class="h3" style="margin-top:16px">Compétence à analyser</h3><div class="chips wrap">'+COMPS.map(c=>'<button class="chip'+(C.compId===c.id?' on':'')+'" data-a="coach-comp" data-id="'+c.id+'" aria-pressed="'+(C.compId===c.id)+'">'+esc(c.nom)+'</button>').join('')+'</div>'+
  (hasDiag()?'<p class="small muted">Suggestion : '+esc(w.nom)+', ta compétence la plus basse ('+S.profile.scores[w.id]+').</p>':'<p class="small muted">Choisis la compétence que tu veux travailler en premier.</p>')+
  '<p class="budget-line">Il te reste '+cr(budgetLeft())+' ce mois-ci. '+esc(ai)+'</p>'+
  '<button class="btn block" data-a="coach-run">Analyser '+esc(comp.nom)+' ('+cr(C.exId?COST.exercise:COST.single)+')</button>'+
  (C.fixed?'':'<div class="or-sep"><span>ou</span></div><button class="btn sec block" data-a="coach-global">'+IC.cap+'Analyser les 7 compétences ('+cr(COST.global)+')</button><p class="small muted" style="margin-top:8px">Analyse globale : une seule lecture, un diagnostic pour chaque compétence. Plus complète et plus longue.</p>');
 }
};
let sheetScroll=0;
function openSheet(name,p){UI.sheet={name:name,p:p||{}};renderSheet();}
function closeSheet(){
  if(UI.coach&&UI.coach.ctl&&UI.coach.phase==='loading'){try{UI.coach.ctl.abort();}catch(e){}}
  UI.sheet=null;renderSheet();
}
function renderSheet(){
  const root=$('#sheet');
  if(!UI.sheet){root.hidden=true;root.innerHTML='';return;}
  const s=UI.sheet;root.hidden=false;
  root.innerHTML='<div class="scrim'+(s.name==='confirm'?' mid':'')+'"><div class="sheet'+(s.name==='confirm'?' modal':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(SHEET_LABEL[s.name])+'" tabindex="-1">'+SHEETS[s.name](s.p)+'</div></div>';
  const sh=root.querySelector('.sheet');if(sh&&sh.focus)sh.focus({preventScroll:true});
}

/* ===== rendu principal ===== */

const TABS=[['decouvrir','Découvrir',IX.home],['catalogue','Catalogue',IX.search],['biblio','Ma biblio',IX.lib],['ecrire','Écrire',IX.feather],['exercer','S’exercer',IX.cap],['profil','Profil',IX.user]];
const SCREENS={'tab:catalogue':vCatalogue,'tab:biblio':vBiblio,talents:vTalents,notifs:vNotifs,genres:vGenres,stats:vStats,blocked:vBlocked,newpass:vNewPass,saved:vSaved,following:vFollowing,exlib:vExLib,boussole:vBoussole,lesson:vLesson,publish:vPublish,'tab:decouvrir':vDecouvrir,'tab:ecrire':vEcrire,'tab:exercer':vProgression,'tab:profil':vProfil,story:vStory,reader:vReader,editor:vEditor,atelier:vAtelier,exercice:vExercice,account:vAccount,plans:vPlans,login:vLogin};
let lastKey='';
function autosize(el){
  if(!el)return;
  // On garde la position de défilement : le recalcul de hauteur ne doit jamais faire sauter la page.
  const v=$('#view'),st=v?v.scrollTop:0;
  el.style.height='auto';
  const min=parseInt(getComputedStyle(el).minHeight,10)||0;
  el.style.height=Math.max(min,el.scrollHeight+(el.id==='ms-text'?64:0))+'px';
  if(v&&v.scrollTop!==st)v.scrollTop=st;
}
function updateWc(){
  const el=$('#wc');if(!el||!UI.stack.length||UI.stack[UI.stack.length-1].name!=='editor')return;
  const m=curMs();if(m){const w=wc(curCh().texte);el.textContent=pl(w,'mot');const b=$('#wcbar');if(b)b.style.width=Math.min(100,w/S.prefs.goal*100)+'%';}
}
function render(){
  const c=UI.stack.length?UI.stack[UI.stack.length-1]:{name:'tab:'+UI.tab,p:{}};
  const key=c.name+JSON.stringify(c.p),v=$('#view'),st=key===lastKey?v.scrollTop:0;
  let html;
  try{html=SCREENS[c.name](c.p);}catch(e){console.error(e);html='<p class="empty">Cet écran n’a pas pu s’afficher.</p>';}
  v.innerHTML=html;v.scrollTop=st;lastKey=key;
  $('#tabs').hidden=UI.stack.length>0;
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-current',(!UI.stack.length&&b.dataset.t===UI.tab)?'page':'false'));
  document.querySelectorAll('.ta,.autog').forEach(autosize);
}
function go(name,p){UI.stack.push({name:name,p:p||{}});render();}
function setTab(t){UI.tab=t;UI.stack=[];render();if(t==='decouvrir'||t==='catalogue'||t==='biblio'||t==='profil')refreshCounts();}
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),3200);}
const isDark=()=>S.theme==='dark'||(S.theme!=='light'&&!!window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
// L'icône de l'onglet suit le thème : version claire (carré prune) ou sombre (image d'origine avec sa marge claire).
function syncIcons(){
  const d=isDark(),v='?v=3',pre=d?'/favicon-dark':'/favicon';
  const set=(id,href)=>{const l=document.getElementById(id);if(l&&l.getAttribute('href')!==href)l.setAttribute('href',href);};
  set('ic-ico',pre+'.ico'+v);set('ic-32',(d?'/favicon-dark-32':'/favicon-32')+'.png'+v);set('ic-48',(d?'/favicon-dark-48':'/favicon-48')+'.png'+v);
}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(S.theme==='auto')syncIcons();});}catch(e){}
function applyTheme(){const r=document.documentElement;if(S.theme==='light'||S.theme==='dark')r.setAttribute('data-theme',S.theme);else r.removeAttribute('data-theme');syncIcons();}

/* ===== actions ===== */

A.tab=d=>setTab(d.t);
A.back=()=>{const t=UI.stack[UI.stack.length-1];if(t&&t.name==='genres'){S.genresAsked=true;UI.gsel=null;save();}UI.stack.pop();UI.reader={sel:null};render();};
A.genre=d=>{UI.cgenre=d.g;setTab('catalogue');};
A.cgenre=d=>{UI.cgenre=d.g;render();};
A.csort=d=>{UI.csort=d.v;render();};
A.story=d=>{go('story',{id:d.id});refreshCounts();};
A.follow=d=>{
  if(!SESSION)return needLogin('Connecte-toi pour suivre un auteur.');
  const i=S.following.indexOf(d.id),on=i<0;
  if(on){S.following.push(d.id);const a=authorsAll().find(x=>x.id===d.id);toast('Tu suis '+(a?a.nom:'cet auteur')+'.');}else S.following.splice(i,1);
  mutSeq++;bump(FOLL,d.id,on?1:-1);B.setFollow(SESSION.user.id,d.id,on);save();render();
};
A.save=d=>{const i=S.saved.indexOf(d.id),on=i<0;if(on){S.saved.push(d.id);toast('Histoire ajoutée à tes favoris.');}else S.saved.splice(i,1);
  if(SESSION){mutSeq++;bump(FAVS,d.id,on?1:-1);B.setFavorite(SESSION.user.id,d.id,on);}save();render();};
A.read=d=>{
  const s=findStory(d.id);if(!s)return;
  const ci=+d.ch,key=s.id+':'+ci;rollover();
  if(S.plan==='free'&&!S.reads.ids.includes(key)){
    if(S.reads.ids.length>=3)return openSheet('paywall',{why:'read'});
    S.reads.ids.push(key);save();
  }
  S.lib.pos[s.id]={ch:ci,f:+d.f||0,t:Date.now()};if(S.lib.status[s.id]!=='done')S.lib.status[s.id]='reading';save();
  if(!S.readSeen[key]){S.readSeen[key]=1;ensureDay();S.week.reads++;activity();S.xp=(S.xp||0)+5;}
  UI.reader={sel:null};
  const top=UI.stack[UI.stack.length-1];
  if(top&&top.name==='reader'){top.p={id:s.id,ch:ci};render();}else go('reader',{id:s.id,ch:ci});
  if(SESSION)B.markRead(SESSION.user.id,s.id,ci).then(()=>refreshCounts(true));
  loadStats(s,ci);
  const vw=$('#view');vw.scrollTop=0;
  if(+d.f>0){const f=+d.f;requestAnimationFrame(()=>{const mx=vw.scrollHeight-vw.clientHeight;vw.scrollTop=f*mx;});}
};
let posT=0;
function onReaderScroll(){
  const top=UI.stack.length?UI.stack[UI.stack.length-1]:null;if(!top||top.name!=='reader')return;
  const v=$('#view'),mx=v.scrollHeight-v.clientHeight;if(mx<=0)return;
  const f=clamp(v.scrollTop/mx,0,1),bar=$('#rprog');if(bar)bar.style.width=Math.round(f*100)+'%';
  const s=findStory(top.p.id);if(!s)return;
  const rec=S.lib.pos[s.id]||(S.lib.pos[s.id]={ch:top.p.ch,f:0,t:0});
  rec.ch=top.p.ch;rec.f=f;
  if(top.p.ch===s.chapitres.length-1&&f>0.97&&S.lib.status[s.id]!=='done'){S.lib.status[s.id]='done';save();toast('Histoire terminée : elle est dans « Terminés ».');}
  const now=Date.now();if(now-posT>900){posT=now;rec.t=now;save();}
}
A.chnav=d=>{const p=curP();A.read({id:p.id,ch:p.ch+(+d.d)});};
A.para=d=>{UI.reader.sel=UI.reader.sel===+d.i?null:+d.i;render();};
function setReact(key,r){
  if(!SESSION){needLogin('Connecte-toi pour réagir.');return false;}
  const old=S.reactions[key],nw=old===r?null:r,c=RC[key]=RC[key]||{};
  if(old)bump(c,old,-1);if(nw){bump(c,nw,1);S.reactions[key]=nw;}else delete S.reactions[key];
  B.setReaction(SESSION.user.id,key,nw);save();return true;
}
A.react=d=>{const p=curP(),key=p.id+':'+p.ch+':'+UI.reader.sel;if(!setReact(key,d.r))return;UI.reader.sel=null;render();};
A.unsel=()=>{UI.reader.sel=null;render();};
A.creact=d=>{const p=curP();if(setReact(p.id+':'+p.ch,d.r))render();};
A.like=()=>{
  if(!SESSION)return needLogin('Connecte-toi pour aimer ce chapitre.');
  const p=curP(),key=p.id+':'+p.ch,on=!S.likes[key];
  if(on)S.likes[key]=true;else delete S.likes[key];
  mutSeq++;bump(LIKES,key,on?1:-1);bump(SLIKES,p.id,on?1:-1);B.setLike(SESSION.user.id,key,on);save();render();
};
function loadStats(s,ci){
  const base=s.id+':'+ci,keys=[base].concat(s.chapitres[ci].texte.map((t,i)=>base+':'+i));
  B.chapterStats(keys).then(st=>{keys.forEach(k=>{RC[k]=st.reactions[k]||{};LIKES[k]=st.likes[k]||0;});const p=curP();if(p.id===s.id&&p.ch===ci)render();}).catch(e=>console.error(e));
}
const cmHtml=c=>{
  const mine=SESSION&&c.uid&&c.uid===SESSION.user.id;
  const act=mine?'<button class="iconbtn sm" data-a="cm-del" data-id="'+c.id+'" aria-label="Supprimer mon commentaire">'+IX.trash+'</button>'
    :(c.uid&&c.id!=null?'<button class="iconbtn sm" data-a="report-open" data-type="comment" data-id="'+c.id+'" data-uid="'+c.uid+'" data-name="'+esc(c.n)+'" aria-label="Signaler ce commentaire">'+IX.flag+'</button>':'');
  return '<div class="cm"><div class="cm-h"><b>'+esc(c.n)+'</b>'+act+'</div><p>'+esc(fr(c.t))+'</p></div>';
};
async function postComment(key,t){
  if(!SESSION){toast('Connecte-toi pour commenter.');return go('login');}
  let id=null;try{id=await B.addComment(SESSION.user.id,S.user.name,key,t);}catch(e){return toast(e.message);}
  (SHARED_CM[key]=SHARED_CM[key]||[]).push({n:S.user.name,t:t,id:id,uid:SESSION.user.id});render();toast('Commentaire publié.');
}
A.chcomment=()=>{const inp=$('#chcm-input');const t=inp?inp.value.trim():'';if(!t)return;const p=curP();postComment('c:'+p.id+':'+p.ch,t);};
A.comment=d=>{const inp=$('#cm-input');const t=inp?inp.value.trim():'';if(!t)return;postComment('s:'+d.id,t);};
A['ms-open']=d=>{const m=getMs(d.id);if(m)m.upd=Date.now();UI.focus=false;go('editor',{id:d.id});};
A['ms-new']=()=>{const id='m'+Date.now();S.manuscripts.push({id:id,upd:Date.now(),titre:'Sans titre',genre:'Drame',resume:'',published:false,active:0,chapitres:[{id:'c'+Date.now(),titre:'Chapitre 1',texte:''}]});save();go('editor',{id:id});};
A['ms-ch']=d=>{curMs().active=+d.i;save();render();};
A['ms-cover']=()=>{if(UI.coverBusy)return;if(!SESSION)return needLogin('Connecte-toi pour ajouter une jaquette.');const i=$('#cover-in');if(i)i.click();};
A['ms-cover-rm']=()=>{const m=curMs();m.jaquette=null;save();render();toast('Jaquette retirée.');};
async function onCoverFile(el){
  const f=el.files&&el.files[0];el.value='';if(!f)return;
  if(!/^image\//.test(f.type))return toast('Choisis une image.');
  const m=curMs();UI.coverBusy=true;render();
  try{const blob=await coverBlob(f);m.jaquette=await B.uploadCover(SESSION.user.id,blob);save();toast('Jaquette ajoutée.');}
  catch(e){toast(e.message||'La jaquette n’a pas pu être ajoutée.');}
  UI.coverBusy=false;render();
}
function coverBlob(file){
  return new Promise((ok,ko)=>{
    const img=new Image(),url=URL.createObjectURL(file);
    img.onload=()=>{
      const W=600,H=840,c=document.createElement('canvas');c.width=W;c.height=H;
      const sc=Math.max(W/img.width,H/img.height),w=img.width*sc,h=img.height*sc;
      c.getContext('2d').drawImage(img,(W-w)/2,(H-h)/2,w,h);URL.revokeObjectURL(url);
      c.toBlob(b=>b?ok(b):ko(new Error('Image illisible.')),'image/jpeg',.85);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);ko(new Error('Image illisible.'));};
    img.src=url;
  });
}
A['ms-addch']=()=>{const m=curMs();m.chapitres.push({id:'c'+Date.now(),titre:'Chapitre '+(m.chapitres.length+1),texte:''});m.active=m.chapitres.length-1;save();render();};
A['ms-publish']=d=>{
  const m=getMs(d.id);
  if(isScheduled(m)){
    if(d.now){m.publishAt=null;toast('Histoire publiée maintenant.');}else{m.published=false;m.publishAt=null;toast('Programmation annulée.');}
    save();render();return;
  }
  if(!m.published){
    if(S.plan==='free'&&S.manuscripts.filter(x=>x.published).length>=1)return openSheet('paywall',{why:'publish'});
    if(wc(m.chapitres.map(c=>c.texte).join(' '))<10)return toast('Écris quelques lignes avant de publier.');
    m.published=true;m.publishAt=null;let bonus='';if(!S.pubXP[m.id]){S.pubXP[m.id]=1;S.xp=(S.xp||0)+100;bonus=' +100 XP';}activity();toast('Histoire publiée. Elle apparaît dans Découvrir.'+bonus);
  }else{m.published=false;m.publishAt=null;toast('Histoire retirée de Découvrir.');}
  save();render();
};
A['pub-mode']=d=>{UI.pubMode=d.v;render();};
A['ms-schedule']=d=>{
  const m=getMs(d.id);if(!m)return;
  if(S.plan==='free'&&S.manuscripts.filter(x=>x.published&&x.id!==m.id).length>=1)return openSheet('paywall',{why:'publish'});
  if(wc(m.chapitres.map(c=>c.texte).join(' '))<10)return toast('Écris quelques lignes avant de programmer.');
  if(!UI.pubWhen)return toast('Choisis une date et une heure.');
  const ts=new Date(UI.pubWhen).getTime();
  if(!(ts>=Date.now()+5*60000))return toast('Choisis une heure au moins 5 minutes dans le futur.');
  if(ts>Date.now()+90*86400000)return toast('Programme au plus tard dans 90 jours.');
  m.published=true;m.publishAt=ts;let bonus='';if(!S.pubXP[m.id]){S.pubXP[m.id]=1;S.xp=(S.xp||0)+100;bonus=' +100 XP';}activity();
  toast('Programmée pour le '+fmtWhen(ts)+'.'+bonus);save();render();
};
A['coach-open']=()=>{const m=curMs(),c=curCh();takeSnapshot(m,clamp(m.active||0,0,m.chapitres.length-1),'avant analyse',true);openCoach({text:c.texte,title:(m.titre||'Sans titre')+', '+c.titre});};
A['coach-open2']=()=>A['coach-open']();
A['coach-comp']=d=>{UI.coach.compId=d.id;renderSheet();};
A['coach-run']=()=>{UI.coach.mode='single';runCoach();};
A['coach-global']=()=>runGlobal();
A['coach-retry']=()=>{if(UI.coach.mode==='global')runGlobal();else runCoach();};
A['coach-back']=()=>{UI.coach.phase='choose';UI.coach.errKind=null;renderSheet();};
A['coach-stop']=()=>{if(UI.coach&&UI.coach.ctl)UI.coach.ctl.abort();if(UI.coach&&UI.coach.phase==='loading'&&!sampleFn){UI.coach.phase='choose';renderSheet();}};
A['coach-local']=()=>{const C=UI.coach,n='Analyse locale simplifiée (statistiques du texte).';if(C.mode==='global')finishGlobal(localGlobal(C.text),'local',n,0);else finish(localCoach(compOf(C.compId),C.text),'local',n,0);};
A['coach-progress']=()=>{closeSheet();setTab('exercer');};
A['sheet-close']=()=>closeSheet();
A.atelier=d=>go('atelier',{id:d.id});
A['exo-run']=d=>{const c=compOf(d.id);openCoach({text:S.exos[d.id]||'',title:'Exercice, '+c.nom,compId:d.id,fixed:true,consigne:c.exercice});};
A['ecrire-tab']=d=>{UI.ecrireTab=d.t;render();};
A.exf=d=>{UI.exFilter=d.f;render();};
A['read-prefs']=()=>openSheet('lecture');
A.rsize=d=>{const r=rprefs();S.read={size:clamp(r.size+(+d.d),0,RSIZES.length-1),font:r.font};save();render();renderSheet();};
A.rfont=d=>{const r=rprefs();S.read={size:r.size,font:d.f};save();render();renderSheet();};
A['exo-open']=d=>go('exercice',{id:d.id});
A['cx-start']=d=>{
  const C=UI.coach,r=C&&C.res;if(!r)return;
  const txt=C.mode==='global'?((r.items.find(i=>i.id===d.id)||{}).exercice||''):r.exercice;if(!txt)return;
  S.coachExos=S.coachExos||[];
  let e=S.coachExos.find(x=>x.consigne===txt);
  if(!e){e={id:'cx'+Date.now(),comp:d.id,titre:'Exercice du coach, '+compOf(d.id).nom,min:10,mots:150,tags:[],consigne:txt,fromCoach:true,source:C.title,when:Date.now()};S.coachExos.unshift(e);S.coachExos=S.coachExos.slice(0,30);save();}
  closeSheet();UI.coach=null;go('exercice',{id:e.id});
};
A['exd-run']=d=>{const e=findEx(d.id);openCoach({text:S.exDraft[e.id]||'',title:'Exercice, '+e.titre,compId:e.comp,fixed:true,exId:e.id,consigne:e.consigne});};
A['plans-open']=()=>{UI.planSel=S.plan==='free'?'plus':S.plan;go('plans');};
A['to-plans']=()=>{closeSheet();UI.planSel=S.plan==='free'?'plus':S.plan;go('plans');};
A.upgrade=()=>{closeSheet();UI.planSel='pp';go('plans');};
A['plan-pick']=d=>{UI.planSel=d.id;render();};
A['plan-go']=()=>{
  if(!S.user){toast('Connecte-toi pour choisir un forfait.');return go('login');}
  toast('Le paiement en ligne n’est pas encore disponible. Les abonnements arrivent bientôt.');
};
A['login-go']=()=>go('login');
A['login-mode']=()=>{UI.login.mode=UI.login.mode==='signin'?'signup':'signin';render();};
A['login-submit']=async()=>{
  const L=UI.login,name=(L.name||'').trim(),mail=(L.email||'').trim(),up=L.mode!=='signin';
  if(L.busy)return;
  if(up&&!name)return toast('Indique ton prénom.');
  if(!/^\S+@\S+\.\S+$/.test(mail))return toast('Indique une adresse e-mail valide.');
  if((L.pass||'').length<6)return toast('Le mot de passe doit contenir au moins 6 caractères.');
  L.busy=true;render();
  try{
    const se=up?await B.signUp(name,mail,L.pass):await B.signIn(mail,L.pass);
    await attach(se);
    UI.login={name:'',email:'',pass:'',mode:'signin',busy:false};
    if(UI.stack.length&&UI.stack[UI.stack.length-1].name==='login')UI.stack.pop();
    render();if(!SYNC_OFF)toast(NOTICE||'Connecté. Bienvenue, '+S.user.name+'.');
    maybeAskGenres();
  }catch(e){L.busy=false;render();toast(e.message||'La connexion a échoué.');}
};
A.gpick=d=>{const sel=UI.gsel||(UI.gsel=(S.genres||[]).slice()),i=sel.indexOf(d.g);if(i>=0)sel.splice(i,1);else{if(sel.length>=3)return toast('Trois genres au maximum.');sel.push(d.g);}render();};
A.gdone=()=>{if(!UI.gsel||!UI.gsel.length)return;S.genres=UI.gsel.slice(0,3);S.genresAsked=true;UI.gsel=null;UI.stack.pop();save();render();toast('C’est noté : tes recommandations vont s’adapter.');};
A.gskip=()=>{S.genresAsked=true;UI.gsel=null;UI.stack.pop();save();render();};
A['genres-open']=()=>{UI.gsel=(S.genres||[]).slice();go('genres');};
function maybeAskGenres(){if(SESSION&&!SYNC_OFF&&!S.genresAsked&&!UI.stack.some(x=>x.name==='genres')){UI.gsel=(S.genres||[]).slice();go('genres');}}
A['report-open']=d=>{if(!SESSION)return needLogin('Connecte-toi pour signaler un contenu.');UI.repDetails='';openSheet('report',{type:d.type,id:d.id,uid:d.uid,name:d.name,reason:null});};
A['report-reason']=d=>{if(UI.sheet)UI.sheet.p.reason=d.r;renderSheet();};
A['report-send']=async()=>{
  const p=UI.sheet&&UI.sheet.p;if(!p||!p.reason||!SESSION)return;
  try{await B.reportContent(SESSION.user.id,p.type,p.id,p.reason,UI.repDetails);}catch(e){return toast(e.message);}
  closeSheet();toast('Merci, ton signalement a été envoyé.');
};
A['block-user']=async d=>{
  if(!SESSION)return;
  try{await B.blockUser(SESSION.user.id,d.uid,d.name);}catch(e){return toast(e.message);}
  BLOCKED.set(d.uid,d.name||'Utilisateur');closeSheet();
  while(UI.stack.length&&['story','reader'].includes(UI.stack[UI.stack.length-1].name)&&!findStory(UI.stack[UI.stack.length-1].p.id))UI.stack.pop();
  render();toast('Utilisateur bloqué. Tu ne verras plus ses histoires ni ses commentaires.');
};
A['blocked-open']=()=>go('blocked');
A.unblock=async d=>{try{await B.unblockUser(SESSION.user.id,d.uid);}catch(e){return toast(e.message);}BLOCKED.delete(d.uid);render();toast('Utilisateur débloqué.');};
A['cm-del']=async d=>{
  try{await B.deleteComment(d.id);}catch(e){return toast(e.message);}
  Object.keys(SHARED_CM).forEach(k=>{SHARED_CM[k]=SHARED_CM[k].filter(c=>String(c.id)!==String(d.id));});render();toast('Commentaire supprimé.');
};
A['pw-forgot']=async()=>{
  const mail=(UI.login.email||'').trim();
  if(!/^\S+@\S+\.\S+$/.test(mail))return toast('Indique d’abord ton adresse e-mail ci-dessus.');
  try{await B.resetPassword(mail);}catch(e){return toast(e.message);}
  toast('Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.');
};
A['pw-save']=async()=>{
  const N=UI.np;if(!N||N.busy)return;
  if((N.a||'').length<6)return toast('Le mot de passe doit contenir au moins 6 caractères.');
  if(N.a!==N.b)return toast('Les deux mots de passe ne correspondent pas.');
  N.busy=true;render();
  try{await B.updatePassword(N.a);}catch(e){N.busy=false;render();return toast(e.message);}
  B.clearRecovering();UI.np=null;try{history.replaceState(null,'',location.pathname);}catch(x){}
  UI.stack=UI.stack.filter(x=>x.name!=='newpass');render();toast('Mot de passe modifié. Tu es connecté.');
};
function openRecovery(){if(!UI.stack.some(x=>x.name==='newpass')){UI.np={a:'',b:'',busy:false};go('newpass');}}
A['delete-open']=()=>openSheet('delete');
A['delete-yes']=async()=>{
  const inp=$('#del-confirm');if(!inp||inp.value.trim().toUpperCase()!=='SUPPRIMER'||!SESSION)return;
  const b=$('#del-yes');if(b){b.disabled=true;b.textContent='Suppression…';}
  const th=S.theme;
  try{await B.deleteAccount(SESSION.user.id);}catch(e){if(b){b.disabled=false;b.textContent='Supprimer définitivement';}return toast(e.message);}
  SESSION=null;stopNotifPoll();BLOCKED=new Map();HIDDEN_MINE=new Set();S=seed();S.theme=th;applyTheme();save();
  UI.sheet=null;UI.coach=null;renderSheet();UI.stack=[];UI.tab='decouvrir';render();toast('Ton compte a été supprimé.');
};
A['lib-open']=d=>{UI.libTab=d.t||'reading';setTab('biblio');};
A['lib-tab']=d=>{UI.libTab=d.t;render();};
A['lib-sheet']=d=>openSheet('libadd',{id:d.id});
A['dl-toggle']=d=>{
  const s=findStory(d.id);if(!s)return;const all=dlAll();
  if(all[s.id]){delete all[s.id];dlSave(all);render();return toast('Retirée de tes téléchargements.');}
  const story=JSON.parse(JSON.stringify({id:s.id,titre:s.titre,auteurId:s.auteurId,authorUid:s.authorUid||null,authorNom:authorName(s.auteurId),genre:s.genre,resume:s.resume,chapitres:s.chapitres,c1:s.c1,c2:s.c2,motif:s.motif,jaquette:s.jaquette||null}));
  all[s.id]={story:story,t:Date.now()};
  if(!dlSave(all))return toast('Espace insuffisant sur cet appareil. Retire une histoire téléchargée.');
  if(s.jaquette){try{fetch(s.jaquette,{mode:'no-cors'}).catch(function(){});}catch(e){}}
  render();toast('Disponible hors connexion.');
};
A['lib-set']=d=>{if(d.st)S.lib.status[d.id]=d.st;else delete S.lib.status[d.id];save();renderSheet();render();toast(d.st?'Ajoutée à « '+LIBLABEL[d.st]+' ».':'Retirée de ta bibliothèque.');};
A['list-new']=d=>{
  const inp=$('#list-name'),nom=inp?inp.value.trim():'';if(!nom)return toast('Donne un nom à ton dossier.');
  if(S.lib.lists.some(l=>l.nom.toLowerCase()===nom.toLowerCase()))return toast('Tu as déjà un dossier de ce nom.');
  S.lib.lists.push({id:'l'+Date.now().toString(36),nom:nom,ids:d.id?[d.id]:[]});save();if(UI.sheet)renderSheet();render();toast('Dossier « '+nom+' » créé.');
};
A['list-toggle']=d=>{const l=S.lib.lists.find(x=>x.id===d.l);if(!l)return;const i=l.ids.indexOf(d.id);if(i>=0)l.ids.splice(i,1);else l.ids.push(d.id);save();if(UI.sheet)renderSheet();render();};
A['list-del']=d=>{const l=S.lib.lists.find(x=>x.id===d.l);if(l)openSheet('confirm',{kind:'dellist',l:l.id,nom:l.nom});};
A['stats-open']=d=>{go('stats',{id:d.id});loadAuthorStats(d.id);};
async function loadAuthorStats(msId){
  const m=getMs(msId);if(!m||!SESSION||!m.published){render();return;}
  const sid=B.remoteId(m.id,SESSION.user.id);STATS[msId]={loading:true};render();
  let r;try{r=Object.assign({loading:false,ok:true},await B.loadStoryStats(sid,m.chapitres.length));}catch(e){console.error(e);r={loading:false,ok:false};}
  STATS[msId]=r;const top=UI.stack[UI.stack.length-1];if(top&&top.name==='stats'&&top.p.id===msId)render();
}
A['stats-analyse']=d=>{const m=getMs(d.id),c=m&&m.chapitres[+d.ch];if(!c)return;openCoach({text:c.texte,title:(m.titre||'Sans titre')+', '+c.titre});};
A['go-account']=()=>go('account');
A.logout=()=>openSheet('confirm',{kind:'logout'});
A.reset=()=>openSheet('confirm',{kind:'reset'});
A['confirm-yes']=d=>{
  if(d.k==='dellist'){S.lib.lists=S.lib.lists.filter(l=>l.id!==d.l);save();closeSheet();render();toast('Dossier supprimé.');return;}
  const th=S.theme;
  if(d.k==='logout'){
    B.flush().finally(()=>B.signOut());SESSION=null;stopNotifPoll();BLOCKED=new Map();HIDDEN_MINE=new Set();STATS={};
    S=seed();S.theme=th;
    toast('Tu es déconnecté.');
  }else{S=seed();S.theme=th;if(SESSION){S=freshAccount();S.theme=th;S.user=userObj(SESSION);}toast('Compte remis à zéro.');}
  applyTheme();save();UI.sheet=null;UI.coach=null;renderSheet();UI.stack=[];UI.tab='profil';render();
};
A.restore=()=>toast('Mode aperçu : la restauration Google Play est inactive. En production, elle relit tes achats depuis Google Play.');
A.theme=d=>{S.theme=d.v;applyTheme();save();render();if(UI.sheet)renderSheet();};

const IN={
 'ms-title':el=>{curMs().titre=el.value;save();},
 'ch-title':el=>{curCh().titre=el.value;save();},
 'ms-genre':el=>{curMs().genre=el.value;save();},
 'ms-text':el=>{const c=curCh(),b=wc(c.texte);c.texte=el.value;const a=wc(el.value);if(a>b)addWords(Math.min(40,a-b));const mm=curMs();mm.upd=Date.now();autosize(el);updateWc();save();const mid=mm.id,ci=clamp(mm.active||0,0,mm.chapitres.length-1);clearTimeout(snapT);snapT=setTimeout(()=>{const x=getMs(mid);if(x)takeSnapshot(x,ci,'auto');},20000);},
 'ch-intent':el=>{curCh().intention=el.value.replace(/\n/g,' ');autosize(el);save();},
 'ms-resume':el=>{curMs().resume=el.value;save();},
 'pub-when':el=>{UI.pubWhen=el.value;},
 'b-notes':el=>{const m=getMs(curP().id)||lastMs();if(m){bibleOf(m.id).notesActe=el.value;save();}},
 csearch:el=>{UI.cq=el.value;const b=$('#clist');if(b)b.innerHTML=catalogList();},
 exo:el=>{S.exos[el.dataset.id]=el.value;autosize(el);save();},
 exd:el=>{S.exDraft[el.dataset.id]=el.value;autosize(el);const e=findEx(el.dataset.id),w=$('#exwc');if(w&&e)w.textContent=exWcText(e,el.value);save();},
 'lg-name':el=>{UI.login.name=el.value;},
 'lg-mail':el=>{UI.login.email=el.value;},
 'lg-pass':el=>{UI.login.pass=el.value;},
 'cover-file':el=>{onCoverFile(el);},
 'rep-details':el=>{UI.repDetails=el.value;},
 'np-a':el=>{if(UI.np)UI.np.a=el.value;},
 'np-b':el=>{if(UI.np)UI.np.b=el.value;},
 'del-confirm':el=>{const b=$('#del-yes');if(b)b.disabled=el.value.trim().toUpperCase()!=='SUPPRIMER';}
};
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('scrim')){closeSheet();return;}
  const el=t.closest?t.closest('[data-a]'):null;if(!el)return;
  const fn=A[el.dataset.a];if(fn)fn(el.dataset,el,e);
});
const onIn=e=>{const k=e.target.dataset&&e.target.dataset.in;if(k&&IN[k])IN[k](e.target);};
document.addEventListener('input',onIn);
document.addEventListener('change',onIn);
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Escape'&&UI.sheet){closeSheet();return;}
  if(!t||!t.dataset)return;
  if(e.key==='Enter'&&t.dataset.enter){e.preventDefault();A[t.dataset.enter](t.dataset,t,e);return;}
  if((e.key==='Enter'||e.key===' ')&&t.dataset.a&&!/^(BUTTON|INPUT|TEXTAREA|SELECT|A)$/.test(t.tagName)){e.preventDefault();t.click();}
});

/* ===== v3 : actions ===== */
A['talents-open']=()=>go('talents');
A['saved-open']=()=>go('saved');
A['following-open']=()=>go('following');
A['exlib-open']=()=>go('exlib');
A['obj-open']=()=>openSheet('objectifs');
A['sprint-open']=()=>openSheet('sprint');
const fmtT=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
let sprintT=null;
function sprintTick(){
  const sp=UI.sprint;if(!sp){clearInterval(sprintT);return;}
  const left=Math.max(0,Math.ceil((sp.end-Date.now())/1000)),el=$('#sp-time');
  if(el)el.textContent=fmtT(left);
  if(left<=0){clearInterval(sprintT);UI.sprint=null;activity();addXP(sp.mins*3,'sprint terminé');save();if(UI.sheet&&UI.sheet.name==='sprint')renderSheet();render();}
}
A['sprint-start']=d=>{clearInterval(sprintT);UI.sprint={mins:+d.m,end:Date.now()+(+d.m)*60000};sprintT=setInterval(sprintTick,1000);renderSheet();};
A['sprint-stop']=()=>{clearInterval(sprintT);UI.sprint=null;renderSheet();toast('Sprint arrêté.');};
// défi du jour
A['dc-accept']=()=>{
  const dc=todayChallenge();
  if(!(S.challenge.d===dc.id&&S.challenge.state==='done'))S.challenge={d:dc.id,state:'accepted'};
  save();go('exercice',{id:dc.id});
};
A['dc-done']=d=>{
  const e=findEx(d.id);if(!e)return;
  const w=wc(S.exDraft[e.id]||'');
  if(w<e.mots)return toast('Encore '+(e.mots-w)+' mots pour relever le défi.');
  if(S.challenge.d===e.id&&S.challenge.state==='done')return;
  S.challenge={d:e.id,state:'done'};ensureDay();S.week.ch++;activity();addXP(e.xp,'défi relevé');save();render();
};
// leçons
A['lesson-open']=d=>go('lesson',{id:d.id});
A['lesson-done']=d=>{if(S.lessons[d.id])return;S.lessons[d.id]=Date.now();activity();addXP(20,'leçon terminée');save();render();};
// boussole
A['boussole-open']=d=>{const m=lastMs();if(!m)return toast('Crée d’abord un manuscrit.');UI.bTab=d.t||'persos';go('boussole',{id:m.id});};
A['boussole-tab']=d=>{UI.bTab=d.t;render();};
A['b-add']=d=>{
  const m=getMs(curP().id)||lastMs();if(!m)return;
  const b=bibleOf(m.id),k=d.k,a=($('#b-a')||{value:''}).value.trim(),c=($('#b-b')||{value:''}).value.trim();
  if(!a)return toast('Écris d’abord quelques mots.');
  if(k==='persos')b.persos.push({nom:a,note:c});
  else if(k==='idees')b.idees.push(a);
  else if(k==='chrono')b.chrono.push({quand:a,quoi:c});
  save();render();
};
A['b-del']=d=>{const m=getMs(curP().id)||lastMs();if(!m)return;bibleOf(m.id)[d.k].splice(+d.i,1);save();render();};
A['b-acte']=d=>{const m=getMs(curP().id)||lastMs();if(!m)return;bibleOf(m.id).acte=d.v;save();render();};
// publication, édition
A['publish-open']=d=>go('publish',{id:d.id});
A['publish-last']=()=>{const m=lastMs();if(m)go('publish',{id:m.id});};
A['focus-toggle']=()=>{UI.focus=!UI.focus;render();};
A['edit-comp']=d=>{UI.editComp=d.id;render();};
// ateliers
A['atelier-sw']=d=>{UI.stack[UI.stack.length-1].p={id:d.id};render();$('#view').scrollTop=0;};
A['exo-done']=d=>{
  const w=wc(S.exos[d.id]||'');
  if(w<40)return toast('Écris au moins 40 mots avant de valider l’exercice.');
  const k='ex'+d.id;
  if(S.exoXP[k]===dayKey())return toast('Exercice déjà validé aujourd’hui. Reviens demain pour gagner des XP.');
  S.exoXP[k]=dayKey();ensureDay();S.week.ex++;activity();addXP(35,'exercice fait');save();render();
};
A['atelier-diag']=d=>{
  const m=lastMs(),ch=activeCh(m);
  if(!ch||wc(ch.texte)<20)return toast('Écris d’abord quelques lignes dans un manuscrit.');
  openCoach({text:ch.texte,title:(m.titre||'Sans titre')+', '+ch.titre,compId:d.id,fixed:true});
};
// profil
A.pref=d=>{S.prefs[d.k]=!S.prefs[d.k];save();render();};
A.goal=d=>{S.prefs.goal=+d.v;save();render();};
A['bio-open']=()=>openSheet('bio');
A['bio-save']=()=>{S.bio=(($('#bio-in')||{value:''}).value||'').trim().slice(0,160);closeSheet();save();render();};

/* ===== démarrage ===== */
applyTheme();rollover();
$('#tabs').innerHTML=TABS.map(t=>'<button class="tab" data-a="tab" data-t="'+t[0]+'">'+t[2]+'<span>'+t[1]+'</span></button>').join('');
$('#view').addEventListener('scroll',onReaderScroll,{passive:true});
render();getSample();boot();

async function attach(se){
  SESSION=se;SYNC_OFF=false;
  const th=S.theme;
  let remote=null;
  try{remote=await B.loadState(se.user.id);}catch(e){console.error(e);SYNC_OFF=true;}
  let cleaned=false;
  if(remote){
    const o=stripDemo(Object.assign(freshAccount(),remote));
    // Compte enregistré avant le correctif : ses scores partaient d'une base de démonstration. On remet le profil à zéro.
    if(remote.v!==2){o.profile=freshAccount().profile;cleaned=!!((remote.profile&&remote.profile.history||[]).length||(remote.profile&&COMPS.some(c=>remote.profile.scores&&remote.profile.scores[c.id])));}
    o.v=2;S=fixState(migrateReacts(o));
  }else S=freshAccount();
  S.theme=th;S.user=userObj(se);S.plan='free';
  try{const plan=await B.loadPlan();S.plan=plan||'free';}catch(e){console.error(e);}
  try{const used=await B.loadCreditsUsed();if(used!=null)S.credits={month:monthKey(),used};}catch(e){console.error(e);}
  try{BLOCKED=new Map((await B.loadBlocks()).map(x=>[x.blocked,x.blocked_name||'Utilisateur']));}catch(e){console.error(e);}
  HIDDEN_MINE=new Set(REMOTE_STORIES.filter(r=>r.hidden&&r.authorUid===se.user.id).map(r=>r.id));
  applyTheme();rollover();
  if(SYNC_OFF)toast('Ton compte n’a pas pu être chargé. Vérifie ta connexion puis recharge la page.');
  else{save();if(S.saved.length)B.syncFavorites(se.user.id,S.saved);NOTICE=cleaned?'Ton profil d’écriture a été remis à zéro : il contenait des scores d’exemple.':'';startNotifPoll();}
}
let BOOTED=false;
B.onRecovery(()=>{if(BOOTED)openRecovery();});
async function boot(){
  BOOT_OFFLINE=OFFLINE;syncOffbar();
  const [pub,cms,cnt]=await Promise.all([B.loadPublished(),B.loadComments(),B.loadCounts()]);
  READS=cnt.reads;FOLL=cnt.follows;SLIKES=cnt.likes;FAVS=cnt.favs;lastRC=Date.now();
  if(B.lastFetchFailed()&&!BOOT_OFFLINE){BOOT_OFFLINE=true;OFFLINE=true;syncOffbar();}
  if(BOOT_OFFLINE){const known=new Set(STORIES.map(x=>x.id));REMOTE_STORIES=dlStories().filter(x=>!known.has(x.id)).map(x=>{const st=Object.assign({},x,{auteurId:x.auteurId,authorUid:x.authorUid,hidden:false,mine:false,lectures:0});EXT_AUTHORS[st.auteurId]=x.authorNom||'Auteur Plume';return st;});}
  else REMOTE_STORIES=pub.map(r=>{const st=Object.assign({},recolor(r.story),{id:r.id,auteurId:'ext:'+r.author_id,authorUid:r.author_id,hidden:!!r.hidden,mine:false,lectures:0});EXT_AUTHORS[st.auteurId]=r.author_name||'Auteur Plume';return st;});
  cms.forEach(c=>{if(c.hidden)return;(SHARED_CM[c.key]=SHARED_CM[c.key]||[]).push({n:c.author_name||'Lecteur',t:c.body,id:c.id,uid:c.author_id});});
  if(!BOOT_OFFLINE){try{const se=await B.getSession();if(se)await attach(se);}catch(e){console.error(e);}}
  render();if(NOTICE&&!SYNC_OFF)toast(NOTICE);
  BOOTED=true;if(B.isRecovering())openRecovery();else maybeAskGenres();
}

