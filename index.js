class Portfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.mouse = { x: 0, y: 0 };
        this.currentSection = 0;
        this.isLoaded = false;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('three-canvas'),
            antialias: true,
            alpha: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Camera position
        this.camera.position.z = 5;
        
        // Create particle system
        this.createParticles();
        
        // Create floating geometries
        this.createFloatingGeometries();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                this.isLoaded = true;
            }, 500);
        }, 2000);
    }

    createParticles() {
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
            
            colors[i] = Math.random();
            colors[i + 1] = Math.random() * 0.5 + 0.5;
            colors[i + 2] = 1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFloatingGeometries() {
        this.geometries = [];
        
        // Torus
        const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        const torusMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(-3, 2, -2);
        this.scene.add(torus);
        this.geometries.push(torus);
        
        // Icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(0.8, 0);
        const icoMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0088ff,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        icosahedron.position.set(3, -2, -1);
        this.scene.add(icosahedron);
        this.geometries.push(icosahedron);
        
        // Octahedron
        const octaGeometry = new THREE.OctahedronGeometry(0.6, 0);
        const octaMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0088,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
        octahedron.position.set(0, 3, -3);
        this.scene.add(octahedron);
        this.geometries.push(octahedron);
    }

    setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Scroll handling
        window.addEventListener('scroll', () => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            document.querySelector('.scroll-progress').style.width = `${scrollPercent * 100}%`;
            
            this.updateCameraOnScroll();
            this.updateSectionVisibility();
        });

        // Navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = document.querySelector(link.getAttribute('href'));
                section.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Project cards
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.project;
                this.animateToProject(projectId);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Custom cursor
        this.setupCustomCursor();
    }

    setupCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'scale(0.8)';
        });

        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'scale(1)';
        });
    }

    updateCameraOnScroll() {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollY / maxScroll;
        
        this.camera.position.z = 5 + scrollPercent * 10;
        this.camera.rotation.x = scrollPercent * 0.5;
    }

    updateSectionVisibility() {
        const sections = document.querySelectorAll('.section');
        const scrollY = window.scrollY;
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
            
            if (isVisible) {
                section.classList.add('active');
                this.currentSection = index;
            } else {
                section.classList.remove('active');
            }
        });
    }

    animateToProject(projectId) {
        const targetRotation = {
            x: Math.PI * 0.1 * projectId,
            y: Math.PI * 0.2 * projectId,
            z: 0
        };
        
        gsap.to(this.camera.rotation, {
            duration: 1.5,
            x: targetRotation.x,
            y: targetRotation.y,
            z: targetRotation.z,
            ease: "power2.inOut"
        });
        
        gsap.to(this.camera.position, {
            duration: 1.5,
            z: 3 + projectId,
            ease: "power2.inOut"
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isLoaded) return;
        
        const time = Date.now() * 0.001;
        
        // Rotate particles
        if (this.particles) {
            this.particles.rotation.x = time * 0.1;
            this.particles.rotation.y = time * 0.05;
        }
        
        // Animate floating geometries
        this.geometries.forEach((geometry, index) => {
            geometry.rotation.x = time * (0.5 + index * 0.1);
            geometry.rotation.y = time * (0.3 + index * 0.05);
            geometry.position.y += Math.sin(time + index) * 0.001;
        });
        
        // Mouse interaction
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.05;
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio3D();
    
    // Additional interactions
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', () => {
        document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Form submission
    const submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Simple form validation and animation
        const inputs = document.querySelectorAll('.form-input, .form-textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff4444';
                isValid = false;
            } else {
                input.style.borderColor = '#00ff88';
            }
        });
        
        if (isValid) {
            submitButton.textContent = 'Message Sent!';
            submitButton.style.background = '#00ff88';
            
            setTimeout(() => {
                submitButton.textContent = 'Send Message';
                submitButton.style.background = 'linear-gradient(45deg, #00ff88, #0088ff)';
                inputs.forEach(input => input.value = '');
            }, 2000);
        }
    });
});