import * as B from './backend.js';
import './style.css';

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

/* ===== données ===== */
const PLANS={
 free:{id:'free',nom:'Gratuit',prixTxt:'0 €',budget:0,points:['3 chapitres de lecture par semaine','1 histoire publiée au total','Accès aux cours de l’école d’écriture','Pas de diagnostic personnalisé']},
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
const GENRES_EDIT=['Drame','Mystère','Romance','Fantasy','Thriller'];
const LEVELS=[[0,'Encre naissante'],[35,'Encre régulière'],[50,'Encre affirmée'],[65,'Encre assurée'],[80,'Encre maîtrisée']];

const AUTHORS=[
 {id:'a1',nom:'Inès Caradec',abonnes:1240},
 {id:'a2',nom:'Malo Devaux',abonnes:860},
 {id:'a3',nom:'Anaïs Rouvière',abonnes:2015},
 {id:'a4',nom:'Karim Belhadj',abonnes:640},
 {id:'a5',nom:'Camille Ferrand',abonnes:320}
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
 {id:'s3',titre:'Les Saisons de Verre',auteurId:'a3',genre:'Fantasy',lectures:15302,c1:'#1F5F5B',c2:'#2F7A6D',motif:'verre',
  resume:'À Vitrelle, chaque saison dort dans une jarre de verre gardée par une famille. Le matin du solstice, la jarre de l’hiver est vide.',
  chapitres:[
   {titre:'Le solstice sans neige',texte:[
    'À Vitrelle, on ne dit pas « l’hiver arrive ». On dit « les Aubrac ouvrent la jarre ». Depuis neuf générations, cette famille gardait sous la halle du marché quatre jarres de verre soufflé : le printemps, où bruissait un vent tiède ; l’été, si chaud qu’on le maniait avec des gants de cuir ; l’automne, qui sentait la châtaigne brûlée ; et l’hiver.',
    'Ce matin-là, Iris Aubrac, douze ans, souleva le bouchon de cire de la quatrième jarre, comme son père le lui avait appris. Rien n’en sortit. Pas un souffle, pas un flocon, pas ce froid qui mordait les dents. Seulement l’écho de sa propre respiration au fond du verre.',
    'Derrière elle, la halle s’était tue. Les commerçants la regardaient. Iris comprit deux choses en même temps : que l’hiver avait disparu, et que, dans quelques secondes, on allait chercher à qui en faire porter la faute.']},
   {titre:'La cire brisée',texte:[
    'On enferma Iris dans la remise aux poids, pour sa sécurité, disait-on. Elle passa l’après-midi à observer la jarre qu’on avait posée devant elle comme une pièce à conviction. Le verre était intact. Le bouchon n’avait pas été forcé. Pourtant, la cire portait, sur le bord, une minuscule empreinte de doigt.',
    'Une empreinte trop petite pour un adulte. Iris posa son propre pouce dessus et le trouva un peu plus gros. Quelqu’un d’aussi jeune qu’elle, ou plus jeune encore, avait ouvert la jarre avant elle, et l’avait refermée avec soin.']}]},
 {id:'s4',titre:'Ligne 9, dernier départ',auteurId:'a4',genre:'Thriller',lectures:6190,c1:'#232946',c2:'#4A4E8A',motif:'metro',
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
    '— Le coussin. Il est mal placé.']}]}
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
    user:null,plan:'free',
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
let S=load();
let SESSION=null,REMOTE_STORIES=[],SHARED_CM={},RC={},LIKES={},READS={},FOLL={};
const bump=(o,k,d)=>{o[k]=Math.max(0,(o[k]||0)+d);};
const needLogin=m=>{toast(m);go('login');};const EXT_AUTHORS={};
const userObj=se=>({name:B.userName(se),email:se.user.email,mode:'compte Plume (e-mail et mot de passe)'});
function load(){try{const raw=localStorage.getItem(KEY);if(raw){return migrateReacts(Object.assign(seed(),JSON.parse(raw)));}}catch(e){}return seed();}
let saveT;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}},250);
  if(SESSION){B.saveState(SESSION.user.id,S);B.syncPublished(SESSION.user.id,S.user?S.user.name:B.userName(SESSION),S.manuscripts.filter(m=>m.published).map(msToStory));}}
function rollover(){
  if(S.reads.week!==mondayKey())S.reads={week:mondayKey(),ids:[]};
  if(!S.credits||S.credits.month!==monthKey())S.credits={month:monthKey(),used:0};
}
const UI={tab:'decouvrir',ecrireTab:'ms',exFilter:'reco',stack:[],sheet:null,genre:'Tout',reader:{sel:null},coach:null,planSel:'plus',login:{name:'',email:'',pass:'',mode:'signup',busy:false}};

/* ===== aides métier ===== */
const allStories=()=>STORIES.concat(REMOTE_STORIES.filter(r=>!SESSION||r.authorUid!==SESSION.user.id),S.manuscripts.filter(m=>m.published).map(m=>{const st=msToStory(m);if(SESSION)st.id=B.remoteId(m.id,SESSION.user.id);return st;}))
  .map(st=>Object.assign({},st,{lectures:READS[st.id]||0}));
const authorsAll=()=>{const seen={},ext=[];REMOTE_STORIES.forEach(r=>{if((!SESSION||r.authorUid!==SESSION.user.id)&&!seen[r.auteurId]){seen[r.auteurId]=1;ext.push({id:r.auteurId,nom:EXT_AUTHORS[r.auteurId]});}});return ext.concat(AUTHORS);};
function msToStory(m){
  return {id:m.id,titre:m.titre||'Sans titre',auteurId:'me',genre:m.genre||'Drame',resume:m.resume||'Une histoire écrite sur Plume.',
    c1:'#2F3A8F',c2:'#5B68D6',motif:'plume',lectures:0,mine:true,jaquette:m.jaquette||null,
    chapitres:m.chapitres.map(c=>({titre:c.titre,texte:c.texte.split(/\n+/).map(s=>s.trim()).filter(Boolean)}))};
}
const findStory=id=>allStories().find(s=>s.id===id);
const authorName=id=>id==='me'?((S.user&&S.user.name)||'Toi'):(EXT_AUTHORS[id]||(AUTHORS.find(a=>a.id===id)||{nom:''}).nom);
const cmFor=(key,ch)=>((ch?SEED_CH_COMMENTS:SEED_COMMENTS)[key]||[]).concat(SHARED_CM[(ch?'c:':'s:')+key]||[]);
const getMs=id=>S.manuscripts.find(m=>m.id===id);
const curP=()=>UI.stack.length?UI.stack[UI.stack.length-1].p:{};
const curMs=()=>getMs(curP().id);
const curCh=()=>{const m=curMs();return m.chapitres[clamp(m.active||0,0,m.chapitres.length-1)];};
const avg=o=>COMPS.reduce((a,c)=>a+(o[c.id]||0),0)/COMPS.length;
function level(){const a=avg(S.profile.scores);let i=0;LEVELS.forEach((l,k)=>{if(a>=l[0])i=k;});return {n:i+1,nom:LEVELS[i][1],moy:Math.round(a),prev:Math.round(avg(S.profile.prev))};}
const weakest=()=>COMPS.slice().sort((a,b)=>S.profile.scores[a.id]-S.profile.scores[b.id])[0];
const compOf=id=>COMPS.find(c=>c.id===id);
const budgetLeft=()=>Math.max(0,PLANS[S.plan].budget-S.credits.used);
const syncCredits=()=>{const c=B.lastCredits();if(c){S.credits={month:monthKey(),used:c.used};}};

