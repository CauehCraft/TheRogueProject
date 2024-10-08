import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Utils from '../utils/Utils.js';

class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.balls = [];
        this.particleSystems = [];  // Armazena os sistemas de partículas

        this.loadModel(position);
        this.createOrbitBalls(scene, 3);  // 2 bolas orbitais
    }

    loadModel(position) {
        const fbxLoader = new FBXLoader();
        fbxLoader.load('assets/models/fireskull.fbx', (object) => {
            object.traverse(function (meshs) {
                if (meshs instanceof THREE.Mesh) {
                    meshs.castShadow = true;
                    meshs.receiveShadow = true;
                }
            });

            Utils.changeModelScale(object, 1);
            object.position.set(position.x, position.y, position.z);
            this.scene.add(object);
            this.mesh = object;
        });
    }

    createOrbitBalls(scene, numBalls) {
        const raio = 0.7;
        for (let i = 0; i < numBalls; i++) {
            const ballGeometry = new THREE.SphereGeometry(0.15, 5, 4);
            const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff, wireframe: false });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            ball.castShadow = true;
            ball.receiveShadow = true;

            // Ângulo inicial para cada bola
            ball.theta = (i / numBalls) * Math.PI * 2;
            ball.R = raio;

            scene.add(ball);
            this.balls.push(ball);

            // Adiciona o sistema de partículas ao redor da bola
            this.createParticleSystem(scene, ball);
        }
    }

    createParticleSystem(scene, ball) {
        const particleCount = 100;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        // Define as posições iniciais das partículas em torno da bola
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.2 + Math.random() * 0.1;  // Raio ao redor da bola
            const x = ball.position.x + radius * Math.cos(angle);
            const y = ball.position.y + (Math.random() - 0.5) * 0.1;  // Flutuação leve no eixo y
            const z = ball.position.z + radius * Math.sin(angle);
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Material das partículas simulando fogo
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xff4500,  // Laranja queimado para efeito de fogo
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);

        this.particleSystems.push({ particleSystem, ball });
    }

    animateOrbitBalls(time) {
        const amplitude = 0.3;
        const frequency = 4;
        const speed = 0.02;

        this.balls.forEach((ball, index) => {
            ball.theta += speed;
            ball.position.x = this.mesh.position.x + ball.R * Math.cos(ball.theta);
            ball.position.z = this.mesh.position.z + ball.R * Math.sin(ball.theta);
            ball.position.y = this.mesh.position.y + amplitude * Math.sin(frequency * time + (index % 2 === 0 ? 0 : Math.PI));
        });

        this.animateParticles(time);
    }

    animateParticles(time) {
        this.particleSystems.forEach(({ particleSystem, ball }, index) => {
            const positions = particleSystem.geometry.attributes.position.array;
            const numParticles = positions.length / 3;

            // Anima as partículas para seguir o movimento da bola e simular o fogo
            for (let i = 0; i < numParticles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.2 + Math.random() * 0.1;  // Raio ao redor da bola
                positions[i * 3] = ball.position.x + radius * Math.cos(angle);
                positions[i * 3 + 1] = ball.position.y + (Math.random() - 0.5) * 0.1;  // Movimento vertical suave
                positions[i * 3 + 2] = ball.position.z + radius * Math.sin(angle);
            }

            particleSystem.geometry.attributes.position.needsUpdate = true;
        });
    }
}

export default Enemy;