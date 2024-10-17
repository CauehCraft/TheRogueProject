import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class Terrain {
    constructor(scene, radius, height, radialSegments, heightSegments, imagem, ringImage) {
        this.radius = radius;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.pieces = [];
        this.createCylinder(scene, imagem);
        this.createRing(scene, ringImage);     
        this.createTorus(scene, imagem);
        this.createSurfaceRing(scene, 'assets/textures/Grama.png');
    }

    createCylinder(scene, imagem) {
        let material;
        if (imagem) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(imagem, (texture) => {
                material = new THREE.MeshStandardMaterial({ map: texture });
                this.createCylinderMesh(scene, material);
            });
        } else {
            material = new THREE.MeshStandardMaterial({ color: 0x808080 });
            this.createCylinderMesh(scene, material);
        }      
    }

    createCylinderMesh(scene, material) {
        const geometry = new THREE.CylinderGeometry(this.radius - 1, this.radius, this.height, this.radialSegments, this.heightSegments);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        scene.add(cylinder);
        this.pieces.push(cylinder);
    }

    createRing(scene, ringImage) {
        // Parâmetros para o primeiro anel
        const innerRadius = this.radius - 1;
        const outerRadius = this.radius + 4;
        const segments = 64;

        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
        
        if (ringImage) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(ringImage, (texture) => {
                const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, emissive: 0xff0000, emissiveIntensity: 0.5 });
                this.createRingMesh(scene, geometry, material);
            });
        } else {
            const material = new THREE.MeshStandardMaterial({ color: 0xffaa00, side: THREE.DoubleSide });
            this.createRingMesh(scene, geometry, material);
        }
    }

    createRingMesh(scene, geometry, material, yPosition = 0) {
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = yPosition;
        ring.castShadow = false;
        ring.receiveShadow = false;
        scene.add(ring);
        this.pieces.push(ring);
        return ring;
    }
    
    createTorus(scene, ringImage) {
        // Parâmetros para o torus (tubo)
        const radius = this.radius + 6;
        const tube = 4;
        const radialSegments = 6;
        const tubularSegments = 64;

        const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);

        if (ringImage) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(ringImage, (texture) => {
                const material = new THREE.MeshStandardMaterial({ map: texture });
                this.createTorusMesh(scene, geometry, material);
            });
        } else {
            const material = new THREE.MeshStandardMaterial({ color: 0xff5500 });
            this.createTorusMesh(scene, geometry, material);
        }
    }

    createTorusMesh(scene, geometry, material) {
        const torus = new THREE.Mesh(geometry, material);
        torus.rotation.x = Math.PI / 2;
        torus.position.y = this.height - 3;
        torus.castShadow = true;
        torus.receiveShadow = true;
        scene.add(torus);
        this.pieces.push(torus);
    }

    createSurfaceRing(scene, ringImage) {
        // Parâmetros para o anel da superfície
        const innerRadius = this.radius + 6;
        const outerRadius = innerRadius + 12; // tamanho da area onde nascem os objetos 
        const segments = 64;
    
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    
        if (ringImage) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(ringImage, (texture) => {
                const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
                const sfRing = this.createRingMesh(scene, geometry, material, this.height + 0.5); 
                sfRing.castShadow = false;
                sfRing.receiveShadow = true;    
                this.loadFBXObjects(scene, innerRadius, outerRadius, this.height + 0.51);
            });
        } else {
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
            const sfRing = this.createRingMesh(scene, geometry, material, this.height + 0.5);
            sfRing.castShadow = true;
            sfRing.receiveShadow = true;
            this.loadFBXObjects(scene, innerRadius, outerRadius, this.height + 0.51);
        }
    }
    
    loadFBXObjects(scene, innerRadius, outerRadius, height) {
        const deadTrees = [];
        const pineTrees = [];
        const rocks = [];
        
        const fbxLoader = new FBXLoader();
        
        // Carregar o arquivo FBX para as árvores
        fbxLoader.load('assets/models/PineTrees.fbx', (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    pineTrees.push(child);
                    console.log('Árvore carregada');
                }
            });
        
            setTimeout(() => {
                this.addRandomObjectsOnRing(scene, pineTrees, innerRadius, outerRadius, height, 100);
            }, 2000);
        });
        
        // Carregar o arquivo FBX para as árvores mortas
        fbxLoader.load('assets/models/MoreDeadTrees.fbx', (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    deadTrees.push(child);
                    console.log('Árvore morta carregada');
                }
            });
        
            setTimeout(() => {
                this.addRandomObjectsOnRing(scene, deadTrees, innerRadius, outerRadius, height, 100);
            }, 2000); 
        });
        
        // Carregar o arquivo FBX para as rochas
        fbxLoader.load('assets/models/Rocks.fbx', (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    rocks.push(child);
                    console.log('Rocha carregada');
                }
            });
        
            setTimeout(() => {
                this.addRandomObjectsOnRing(scene, rocks, innerRadius, outerRadius, height, 100);
            }, 2000); 
        });
    }

    addRandomObjectsOnRing(scene, objectsArray, innerRadius, outerRadius, height, count) {
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * objectsArray.length); // pega um index aleatorio do array
            const originalMesh = objectsArray[randomIndex].clone(); // Cria uma cópia do Mesh
            originalMesh.scale.set(1, 1, 1);
            
            // Gera um ângulo aleatório para posicionar as árvores em cima do anel
            const angle = Math.random() * 2 * Math.PI;
            // Gera um raio aleatório entre innerRadius e outerRadius para posicionar as árvores dentro do anel
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            originalMesh.position.set(x, height, z);

            console.log(`Adicionando objeto em x: ${x}, y: ${height}, z: ${z}`);
            scene.add(originalMesh);
        }
    }
    
}

export default Terrain;
