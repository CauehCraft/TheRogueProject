import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Background{
    constructor(scene, numberLayers){
        this.scene = scene;
        this.numberLayers = numberLayers;   
        this.start()
    }
    
    start(){
        this.models = []
        this.rotationX = []
        this.rotationY = []
        this.rotationZ = []

        for(let i = 0; i < this.numberLayers; i++){
            this.load();
            this.rotationX.push(((Math.random() * 2) - 1) / 10000);
            this.rotationY.push(((Math.random() * 2) - 1) / 10000);
            this.rotationZ.push(((Math.random() * 2) - 1) / 10000);    
        }
    }

    update(){
        for(let i = 0; i < this.models.length; i++){
            this.models[i].rotation.x += this.rotationX[i]
            this.models[i].rotation.y += this.rotationY[i]
            this.models[i].rotation.z += this.rotationZ[i]
        }
    }

    load() {
        const loader = new GLTFLoader();    
    
        loader.load(
            './assets/models/scene.gltf', 
    
            // Chamado quando o recurso é carregado
            (gltf) => {
                this.scene.add(gltf.scene);
                const model = gltf.scene.children[0];
                model.scale.set((Math.random() * this.numberLayers) + 5, (Math.random() * this.numberLayers) + 5, (Math.random() * this.numberLayers) + 5);
                model.position.set(0, 0, 100);
                model.rotation.set(Math.random(), Math.random(), Math.random())
                this.models.push(model)
            },
    
            // Progresso do carregamento
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
    
            // Chamado quando ocorre um erro no carregamento
            (error) => {
                console.error('Erro ao carregar o modelo:', error);
            }
        );
    }
}

export default Background;