/**
 * Nirrox Games - Script principal (app.js)
 * Scan automatique du dossier /Jeux/ et affichage des jeux.
 */

// Configuration du dépôt GitHub (sécurisée contre la redéclaration)
window.GITHUB_REPO_OWNER = window.GITHUB_REPO_OWNER || "nirroxbroxi";
window.GITHUB_REPO_NAME = window.GITHUB_REPO_NAME || "Nirrox-Games-official";

const GITHUB_REPO_OWNER = window.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = window.GITHUB_REPO_NAME;

let catalogueJeux = [];

/**
 * Interroge l'API GitHub pour obtenir la liste des fichiers HTML dans le dossier /Jeux/
 */
async function chargerJeuxDossier() {
  catalogueJeux = [];
  const container = document.getElementById("games-grid-container");
  if (container) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center space-y-3">
        <i class="fa-solid fa-spinner animate-spin text-3xl text-indigo-500"></i>
        <p class="text-xs text-slate-400 font-bold">Recherche des jeux dans le dossier /Jeux/...</p>
      </div>
    `;
  }

  try {
    // Parameter anti-cache pour charger directement les nouveaux jeux
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/Jeux?t=${Date.now()}`;
    let res = await fetch(apiUrl);
    
    // Si 'Jeux' avec une majuscule échoue, on essaye avec 'jeux' en minuscule
    if (!res.ok) {
      const apiUrlLower = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/jeux?t=${Date.now()}`;
      res = await fetch(apiUrlLower);
    }
    
    if (res.ok) {
      const files = await res.json();
      if (Array.isArray(files)) {
        const htmlFiles = files.filter(file => file.name.toLowerCase().endsWith('.html'));

        if (htmlFiles.length > 0) {
          catalogueJeux = htmlFiles.map((file, idx) => {
            const cleanName = file.name.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
            const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            
            return {
              id: `game-${idx}`,
              titre: formattedTitle,
              fichier: file.path,
              nomFichier: file.name
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn("Erreur lors de la récupération des jeux via GitHub API :", err);
  }

  // Si aucun jeu n'est trouvé, charge le jeu par défaut en secours
  if (catalogueJeux.length === 0) {
    catalogueJeux = [
      {
        id: 'ultra-game',
        titre: 'Ultra',
        fichier: 'Jeux/ultra.html',
        nomFichier: 'ultra.html'
      }
    ];
  }

  afficherBibliotheque();
}

/**
 * Affiche la liste des jeux sous forme de cartes dynamiques dans la grille
 */
function afficherBibliotheque() {
  const container = document.getElementById("games-grid-container");
  const countEl = document.getElementById("jeux-count");
  if (!container) return;

  if (countEl) countEl.textContent = `${catalogueJeux.length} jeu(x) disponible(s)`;

  const couleursBadge = [
    'from-indigo-600 to-indigo-900',
    'from-purple-600 to-purple-900',
    'from-blue-600 to-blue-900',
    'from-emerald-600 to-emerald-900'
  ];

  container.innerHTML = catalogueJeux.map((jeu, idx) => {
    const bgGrad = couleursBadge[idx % couleursBadge.length];
    return `
    <div class="glass-card rounded-3xl overflow-hidden flex flex-col group relative border border-white/10 hover:border-indigo-500/40 transition duration-300">
      <div class="h-40 bg-gradient-to-tr ${bgGrad} relative p-6 flex flex-col justify-between overflow-hidden">
        <div class="flex items-center justify-between z-10">
          <span class="bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Jeu HTML5
          </span>
          <span class="text-[11px] font-mono text-white/70 bg-black/30 px-2 py-0.5 rounded">
            ${jeu.nomFichier}
          </span>
        </div>
        <i class="fa-solid fa-gamepad text-6xl text-white/10 absolute -bottom-2 -right-2 group-hover:scale-125 transition duration-500"></i>
        <h3 class="font-black text-2xl text-white z-10 drop-shadow-md">${jeu.titre}</h3>
      </div>
      
      <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
        <p class="text-xs text-slate-400">Fichier : <code class="text-indigo-300">${jeu.fichier}</code></p>

        <button onclick="lancerFichierJeu('${jeu.fichier}', '${jeu.titre}')" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-indigo">
          <i class="fa-solid fa-play"></i> Lancer le jeu
        </button>
      </div>
    </div>
  `}).join('');
}

/**
 * Lance le jeu sélectionné dans l'iframe plein écran
 */
function lancerFichierJeu(urlFichier, titre) {
  const title = document.getElementById("game-modal-title");
  const container = document.getElementById("game-canvas-container");
  if (title) title.textContent = titre;

  if (container) {
    container.innerHTML = `<iframe src="${urlFichier}" class="absolute inset-0 w-full h-full border-0" allow="fullscreen; autoplay; gamepad"></iframe>`;
  }

  const modal = document.getElementById("modal-game");
  if (modal) modal.classList.remove("hidden");
}

/**
 * Ferme la modale du jeu et stoppe l'exécution dans l'iframe
 */
function fermerJeu() {
  const container = document.getElementById("game-canvas-container");
  if (container) container.innerHTML = '';
  const modal = document.getElementById("modal-game");
  if (modal) modal.classList.add("hidden");
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  chargerJeuxDossier();
});
