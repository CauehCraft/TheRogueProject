import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
// import CollisionSystem from './systems/CollisionSystem.js';
// import Projectile from './components/Projectile.js';
import Terrain from './components/Terrain.js';
import Background from './components/Background.js';
import Player from './components/Player.js';
import Enemy from './components/Enemy.js';
import Utils from './utils/Utils.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc2d0df);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera( window.innerWidth / - 150, window.innerWidth / 150, window.innerHeight / 150, window.innerHeight / - 150, 1, 1000 );
camera.position.y = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', (event) => Utils.onWindowResize(camera, renderer));

const mapSize = 30;
let enemySpawnInterval = 15000; // Spawn dos inimigos (15 segundos)
let enemySpawnTimer;


const player = new Player(scene, 'assets/models/mutant.fbx');
const terrain = new Terrain(scene, mapSize, 1, 64, 1, 'assets/textures/Ground3.png', 'assets/textures/Lava.png');
const background = new Background(scene, 8);
const light = Utils.addLightAndShadows(scene);
const fbxLoader = new FBXLoader();

// inimigos
const enemies = [];
function spawnEnemy() {
    const x = (Math.random() - 0.5) * mapSize * 2; // Gera X entre -mapSize e +mapSize
    const z = (Math.random() - 0.5) * mapSize * 2; // Gera Z entre -mapSize e +mapSize
    const position = new THREE.Vector3(x, 1, z);
    const enemy = new Enemy(scene, position, fbxLoader);
    enemies.push(enemy);
}

function startSpawningEnemies() {
    enemySpawnTimer = setInterval(() => {
        spawnEnemy();

        if (enemySpawnInterval > 5000) {
            enemySpawnInterval -= 500; // Diminui o intervalo de spawn em meio segundo
            clearInterval(enemySpawnTimer);
            startSpawningEnemies(); // Reinicia o spawn com o novo tempo
        }
    }, enemySpawnInterval);
}

const projectiles = [];

// Distancia da camera ao player
const cameraDistance = 5;

const clock = new THREE.Clock();

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
    const intersects = raycaster.intersectObjects(terrain.pieces);

    if (intersects.length > 0 && isGameStarted) {
        // const intersectedCube = intersects[0].object; // Inutilizado
        const targetPosition = intersects[0].point; // Coordenadas de interseção no cubo (Melhora a precisão do projetil)
        targetPosition.y = 1;
        const projectileStartPosition = player.mesh.position.clone();
        projectileStartPosition.y = 1;
        // Calcula o vetor unitario de direção com base na diferença de dois vetores (Vector3) de posição
        const direction = new THREE.Vector3().subVectors(targetPosition, projectileStartPosition).normalize();
        const delta = clock.getDelta();
        player.shoot(scene, projectiles, direction, projectileStartPosition, delta);
    }
}

let isGameStarted = false;

document.getElementById('start-game').addEventListener('click', () => {
    isGameStarted = true;
    document.getElementById('start-game').style.display = 'none';
    startSpawningEnemies();
});


window.addEventListener('click', onMouseClick, false);

function animate() {
    requestAnimationFrame(animate);

    if (isGameStarted) {
        projectiles.forEach((projectile) => {
            projectile.update(enemies, scene, projectiles);
        });

        const delta = clock.getDelta();
        player.update(delta, camera, cameraDistance);
        const time = clock.getElapsedTime();
        enemies.forEach(enemy => enemy.update(time, delta, player, scene));
        Utils.clampEntitiesToMap(player, enemies, mapSize);
        Utils.updateLight(light, scene, time, 48);
    }
    renderer.render(scene, camera);
    stats.update();
    background.update();
}

animate();