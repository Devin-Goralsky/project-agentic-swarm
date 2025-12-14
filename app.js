// Professional 3D Visualizer
// Scene components
let scene, camera, renderer, currentShape, light, lightHelper;
let ambientLight, grid, axes, particles, particleSystem;

// State
let rotationX = 0, rotationY = 0, rotationZ = 0;
let scaleValue = 1.0;
let autoRotateX = false, autoRotateY = false, autoRotateZ = false;
let rotationSpeed = 1.0;
let lightOrbitEnabled = false;
let cameraOrbitEnabled = false;
let rainbowModeEnabled = false;
let isPaused = false;
let floatAnimation = false;
let pulseAnimation = false;

// FPS and performance
let lastTime = performance.now();
let frames = 0;
let fps = 0;

// Mouse interaction
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Animation time
let time = 0;

// Colors
const shapeColors = [0x6366f1, 0x8b5cf6, 0x06b6d4, 0x10b981, 0xf59e0b, 0xef4444];

// Initialize
function init() {
    const canvas = document.getElementById('main-canvas');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);

    // Light helper
    const lightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    lightHelper = new THREE.Mesh(lightGeometry, lightMaterial);
    lightHelper.position.copy(light.position);
    scene.add(lightHelper);

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a24,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Create main shape
    createShape('cube');

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    setupMouseControls();
    setupKeyboardControls();
    setupUI();

    // Start animation
    animate();
}

// Create shape geometries
function createShape(shapeType) {
    if (currentShape) {
        scene.remove(currentShape);
    }

    let geometry;

    switch (shapeType) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 64, 64);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1.2, 0.5, 32, 100);
            break;
        case 'pyramid':
            geometry = new THREE.ConeGeometry(1.5, 2, 4);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(1, 1, 2, 64);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(1.5);
            break;
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(1.5);
            break;
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(1.5);
            break;
        case 'cube':
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
    }

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: shapeColors[0],
        roughness: 0.5,
        metalness: 0,
        transparent: true,
        opacity: 1
    });

    currentShape = new THREE.Mesh(geometry, material);
    currentShape.castShadow = true;
    currentShape.receiveShadow = true;
    scene.add(currentShape);

    updateShapeTransform();
}

// Window resize
function onWindowResize() {
    const canvas = document.getElementById('main-canvas');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Mouse controls
function setupMouseControls() {
    const canvas = document.getElementById('main-canvas');

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            rotationY += deltaX * 0.5;
            rotationX += deltaY * 0.5;

            rotationY = rotationY % 360;
            rotationX = rotationX % 360;

            document.getElementById('rotationY').value = rotationY;
            document.getElementById('rotationX').value = rotationX;
            document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
            document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;

            updateShapeTransform();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);
}

// Keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const step = 5;

        switch (e.key) {
            case 'ArrowLeft':
                rotationY = (rotationY - step) % 360;
                document.getElementById('rotationY').value = rotationY;
                document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
                updateShapeTransform();
                break;
            case 'ArrowRight':
                rotationY = (rotationY + step) % 360;
                document.getElementById('rotationY').value = rotationY;
                document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
                updateShapeTransform();
                break;
            case 'ArrowUp':
                rotationX = (rotationX - step) % 360;
                document.getElementById('rotationX').value = rotationX;
                document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
                updateShapeTransform();
                break;
            case 'ArrowDown':
                rotationX = (rotationX + step) % 360;
                document.getElementById('rotationX').value = rotationX;
                document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
                updateShapeTransform();
                break;
            case ' ':
                isPaused = !isPaused;
                e.preventDefault();
                break;
            case 'r':
            case 'R':
                resetAll();
                break;
        }
    });
}

