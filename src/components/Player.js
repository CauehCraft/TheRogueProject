import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import Projectile from './Projectile.js';
import Utils from '../utils/Utils.js';

class Player {
    constructor(scene) {
        this.scene = scene;
        this.mixer = null;
        this.modelReady = false;
        this.activeAction = null;
        this.lastAction = null;
        this.animations = {};
        this.loadModelAndAnimations();
        this.keys = {};
        this.velocity = 4;
        this.ammo = 10;
        this.blocking = false;
        this.reloading = false;
        this.shooting = false;
        this.reloadTime = 5000; // tempo em ms
        this.shootSpeed = 500; // tempo em ms
        this.health = 100;
        this.damage = 35;
        this.isDied = false;
        this.cameraOrbitAngle = 0;
        this.currentCameraDistance = 2;
        this.score = 0;
        this.deadCountdown = 250;

        window.addEventListener('keydown', (event) => this.keys[event.key.toLowerCase()] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key.toLowerCase()] = false);
    }

    loadModelAndAnimations() {
        const fbxLoader = new FBXLoader();
        
        // Carrega o modelo do player
        fbxLoader.load('assets/models/Mutant.fbx', (object) => {
            // object.scale.set(0.01, 0.01, 0.01);
            object.traverse(function (meshs) {
                if (meshs instanceof THREE.Mesh) {
                    meshs.castShadow = true;
                    meshs.receiveShadow = true;
                }
            });
            object.position.y = 0.18;
            Utils.changeModelScale(object, 2);
            this.mixer = new THREE.AnimationMixer(object);
            this.scene.add(object);
            this.mesh = object;
            
            // Carrega todas as animações
            this.loadAnimation(fbxLoader, 'assets/animations/Idle.fbx', 'idle');
            this.loadAnimation(fbxLoader, 'assets/animations/Run.fbx', 'run');
            this.loadAnimation(fbxLoader, 'assets/animations/Attack01.fbx', 'attack01');
            this.loadAnimation(fbxLoader, 'assets/animations/Attack03.fbx', 'attack02');
            this.loadAnimation(fbxLoader, 'assets/animations/BlockIdle.fbx', 'blockIdle');
            this.loadAnimation(fbxLoader, 'assets/animations/BlockStart.fbx', 'blockStart');
            this.loadAnimation(fbxLoader, 'assets/animations/Dying.fbx', 'dying');
            this.loadAnimation(fbxLoader, 'assets/animations/Died.fbx', 'died');
            
            this.modelReady = true;
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% carregado');
        }, (error) => {
            console.error(error);
        });
    }

    loadAnimation(loader, path, name) {
        loader.load(path, (anim) => {
            const animationAction = this.mixer.clipAction(anim.animations[0]);
            this.animations[name] = animationAction;
            if (name === 'idle') {
                this.activeAction = animationAction; // Define animação inicial
                animationAction.play();
            }
            if (name === 'attack01') {
                animationAction.timeScale = 3.0; // Altera a velocidade de reprodução da animação de atirar
            }
            if (name === 'dying'){
                animationAction.setLoop(THREE.LoopOnce, 1); // Não reproduzir em loop
            }
        }, undefined, (error) => {
            console.error(`Erro na animação ${name}:`, error);
        });
    }

    setAction(toAction) {
        if (toAction !== this.activeAction && !this.shooting) {
            this.lastAction = this.activeAction;
            this.activeAction = toAction;
            this.lastAction.fadeOut(0.1);  // Transição suave
            this.activeAction.reset().fadeIn(0.01).play();
        }
    }

    move(delta) {
        let direction = new THREE.Vector3();
        if (this.keys[' ']) {
            this.setAction(this.animations['blockIdle']);
            this.blocking = true;
        } else {
            this.blocking = false;
            if (this.keys['w']) {direction.z -= 1; direction.x -= 1;}
            if (this.keys['s']) {direction.z += 1; direction.x += 1;}
            if (this.keys['a']) {direction.x -= 1; direction.z += 1;}
            if (this.keys['d']) {direction.x += 1; direction.z -= 1;}
            if (this.keys['1']) {this.setAction(this.animations['attack02']);}
            if (this.keys['r']) {this.reload();}

            if (direction.length() > 0) {
                direction.normalize();
                this.mesh.position.add(direction.multiplyScalar(this.velocity*delta));
                if(!this.shooting) this.mesh.lookAt(this.mesh.position.clone().add(direction));
                this.setAction(this.animations['run']);
            } else {
                if(!this.shooting) this.setAction(this.animations['idle']);
            }
        }
        
    }

    takeDamage(damageAmount) {
        if (this.blocking) { // Verifica se ta defendendo
            damageAmount *= 0.5; // Reduz o dano por 0.5 **temporario**
        }
        this.health -= damageAmount;
        console.log(`Player: ${damageAmount} de dano. Vida: ${this.health}`);

        if (this.health <= 0) { // Verifica se o player morreu
            this.die();
        }
    }

    die() {
        if(!this.isDied){
            console.log("O jogador foi derrotado.");
            this.isDied = true;
            this.setAction(this.animations['dying']);
            this.mesh.position.y += 0.15;
            setTimeout(() => { this.setAction(this.animations['died']); }, 3000);
        }
    }

    update(delta, camera, cameraDistance) {
        if (this.modelReady) {
            this.mixer.update(delta);
        }
        if (!this.isDied){
            this.move(delta);
        }
        
        this.updateCamera(camera, cameraDistance);
        this.updateHUD();
    }

    updateHUD() {
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        const ammoText = document.getElementById('ammo');
        const scoreText = document.getElementById('score');

        const healthPercentage = (this.health / 100) * 100;
        healthBar.style.width = `${healthPercentage}%`;
        healthText.textContent = `Vida: ${this.health}`;
        ammoText.textContent = `Munição: ${this.ammo}`;
        scoreText.textContent = `Pontuação: ${this.score}`;
    }

    addScore(score){
        this.score += score;
    }

    updateCamera(camera, cameraDistance) {
        if (this.isDied) {
            if(this.deadCountdown <= 0){
                const orbitSpeed = 0.001; // Velocidade de rotação 
            const distanceSpeed = 0.1; // Velocidade de afastamento 
            const targetDistance = 60;

            // Aumenta gradualmente a distância atual da câmera
            if (this.currentCameraDistance < targetDistance) {
                this.currentCameraDistance += distanceSpeed;
            }

            this.cameraOrbitAngle += orbitSpeed;

            // Calcula a nova posição da câmera para orbitar em torno do ponto (0, 0, 0)
            const x = Math.cos(this.cameraOrbitAngle) * this.currentCameraDistance;
            const z = Math.sin(this.cameraOrbitAngle) * this.currentCameraDistance;
            const y = this.currentCameraDistance / 2;

            camera.position.set(x, y, z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            } else this.deadCountdown -= 1;
            
        } else {
            camera.position.set(
                this.mesh.position.x + cameraDistance,
                this.mesh.position.y + cameraDistance + 1,
                this.mesh.position.z + cameraDistance
            );
            camera.lookAt(this.mesh.position);
        }
    }

    shoot(scene, projectiles, direction, startPosition, delta) {
        if (this.ammo > 0 && !this.reloading && !this.shooting && !this.blocking && !this.isDied) {
            this.ammo--;
            this.setAction(this.animations['attack02']);
            this.shooting = true;
            this.velocity *= 0.25;
            this.mesh.lookAt(this.mesh.position.clone().add(direction));
            setTimeout(() => { // timeout para atirar na metade do tempo de disparo
                const projectile = new Projectile(startPosition, direction, 15*delta, this.damage, false, null, this);
                projectiles.push(projectile);
                scene.add(projectile.mesh);
                setTimeout(() => { // timeout para remover o projetil depois de 5 segundos
                    scene.remove(projectile.mesh);
                    const index = projectiles.indexOf(projectile);
                    if (index > -1) {
                        projectiles.splice(index, 1);
                    }
                }, 5000);
            }, this.shootSpeed/2);
            
    
            setTimeout(() => { this.shooting = false; this.velocity *= 4;}, this.shootSpeed);
        } else if (!this.reloading && !this.shooting && !this.blocking && !this.isDied) {
            console.log("Recarregando...");
            this.reload();
        }
    }
    

    reload() {
        this.reloading = true;
        setTimeout(() => {
            this.ammo = 10;
            this.reloading = false;
        }, this.reloadTime);
    }

}

export default Player;