function avatar(name,size){return '<span class="av" style="--s:'+size+'px;--h:'+(hash(name)%360)+'">'+esc((name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase())+'</span>';}
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
  return '<svg viewBox="0 0 340 320" class="radar" role="img" aria-label="Radar des sept compétences d’écriture">'+rings+axes+'<polygon points="'+poly(S.profile.prev)+'" fill="none" stroke="var(--rouge)" stroke-width="1.5" stroke-dasharray="4 3"/><polygon points="'+poly(S.profile.scores)+'" fill="var(--bleu)" fill-opacity=".16" stroke="var(--bleu)" stroke-width="2"/>'+dots+labels+'</svg>';
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
  'Contexte longitudinal de l’auteur'+((S.user&&S.user.name)?' ('+S.user.name+')':'')+' :\n- Score actuel dans cette compétence : '+P.scores[comp.id]+'/100 (il y a trois mois : '+P.prev[comp.id]+'/100)\n- Notes de mémoire du coach :\n'+mem+'\n- Derniers diagnostics :\n'+last+'\n\n'+
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
  if(S.plan==='free')return openSheet('paywall',{why:'coach'});
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
  const old=P.scores[comp.id],nw=Math.round(old*.65+res.score*.35);
  const tokens=src==='ia'?(C.exId?COST.exercise:COST.single):0;
  P.scores[comp.id]=nw;P.trend[comp.id]=res.tendance;
  P.history.unshift({id:'h'+Date.now(),comp:comp.id,score:res.score,appreciation:res.appreciation||'Diagnostic enregistré.',titre:C.title,quand:Date.now(),src});
  if(res.memoire)P.memory.unshift({comp:comp.id,note:res.memoire,quand:Date.now()});
  P.history=P.history.slice(0,30);P.memory=P.memory.slice(0,12);
  rollover();S.credits.used+=tokens;if(src==='ia')syncCredits();save();
  if(C.exId){const at={score:res.score,app:res.appreciation||'',when:Date.now()};S.exDone[C.exId]=at;S.exHist=S.exHist||{};(S.exHist[C.exId]=S.exHist[C.exId]||[]).push(at);S.exHist[C.exId]=S.exHist[C.exId].slice(-20);save();}
  Object.assign(C,{phase:'result',mode:'single',res,src,note,tokens,oldScore:old,newScore:nw});
  renderSheet();
  if(C.exId)render();
}

/* ===== coach : analyse globale des 7 compétences ===== */
function buildGlobalPrompt(text,title){
  const P=S.profile;
  const grid=COMPS.map(c=>'- '+c.id+' ('+c.nom+') : '+c.objectif+' Grille : '+c.grille.join(' ; ')+'.').join('\n');
  const ctx=COMPS.map(c=>{const m=P.memory.find(x=>x.comp===c.id);return '- '+c.id+' : score '+P.scores[c.id]+'/100 (il y a trois mois : '+P.prev[c.id]+'/100). Note du coach : '+(m?m.note:'aucune')+'.';}).join('\n');
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
  res.items.forEach(i=>{const old=P.scores[i.id];olds[i.id]=old;P.scores[i.id]=Math.round(old*.65+i.score*.35);P.trend[i.id]=i.tendance;});
  P.history.unshift({id:'h'+Date.now(),comp:'global',score:res.score,appreciation:res.appreciation||'Analyse globale enregistrée.',titre:C.title,quand:Date.now(),src});
  res.items.slice().sort((a,b)=>a.score-b.score).slice(0,2).forEach(i=>{if(i.memoire)P.memory.unshift({comp:i.id,note:i.memoire,quand:Date.now()});});
  P.history=P.history.slice(0,30);P.memory=P.memory.slice(0,12);
  rollover();S.credits.used+=tokens;if(src==='ia')syncCredits();save();
  Object.assign(C,{phase:'result',mode:'global',res,src,note,tokens,olds});
  renderSheet();
}

/* ===== écrans ===== */
const topBack=(title,right)=>'<header class="top"><button class="iconbtn" data-a="back" aria-label="Retour">'+IC.back+'</button><b class="top-title">'+esc(title)+'</b>'+(right||'<span class="sp"></span>')+'</header>';
const brandTop=right=>'<header class="top"><div class="brand">'+IC.feather+'<span>Plume</span></div>'+(right||'')+'</header>';
const deltaChip=d=>'<span class="delta '+(d>=0?'pos':'neg')+'">'+(d>0?'+':(d<0?'−':''))+Math.abs(d)+' pts</span>';

