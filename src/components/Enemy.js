import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Utils from '../utils/Utils.js';

class Enemy {
    constructor(scene, position) {
        // const enemyGeometry = new THREE.SphereGeometry(0.5, 15);
        // const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
        // this.mesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
        this.scene = scene;
        this.loadModel(position);
        // this.mesh.position.set(position.x, position.y, position.z);

        this.balls = [];
        this.createOrbitBalls(scene, 2);
    }

    loadModel(position) {
        const fbxLoader = new FBXLoader();
        
        // Carrega o modelo do inimigo
        fbxLoader.load('assets/models/fireskull.fbx', (object) => {
            // object.scale.set(0.01, 0.01, 0.01);
            // object.position.y = 0.18;
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
        })
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
        }
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
    }
}

export default Enemy;