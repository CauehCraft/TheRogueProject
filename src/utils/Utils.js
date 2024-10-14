import * as THREE from 'three';
import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewer.js';

class Utils {
    // Função para ajustar escala dos modelos importados
    static changeModelScale(modelo, alturaDesejada) {
        const box = new THREE.Box3().setFromObject(modelo);
        const tamanho = new THREE.Vector3();
        box.getSize(tamanho);

        const escala = alturaDesejada / tamanho.y;
        modelo.scale.set(escala, escala, escala);

    }

    // Função para ajustar o tamanho da janela da cena
    static onWindowResize(camera, renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    static addLightAndShadows(scene){
    // Configuração da luz direcional
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.castShadow = true;
    light.position.set(0, 7, 0);
    light.target.position.set(1, 0, 0);
    // Configuração das sombras
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 10;
    light.shadow.camera.right = 45;
    light.shadow.camera.left = -45;
    light.shadow.camera.top = 45;
    light.shadow.camera.bottom = -45;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);
    scene.add(light.target);

    // Adicionando 'visualizadores' da luz para facilitar configuração 
    const helper = new THREE.DirectionalLightHelper(light);
    scene.add(helper);

    // Adicionando o helper da câmera de sombra
    const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(shadowCameraHelper);
    const lightShadowMapViewer = new ShadowMapViewer(light);
    const size = window.innerWidth * 0.30;
    lightShadowMapViewer.position.set(10, 10);
    lightShadowMapViewer.size.set(size, size);
    lightShadowMapViewer.update();

    // Adicionando luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    }
}

export default Utils