import * as THREE from 'three';
import Utils from '../utils/Utils.js';
import Projectile from './Projectile.js';

class Enemy {
    constructor(scene, position, fbxLoader) {
        this.scene = scene;
        this.balls = [];
        this.particleSystems = [];  // Armazena os sistemas de partículas
        this.projectiles = [];
        this.testTimer = 0;
        this.forceField = null;
        this.isRecharging = false;
        this.randomDirection = new THREE.Vector3();
        this.randomMoveDuration = 0;
        this.randomMoveTime = 0;
        this.velocity = 1;
        this.bulletSpeed = 8;
        this.detectionRange = 20; // Distância para o inimigo detectar o jogador
        this.chaseDistance = 8; // Distância para o inimigo atacar o jogador
        this.health = 100;
        this.shieldReduction = 0.5;
        this.damage = 20;
        this.fbxLoader = fbxLoader;

        this.loadModel(position);
        setTimeout(() => {this.createOrbitBalls(scene, 3);}, 1000);  // 3 bolas orbitais
    }

    loadModel(position) {
        // const fbxLoader = new FBXLoader();
        this.fbxLoader.load('assets/models/Skull.fbx', (object) => {
            object.traverse(function (meshs) {
                if (meshs instanceof THREE.Mesh) {
                    meshs.castShadow = true;
                    meshs.receiveShadow = false;
                }
            });

            Utils.changeModelScale(object, 0.5);
            object.position.set(position.x, position.y, position.z);
            this.scene.add(object);
            this.mesh = object;
        });
    }

    createOrbitBalls(scene, numBalls) {
        const raio = 0; // 0.7
        for (let i = 0; i < numBalls; i++) {
            const ballGeometry = new THREE.SphereGeometry(0.15, 5, 4);
            const ballMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xff4500, 
                transparent: true,
                opacity: 0.8,
                wireframe: false 
            });
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
        const velocities = new Float32Array(particleCount * 3);  // Adiciona velocidades para cada partícula

