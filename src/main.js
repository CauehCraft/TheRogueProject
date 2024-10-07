import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
// import CollisionSystem from './systems/CollisionSystem.js';
// import Projectile from './components/Projectile.js';
import Terrain from './components/Terrain.js';
import Player from './components/Player.js';
import Enemy from './components/Enemy.js';
import Utils from './utils/Utils.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera( window.innerWidth / - 150, window.innerWidth / 150, window.innerHeight / 150, window.innerHeight / - 150, 1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', (event) => Utils.onWindowResize(camera, renderer));

const player = new Player(scene, 'assets/models/mutant.fbx');
const terrain = new Terrain(scene, 30);

Utils.addLightAndShadows(scene);

// Exemplo temporario de inimigos
const enemies = [
    new Enemy(scene, new THREE.Vector3(0, 1, 0)),
    new Enemy(scene, new THREE.Vector3(-2, 1, 2)),
    new Enemy(scene, new THREE.Vector3(2, 1, -2))
];

const projectiles = [];

// Distancia da camera ao player
const cameraDistance = 5;

// Contador de fps
const stats = new Stats();
document.body.appendChild(stats.dom);

// Raycaster e vetor do mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Função de click do mouse para atirar projéteis
function onMouseClick(event) {
    // Converte as coordenadas do clique do mouse em coordenadas de tela normalizadas
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(terrain.cubes);

    if (intersects.length > 0) {
        // const intersectedCube = intersects[0].object; // Inutilizado
        const targetPosition = intersects[0].point; // Coordenadas de interseção no cubo (Melhora a precisão do projetil)
        targetPosition.y = 1;
        const projectileStartPosition = player.mesh.position.clone();
        projectileStartPosition.y = 1;
        // Calcula o vetor unitario de direção com base na diferença de dois vetores (Vector3) de posição
        const direction = new THREE.Vector3().subVectors(targetPosition, projectileStartPosition).normalize();

        player.shoot(scene, projectiles, direction, projectileStartPosition);

        // const projectile = new Projectile(projectileStartPosition, direction, 0.5);
        // projectiles.push(projectile);
        // scene.add(projectile.mesh);
    }
}


window.addEventListener('click', onMouseClick, false);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    projectiles.forEach((projectile) => {
        projectile.update(enemies, scene, projectiles);
    });

    const delta = clock.getDelta();
    player.update(delta, camera, cameraDistance);
    const time = clock.getElapsedTime();
    enemies.forEach(enemy => enemy.animateOrbitBalls(time));
    // terrain.cubes.forEach(cube => terrain.updateObjectMovement(cube));
    renderer.render(scene, camera);
    stats.update();
}


animate();