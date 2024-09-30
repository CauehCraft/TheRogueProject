import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import CollisionSystem from './systems/CollisionSystem.js';
import Projectile from './components/Projectile.js';
import Terrain from './components/Terrain.js';
import Player from './components/Player.js';
import Enemy from './components/Enemy.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const player = new Player(scene);
const terrain = new Terrain(scene, 10);

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
        targetPosition.y = player.mesh.position.y;

        const direction = new THREE.Vector3().subVectors(targetPosition, player.mesh.position).normalize();

        const projectile = new Projectile(player.mesh.position, direction, 0.5);
        projectiles.push(projectile);
        scene.add(projectile.mesh);
    }
}


window.addEventListener('click', onMouseClick, false);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    projectiles.forEach((projectile, index) => {
        projectile.update();

        enemies.forEach((enemy, enemyIndex) => {
            if (CollisionSystem.checkCollision(projectile.mesh, enemy.mesh)) {
                
                // Adicionar dps um efeito de 'splash' pra caso o projetil bata na parede 
                scene.remove(projectile.mesh);
                projectiles.splice(index, 1);
                scene.remove(enemy.mesh);
                enemies.splice(enemyIndex, 1);
            }
        });
    });

    player.move();
    player.updateCamera(camera, cameraDistance);

    const time = clock.getElapsedTime();
    enemies.forEach(enemy => enemy.animateOrbitBalls(time));
    terrain.cubes.forEach(cube => terrain.updateObjectMovement(cube));
    renderer.render(scene, camera);
    stats.update();
}


animate();