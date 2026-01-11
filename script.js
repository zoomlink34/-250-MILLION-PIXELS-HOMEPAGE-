const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const canvas = document.getElementById('billboardCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000; canvas.height = 1000; 

const slotSize = 10; 
const cols = 316;
let zoom = 1, cameraX = 500, cameraY = 500;
let approved = {}, pending = {};

db.ref('pixels').on('value', snap => { 
    approved = snap.val() || {}; 
    document.getElementById('sold-count').innerText = Object.keys(approved).length.toLocaleString();
});
db.ref('pending').on('value', snap => { pending = snap.val() || {}; });

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cameraX, -cameraY);

    for (let i = 1; i <= 100000; i++) {
        let x = ((i - 1) % cols) * slotSize;
        let y = Math.floor((i - 1) / cols) * slotSize;
        
        if (approved[i]) {
            let img = new Image(); img.src = approved[i].imageUrl;
            ctx.drawImage(img, x, y, slotSize, slotSize);
        } else if (pending[i]) {
            let img = new Image(); img.src = pending[i].imageUrl;
            ctx.filter = 'blur(1px) grayscale(100%)';
            ctx.drawImage(img, x, y, slotSize, slotSize);
            ctx.filter = 'none';
        } else {
            ctx.strokeStyle = "#ebebeb";
            ctx.strokeRect(x, y, slotSize, slotSize);
        }
    }
    ctx.restore();
    requestAnimationFrame(draw);
}

function searchHome() {
    let num = parseInt(document.getElementById('searchSlot').value);
    if (num >= 1 && num <= 100000) {
        cameraX = ((num - 1) % cols) * slotSize + 5;
        cameraY = Math.floor((num - 1) / cols) * slotSize + 5;
        zoom = 5;
    } else { alert("Please enter a valid slot number (1-100,000)"); }
}

// Controls
let isDragging = false, lastX, lastY;
canvas.onmousedown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
window.onmouseup = () => isDragging = false;
window.onmousemove = (e) => {
    if (isDragging) {
        cameraX -= (e.clientX - lastX) / zoom;
        cameraY -= (e.clientY - lastY) / zoom;
        lastX = e.clientX; lastY = e.clientY;
    }
};
canvas.onwheel = (e) => { zoom = Math.min(Math.max(0.1, zoom * (e.deltaY < 0 ? 1.1 : 0.9)), 15); e.preventDefault(); };
draw();
