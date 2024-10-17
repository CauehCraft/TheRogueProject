import * as THREE from 'three';
import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewer.js';

class Utils {
    // Função para ajustar escala dos modelos importados
    static changeModelScale(modelo, alturaDesejada) {
        const box = new THREE.Box3().setFromObject(modelo); // Cria uma caixa a partir de um objeto
        const tamanho = new THREE.Vector3(); // Cria um vetor pra armazenar o tamanho da caixa
        box.getSize(tamanho); // Salva o tamanho da caixa no vetor

        const escala = alturaDesejada / tamanho.y; // Fator de escala
        modelo.scale.set(escala, escala, escala); // Define o fator de escala no modelo
    }

    // Função para ajustar o tamanho da janela da cena dinamicamente
    static onWindowResize(camera, renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    static addLightAndShadows(scene){
        // Configuração da luz direcional
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.castShadow = true;
        light.position.set(0, 15, 0);
        light.target.position.set(0, 0, 0);
        
        // Configuração das sombras
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;
        light.shadow.camera.right = 100;
        light.shadow.camera.left = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        scene.add(light);
        scene.add(light.target);

        // Adicionando 'visualizadores' da luz e sombra para facilitar configuração 
        const helper = new THREE.DirectionalLightHelper(light);
        const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);

        scene.add(helper); // adiciona na cena
        scene.add(shadowCameraHelper);

        // Propriedades do visualizador do mapa de sombras
        const lightShadowMapViewer = new ShadowMapViewer(light);
        const size = window.innerWidth * 0.30;
        lightShadowMapViewer.position.set(10, 10);
        lightShadowMapViewer.size.set(size, size);
        lightShadowMapViewer.update();

        // Adicionando luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        return light;
    }

    static updateLight(light, scene, time, mapRadius) {
        // Configurações para a órbita da luz (o "sol")
        const orbitSpeed = 0.05; // Velocidade da órbita da luz
        const maxDistance = mapRadius; // Ajusta a distância máxima da luz conforme tamanho do mapa
        const angle = time * orbitSpeed; // Calcula o ângulo de órbita com base no tempo
        
        // Calcula a posição da luz para uma órbita ao redor do centro (0, 0, 0)
        const x = Math.cos(angle) * maxDistance;
        const z = Math.sin(angle) * maxDistance;
        const y = Math.sin(angle) * mapRadius; // Ajusta a altura da luz para dar um efeito de nascer e pôr do sol

        light.position.set(x, y, z);
        light.target.position.set(0, 0, 0);
        light.target.updateMatrixWorld();

        // Ajuste da cor e intensidade da luz com base na altura Y
        const normalizedY = (y + mapRadius) / (2 * mapRadius);
        const intensity = Math.max(0, normalizedY); // Intensidade da luz de 0 a 1
        light.intensity = intensity;

        // Ajusta a cor da luz (tom mais quente quando no horizonte)
        if (y < 20) {
            light.color.setHSL(0.08, 0.8, 0.6); // Tom laranja ao se pôr
        } else {
            light.color.setHSL(0.1, 0.5, 0.9); // Tom mais neutro durante o "dia"
        }

        // Ajusta a cor de fundo da cena para simular dia/noite
        const backgroundColor = new THREE.Color(0.2, 0.4, 0.6).lerp(new THREE.Color(0, 0, 0), 1 - intensity);
        scene.background = backgroundColor;
    }

    static clampObjectToCircle(object, mapSize) {
        if(object.mesh) {
            const distanceFromCenter = Math.sqrt(object.mesh.position.x**2 + object.mesh.position.z**2); // A = raiz(B**2 + C**2)
            // Se a distância do centro for maior que o raio do mapa, ajusta a posição
            if (distanceFromCenter > mapSize) {
                const ratio = mapSize / distanceFromCenter;
                object.mesh.position.x *= ratio;
                object.mesh.position.z *= ratio;
            }
        }
    }

    static clampEntitiesToMap(player, enemies, mapSize) {
        mapSize -= 1.5; // Ajuste do tamanho do mapa
        this.clampObjectToCircle(player, mapSize);
        enemies.forEach(enemy => this.clampObjectToCircle(enemy, mapSize));

    }
}

export default Utils