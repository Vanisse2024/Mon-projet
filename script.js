const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const memeText = document.getElementById('memeText');

canvas.width = 500;
canvas.height = 500;

imageUpload.addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

function generateMeme() {
    const text = memeText.value;
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height - 30);
    ctx.strokeText(text, canvas.width / 2, canvas.height - 30);
}

function downloadMeme() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'meme.png';
    link.click();
}
 