        // Define as posições e as velocidades iniciais das partículas em torno da bola
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.2 + Math.random() * 0.05;  // Raio ao redor da bola
            const x = ball.position.x + radius * Math.cos(angle);
            const y = ball.position.y + (Math.random() - 0.5) * 0.1;
            const z = ball.position.z + radius * Math.sin(angle);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Define uma velocidade inicial para as partículas (movimento radial)
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;  // Movimento leve no eixo X
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;  // Movimento leve no eixo Y
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;  // Movimento leve no eixo Z
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

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
            if(ball.R<0.7) ball.R+=0.005; // faz o raio aumentar aos poucos
            ball.theta += speed;
            ball.position.x = this.mesh.position.x + ball.R * Math.cos(ball.theta);
            ball.position.z = this.mesh.position.z + ball.R * Math.sin(ball.theta);
            ball.position.y = this.mesh.position.y + amplitude * Math.sin(frequency * time + (index % 2 === 0 ? 0 : Math.PI));
        });
    }

    animateParticles(time) {
        this.particleSystems.forEach(({ particleSystem, ball }) => {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.geometry.attributes.velocity.array;
            const numParticles = positions.length / 3;

            // Anima as partículas em torno da bola
            for (let i = 0; i < numParticles; i++) {
                positions[i * 3] += velocities[i * 3];       // Movimento no eixo X
                positions[i * 3 + 1] += velocities[i * 3 + 1]; // Movimento no eixo Y
                positions[i * 3 + 2] += velocities[i * 3 + 2]; // Movimento no eixo Z

                const dx = positions[i * 3] - ball.position.x;
                const dz = positions[i * 3 + 2] - ball.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                // Verifica se a partícula saiu do alcance definido (raio ao redor da bola)
                if (distance > 0.3) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.2 + Math.random() * 0.05;
                    positions[i * 3] = ball.position.x + radius * Math.cos(angle);
                    positions[i * 3 + 1] = ball.position.y + (Math.random() - 0.5) * 0.1;
                    positions[i * 3 + 2] = ball.position.z + radius * Math.sin(angle);

                    // Redefine uma nova velocidade para a partícula
                    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
                    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
                    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
                }
            }

            particleSystem.geometry.attributes.position.needsUpdate = true;
        });
    }

    takeDamage(damageAmount) {
        if (this.forceField) { // Verifica se há um escudo ativo
            damageAmount *= this.shieldReduction; // Reduz o dano conforme o escudo
        }
        this.health -= damageAmount;
        console.log(`Inimigo recebeu ${damageAmount} de dano. Saúde restante: ${this.health}`);

        if (this.health <= 0) { // Verifica se o inimigo morreu
            this.die();
        }
    }

    die() {
        console.log("Um inimigo foi derrotado.");
        this.removeFromScene(this.scene);
    }

    update(time, deltaTime, player, scene){
        let playerPosition = player.mesh.position;
        this.move(player, deltaTime);
        this.animateOrbitBalls(time);
        this.animateParticles(time);
        this.testTimer++;

        if (this.forceField) this.forceField.rotation.y += deltaTime * 0.5; // Faz o escudo girar

        this.projectiles.forEach((projectile, index) => {
            projectile.update([], scene, this.projectiles, deltaTime, player);
        });

        // Atira no player se não estiver em cooldown e se estiver perto
        if (this.testTimer > 500 && this.mesh.position.distanceTo(playerPosition) <= this.detectionRange && !player.isDied) {
            this.shootAtPlayer(player, scene, deltaTime);
            this.testTimer = 0;
        }
    }
    
    move(player, deltaTime) {
        let playerPosition = player.mesh.position;
        if(this.mesh){
            const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    
            if (distanceToPlayer <= this.detectionRange && !player.isDied) {
                this.mesh.lookAt(playerPosition);
            }
        
            if (distanceToPlayer > this.chaseDistance && distanceToPlayer <= this.detectionRange && !player.isDied) {
                this.moveTo(playerPosition, deltaTime, true); // Persegue o jogador
            } else if (distanceToPlayer <= this.chaseDistance && !player.isDied) {
                this.moveTo(playerPosition, deltaTime, false); // Afasta-se do jogador
            } else {
                this.moveRandomly(deltaTime); // Movimento aleatório
            }
        }
        
    }

    moveTo(targetPosition, deltaTime, isTowards) {
        if (!this.isRecharging) {
            let direction = new THREE.Vector3();
            if(isTowards) direction = direction.subVectors(targetPosition, this.mesh.position).normalize();
            else direction = direction.subVectors(this.mesh.position, targetPosition).normalize();
            direction.y = 0;
            this.mesh.position.add(direction.multiplyScalar(this.velocity * deltaTime));
        }
    }       

    moveRandomly(deltaTime) {
    if (this.randomMoveTime <= 0) {
        this.randomDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2, // Gera um X aleatorio entre -1 e 1
            0,
            (Math.random() - 0.5) * 2 // Gera um Z aleatorio entre -1 e 1
        ).normalize();
        this.randomMoveDuration = Math.random() * 3 + 1; // Entre 1 e 4 segundos
        this.randomMoveTime = this.randomMoveDuration;
    }
    this.mesh.position.add(this.randomDirection.clone().multiplyScalar(this.velocity*deltaTime)); // move o inimigo na direção randomizada

    const targetPosition = this.mesh.position.clone().add(this.randomDirection); // calcula onde o inimigo vai estar
    this.mesh.lookAt(targetPosition); // Faz o inimigo olhar na direção em que está se movendo
    this.randomMoveTime -= deltaTime; // Reduz o tempo de movimentação
}


    shootAtPlayer(player, scene, deltaTime) {
        let playerPosition = player.mesh.position;
        if (this.balls.length > 0) {
            const ball = this.balls.pop(); // Retira a bola da lista de bolas orbitais
            const direction = new THREE.Vector3().subVectors(playerPosition, ball.position).normalize();
            direction.y = 0;
            const projectile = new Projectile(ball.position, direction, this.bulletSpeed*deltaTime, this.damage, true, ball, player);
            projectile.particleSystem = this.particleSystems.find(ps => ps.ball === ball)?.particleSystem; // Associa as particulas da bola ao projetil
            scene.add(projectile.mesh);
            this.projectiles.push(projectile);
            setTimeout(() => { // timeout para remover o projetil depois de 3 segundos
                scene.remove(projectile.mesh);
                scene.remove(projectile.particleSystem);
                const index = projectiles.indexOf(projectile);
                if (index > -1) {
                    projectiles.splice(index, 1);
                }
            }, 3000);
            if(this.balls.length == 0){
                this.isRecharging = true;
                this.createForceField(scene);
                this.recharge();
            }
        }
        
    }

    createForceField(scene) {
        const geometry = new THREE.SphereGeometry(1.0, 16, 16); // Ajuste o tamanho do campo
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff4500, 
            wireframe: true, 
            opacity: 0.2, 
            transparent: true 
        });
        this.forceField = new THREE.Mesh(geometry, material);
        this.forceField.position.copy(this.mesh.position);
        this.forceField.position.y = 1.3;
        scene.add(this.forceField);
    }
    
    recharge() {
        setTimeout(() => {
            this.createOrbitBalls(this.scene, 3); // Recria as bolas orbitais
            this.isRecharging = false;
            if (this.forceField) {
                this.scene.remove(this.forceField);
                this.forceField = null;
                this.isRecharging = false;
            }
        }, 5000); // Recarrega após 5 segundos
    }

    removeFromScene(scene) {
        scene.remove(this.mesh);
        this.balls.forEach(ball => {
            scene.remove(ball);
        });
        this.balls = [];
        this.particleSystems.forEach(({ particleSystem }) => {
            scene.remove(particleSystem);
        });
        this.particleSystems = [];
        if (this.forceField) {
            scene.remove(this.forceField);
            this.forceField = null;
        }
    }
    
    
}

export default Enemy;