function storyRow(s){
  const saved=S.saved.includes(s.id);
  return '<div class="srow"><button class="rowmain" data-a="story" data-id="'+s.id+'">'+cover(s,'mini')+'<span class="sinfo"><b>'+esc(s.titre)+'</b><span class="small">'+esc(authorName(s.auteurId))+'</span><span class="small muted">'+esc(s.genre)+', '+pl(s.chapitres.length,'chapitre')+(s.lectures?', '+pl(s.lectures,'lecture'):'')+'</span></span></button>'+
    '<button class="iconbtn'+(saved?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+saved+'" aria-label="Ajouter '+esc(s.titre)+' aux favoris">'+IC.mark+'</button></div>';
}

function vDecouvrir(){
  rollover();
  const all=allStories(),feat=all.find(s=>s.id==='s1')||all[0];
  const genres=['Tout'].concat(Array.from(new Set(all.map(s=>s.genre))));
  const list=all.filter(s=>UI.genre==='Tout'||s.genre===UI.genre);
  const counter=S.plan==='free'
    ?'<button class="chip" data-a="plans-open" aria-label="Compteur de lecture gratuit, voir les forfaits">'+S.reads.ids.length+'/3 chapitres cette semaine</button>'
    :'<span class="chip plan-chip">'+esc(PLANS[S.plan].nom)+'</span>';
  const authors=authorsAll().map(a=>{
    const on=S.following.includes(a.id);
    return '<div class="author">'+avatar(a.nom,56)+'<b>'+esc(a.nom)+'</b><span class="small muted">'+pl(FOLL[a.id]||0,'abonné')+'</span><button class="btn sm'+(on?' sec':'')+'" data-a="follow" data-id="'+a.id+'" aria-pressed="'+on+'">'+(on?'Suivi':'Suivre')+'</button></div>';
  }).join('');
  return brandTop(counter)+
  '<section class="pad"><div class="chips" role="group" aria-label="Genres">'+genres.map(g=>'<button class="chip'+(UI.genre===g?' on':'')+'" data-a="genre" data-g="'+esc(g)+'" aria-pressed="'+(UI.genre===g)+'">'+esc(g)+'</button>').join('')+'</div></section>'+
  '<section class="pad"><h2 class="h2">À la une</h2><div class="feat"><button class="plain" data-a="story" data-id="'+feat.id+'" aria-label="Ouvrir '+esc(feat.titre)+'">'+cover(feat,'feat-c')+'</button><div class="ft"><h3><button class="plain" data-a="story" data-id="'+feat.id+'">'+esc(feat.titre)+'</button></h3><span class="small">'+esc(authorName(feat.auteurId))+'</span><p class="rs">'+esc(fr(feat.resume))+'</p><button class="btn sm" data-a="read" data-id="'+feat.id+'" data-ch="0">Lire le chapitre 1</button></div></div></section>'+
  '<section class="pad"><h2 class="h2">Talents émergents</h2><div class="authors">'+authors+'</div></section>'+
  '<section class="pad"><h2 class="h2">Histoires</h2>'+(list.length?list.map(storyRow).join(''):'<p class="empty">Aucune histoire dans ce genre pour l’instant.</p>')+'</section>';
}

function vStory(p){
  const s=findStory(p.id);if(!s)return topBack('Histoire')+'<p class="empty">Cette histoire n’est plus disponible.</p>';
  const saved=S.saved.includes(s.id),au=authorsAll().find(a=>a.id===s.auteurId),foll=au&&S.following.includes(au.id),cms=cmFor(s.id);
  const chs=s.chapitres.map((c,i)=>{
    const key=s.id+':'+i,read=S.reads.ids.includes(key),locked=S.plan==='free'&&!read&&S.reads.ids.length>=3;
    return '<li><button data-a="read" data-id="'+s.id+'" data-ch="'+i+'"><span class="num">'+(i+1)+'</span><span>'+esc(c.titre)+'</span><span class="st">'+(locked?IC.lock:(read?IC.check:''))+'</span></button></li>';
  }).join('');
  return topBack('Histoire','<button class="iconbtn'+(saved?' on':'')+'" data-a="save" data-id="'+s.id+'" aria-pressed="'+saved+'" aria-label="Ajouter l’histoire aux favoris">'+IC.mark+'</button>')+
  '<section class="pad story-head">'+cover(s,'big')+'<div><h1 class="h1">'+esc(s.titre)+'</h1><p>'+esc(authorName(s.auteurId))+'</p><p class="small muted">'+esc(s.genre)+(s.lectures?', '+pl(s.lectures,'lecture'):'')+'</p></div></section>'+
  '<section class="pad"><p class="synopsis">'+esc(fr(s.resume))+'</p><div class="btns"><button class="btn" data-a="read" data-id="'+s.id+'" data-ch="0">Lire le chapitre 1</button>'+
  (au?'<button class="btn sec" data-a="follow" data-id="'+au.id+'" aria-pressed="'+!!foll+'">'+(foll?'Suivi':'Suivre '+esc(au.nom.split(' ')[0]))+'</button>':'')+'</div></section>'+
  '<section class="pad"><h2 class="h2">Chapitres</h2><ol class="chlist">'+chs+'</ol></section>'+
  '<section class="pad"><h2 class="h2">Commentaires</h2>'+(cms.length?cms.map(c=>'<div class="cm"><b>'+esc(c.n)+'</b><p>'+esc(fr(c.t))+'</p></div>').join(''):'<p class="muted">Aucun commentaire. Lance la conversation.</p>')+
  '<div class="cm-row"><input class="cm-in" id="cm-input" maxlength="280" placeholder="Ajouter un commentaire" aria-label="Ajouter un commentaire" data-enter="comment" data-id="'+s.id+'"><button class="btn sm" data-a="comment" data-id="'+s.id+'">Publier</button></div></section>';
}

const rbtn=(k,on,action,n)=>'<button class="rbtn'+(on?' on':'')+'" data-a="'+action+'" data-r="'+k+'" aria-pressed="'+on+'"><span class="re" aria-hidden="true">'+REACTS[k].e+'</span><span class="rl2">'+esc(REACTS[k].l)+'</span>'+(n?'<b class="rn">'+fmt(n)+'</b>':'')+'</button>';
const rcounts=key=>{const c=RC[key]||{},ks=Object.keys(REACTS).filter(k=>c[k]>0);return ks.length?'<span class="rcnt">'+ks.map(k=>'<span><span class="re" aria-hidden="true">'+REACTS[k].e+'</span>'+fmt(c[k])+'</span>').join('')+'</span>':'';};
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
   '<section class="chcm"><h2 class="h2">Commentaires sur ce chapitre'+(cc.length?' ('+cc.length+')':'')+'</h2>'+(cc.length?cc.map(c=>'<div class="cm"><b>'+esc(c.n)+'</b><p>'+esc(fr(c.t))+'</p></div>').join(''):'<p class="muted">Sois le premier à commenter ce chapitre.</p>')+
   '<div class="cm-row"><input class="cm-in" id="chcm-input" maxlength="280" placeholder="Ajouter un commentaire" aria-label="Ajouter un commentaire sur ce chapitre" data-enter="chcomment"><button class="btn sm" data-a="chcomment">Publier</button></div></section>';
  const rp=rprefs();
  return topBack(s.titre,'<button class="iconbtn aa" data-a="read-prefs" aria-label="Taille et police du texte">Aa</button>')+'<article class="reader" style="--rfs:'+RSIZES[rp.size]+'px;--rff:'+esc(RFONTS[rp.font][1])+'"><h1 class="h1">'+esc(ch.titre)+'</h1><p class="small muted meta">Chapitre '+(ci+1)+' sur '+s.chapitres.length+'</p><p class="rhint">Touche un paragraphe pour réagir <span class="rh-e">'+Object.keys(REACTS).map(k=>'<span class="re" aria-hidden="true">'+REACTS[k].e+'</span>').join(' ')+'</span></p>'+paras+chReact+
  (S.plan==='free'?'<p class="small muted reads-note">Chapitres lus cette semaine : '+S.reads.ids.length+' sur 3, le compteur repart lundi.</p>':'')+'</article>'+dock;
}

