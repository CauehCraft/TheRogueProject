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
        this.velocity = 0.03;
        this.ammo = 10;
        this.blocking = false;
        this.reloading = false;
        this.shooting = false;
        this.reloadTime = 5000; // tempo em ms
        this.shootSpeed = 500; // tempo em ms

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
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

    move() {
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

            if (direction.length() > 0) {
                direction.normalize();
                this.mesh.position.add(direction.multiplyScalar(this.velocity));
                if(!this.shooting) this.mesh.lookAt(this.mesh.position.clone().add(direction));
                this.setAction(this.animations['run']);
            } else {
                if(!this.shooting) this.setAction(this.animations['idle']);
            }
        }
        
    }

    update(delta, camera, cameraDistance) {
        if (this.modelReady) {
            this.mixer.update(delta);
        }
        this.move();
        this.updateCamera(camera, cameraDistance);
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('ammo').textContent = `Munição: ${this.ammo}`;
        
    }

    updateCamera(camera, cameraDistance) {
        camera.position.set(
            this.mesh.position.x + cameraDistance,
            this.mesh.position.y + cameraDistance + 1,
            this.mesh.position.z + cameraDistance
        );
        camera.lookAt(this.mesh.position);
    }

    shoot(scene, projectiles, direction, startPosition) {
        if (this.ammo > 0 && !this.reloading && !this.shooting && !this.blocking) {
            this.ammo--;
            this.setAction(this.animations['attack02']);
            this.shooting = true;
            this.velocity *= 0.25;
            this.mesh.lookAt(this.mesh.position.clone().add(direction));
            setTimeout(() => { 
                const projectile = new Projectile(startPosition, direction, 0.5);
                projectiles.push(projectile);
                scene.add(projectile.mesh);
            }, this.shootSpeed/2);
            
    
            setTimeout(() => { this.shooting = false; this.velocity *= 4;}, this.shootSpeed);
        } else if (!this.reloading && !this.shooting && !this.blocking) {
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