// Setup UI controls
function setupUI() {
    // Collapsible sections
    document.querySelectorAll('.section-header[data-section]').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.control-section');
            section.classList.toggle('collapsed');
        });
    });

    // Shape
    document.getElementById('shapeSelect').addEventListener('change', (e) => {
        createShape(e.target.value);
    });

    // Wireframe
    document.getElementById('wireframeToggle').addEventListener('change', (e) => {
        if (currentShape) {
            currentShape.material.wireframe = e.target.checked;
        }
    });

    // Show Axes
    document.getElementById('showAxes').addEventListener('change', (e) => {
        if (e.target.checked) {
            if (!axes) {
                axes = new THREE.AxesHelper(3);
                scene.add(axes);
            }
        } else if (axes) {
            scene.remove(axes);
            axes = null;
        }
    });

    // Show Grid
    document.getElementById('showGrid').addEventListener('change', (e) => {
        if (e.target.checked) {
            if (!grid) {
                grid = new THREE.GridHelper(10, 10, 0x6366f1, 0x2a2a3a);
                grid.position.y = -2;
                scene.add(grid);
            }
        } else if (grid) {
            scene.remove(grid);
            grid = null;
        }
    });

    // Rotation sliders
    ['rotationX', 'rotationY', 'rotationZ'].forEach(axis => {
        const slider = document.getElementById(axis);
        const valueDisplay = document.getElementById(`${axis}-value`);

        slider.addEventListener('input', (e) => {
            window[axis] = parseFloat(e.target.value);
            valueDisplay.textContent = `${Math.round(window[axis])}°`;
            updateShapeTransform();
        });
    });

    // Scale
    document.getElementById('scale').addEventListener('input', (e) => {
        scaleValue = parseFloat(e.target.value);
        document.getElementById('scale-value').textContent = scaleValue.toFixed(1);
        updateShapeTransform();
    });

    // Auto-rotation
    document.getElementById('autoRotateX').addEventListener('change', (e) => {
        autoRotateX = e.target.checked;
    });

    document.getElementById('autoRotateY').addEventListener('change', (e) => {
        autoRotateY = e.target.checked;
    });

    document.getElementById('autoRotateZ').addEventListener('change', (e) => {
        autoRotateZ = e.target.checked;
    });

    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        document.getElementById('rotationSpeed-value').textContent = `${rotationSpeed.toFixed(1)}x`;
    });

    // Float animation
    document.getElementById('floatAnimation').addEventListener('change', (e) => {
        floatAnimation = e.target.checked;
    });

    // Pulse animation
    document.getElementById('pulseAnimation').addEventListener('change', (e) => {
        pulseAnimation = e.target.checked;
    });

    // Light color
    document.getElementById('lightColor').addEventListener('input', (e) => {
        const color = new THREE.Color(e.target.value);
        light.color = color;
        lightHelper.material.color = color;
    });

    // Light intensity
    document.getElementById('lightIntensity').addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        light.intensity = intensity;
        document.getElementById('lightIntensity-value').textContent = intensity.toFixed(1);
    });

    // Light orbit
    document.getElementById('lightOrbit').addEventListener('change', (e) => {
        lightOrbitEnabled = e.target.checked;
    });

    // Ambient light
    document.getElementById('ambientLight').addEventListener('change', (e) => {
        ambientLight.visible = e.target.checked;
    });

    // Material properties
    document.getElementById('metalness').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (currentShape) {
            currentShape.material.metalness = value;
        }
        document.getElementById('metalness-value').textContent = value.toFixed(1);
    });

    document.getElementById('roughness').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (currentShape) {
            currentShape.material.roughness = value;
        }
        document.getElementById('roughness-value').textContent = value.toFixed(1);
    });

    document.getElementById('opacity').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 100;
        if (currentShape) {
            currentShape.material.opacity = value;
            currentShape.material.transparent = value < 1;
        }
        document.getElementById('opacity-value').textContent = `${Math.round(value * 100)}%`;
    });

    // Rainbow mode
    document.getElementById('rainbowMode').addEventListener('change', (e) => {
        rainbowModeEnabled = e.target.checked;
    });

    // Environment map
    document.getElementById('envMap').addEventListener('change', (e) => {
        if (e.target.checked && currentShape) {
            // Create simple environment map
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
            const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
            scene.add(cubeCamera);
            cubeCamera.update(renderer, scene);
            currentShape.material.envMap = cubeRenderTarget.texture;
            currentShape.material.envMapIntensity = 0.5;
        } else if (currentShape) {
            currentShape.material.envMap = null;
        }
    });

    // Particles
    document.getElementById('particles').addEventListener('change', (e) => {
        if (e.target.checked) {
            createParticles();
        } else if (particleSystem) {
            scene.remove(particleSystem);
            particleSystem = null;
        }
    });

    // Fog
    document.getElementById('fogToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            scene.fog = new THREE.Fog(scene.background.getHex(), 5, 20);
        } else {
            scene.fog = null;
        }
    });

    // Background color
    document.getElementById('bgColor').addEventListener('input', (e) => {
        scene.background = new THREE.Color(e.target.value);
    });

    // Camera distance
    document.getElementById('zoomLevel').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        camera.position.z = value;
        document.getElementById('zoomLevel-value').textContent = value;
    });

    // Camera orbit
    document.getElementById('cameraOrbit').addEventListener('change', (e) => {
        cameraOrbitEnabled = e.target.checked;
    });

    // Quick actions
    document.getElementById('random-btn').addEventListener('click', randomizeSettings);
    document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);
    document.getElementById('reset-btn').addEventListener('click', resetAll);

    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

    // Presets
    document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
            applyPreset(card.dataset.preset);
        });
    });
}

