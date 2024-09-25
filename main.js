import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

// teste de projetil
const spheregeometry = new THREE.SphereGeometry(0.5);
const spherematerial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
const sphere = new THREE.Mesh(spheregeometry, spherematerial);
sphere.position.set(0, 1, 0);
scene.add(sphere);

const terreno = 10;
const cubes = [];

// Criar o terreno baseado no tamanho de cubos
for (let x = 0; x < terreno; x++) {
    for (let z = 0; z < terreno; z++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x - terreno / 2, 0, z - terreno / 2);
        scene.add(cube);
        cubes.push(cube);
    }
}

// Cubo pra exemplo de personagem
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
scene.add(player);

// Câmera com perspectiva isométrica
camera.position.set(10, 10, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Contador de FPS
const stats = new Stats();
document.body.appendChild(stats.dom);

// Raycaster e vetor do mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Movimento do personagem
const keys = {};
window.addEventListener('keydown', (event) => keys[event.key] = true);
window.addEventListener('keyup', (event) => keys[event.key] = false);

let velocity = 0.04;
function movePlayer() {
    if (keys['w']) player.position.z -= velocity;
    if (keys['s']) player.position.z += velocity;
    if (keys['a']) player.position.x -= velocity;
    if (keys['d']) player.position.x += velocity;
}

// Função para manter a camera fixa em relação ao personagem
function updateCamera() {
    camera.position.set(player.position.x + 10, player.position.y + 10, player.position.z + 10);
    camera.lookAt(player.position);
}

function moveTo(object, targetX, targetZ, speed) {
    object.userData.target = new THREE.Vector3(targetX, 1, targetZ);
    object.userData.speed = speed;
}

function updateObjectMovement(object) {
    if (object.userData.target) {
        const direction = new THREE.Vector3().subVectors(object.userData.target, object.position).normalize();
        const distance = object.userData.speed * 0.5;
        object.position.add(direction.multiplyScalar(distance));

        if (object.position.distanceTo(object.userData.target) < distance) {
            object.position.copy(object.userData.target);
            object.userData.target = null;
        }
    }
}

// Testando implementações de Raycaster com click do mouse
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubes);
    if (intersects.length > 0) {
        const intersectedCube = intersects[0].object;
        console.log('Cubo clicado:', intersectedCube.position);
        sphere.position.set(player.position.x, player.position.y, player.position.z);
        moveTo(sphere, intersectedCube.position.x, intersectedCube.position.z, 0.5);
    }
}

window.addEventListener('click', onMouseClick, false);

function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    updateCamera();
    cubes.forEach(updateObjectMovement);
    updateObjectMovement(sphere); 
    renderer.render(scene, camera);
    stats.update();
}

animate();
