import * as THREE from 'three';
import CollisionSystem from '../systems/CollisionSystem.js';

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

    update(enemies, scene, projectiles) {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    
        enemies.forEach((enemy, enemyIndex) => {
            if (CollisionSystem.checkCollision(this.mesh, enemy.mesh)) {
                scene.remove(this.mesh);
                projectiles.splice(projectiles.indexOf(this), 1);
                scene.remove(enemy.mesh);
                enemies.splice(enemyIndex, 1);
            }
        });
    }
    
}

export default Projectile;