/* ===== s'exercer à écrire ===== */
const sortedComps=()=>COMPS.slice().sort((a,b)=>S.profile.scores[a.id]-S.profile.scores[b.id]);
function roleOf(compId){
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
  '<h2 class="h2">Ton profil d’écriture</h2><div class="prof2"><div><h3 class="h3">À travailler</h3><div class="tags">'+weak.map(c=>'<span class="tagc r">'+esc(c.nom)+' <b>'+S.profile.scores[c.id]+'</b></span>').join('')+'</div></div>'+
  '<div><h3 class="h3">Points forts</h3><div class="tags">'+strong.map(c=>'<span class="tagc g">'+esc(c.nom)+' <b>'+S.profile.scores[c.id]+'</b></span>').join('')+'</div></div></div>'+
  (note?'<div class="mem"><p class="hand">'+esc(fr(note.t))+'</p><p class="small muted">Noté par le coach sur '+esc(note.c.nom)+'</p></div>':'')+
  '<p class="small muted">Ces repères viennent des diagnostics du coach et se mettent à jour à chaque correction.</p></section>'+
  '<section class="pad"><h2 class="h2">'+(f==='reco'?'Ton programme du moment':'Exercices de '+esc(compOf(f).nom))+'</h2>'+chips+
  (f==='reco'?'<p class="small muted">Deux exercices pour ta compétence la plus basse, un pour la deuxième, un pour consolider ton point fort.</p>':'')+
  '<div>'+list.map(exCard).join('')+'</div></section>'+
  ((f==='reco'&&(S.coachExos||[]).length)?'<section class="pad"><h2 class="h2">Exercices proposés par le coach</h2><div>'+S.coachExos.slice(0,10).map(exCard).join('')+'</div></section>':'')+
  (doneList.length?'<section class="pad"><h2 class="h2">Exercices corrigés</h2><div>'+doneList.map(exCard).join('')+'</div></section>':'');
}
const findEx=id=>EXOS.find(x=>x.id===id)||(S.coachExos||[]).find(x=>x.id===id);
function exWcText(e,t){return pl(wc(t),'mot')+', vise environ '+e.mots+'.';}
function vExercice(p){
  const e=findEx(p.id);if(!e)return topBack('Exercice')+'<p class="empty">Exercice introuvable.</p>';
  const c=compOf(e.comp),r=roleOf(e.comp),sc=S.profile.scores[c.id],d=S.exDone[e.id],n=noteFor(c.id),draft=S.exDraft[e.id]||'';
  const hist=(S.exHist&&S.exHist[e.id])||[];
  const why=e.fromCoach?'Proposé par le coach après l’analyse de « '+e.source+' », pour travailler '+c.nom+' ('+sc+').':r.rank===0?c.nom+' est ta compétence la plus basse ('+sc+').':(r.rank===1?c.nom+' est ta deuxième compétence la plus basse ('+sc+').':(r.cls==='g'?c.nom+' est ton point fort ('+sc+') : cet exercice te pousse à le consolider.':'Tu es à '+sc+' en '+c.nom+'.'));
  return topBack('Exercice')+'<section class="pad"><div class="exc-l"><span class="tagc '+r.cls+'">'+r.label+'</span><span class="exc-c">'+esc(c.nom)+'</span></div>'+
  '<h1 class="h1">'+esc(e.titre)+'</h1><p class="small muted">'+e.min+' min, environ '+e.mots+' mots</p>'+
  '<div class="why"><p><b>Pourquoi cet exercice</b></p><p>'+esc(why)+'</p>'+(n?'<p class="hand">'+esc(fr(n))+'</p>':'')+'</div>'+
  '<h2 class="h2">Consigne</h2><p class="consigne">'+esc(fr(e.consigne))+'</p>'+
  '<h2 class="h2">Le conseil du coach</h2><p>'+esc(fr(c.methode))+'</p>'+
  '<h2 class="h2">Ton texte</h2><textarea class="ta seyes" data-in="exd" data-id="'+e.id+'" placeholder="Écris ton exercice ici…" spellcheck="true" lang="fr" aria-label="Ton texte pour l’exercice">'+esc(draft)+'</textarea>'+
  '<p class="small muted" id="exwc" style="margin-top:8px">'+esc(exWcText(e,draft))+'</p>'+
  (d?'<div class="note"><b>Dernière correction : '+d.score+'/100.</b> '+esc(fr(d.app))+(hist.length>1?'<br><span class="small">Tes '+hist.length+' corrections : '+hist.map(h=>h.score).join(' → ')+'</span>':'')+'<br><span class="small">Tu peux réécrire ton texte et le faire corriger à nouveau, autant de fois que tu veux.</span></div>':'')+
  '<div class="btns"><button class="btn block" data-a="exd-run" data-id="'+e.id+'">'+IC.cap+(d?'Faire corriger à nouveau':'Faire corriger par le coach')+'</button></div>'+
  (S.plan==='free'?'<p class="small muted" style="margin-top:10px">La correction par le coach est incluse dans Plume + et Plume ++.</p>':'')+'</section>';
}

function vEcrire(){
  const pubs=S.manuscripts.filter(m=>m.published).length;
  const rows=S.manuscripts.map(m=>{
    const w=m.chapitres.reduce((a,c)=>a+wc(c.texte),0);
    return '<button class="ms" data-a="ms-open" data-id="'+m.id+'"><span class="mi"><b>'+esc(m.titre||'Sans titre')+'</b><span class="small muted">'+pl(w,'mot')+', '+pl(m.chapitres.length,'chapitre')+'</span></span><span class="pill'+(m.published?' pub':'')+'">'+(m.published?'Publié':'Brouillon')+'</span></button>';
  }).join('');
  const seg='<div class="seg top-seg" role="group" aria-label="Section"><button data-a="ecrire-tab" data-t="ms" aria-pressed="'+(UI.ecrireTab!=='ex')+'">Mes manuscrits</button><button data-a="ecrire-tab" data-t="ex" aria-pressed="'+(UI.ecrireTab==='ex')+'">S’exercer à écrire</button></div>';
  if(UI.ecrireTab==='ex')return brandTop()+'<section class="pad"><h1 class="h1">Écrire</h1>'+seg+'</section>'+vExercices();
  return brandTop()+'<section class="pad"><h1 class="h1">Écrire</h1>'+seg+'<p class="muted" style="margin-top:14px">Tes manuscrits sont enregistrés sur cet appareil.</p>'+
  (S.plan==='free'?'<div class="note or">Avec le forfait Gratuit, tu peux publier 1 histoire au total ('+pubs+' sur 1 aujourd’hui).</div>':'')+
  '<div>'+rows+'</div><div class="btns"><button class="btn block" data-a="ms-new">'+IC.plus+'Nouveau manuscrit</button></div></section>';
}

function vEditor(p){
  const m=getMs(p.id);if(!m)return topBack('Manuscrit')+'<p class="empty">Ce manuscrit est introuvable.</p>';
  const act=clamp(m.active||0,0,m.chapitres.length-1),c=m.chapitres[act];
  return '<header class="top"><button class="iconbtn" data-a="back" aria-label="Retour">'+IC.back+'</button><input class="title-in" id="ms-title" value="'+esc(m.titre)+'" data-in="ms-title" maxlength="80" aria-label="Titre du manuscrit"><button class="btn sm'+(m.published?' sec':'')+'" data-a="ms-publish" data-id="'+m.id+'">'+(m.published?'Publié':'Publier')+'</button></header>'+
  '<div class="pad"><div class="chips" role="group" aria-label="Chapitres">'+m.chapitres.map((ch,i)=>'<button class="chip'+(i===act?' on':'')+'" data-a="ms-ch" data-i="'+i+'">Chapitre '+(i+1)+'</button>').join('')+'<button class="chip" data-a="ms-addch">'+IC.plus+'Chapitre</button></div>'+
  '<div class="jq">'+cover(msToStory(m),'mini')+'<div><b>Jaquette</b><span class="small muted">'+(m.jaquette?'Ta jaquette personnalisée.':'Couverture bleue par défaut. Tu peux ajouter ta propre image.')+'</span><div class="jq-btns"><button class="btn sm sec" data-a="ms-cover">'+(UI.coverBusy?'Envoi…':(m.jaquette?'Changer':'Ajouter une jaquette'))+'</button>'+(m.jaquette?'<button class="btn sm ghost" data-a="ms-cover-rm">Retirer</button>':'')+'</div></div><input type="file" accept="image/*" id="cover-in" data-in="cover-file" hidden></div>'+
  '<div class="ed-meta"><input class="line-in" id="ch-title" value="'+esc(c.titre)+'" data-in="ch-title" maxlength="80" aria-label="Titre du chapitre"><select class="sel-in" data-in="ms-genre" aria-label="Genre">'+GENRES_EDIT.map(g=>'<option'+(g===m.genre?' selected':'')+'>'+g+'</option>').join('')+'</select></div></div>'+
  '<textarea class="ta seyes" id="ms-text" data-in="ms-text" placeholder="Écris ta scène ici…" spellcheck="true" lang="fr" aria-label="Texte du chapitre">'+esc(c.texte)+'</textarea>'+
  '<div class="dock"><span class="small muted" id="wc">'+pl(wc(c.texte),'mot')+'</span><button class="btn" data-a="coach-open">'+IC.cap+'Demander au coach</button></div>';
}