// Create particle system
function createParticles() {
    const particleCount = 1000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 15;
        positions[i + 1] = (Math.random() - 0.5) * 15;
        positions[i + 2] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
}

// Update shape transform
function updateShapeTransform() {
    if (currentShape) {
        currentShape.rotation.x = (rotationX * Math.PI) / 180;
        currentShape.rotation.y = (rotationY * Math.PI) / 180;
        currentShape.rotation.z = (rotationZ * Math.PI) / 180;
        currentShape.scale.set(scaleValue, scaleValue, scaleValue);
    }
}

// Randomize settings
function randomizeSettings() {
    const shapes = ['cube', 'sphere', 'torus', 'pyramid', 'cylinder', 'dodecahedron', 'octahedron', 'tetrahedron'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    document.getElementById('shapeSelect').value = randomShape;
    createShape(randomShape);

    rotationX = Math.random() * 360;
    rotationY = Math.random() * 360;
    rotationZ = Math.random() * 360;
    document.getElementById('rotationX').value = rotationX;
    document.getElementById('rotationY').value = rotationY;
    document.getElementById('rotationZ').value = rotationZ;
    document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
    document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
    document.getElementById('rotationZ-value').textContent = `${Math.round(rotationZ)}°`;
    updateShapeTransform();

    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    document.getElementById('lightColor').value = randomColor;
    light.color = new THREE.Color(randomColor);
    lightHelper.material.color = new THREE.Color(randomColor);

    autoRotateX = Math.random() > 0.5;
    autoRotateY = Math.random() > 0.5;
    autoRotateZ = Math.random() > 0.5;
    document.getElementById('autoRotateX').checked = autoRotateX;
    document.getElementById('autoRotateY').checked = autoRotateY;
    document.getElementById('autoRotateZ').checked = autoRotateZ;
}

// Take screenshot
function takeScreenshot() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `visualizer-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.querySelector('.canvas-wrapper').requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Apply presets
function applyPreset(preset) {
    switch (preset) {
        case 'default':
            resetAll();
            break;

        case 'sunset':
            document.getElementById('bgColor').value = '#ff6b35';
            scene.background = new THREE.Color('#ff6b35');
            document.getElementById('lightColor').value = '#ffa500';
            light.color = new THREE.Color('#ffa500');
            lightHelper.material.color = new THREE.Color('#ffa500');
            autoRotateY = true;
            document.getElementById('autoRotateY').checked = true;
            rotationSpeed = 0.5;
            document.getElementById('rotationSpeed').value = 0.5;
            document.getElementById('rotationSpeed-value').textContent = '0.5x';
            break;

        case 'disco':
            rainbowModeEnabled = true;
            document.getElementById('rainbowMode').checked = true;
            autoRotateX = true;
            autoRotateY = true;
            autoRotateZ = true;
            document.getElementById('autoRotateX').checked = true;
            document.getElementById('autoRotateY').checked = true;
            document.getElementById('autoRotateZ').checked = true;
            rotationSpeed = 2;
            document.getElementById('rotationSpeed').value = 2;
            document.getElementById('rotationSpeed-value').textContent = '2.0x';
            lightOrbitEnabled = true;
            document.getElementById('lightOrbit').checked = true;
            document.getElementById('particles').checked = true;
            createParticles();
            break;

        case 'ice':
            document.getElementById('bgColor').value = '#e3f2fd';
            scene.background = new THREE.Color('#e3f2fd');
            document.getElementById('lightColor').value = '#00bcd4';
            light.color = new THREE.Color('#00bcd4');
            lightHelper.material.color = new THREE.Color('#00bcd4');
            document.getElementById('fogToggle').checked = true;
            scene.fog = new THREE.Fog(0xe3f2fd, 5, 20);
            document.getElementById('metalness').value = 0.8;
            if (currentShape) {
                currentShape.material.metalness = 0.8;
            }
            document.getElementById('metalness-value').textContent = '0.8';
            break;

        case 'matrix':
            document.getElementById('bgColor').value = '#000000';
            scene.background = new THREE.Color('#000000');
            document.getElementById('lightColor').value = '#00ff41';
            light.color = new THREE.Color('#00ff41');
            lightHelper.material.color = new THREE.Color('#00ff41');
            document.getElementById('particles').checked = true;
            createParticles();
            if (particleSystem) {
                particleSystem.material.color = new THREE.Color('#00ff41');
            }
            document.getElementById('wireframeToggle').checked = true;
            if (currentShape) {
                currentShape.material.wireframe = true;
                currentShape.material.color = new THREE.Color('#00ff41');
            }
            autoRotateY = true;
            document.getElementById('autoRotateY').checked = true;
            break;

        case 'galaxy':
            document.getElementById('bgColor').value = '#1a1a2e';
            scene.background = new THREE.Color('#1a1a2e');
            document.getElementById('particles').checked = true;
            createParticles();
            if (particleSystem) {
                particleSystem.material.color = new THREE.Color('#6366f1');
                particleSystem.material.size = 0.08;
            }
            cameraOrbitEnabled = true;
            document.getElementById('cameraOrbit').checked = true;
            autoRotateY = true;
            document.getElementById('autoRotateY').checked = true;
            rotationSpeed = 0.3;
            document.getElementById('rotationSpeed').value = 0.3;
            document.getElementById('rotationSpeed-value').textContent = '0.3x';
            document.getElementById('metalness').value = 0.9;
            document.getElementById('roughness').value = 0.1;
            if (currentShape) {
                currentShape.material.metalness = 0.9;
                currentShape.material.roughness = 0.1;
            }
            document.getElementById('metalness-value').textContent = '0.9';
            document.getElementById('roughness-value').textContent = '0.1';
            break;
    }
}

// Reset all
function resetAll() {
    // Shape
    document.getElementById('shapeSelect').value = 'cube';
    createShape('cube');

    // Toggles
    document.getElementById('wireframeToggle').checked = false;
    document.getElementById('showAxes').checked = false;
    document.getElementById('showGrid').checked = false;
    document.getElementById('fogToggle').checked = false;
    scene.fog = null;

    if (axes) {
        scene.remove(axes);
        axes = null;
    }
    if (grid) {
        scene.remove(grid);
        grid = null;
    }

    // Background
    document.getElementById('bgColor').value = '#1a1a2e';
    scene.background = new THREE.Color(0x1a1a2e);

    // Rotation
    rotationX = 0;
    rotationY = 0;
    rotationZ = 0;
    document.getElementById('rotationX').value = 0;
    document.getElementById('rotationY').value = 0;
    document.getElementById('rotationZ').value = 0;
    document.getElementById('rotationX-value').textContent = '0°';
    document.getElementById('rotationY-value').textContent = '0°';
    document.getElementById('rotationZ-value').textContent = '0°';

    // Scale
    scaleValue = 1.0;
    document.getElementById('scale').value = 1;
    document.getElementById('scale-value').textContent = '1.0';

    updateShapeTransform();

    // Auto-rotation
    autoRotateX = false;
    autoRotateY = false;
    autoRotateZ = false;
    document.getElementById('autoRotateX').checked = false;
    document.getElementById('autoRotateY').checked = false;
    document.getElementById('autoRotateZ').checked = false;
    rotationSpeed = 1;
    document.getElementById('rotationSpeed').value = 1;
    document.getElementById('rotationSpeed-value').textContent = '1.0x';

    // Animations
    floatAnimation = false;
    pulseAnimation = false;
    document.getElementById('floatAnimation').checked = false;
    document.getElementById('pulseAnimation').checked = false;

    // Light
    document.getElementById('lightColor').value = '#ffffff';
    light.color = new THREE.Color(0xffffff);
    lightHelper.material.color = new THREE.Color(0xffffff);
    light.intensity = 1;
    light.position.set(5, 5, 5);
    lightHelper.position.set(5, 5, 5);
    document.getElementById('lightIntensity').value = 1;
    document.getElementById('lightIntensity-value').textContent = '1.0';
    lightOrbitEnabled = false;
    document.getElementById('lightOrbit').checked = false;
    ambientLight.visible = true;
    document.getElementById('ambientLight').checked = true;

    // Material
    document.getElementById('metalness').value = 0;
    document.getElementById('roughness').value = 0.5;
    document.getElementById('opacity').value = 100;
    if (currentShape) {
        currentShape.material.metalness = 0;
        currentShape.material.roughness = 0.5;
        currentShape.material.opacity = 1;
        currentShape.material.transparent = false;
        currentShape.material.envMap = null;
    }
    document.getElementById('metalness-value').textContent = '0.0';
    document.getElementById('roughness-value').textContent = '0.5';
    document.getElementById('opacity-value').textContent = '100%';
    rainbowModeEnabled = false;
    document.getElementById('rainbowMode').checked = false;
    document.getElementById('envMap').checked = false;

    // Effects
    if (particleSystem) {
        scene.remove(particleSystem);
        particleSystem = null;
    }
    document.getElementById('particles').checked = false;

    // Camera
    camera.position.set(0, 0, 5);
    document.getElementById('zoomLevel').value = 5;
    document.getElementById('zoomLevel-value').textContent = '5';
    cameraOrbitEnabled = false;
    document.getElementById('cameraOrbit').checked = false;

    isPaused = false;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        time += 0.016 * rotationSpeed;

        // Auto-rotation
        if (autoRotateX) {
            rotationX = (rotationX + rotationSpeed) % 360;
            document.getElementById('rotationX').value = rotationX;
            document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
        }
        if (autoRotateY) {
            rotationY = (rotationY + rotationSpeed) % 360;
            document.getElementById('rotationY').value = rotationY;
            document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
        }
        if (autoRotateZ) {
            rotationZ = (rotationZ + rotationSpeed) % 360;
            document.getElementById('rotationZ').value = rotationZ;
            document.getElementById('rotationZ-value').textContent = `${Math.round(rotationZ)}°`;
        }

        updateShapeTransform();

        // Float animation
        if (floatAnimation && currentShape) {
            currentShape.position.y = Math.sin(time) * 0.5;
        } else if (currentShape) {
            currentShape.position.y = 0;
        }

        // Pulse animation
        if (pulseAnimation && currentShape) {
            const pulse = 1 + Math.sin(time * 2) * 0.1;
            currentShape.scale.set(scaleValue * pulse, scaleValue * pulse, scaleValue * pulse);
        }

        // Light orbit
        if (lightOrbitEnabled) {
            const radius = 7;
            light.position.x = Math.cos(time) * radius;
            light.position.z = Math.sin(time) * radius;
            lightHelper.position.copy(light.position);
        }

        // Camera orbit
        if (cameraOrbitEnabled) {
            const radius = camera.position.length();
            camera.position.x = Math.cos(time * 0.3) * radius;
            camera.position.z = Math.sin(time * 0.3) * radius;
            camera.lookAt(0, 0, 0);
        }

        // Rainbow mode
        if (rainbowModeEnabled && currentShape) {
            const hue = (time * 30) % 360;
            const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
            currentShape.material.color = color;
        }

        // Particle rotation
        if (particleSystem) {
            particleSystem.rotation.y += 0.0005 * rotationSpeed;
        }
    }

    renderer.render(scene, camera);

    // Update FPS
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        document.getElementById('fps-counter').textContent = fps;
        document.getElementById('object-count').textContent = scene.children.length;
        frames = 0;
        lastTime = currentTime;
    }
}

// Start when DOM loaded
window.addEventListener('DOMContentLoaded', init);
