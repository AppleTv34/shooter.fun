// --- 1. FORCE REAL SCREEN DIMENSIONS (FIXES BLACK SCREEN) ---
let width = window.innerWidth || 800;
let height = window.innerHeight || 600;

// If the browser reports 0, force it to use standard screen scales
if (width === 0 || height === 0) {
    width = 1280;
    height = 720;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefd1b5); // Dust-peach sky color
scene.fog = new THREE.FogExp2(0xefd1b5, 0.015);

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 1.6, 5); // Position camera slightly back from the origin

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// --- 3. ENVIRONMENT GRID (FLOOR & 3D CUBES) ---
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Simple box creation using basic meshes
const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B }); 
for (let i = 0; i < 15; i++) {
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
}

// --- 4. CONTROLS SETUP ---
let yaw = 0;   
let pitch = 0; 

document.addEventListener('mousemove', (e) => {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));

    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
});

const keys = { w: false, a: false, s: false, d: false };

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
});

const moveSpeed = 0.15;

// --- 5. RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    if (keys.w) camera.position.addScaledVector(forward, moveSpeed);
    if (keys.s) camera.position.addScaledVector(forward, -moveSpeed);
    if (keys.d) camera.position.addScaledVector(right, moveSpeed);
    if (keys.a) camera.position.addScaledVector(right, -moveSpeed);

    renderer.render(scene, camera);
}

// --- 6. AUTO-RESIZE HANDLER ---
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

animate();