function vProgression(){
  const L=level(),w=weakest(),ws=S.profile.scores[w.id],d=L.moy-L.prev;
  const mem=S.profile.memory.slice(0,2).map(x=>'<div class="mem"><p class="hand">'+esc(fr(x.note))+'</p><p class="small muted">'+esc(compOf(x.comp).nom)+', '+dateFr(x.quand)+'</p></div>').join('');
  const atl=COMPS.map(c=>{
    const sc=S.profile.scores[c.id],dv=sc-S.profile.prev[c.id];
    return '<button class="atl" data-a="atelier" data-id="'+c.id+'"><span class="t"><b>'+esc(c.nom)+'</b><span class="small muted">'+esc(c.objectif)+'</span></span><span class="sc"><b>'+sc+'</b>'+deltaChip(dv)+'</span><span class="bar" aria-hidden="true"><i style="width:'+sc+'%"></i></span></button>';
  }).join('');
  const hist=S.profile.history.slice(0,5).map(h=>'<div class="hist"><span class="hs">'+h.score+'</span><div><p><b>'+esc(h.comp==='global'?'Analyse globale':compOf(h.comp).nom)+'</b>, '+esc(h.titre)+'</p><p class="muted">'+esc(fr(h.appreciation))+'</p><p class="small muted">'+dateFr(h.quand)+(h.src==='local'?', analyse locale':'')+'</p></div></div>').join('');
  return brandTop()+'<section class="pad"><h1 class="h1">Progression</h1>'+
  '<div class="lvl"><div><span class="lv-n">Niveau '+L.n+'</span><b class="serif lv-name">'+L.nom+'</b></div><div class="lv-score"><b>'+L.moy+'</b><span>sur 100 en moyenne</span></div></div>'+
  '<p class="small '+(d>=0?'pos':'neg')+'">'+(d>0?'+':(d<0?'−':''))+Math.abs(d)+' points par rapport au niveau observé il y a trois mois ('+L.prev+').</p>'+
  radar()+'<div class="legend"><span><i></i>Aujourd’hui</span><span><i class="off"></i>Il y a trois mois</span></div></section>'+
  '<section class="pad"><h2 class="h2">Objectif du mois</h2><div class="goal"><p><b>'+esc(w.nom)+'</b>, ta compétence la plus basse : passe de '+ws+' à '+Math.min(100,ws+7)+'.</p><p class="small muted">'+esc(w.methode)+'</p><button class="btn sm" data-a="atelier" data-id="'+w.id+'">Ouvrir l’atelier</button></div></section>'+
  '<section class="pad"><h2 class="h2">Ce que le coach a retenu</h2>'+(mem||'<p class="muted">Le coach notera tes habitudes d’écriture après ton premier diagnostic.</p>')+'</section>'+
  '<section class="pad"><h2 class="h2">École d’écriture</h2>'+atl+'</section>'+
  '<section class="pad"><h2 class="h2">Historique des diagnostics</h2>'+(hist||'<p class="muted">Aucun diagnostic pour l’instant.</p>')+'</section>'+
  '<p class="pad small muted">Les scores de départ sont des données de démonstration. Ils évoluent avec chaque diagnostic.</p>';
}

function vAtelier(p){
  const c=compOf(p.id);if(!c)return topBack('Atelier')+'<p class="empty">Atelier introuvable.</p>';
  const sc=S.profile.scores[c.id],dv=sc-S.profile.prev[c.id];
  return topBack('Atelier')+'<section class="pad"><h1 class="h1">'+esc(c.nom)+'</h1><p class="muted">'+esc(c.objectif)+'</p>'+
  '<div class="lvl"><div><span class="lv-n">Ton score</span></div><div class="lv-score"><b>'+sc+'</b>'+deltaChip(dv)+'</div></div><div class="bar" aria-hidden="true"><i style="width:'+sc+'%"></i></div></section>'+
  '<section class="pad"><h2 class="h2">Méthode</h2><p>'+esc(fr(c.methode))+'</p></section>'+
  '<section class="pad"><h2 class="h2">Question de travail</h2><p class="q">'+esc(fr(c.question))+'</p></section>'+
  '<section class="pad"><h2 class="h2">Exercice</h2><p>'+esc(fr(c.exercice))+'</p><div style="height:12px"></div><textarea class="ta seyes" data-in="exo" data-id="'+c.id+'" placeholder="Écris ton exercice ici…" spellcheck="true" lang="fr" aria-label="Ton exercice">'+esc(S.exos[c.id]||'')+'</textarea><div class="btns"><button class="btn block" data-a="exo-run" data-id="'+c.id+'">'+IC.cap+'Faire analyser par le coach</button></div></section>'+
  '<section class="pad"><h2 class="h2">Grille d’analyse</h2><ul class="gr">'+c.grille.map(g=>'<li>'+IC.check+'<span>'+esc(g)+'</span></li>').join('')+'</ul><p class="small muted">Le coach utilise cette grille pour analyser tes textes sur cette compétence.</p></section>';
}

function vProfil(){
  const u=S.user,L=level(),pub=S.manuscripts.filter(m=>m.published).length,pl_=PLANS[S.plan];
  const saved=S.saved.map(findStory).filter(Boolean);
  return brandTop()+'<section class="pad prof-head">'+avatar(u?u.name:'Invité',64)+'<div><h1 class="h1" style="margin:0">'+esc(u?u.name:'Invité')+'</h1><p class="muted">Niveau '+L.n+', '+L.nom+'</p></div></section>'+
  '<section class="pad">'+(u
    ?'<div class="panel"><div class="split"><b>'+esc(pl_.nom)+'</b><span>'+esc(pl_.prixTxt)+'</span></div><p class="small muted">'+(S.plan==='free'?'Diagnostic personnalisé réservé aux abonnements.':cr(budgetLeft())+' de coach restants ce mois-ci.')+'</p><button class="btn sec block" data-a="go-account">Mon espace client</button></div>'
    :'<div class="note"><b>Tu explores Plume en mode découverte.</b><br>Crée ton espace client pour retrouver ton abonnement, ton budget de coach et tes manuscrits.</div><button class="btn block" data-a="login-go">Se connecter</button>')+'</section>'+
  '<section class="pad"><div class="stats"><div><b>'+pub+'</b><span>Publiées</span></div><div><b>'+saved.length+'</b><span>Favoris</span></div><div><b>'+S.profile.history.length+'</b><span>Diagnostics</span></div></div>'+
  '<h2 class="h2" style="margin-top:6px">Mes favoris</h2>'+(saved.length?saved.map(storyRow).join(''):'<p class="empty">Aucun favori pour l’instant. Touche l’étoile d’une histoire pour la retrouver ici.</p>')+'</section>'+
  '<section class="pad"><h2 class="h2">Apparence</h2><div class="seg" role="group" aria-label="Thème">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(t=>'<button data-a="theme" data-v="'+t[0]+'" aria-pressed="'+(S.theme===t[0])+'">'+t[1]+'</button>').join('')+'</div>'+'</section>';
}

