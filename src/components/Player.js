import * as THREE from 'three';

class Player {
    constructor(scene) {
        // Caixa temporaria para representar o jogador
        const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.mesh.position.y = 1;

        scene.add(this.mesh);

        this.velocity = 0.04;
        this.keys = {};

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    move() {
        if (this.keys['w']) this.mesh.position.z -= this.velocity;
        if (this.keys['s']) this.mesh.position.z += this.velocity;
        if (this.keys['a']) this.mesh.position.x -= this.velocity;
        if (this.keys['d']) this.mesh.position.x += this.velocity;
    }

    updateCamera(camera, cameraDistance) {
        camera.position.set(
            this.mesh.position.x + cameraDistance,
            this.mesh.position.y + cameraDistance + 1,
            this.mesh.position.z + cameraDistance
        );
        camera.lookAt(this.mesh.position);
    }
}

export default Player;