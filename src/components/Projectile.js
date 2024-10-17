import * as THREE from 'three';
import CollisionSystem from '../systems/CollisionSystem.js';

class Projectile {
    constructor(position, direction, speed, damage, isEnemy = false, enemyBall = null, player = null) {
        this.direction = direction.clone().normalize();
        this.speed = speed;
        this.isEnemy = isEnemy;
        this.damage = damage;
        this.player = player;
        
        if (isEnemy && enemyBall) {
            this.mesh = enemyBall; // Se for um projétil inimigo, usa a bola orbital como "mesh"
        } else { // Caso contrário, cria um mesh padrão para o projétil do jogador
            this.mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x1000ff })
            );
            this.mesh.position.copy(position);
        }
    }

    update(enemies, scene, projectiles) {
    this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    
    // Verifica colisão com inimigos apenas se o projétil for do jogador
    if (!this.isEnemy) {
        enemies.forEach((enemy, enemyIndex) => {
            if (CollisionSystem.checkCollision(this.mesh, enemy.mesh)) {
                scene.remove(this.mesh);
                projectiles.splice(projectiles.indexOf(this), 1);
                enemy.takeDamage(this.damage, this.player);
            } 
        });
    } else {
        if (this.mesh && this.player.mesh) {
            if (CollisionSystem.checkCollision(this.mesh, this.player.mesh)) {
                // Verifica colisão do projétil inimigo com o jogador
                scene.remove(this.mesh);
                projectiles.splice(projectiles.indexOf(this), 1);
                this.player.takeDamage(this.damage);
            }
        }
    }
}

}

export default Projectile;
