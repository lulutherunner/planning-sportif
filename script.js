// ----- Données de base -----

let planning = JSON.parse(localStorage.getItem('planning') || '{}');

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const semaineContainer = document.getElementById('semaine');

// ----- Activités et couleurs -----

const activites = {

  "Footing": "#FFA500",          // Orange

  "Sortie longue": "#FFA500",    // Orange

  "Fractionné": "#FFA500",       // Orange

  "Renfo court": "#32CD32",      // Vert

  "Renfo long": "#32CD32",       // Vert

  "Fullbody HYROX": "#00BFFF",   // Bleu
  
  "Course" : "#FFD700"   // Or

};

// ----- Calcul de la semaine actuelle -----

function getSemaineNumber(date) {

  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

}

let semaineActuelle = parseInt(localStorage.getItem('semaineActuelle') || 0);

const semaineReelle = getSemaineNumber(new Date());

if (semaineReelle !== semaineActuelle) {

  semaineActuelle = semaineReelle;

  localStorage.setItem('semaineActuelle', semaineActuelle);

}

// ----- Affichage de la semaine -----

function afficherSemaine(semaine) {
    // Nettoyage
    semaineContainer.innerHTML = '';
    // Calcul du lundi et affichage de la date
    const lundi = getMondayOfWeek(semaine);
    const dateLundi = lundi.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    // Header : flèches + titre (sera au-dessus des colonnes grâce au CSS #semaine { flex-direction: column })
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '0';
    header.style.fontWeight = 'bold';
    header.style.width = '100%';
    header.style.maxWidth = '1000px'; // limite la largeur du header pour le centrer visuellement
    const prev = document.createElement('button');
    prev.textContent = "⬅️";
    prev.style.fontSize = '20px';
    prev.onclick = () => changerSemaine(-1);
    const titreSemaine = document.createElement('div');
    titreSemaine.textContent = `Semaine ${semaine} – à partir du ${dateLundi}`;
    titreSemaine.style.textAlign = 'center';
    titreSemaine.style.flex = '1';
    const next = document.createElement('button');
    next.textContent = "➡️";
    next.style.fontSize = '20px';
    next.onclick = () => changerSemaine(1);
    header.appendChild(prev);
    header.appendChild(titreSemaine);
    header.appendChild(next);
    // On ajoute d'abord le header AU CONTENEUR #semaine
    semaineContainer.appendChild(header);
    // Puis on crée un wrapper .columns qui contiendra toutes les colonnes en ligne
    const columnsWrap = document.createElement('div');
    columnsWrap.className = 'columns';
    // Colonnes par jour
    jours.forEach((jour, i) => {
      const col = document.createElement('div');
      col.classList.add('colonne');
      col.dataset.jour = jour;
      const titre = document.createElement('h3');
      const jourDate = new Date(lundi);
      jourDate.setDate(lundi.getDate() + i);
      titre.textContent = `${jour} ${jourDate.getDate()}/${jourDate.getMonth() + 1}`;
      col.appendChild(titre);
      const key = getSemaineKey(semaine);
      const activitesJour = (planning[key] && planning[key][jour]) || [];
      activitesJour.forEach(act => {
        const postit = creerPostit(act.titre, act.couleur);
        col.appendChild(postit);
      });
      col.addEventListener('dragover', dragOver);
      col.addEventListener('drop', drop);
      columnsWrap.appendChild(col);
    });
    // Enfin, on ajoute le wrapper .columns (ligne horizontale) sous le header
    semaineContainer.appendChild(columnsWrap);
   }

// ----- Crée un post-it avec bouton suppression -----

function creerPostit(titre, couleur) {

  const postit = document.createElement('div');

  postit.classList.add('postit');

  postit.textContent = titre;

  postit.style.backgroundColor = couleur;

  postit.draggable = true;

  postit.addEventListener('dragstart', dragStart);

  // Bouton de suppression

  const deleteBtn = document.createElement('button');

  deleteBtn.textContent = "×";

  deleteBtn.classList.add('delete-btn');

  deleteBtn.addEventListener('click', (e) => {

    e.stopPropagation();

    postit.remove();

    sauvegarder();

  });

  postit.appendChild(deleteBtn);

  return postit;

}

// ----- Outils -----

function getMondayOfWeek(semaine) {

  const today = new Date();

  const currentWeek = getSemaineNumber(today);

  const diffWeeks = semaine - currentWeek;

  const lundi = new Date(today);

  lundi.setDate(today.getDate() - today.getDay() + 1 + diffWeeks * 7);

  return lundi;

}

// ----- Drag & Drop -----

let dragged = null;

function dragStart(e) { dragged = e.target; }

function dragOver(e) { e.preventDefault(); }

function drop(e) {

  e.preventDefault();

  if (dragged) {

    e.currentTarget.appendChild(dragged);

    sauvegarder();

    dragged = null;

  }

}

// ----- Swipe + flèches -----

//let startX = 0, endX = 0;

//semaineContainer.addEventListener('touchstart', e => startX = e.touches[0].clientX);

//semaineContainer.addEventListener('touchend', e => {

//  endX = e.changedTouches[0].clientX;

//  if (endX - startX > 50) changerSemaine(-1);

//  else if (endX - startX < -50) changerSemaine(1);

//});

function changerSemaine(direction) {

  semaineActuelle += direction;

  localStorage.setItem('semaineActuelle', semaineActuelle);

  afficherSemaine(semaineActuelle);

}

// ----- Sauvegarde -----

function getSemaineKey(semaine) {

  const lundi = getMondayOfWeek(semaine);

  return lundi.toISOString().slice(0,10);

}

function sauvegarder() {

  const key = getSemaineKey(semaineActuelle);

  planning[key] = {};

  document.querySelectorAll('.colonne').forEach(col => {

    const jour = col.dataset.jour;

    planning[key][jour] = [];

    col.querySelectorAll('.postit').forEach(p => {

      planning[key][jour].push({ titre: p.childNodes[0].textContent, couleur: p.style.backgroundColor });

    });

  });

  localStorage.setItem('planning', JSON.stringify(planning));

}

// ----- Menus déroulants -----

const selectActivite = document.getElementById('selectActivite');

const selectJour = document.getElementById('selectJour');

Object.keys(activites).forEach(act => {

  const opt = document.createElement('option');

  opt.value = act;

  opt.textContent = act;

  selectActivite.appendChild(opt);

});

jours.forEach(j => {

  const opt = document.createElement('option');

  opt.value = j;

  opt.textContent = j;

  selectJour.appendChild(opt);

});

// ----- Ajout activité -----

document.getElementById('ajouterActivite').addEventListener('click', () => {

  const act = selectActivite.value;

  const jour = selectJour.value;

  const couleur = activites[act];

  const col = Array.from(document.querySelectorAll('.colonne')).find(c => c.dataset.jour === jour);

  if (!col) return alert("Jour invalide");

  const postit = creerPostit(act, couleur);

  col.appendChild(postit);

  sauvegarder();

});

// ----- Initialisation -----

afficherSemaine(semaineActuelle);
 