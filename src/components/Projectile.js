import * as THREE from 'three';

class Projectile {
    constructor(position, direction, speed) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.mesh.position.copy(position);
        this.direction = direction.clone().normalize();
        this.speed = speed;
    }

    update() {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    }
}

export default Projectile;