function vAccount(){
  const u=S.user;
  if(!u)return topBack('Espace client')+'<section class="pad"><p class="empty">Tu n’es pas connecté.</p><button class="btn block" data-a="login-go">Se connecter</button></section>';
  const pl_=PLANS[S.plan],budget=pl_.budget,used=S.credits.used,pct=budget?Math.min(100,used/budget*100):0;
  return topBack('Espace client')+'<section class="pad acc-head">'+avatar(u.name,64)+'<div><h1 class="h1" style="margin:0">'+esc(u.name)+'</h1><p class="muted">'+esc(u.email)+'</p><p class="small muted">Connexion : '+esc(u.mode)+'</p></div></section>'+
  '<section class="pad"><h2 class="h2">Abonnement</h2><div class="panel"><div class="split"><b>'+esc(pl_.nom)+'</b><span>'+esc(pl_.prixTxt)+'</span></div><p class="small muted">'+(S.plan==='free'?'Lecture limitée à 3 chapitres par semaine et 1 histoire publiée.':'Lecture et publication illimitées.')+'</p><button class="btn sec block" data-a="plans-open">Voir les forfaits</button></div></section>'+
  '<section class="pad"><h2 class="h2">Budget du coach IA</h2><div class="panel">'+(budget
    ?'<div class="split"><b>'+cr(Math.max(0,budget-used))+' restants</b><span class="small muted">sur '+fmt(budget)+'</span></div><div class="bar'+(pct>90?' hot':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+budget+'" aria-valuenow="'+Math.min(used,budget)+'"><i style="width:'+pct+'%"></i></div><p class="small muted" style="margin-top:10px">'+cr(used)+' utilisés ce mois-ci. Tes crédits reviennent le '+resetLabel()+'.</p><p class="small muted" style="margin-top:6px">'+CREDIT_HELP+'</p>'
    :'<p class="small muted">Le forfait Gratuit ne comprend pas de diagnostic personnalisé. Plume + offre 50 crédits par mois, Plume ++ en offre 200. '+CREDIT_HELP+'</p>')+'</div></section>'+
  '<section class="pad"><h2 class="h2">Achats et données</h2><button class="rowitem" data-a="restore"><span>Restaurer les achats Google Play<small>Relit tes abonnements depuis Google Play.</small></span>'+IC.next+'</button>'+
  '<div class="rowitem"><span>Conserver les données locales<small>Garde tes manuscrits et ta progression à la déconnexion.</small></span><button class="switch" role="switch" aria-checked="'+S.keepData+'" aria-label="Conserver les données locales" data-a="keep"></button></div></section>'+
  '<section class="pad"><button class="btn danger block" data-a="logout">Se déconnecter</button></section>';
}

function vPlans(){
  const sel=UI.planSel||S.plan;
  const cards=['free','plus','pp'].map(id=>{
    const p=PLANS[id];
    return '<div class="plan" role="radio" tabindex="0" aria-checked="'+(sel===id)+'" data-a="plan-pick" data-id="'+id+'"><span class="radio" aria-hidden="true"></span><div class="pl-main"><div class="pl-top"><span class="pl-name">'+esc(p.nom)+'</span><span class="pl-price">'+esc(p.prixTxt)+'</span></div><ul>'+p.points.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(S.plan===id?'<span class="tag">Forfait actuel</span>':'')+'</div></div>';
  }).join('');
  const label=sel===S.plan?'Forfait actuel':(sel==='free'?'Revenir au forfait Gratuit':'Passer à '+PLANS[sel].nom);
  return topBack('Forfaits')+'<section class="pad"><h1 class="h1">Choisis ton forfait</h1><p class="muted">Dès Plume +, la lecture et la publication restent illimitées, même quand ton budget de coach est épuisé.</p>'+
  '<div class="note or">Mode aperçu : aucun paiement n’est effectué. Sur Android, l’achat réel passera par Google Play Billing.</div>'+
  '<div class="plans" role="radiogroup" aria-label="Forfaits">'+cards+'</div><div class="btns"><button class="btn block" data-a="plan-go"'+(sel===S.plan?' disabled':'')+'>'+esc(label)+'</button></div>'+
  '<p class="small muted" style="margin-top:12px">Le compteur de lecture gratuit repart chaque lundi. Le budget de coach IA repart le 1er de chaque mois.</p></section>';
}

function vLogin(){
  const L=UI.login,dis=L.busy?' disabled':'',up=L.mode!=='signin';
  return topBack('Connexion')+'<section class="pad login"><div class="brand big">'+IC.feather+'<span>Plume</span></div><h1 class="h1">'+(up?'Crée ton espace client':'Content de te revoir')+'</h1><p class="muted">Retrouve ton abonnement, ton budget de coach et tes manuscrits.</p>'+
  (up?'<label class="field"><span>Prénom</span><input id="lg-name" data-in="lg-name" data-enter="login-submit" autocomplete="given-name" value="'+esc(L.name)+'"'+dis+'></label>':'')+
  '<label class="field"><span>Adresse e-mail</span><input id="lg-mail" type="email" inputmode="email" autocomplete="email" data-in="lg-mail" data-enter="login-submit" value="'+esc(L.email)+'"'+dis+'></label>'+
  '<label class="field"><span>Mot de passe</span><input id="lg-pass" type="password" autocomplete="'+(up?'new-password':'current-password')+'" data-in="lg-pass" data-enter="login-submit" value="'+esc(L.pass)+'"'+dis+'></label>'+
  '<button class="btn block" data-a="login-submit"'+dis+'>'+(L.busy?'Connexion en cours…':(up?'Créer mon compte':'Se connecter'))+'</button>'+
  '<button class="btn ghost block" data-a="login-mode"'+dis+'>'+(up?'J’ai déjà un compte':'Créer un compte')+'</button>'+
  '<button class="btn ghost block" data-a="back"'+dis+'>Continuer en mode découverte</button>'+
  '<p class="small muted">'+(up?'Au moins 6 caractères pour le mot de passe. ':'')+'Tes manuscrits et ta progression sont sauvegardés sur ton compte.</p></section>';
}

/* ===== feuilles ===== */
const closeBtn='<button class="iconbtn" data-a="sheet-close" aria-label="Fermer">'+IC.x+'</button>';
const TEND={hausse:['en hausse',IC.up],stable:['stable',IC.flat],baisse:['en baisse',IC.down]};
const SHEET_LABEL={paywall:'Réservé aux abonnements',budget:'Crédits du coach IA',lecture:'Affichage du texte',coach:'Coach d’écriture',confirm:'Confirmation'};
function coachGlobalResult(C){
  const r=C.res,prio=compOf(r.priorite),pi=r.items.find(i=>i.id===r.priorite);
  const rows=r.items.map(i=>{
    const c=compOf(i.id),t=TEND[i.tendance],star=i.id===r.priorite;
    return '<details class="cd"'+(star?' open':'')+'><summary><span class="chev">'+IC.next+'</span><span class="cn">'+esc(c.nom)+(star?'<em class="prio">Priorité</em>':'')+'</span><span class="cs">'+i.score+'</span><span class="bar" aria-hidden="true"><i style="width:'+i.score+'%"></i></span></summary><div class="cb">'+
      (i.diagnostic?'<p>'+esc(fr(i.diagnostic))+'</p>':'')+
      (i.force?'<p class="g"><b>Ce qui fonctionne.</b> '+esc(fr(i.force))+'</p>':'')+
      (i.attention?'<p class="r"><b>À travailler.</b> '+esc(fr(i.attention))+'</p>':'')+
      (i.exercice?'<p><b>Exercice.</b> '+esc(fr(i.exercice))+'</p>'+'<button class="btn sm cx-go" data-a="cx-start" data-id="'+i.id+'">'+IC.pen+'Faire cet exercice</button>':'')+
      '<p class="small muted">Ton score passe de '+C.olds[i.id]+' à '+S.profile.scores[i.id]+', tendance '+t[0]+'.</p></div></details>';
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
 budget:()=>'<div class="sheet-head"><h2 class="h2">Plus de crédits ce mois-ci</h2>'+closeBtn+'</div><p>Tu as utilisé tes '+cr(PLANS[S.plan].budget)+' de ce mois-ci. Ils reviennent le '+resetLabel()+'. La lecture et la publication restent illimitées.</p><div class="btns">'+(S.plan==='plus'?'<button class="btn" data-a="upgrade">Passer à Plume ++</button>':'')+'<button class="btn sec" data-a="sheet-close">Fermer</button></div>',
 lecture:()=>{
  const rp=rprefs();
  return '<div class="sheet-head"><h2 class="h2">Affichage du texte</h2>'+closeBtn+'</div>'+
  '<h3 class="h3">Taille</h3><div class="rsize"><button class="btn sec" data-a="rsize" data-d="-1" aria-label="Plus petit"'+(rp.size===0?' disabled':'')+'><span style="font-size:14px">A</span></button>'+
  '<div class="rdots" aria-hidden="true">'+RSIZES.map((x,i)=>'<i class="'+(i<=rp.size?'on':'')+'"></i>').join('')+'</div>'+
  '<button class="btn sec" data-a="rsize" data-d="1" aria-label="Plus grand"'+(rp.size===RSIZES.length-1?' disabled':'')+'><span style="font-size:22px">A</span></button></div>'+
  '<h3 class="h3" style="margin-top:16px">Police</h3><div class="rfonts" role="radiogroup" aria-label="Police">'+Object.keys(RFONTS).map(k=>'<button class="rfont'+(rp.font===k?' on':'')+'" role="radio" aria-checked="'+(rp.font===k)+'" data-a="rfont" data-f="'+k+'" style="font-family:'+esc(RFONTS[k][1])+'"><b>'+RFONTS[k][0]+'</b><span>Il était une fois, au bord de la mer…</span></button>').join('')+'</div>'+
  '<div class="btns"><button class="btn block" data-a="sheet-close">OK</button></div>';
 },
 confirm:p=>{
  const T=p.kind==='logout'
   ?['Se déconnecter ?','Ton abonnement en aperçu sera désactivé. '+(S.keepData?'Tes manuscrits et ta progression restent sur cet appareil.':'Tes manuscrits et ta progression locale seront effacés.'),'Se déconnecter']
   :['Réinitialiser la démo ?','Tes manuscrits, ta progression et tes réglages locaux reviennent aux données de démonstration.','Réinitialiser'];
  return '<h2 class="h2">'+T[0]+'</h2><p>'+T[1]+'</p><div class="btns"><button class="btn danger" data-a="confirm-yes" data-k="'+p.kind+'">'+T[2]+'</button><button class="btn sec" data-a="sheet-close">Annuler</button></div>';
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
    '<p class="small muted">'+(C.note?esc(C.note)+' ':'')+'Ton score en '+esc(comp.nom)+' passe de '+C.oldScore+' à '+C.newScore+'. Diagnostic ajouté à ton profil.'+(C.src==='ia'?' Cette analyse a utilisé '+cr(C.tokens)+', il t’en reste '+budgetLeft()+' ce mois-ci.':' Aucun crédit utilisé.')+'</p>'+
    (C.exId?'<div class="btns"><button class="btn" data-a="sheet-close">'+IC.pen+'Retravailler mon texte</button><button class="btn sec" data-a="coach-progress">Voir ma progression</button></div>'
      :'<div class="btns"><button class="btn" data-a="coach-progress">Voir ma progression</button><button class="btn sec" data-a="sheet-close">Fermer</button></div>');
  }
  const ai=HAS_AI===true?'Analyse par le coach IA.':(HAS_AI===false?'Le coach IA n’est pas disponible pour le moment : une analyse locale simplifiée sera utilisée.':'Connexion au coach IA…');
  return '<div class="sheet-head"><h2 class="h2">Coach d’écriture</h2>'+closeBtn+'</div>'+
  '<p class="muted">Le coach lit « '+esc(C.title)+' », t’explique ce qui marche et ce qui manque, puis te propose un exercice. Il n’écrit jamais la suite à ta place.</p>'+
  '<h3 class="h3" style="margin-top:16px">Compétence à analyser</h3><div class="chips wrap">'+COMPS.map(c=>'<button class="chip'+(C.compId===c.id?' on':'')+'" data-a="coach-comp" data-id="'+c.id+'" aria-pressed="'+(C.compId===c.id)+'">'+esc(c.nom)+'</button>').join('')+'</div>'+
  '<p class="small muted">Suggestion : '+esc(w.nom)+', ta compétence la plus basse ('+S.profile.scores[w.id]+').</p>'+
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
const TABS=[['decouvrir','Découvrir',IC.compass],['ecrire','Écrire',IC.pen],['progression','Progression',IC.chart],['profil','Profil',IC.user]];
const SCREENS={'tab:decouvrir':vDecouvrir,'tab:ecrire':vEcrire,'tab:progression':vProgression,'tab:profil':vProfil,story:vStory,reader:vReader,editor:vEditor,atelier:vAtelier,exercice:vExercice,account:vAccount,plans:vPlans,login:vLogin};
let lastKey='';
function autosize(el){
  if(!el)return;
  el.style.height='auto';
  const min=parseInt(getComputedStyle(el).minHeight,10)||0;
  el.style.height=Math.max(min,el.scrollHeight+(el.id==='ms-text'?64:0))+'px';
}
function updateWc(){
  const el=$('#wc');if(!el||!UI.stack.length||UI.stack[UI.stack.length-1].name!=='editor')return;
  const m=curMs();if(m)el.textContent=pl(wc(curCh().texte),'mot');
}
function render(){
  const c=UI.stack.length?UI.stack[UI.stack.length-1]:{name:'tab:'+UI.tab,p:{}};
  const key=c.name+JSON.stringify(c.p),v=$('#view'),st=key===lastKey?v.scrollTop:0;
  let html;
  try{html=SCREENS[c.name](c.p);}catch(e){console.error(e);html='<p class="empty">Cet écran n’a pas pu s’afficher.</p>';}
  v.innerHTML=html;v.scrollTop=st;lastKey=key;
  $('#tabs').hidden=UI.stack.length>0;
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-current',(!UI.stack.length&&b.dataset.t===UI.tab)?'page':'false'));
  document.querySelectorAll('.ta').forEach(autosize);
}
function go(name,p){UI.stack.push({name:name,p:p||{}});render();}
function setTab(t){UI.tab=t;UI.stack=[];render();}
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),3200);}
function applyTheme(){const r=document.documentElement;if(S.theme==='light'||S.theme==='dark')r.setAttribute('data-theme',S.theme);else r.removeAttribute('data-theme');}

/* ===== actions ===== */
const A={};
A.tab=d=>setTab(d.t);
A.back=()=>{UI.stack.pop();UI.reader={sel:null};render();};
A.genre=d=>{UI.genre=d.g;render();};
A.story=d=>go('story',{id:d.id});
A.follow=d=>{
  if(!SESSION)return needLogin('Connecte-toi pour suivre un auteur.');
  const i=S.following.indexOf(d.id),on=i<0;
  if(on){S.following.push(d.id);const a=authorsAll().find(x=>x.id===d.id);toast('Tu suis '+(a?a.nom:'cet auteur')+'.');}else S.following.splice(i,1);
  bump(FOLL,d.id,on?1:-1);B.setFollow(SESSION.user.id,d.id,on);save();render();
};
A.save=d=>{const i=S.saved.indexOf(d.id);if(i<0){S.saved.push(d.id);toast('Histoire ajoutée à tes favoris.');}else S.saved.splice(i,1);save();render();};
A.read=d=>{
  const s=findStory(d.id);if(!s)return;
  const ci=+d.ch,key=s.id+':'+ci;rollover();
  if(S.plan==='free'&&!S.reads.ids.includes(key)){
    if(S.reads.ids.length>=3)return openSheet('paywall',{why:'read'});
    S.reads.ids.push(key);save();
  }
  UI.reader={sel:null};
  const top=UI.stack[UI.stack.length-1];
  if(top&&top.name==='reader'){top.p={id:s.id,ch:ci};render();}else go('reader',{id:s.id,ch:ci});
  if(SESSION)B.markRead(SESSION.user.id,s.id,ci);
  loadStats(s,ci);
  $('#view').scrollTop=0;
};
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
  bump(LIKES,key,on?1:-1);B.setLike(SESSION.user.id,key,on);save();render();
};
function loadStats(s,ci){
  const base=s.id+':'+ci,keys=[base].concat(s.chapitres[ci].texte.map((t,i)=>base+':'+i));
  B.chapterStats(keys).then(st=>{keys.forEach(k=>{RC[k]=st.reactions[k]||{};LIKES[k]=st.likes[k]||0;});const p=curP();if(p.id===s.id&&p.ch===ci)render();}).catch(e=>console.error(e));
}
async function postComment(key,t){
  if(!SESSION){toast('Connecte-toi pour commenter.');return go('login');}
  try{await B.addComment(SESSION.user.id,S.user.name,key,t);}catch(e){return toast(e.message);}
  (SHARED_CM[key]=SHARED_CM[key]||[]).push({n:S.user.name,t:t});render();toast('Commentaire publié.');
}
A.chcomment=()=>{const inp=$('#chcm-input');const t=inp?inp.value.trim():'';if(!t)return;const p=curP();postComment('c:'+p.id+':'+p.ch,t);};
A.comment=d=>{const inp=$('#cm-input');const t=inp?inp.value.trim():'';if(!t)return;postComment('s:'+d.id,t);};
A['ms-open']=d=>go('editor',{id:d.id});
A['ms-new']=()=>{const id='m'+Date.now();S.manuscripts.push({id:id,titre:'Sans titre',genre:'Drame',resume:'',published:false,active:0,chapitres:[{id:'c'+Date.now(),titre:'Chapitre 1',texte:''}]});save();go('editor',{id:id});};
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
  if(!m.published){
    if(S.plan==='free'&&S.manuscripts.filter(x=>x.published).length>=1)return openSheet('paywall',{why:'publish'});
    if(wc(m.chapitres.map(c=>c.texte).join(' '))<10)return toast('Écris quelques lignes avant de publier.');
    m.published=true;toast('Histoire publiée. Elle apparaît dans Découvrir.');
  }else{m.published=false;toast('Histoire retirée de Découvrir.');}
  save();render();
};
A['coach-open']=()=>{const m=curMs(),c=curCh();openCoach({text:c.texte,title:(m.titre||'Sans titre')+', '+c.titre});};
A['coach-comp']=d=>{UI.coach.compId=d.id;renderSheet();};
A['coach-run']=()=>{UI.coach.mode='single';runCoach();};
A['coach-global']=()=>runGlobal();
A['coach-retry']=()=>{if(UI.coach.mode==='global')runGlobal();else runCoach();};
A['coach-back']=()=>{UI.coach.phase='choose';UI.coach.errKind=null;renderSheet();};
A['coach-stop']=()=>{if(UI.coach&&UI.coach.ctl)UI.coach.ctl.abort();if(UI.coach&&UI.coach.phase==='loading'&&!sampleFn){UI.coach.phase='choose';renderSheet();}};
A['coach-local']=()=>{const C=UI.coach,n='Analyse locale simplifiée (statistiques du texte).';if(C.mode==='global')finishGlobal(localGlobal(C.text),'local',n,0);else finish(localCoach(compOf(C.compId),C.text),'local',n,0);};
A['coach-progress']=()=>{closeSheet();setTab('progression');};
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
  const sel=UI.planSel;if(sel===S.plan)return;
  if(!S.user){toast('Connecte-toi pour activer un forfait.');return go('login');}
  S.plan=sel;save();
  toast(sel==='free'?'Retour au forfait Gratuit.':PLANS[sel].nom+' activé en mode aperçu. Aucun débit n’a eu lieu.');
  render();
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
    render();toast('Connecté. Bienvenue, '+S.user.name+'.');
  }catch(e){L.busy=false;render();toast(e.message||'La connexion a échoué.');}
};
A['go-account']=()=>go('account');
A.logout=()=>openSheet('confirm',{kind:'logout'});
A.reset=()=>openSheet('confirm',{kind:'reset'});
A['confirm-yes']=d=>{
  const th=S.theme,kd=S.keepData;
  if(d.k==='logout'){
    B.flush().finally(()=>B.signOut());SESSION=null;
    const wipe=!S.keepData;
    if(wipe){S=seed();S.theme=th;S.keepData=kd;}else{S.user=null;S.plan='free';}
    toast('Tu es déconnecté.');
  }else{S=seed();S.theme=th;if(SESSION)S.user=userObj(SESSION);toast('Données de démonstration rétablies.');}
  applyTheme();save();UI.sheet=null;UI.coach=null;renderSheet();UI.stack=[];UI.tab='profil';render();
};
A.keep=()=>{S.keepData=!S.keepData;save();render();};
A.restore=()=>toast('Mode aperçu : la restauration Google Play est inactive. En production, elle relit tes achats depuis Google Play.');
A.theme=d=>{S.theme=d.v;applyTheme();save();render();};

