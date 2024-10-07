import * as THREE from 'three';

class Terrain {
    constructor(scene, size = 10) {
        this.size = size;
        this.cubes = [];
        this.createTerrain(scene);
    }

    createTerrain(scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x808080, wireframe: false });

        // uso temporario de uma planice de cubos
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const cube = new THREE.Mesh(geometry, material);
                cube.receiveShadow = true;
                cube.position.set(x - this.size / 2, 0, z - this.size / 2);
                scene.add(cube);
                this.cubes.push(cube);
            }
        }
    }

    // updateObjectMovement(object) {
    //     if (object.userData.target) {
    //         const direction = new THREE.Vector3().subVectors(object.userData.target, object.position).normalize();
    //         const distance = object.userData.speed * 0.5;
    //         object.position.add(direction.multiplyScalar(distance));

    //         if (object.position.distanceTo(object.userData.target) < distance) {
    //             object.position.copy(object.userData.target);
    //             object.userData.target = null;
    //         }
    //     }
    // }
}

export default Terrain;