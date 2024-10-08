class FireEffect {
    constructor(scene, ball) {
        this.scene = scene;
        this.parentObject = ball; // A esfera que a "bola de fogo" deve orbitar.
        this.particles = [];
        this.createFireParticles();
        this.scene.add(this.particles);
    }

    createFireParticles() {
        const particleCount = 100; // Número de partículas para simular o fogo.
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3); // Array para armazenar as posições das partículas.
        
        for (let i = 0; i < particleCount; i++) {
            // Posições aleatórias em torno da esfera
            const radius = 0.2 + Math.random() * 0.2; // Raio das partículas em torno da esfera.
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 0.4 - 0.2;

            positions[i * 3] = radius * Math.cos(angle); // Posição X.
            positions[i * 3 + 1] = height; // Posição Y.
            positions[i * 3 + 2] = radius * Math.sin(angle); // Posição Z.
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Material das partículas - usaremos um material transparente para o fogo.
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4500, // Cor laranja-avermelhada de fogo.
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            map: new THREE.TextureLoader().load('assets/textures/fire.png'), // Textura de partícula de fogo.
            blending: THREE.AdditiveBlending, // Mistura aditiva para dar o efeito de fogo brilhante.
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    animateParticles(time) {
        const positions = this.particleSystem.geometry.attributes.position.array;

        // Alterar levemente as posições para dar um efeito de fogo em movimento.
        for (let i = 0; i < positions.length / 3; i++) {
            const radius = 0.2 + Math.random() * 0.2;
            const angle = time * 0.5 + i; // Move levemente as partículas com o tempo.
            const height = Math.sin(time * 2 + i) * 0.2; // Movimento oscilante no eixo Y.

            positions[i * 3] = radius * Math.cos(angle); // Atualiza X.
            positions[i * 3 + 1] = height; // Atualiza Y.
            positions[i * 3 + 2] = radius * Math.sin(angle); // Atualiza Z.
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true; // Informar ao sistema que as posições foram atualizadas.

        // Posicionar as partículas em torno da esfera
        this.particleSystem.position.copy(this.parentObject.position);
    }
}

export default FireEffect;