const IN={
 'ms-title':el=>{curMs().titre=el.value;save();},
 'ch-title':el=>{curCh().titre=el.value;save();},
 'ms-genre':el=>{curMs().genre=el.value;save();},
 'ms-text':el=>{curCh().texte=el.value;autosize(el);updateWc();save();},
 exo:el=>{S.exos[el.dataset.id]=el.value;autosize(el);save();},
 exd:el=>{S.exDraft[el.dataset.id]=el.value;autosize(el);const e=findEx(el.dataset.id),w=$('#exwc');if(w&&e)w.textContent=exWcText(e,el.value);save();},
 'lg-name':el=>{UI.login.name=el.value;},
 'lg-mail':el=>{UI.login.email=el.value;},
 'lg-pass':el=>{UI.login.pass=el.value;},
 'cover-file':el=>{onCoverFile(el);}
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

/* ===== démarrage ===== */
applyTheme();rollover();
$('#tabs').innerHTML=TABS.map(t=>'<button class="tab" data-a="tab" data-t="'+t[0]+'">'+t[2]+'<span>'+t[1]+'</span></button>').join('');
render();getSample();boot();

async function attach(se){
  SESSION=se;
  let remote=null;
  try{remote=await B.loadState(se.user.id);}catch(e){console.error(e);}
  if(remote){const th=S.theme;S=migrateReacts(Object.assign(seed(),remote));if(!remote.theme)S.theme=th;}
  try{const plan=await B.loadPlan();if(plan)S.plan=plan;}catch(e){console.error(e);}
  try{const used=await B.loadCreditsUsed();if(used!=null)S.credits={month:monthKey(),used};}catch(e){console.error(e);}
  S.user=userObj(se);
  applyTheme();rollover();save();
}
async function boot(){
  const [pub,cms,cnt]=await Promise.all([B.loadPublished(),B.loadComments(),B.loadCounts()]);
  READS=cnt.reads;FOLL=cnt.follows;
  REMOTE_STORIES=pub.map(r=>{const st=Object.assign({},r.story,{id:r.id,auteurId:'ext:'+r.author_id,authorUid:r.author_id,mine:false,lectures:0});EXT_AUTHORS[st.auteurId]=r.author_name||'Auteur Plume';return st;});
  cms.forEach(c=>{(SHARED_CM[c.key]=SHARED_CM[c.key]||[]).push({n:c.author_name||'Lecteur',t:c.body});});
  try{const se=await B.getSession();if(se)await attach(se);}catch(e){console.error(e);}
  render();
}

