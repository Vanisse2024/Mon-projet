// Éléments du DOM
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const topText = document.getElementById('topText');
const bottomText = document.getElementById('bottomText');
const textColor = document.getElementById('textColor');
const strokeColor = document.getElementById('strokeColor');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const gallery = document.getElementById('gallery');
const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');

// Variables
canvas.width = 600;
canvas.height = 600;
let memeImage = null;
let savedMemes = JSON.parse(localStorage.getItem('savedMemes')) || [];

// Initialisation
function init() {
    emptyState.style.display = 'flex';
    loadSavedMemes();
    setupEventListeners();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    imageUpload.addEventListener('change', handleImageUpload);
    generateBtn.addEventListener('click', generateMeme);
    downloadBtn.addEventListener('click', downloadMeme);
    shareBtn.addEventListener('click', shareMeme);

    // Aperçu en temps réel
    [topText, bottomText, textColor, strokeColor, fontFamily, fontSize].forEach(element => {
        element.addEventListener('input', () => {
            if (memeImage) generateMeme();
        });
    });
}

// Gestion du téléchargement de l'image
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        memeImage = new Image();
        memeImage.onload = function() {
            emptyState.style.display = 'none';
            generateMeme();
        };
        memeImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Génération du mème
function generateMeme() {
    if (!memeImage) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculer les dimensions pour maintenir les proportions
    const imgRatio = memeImage.width / memeImage.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.width / imgRatio;

    if (drawHeight > canvas.height) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
    }

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    // Dessiner l'image
    ctx.drawImage(memeImage, x, y, drawWidth, drawHeight);

    // Configuration du texte
    const fontSizeValue = fontSize.value;
    ctx.font = `bold ${fontSizeValue}px ${fontFamily.value}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor.value;
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = fontSizeValue / 10;

    // Ajouter le texte du haut
    if (topText.value) {
        addTextWithWrapping(topText.value, canvas.width / 2, y + 10 + fontSizeValue, fontSizeValue, drawWidth);
    }

    // Ajouter le texte du bas
    if (bottomText.value) {
        addTextWithWrapping(bottomText.value, canvas.width / 2, y + drawHeight - 10, fontSizeValue, drawWidth);
    }

    // Effet visuel de confirmation
    canvas.style.boxShadow = '0 0 15px rgba(126, 87, 194, 0.7)';
    setTimeout(() => {
        canvas.style.boxShadow = 'none';
    }, 300);
}

// Ajouter du texte avec retour à la ligne automatique
function addTextWithWrapping(text, x, y, fontSize, maxWidth) {
    const words = text.split(' ');
    const lineHeight = fontSize * 1.2;
    let line = '';
    const lines = [];

    // Diviser le texte en lignes
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth * 0.8 && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Ajuster la position Y en fonction du nombre de lignes
    const totalHeight = lineHeight * lines.length;
    let adjustedY = y;

    if (y < canvas.height / 2) {
        // Texte du haut
        adjustedY = y + (fontSize / 2);
    } else {
        // Texte du bas
        adjustedY = y - totalHeight + (fontSize / 2);
    }

    // Dessiner chaque ligne
    for (let i = 0; i < lines.length; i++) {
        const lineY = adjustedY + (i * lineHeight);
        ctx.strokeText(lines[i], x, lineY);
        ctx.fillText(lines[i], x, lineY);
    }
}

// Télécharger le mème
function downloadMeme() {
    if (!canvas.toDataURL) return;

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `meme-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Ajouter à la galerie
    saveToGallery();

    // Feedback visuel
    downloadBtn.innerHTML = '<i class="fas fa-check"></i> Téléchargé';
    setTimeout(() => {
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Télécharger';
    }, 2000);
}

// Partager le mème
function shareMeme() {
    if (!canvas.toDataURL) return;

    if (navigator.share) {
        canvas.toBlob(async function(blob) {
            try {
                const file = new File([blob], 'meme.png', { type: 'image/png' });
                await navigator.share({
                    title: 'Mon mème',
                    text: 'Regarde ce mème que j\'ai créé !',
                    files: [file]
                });

                shareBtn.innerHTML = '<i class="fas fa-check"></i> Partagé';
                setTimeout(() => {
                    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Partager';
                }, 2000);
            } catch (error) {
                console.error('Erreur de partage:', error);
                alert('Impossible de partager le mème. Essayez de le télécharger puis de le partager manuellement.');
            }
        });
    } else {
        alert('Votre navigateur ne prend pas en charge la fonction de partage. Téléchargez le mème puis partagez-le manuellement.');
    }
}

// Sauvegarder dans la galerie
function saveToGallery() {
    const memeData = canvas.toDataURL('image/png');
    const timestamp = Date.now();
    const newMeme = { id: timestamp, data: memeData };

    savedMemes.unshift(newMeme);

    // Limiter à 12 mèmes sauvegardés
    if (savedMemes.length > 12) {
        savedMemes = savedMemes.slice(0, 12);
    }

    localStorage.setItem('savedMemes', JSON.stringify(savedMemes));
    loadSavedMemes();
}

// Charger les mèmes sauvegardés
function loadSavedMemes() {
    galleryGrid.innerHTML = '';

    if (savedMemes.length === 0) {
        galleryGrid.innerHTML = '<p class="empty-gallery">Aucun mème sauvegardé. Créez-en un !</p>';
        return;
    }

    savedMemes.forEach(meme => {
        const memeItem = document.createElement('div');
        memeItem.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = meme.data;
        img.alt = 'Mème sauvegardé';
        memeItem.appendChild(img);

        const actions = document.createElement('div');
        actions.className = 'gallery-actions';

        const reloadBtn = document.createElement('button');
        reloadBtn.innerHTML = '<i class="fas fa-edit"></i>';
        reloadBtn.title = 'Modifier';
        reloadBtn.onclick = () => loadFromGallery(meme.data);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Supprimer';
        deleteBtn.onclick = () => deleteMeme(meme.id);

        actions.appendChild(reloadBtn);
        actions.appendChild(deleteBtn);
        memeItem.appendChild(actions);

        galleryGrid.appendChild(memeItem);
    });
}

// Charger un mème depuis la galerie
function loadFromGallery(data) {
    memeImage = new Image();
    memeImage.onload = function() {
        emptyState.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(memeImage, 0, 0, canvas.width, canvas.height);

        // Scroll jusqu'au canvas
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    memeImage.src = data;
}

// Supprimer un mème
function deleteMeme(id) {
    savedMemes = savedMemes.filter(meme => meme.id !== id);
    localStorage.setItem('savedMemes', JSON.stringify(savedMemes));
    loadSavedMemes();
}

// Initialisation au chargement
window.onload = init;