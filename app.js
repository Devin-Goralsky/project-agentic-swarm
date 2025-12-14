// Scene, Camera, Renderer setup
let scene, camera, renderer, currentShape, light, lightHelper;
let rotationX = 0, rotationY = 0, rotationZ = 0;

// Animation state
let autoRotateX = false, autoRotateY = false, autoRotateZ = false;
let rotationSpeed = 1.0;
let lightOrbitEnabled = false;
let cameraOrbitEnabled = false;
let rainbowModeEnabled = false;
let isPaused = false;

// FPS tracking
let lastTime = performance.now();
let frames = 0;
let fps = 0;

// Mouse drag state
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Time tracking for animations
let time = 0;

// Shape colors
const shapeColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Create camera
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Create initial shape (cube)
    createShape('cube');

    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Create colored point light
    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);

    // Add visual indicator for light position
    const lightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    lightHelper = new THREE.Mesh(lightGeometry, lightMaterial);
    lightHelper.position.copy(light.position);
    scene.add(lightHelper);

    // Add a ground plane to show shadows
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Setup mouse controls
    setupMouseControls();

    // Setup keyboard controls
    setupKeyboardControls();

    // Setup UI controls
    setupControls();

    // Start animation loop
    animate();
}

// Create different shapes
function createShape(shapeType) {
    // Remove existing shape
    if (currentShape) {
        scene.remove(currentShape);
    }

    let geometry;
    let materials;

    switch (shapeType) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1.2, 0.5, 16, 100);
            break;
        case 'pyramid':
            geometry = new THREE.ConeGeometry(1.5, 2, 4);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
            break;
        case 'cube':
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
    }

    // Create materials
    if (shapeType === 'cube') {
        materials = shapeColors.map(color =>
            new THREE.MeshPhongMaterial({ color: color })
        );
    } else {
        materials = new THREE.MeshPhongMaterial({ color: shapeColors[0] });
    }

    currentShape = new THREE.Mesh(geometry, materials);
    currentShape.castShadow = true;
    currentShape.receiveShadow = true;
    scene.add(currentShape);

    updateShapeRotation();
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Setup mouse drag controls
function setupMouseControls() {
    const canvas = renderer.domElement;

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

            // Keep values in 0-360 range
            rotationY = rotationY % 360;
            rotationX = rotationX % 360;

            // Update sliders
            document.getElementById('rotationY').value = rotationY;
            document.getElementById('rotationX').value = rotationX;
            document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
            document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;

            updateShapeRotation();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

// Setup keyboard shortcuts
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const step = 5;

        switch (e.key) {
            case 'ArrowLeft':
                rotationY = (rotationY - step) % 360;
                document.getElementById('rotationY').value = rotationY;
                document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
                updateShapeRotation();
                break;
            case 'ArrowRight':
                rotationY = (rotationY + step) % 360;
                document.getElementById('rotationY').value = rotationY;
                document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
                updateShapeRotation();
                break;
            case 'ArrowUp':
                rotationX = (rotationX - step) % 360;
                document.getElementById('rotationX').value = rotationX;
                document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
                updateShapeRotation();
                break;
            case 'ArrowDown':
                rotationX = (rotationX + step) % 360;
                document.getElementById('rotationX').value = rotationX;
                document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
                updateShapeRotation();
                break;
            case '+':
            case '=':
                const currentZoom = parseFloat(document.getElementById('zoomLevel').value);
                const newZoom = Math.max(2, currentZoom - 0.5);
                document.getElementById('zoomLevel').value = newZoom;
                document.getElementById('zoomLevel-value').textContent = newZoom.toFixed(1);
                camera.position.z = newZoom;
                break;
            case '-':
            case '_':
                const currentZoomOut = parseFloat(document.getElementById('zoomLevel').value);
                const newZoomOut = Math.min(15, currentZoomOut + 0.5);
                document.getElementById('zoomLevel').value = newZoomOut;
                document.getElementById('zoomLevel-value').textContent = newZoomOut.toFixed(1);
                camera.position.z = newZoomOut;
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

// Setup slider controls
function setupControls() {
    // Shape select
    const shapeSelect = document.getElementById('shapeSelect');
    shapeSelect.addEventListener('change', (e) => {
        createShape(e.target.value);
    });

    // Wireframe toggle
    const wireframeToggle = document.getElementById('wireframeToggle');
    wireframeToggle.addEventListener('change', (e) => {
        if (Array.isArray(currentShape.material)) {
            currentShape.material.forEach(mat => mat.wireframe = e.target.checked);
        } else {
            currentShape.material.wireframe = e.target.checked;
        }
    });

    // Background color
    const bgColorPicker = document.getElementById('bgColor');
    bgColorPicker.addEventListener('input', (e) => {
        scene.background = new THREE.Color(e.target.value);
    });

    // Fog toggle
    const fogToggle = document.getElementById('fogToggle');
    fogToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            scene.fog = new THREE.Fog(scene.background.getHex(), 5, 15);
        } else {
            scene.fog = null;
        }
    });

    // Rotation controls
    const rotationXSlider = document.getElementById('rotationX');
    const rotationYSlider = document.getElementById('rotationY');
    const rotationZSlider = document.getElementById('rotationZ');

    const rotationXValue = document.getElementById('rotationX-value');
    const rotationYValue = document.getElementById('rotationY-value');
    const rotationZValue = document.getElementById('rotationZ-value');

    rotationXSlider.addEventListener('input', (e) => {
        rotationX = parseFloat(e.target.value);
        rotationXValue.textContent = `${rotationX}°`;
        updateShapeRotation();
    });

    rotationYSlider.addEventListener('input', (e) => {
        rotationY = parseFloat(e.target.value);
        rotationYValue.textContent = `${rotationY}°`;
        updateShapeRotation();
    });

    rotationZSlider.addEventListener('input', (e) => {
        rotationZ = parseFloat(e.target.value);
        rotationZValue.textContent = `${rotationZ}°`;
        updateShapeRotation();
    });

    // Auto-rotation controls
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
        document.getElementById('rotationSpeed-value').textContent = rotationSpeed.toFixed(1);
    });

    // Zoom control
    document.getElementById('zoomLevel').addEventListener('input', (e) => {
        const zoom = parseFloat(e.target.value);
        camera.position.z = zoom;
        document.getElementById('zoomLevel-value').textContent = zoom.toFixed(1);
    });

    // Camera orbit
    document.getElementById('cameraOrbit').addEventListener('change', (e) => {
        cameraOrbitEnabled = e.target.checked;
    });

    // Light controls
    const lightColorPicker = document.getElementById('lightColor');
    const lightIntensitySlider = document.getElementById('lightIntensity');
    const lightXSlider = document.getElementById('lightX');
    const lightYSlider = document.getElementById('lightY');
    const lightZSlider = document.getElementById('lightZ');

    const lightIntensityValue = document.getElementById('lightIntensity-value');
    const lightXValue = document.getElementById('lightX-value');
    const lightYValue = document.getElementById('lightY-value');
    const lightZValue = document.getElementById('lightZ-value');

    lightColorPicker.addEventListener('input', (e) => {
        const color = new THREE.Color(e.target.value);
        light.color = color;
        lightHelper.material.color = color;
    });

    lightIntensitySlider.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        light.intensity = intensity;
        lightIntensityValue.textContent = intensity.toFixed(1);
    });

    lightXSlider.addEventListener('input', (e) => {
        const x = parseFloat(e.target.value);
        light.position.x = x;
        lightHelper.position.x = x;
        lightXValue.textContent = x.toFixed(1);
    });

    lightYSlider.addEventListener('input', (e) => {
        const y = parseFloat(e.target.value);
        light.position.y = y;
        lightHelper.position.y = y;
        lightYValue.textContent = y.toFixed(1);
    });

    lightZSlider.addEventListener('input', (e) => {
        const z = parseFloat(e.target.value);
        light.position.z = z;
        lightHelper.position.z = z;
        lightZValue.textContent = z.toFixed(1);
    });

    // Light orbit
    document.getElementById('lightOrbit').addEventListener('change', (e) => {
        lightOrbitEnabled = e.target.checked;
    });

    // Material properties
    document.getElementById('shininess').addEventListener('input', (e) => {
        const shininess = parseFloat(e.target.value);
        document.getElementById('shininess-value').textContent = shininess;
        updateMaterialProperty('shininess', shininess);
    });

    document.getElementById('opacity').addEventListener('input', (e) => {
        const opacity = parseFloat(e.target.value) / 100;
        document.getElementById('opacity-value').textContent = `${Math.round(opacity * 100)}%`;
        updateMaterialProperty('opacity', opacity);
        updateMaterialProperty('transparent', opacity < 1);
    });

    document.getElementById('metallicToggle').addEventListener('change', (e) => {
        toggleMetallic(e.target.checked);
    });

    // Rainbow mode
    document.getElementById('rainbowMode').addEventListener('change', (e) => {
        rainbowModeEnabled = e.target.checked;
    });

    // Random button
    document.getElementById('random-btn').addEventListener('click', randomizeSettings);

    // Screenshot button
    document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });

    // Reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', resetAll);
}

// Update shape rotation based on slider values
function updateShapeRotation() {
    if (currentShape) {
        currentShape.rotation.x = (rotationX * Math.PI) / 180;
        currentShape.rotation.y = (rotationY * Math.PI) / 180;
        currentShape.rotation.z = (rotationZ * Math.PI) / 180;
    }
}

// Update material properties
function updateMaterialProperty(property, value) {
    if (!currentShape) return;

    if (Array.isArray(currentShape.material)) {
        currentShape.material.forEach(mat => {
            mat[property] = value;
            mat.needsUpdate = true;
        });
    } else {
        currentShape.material[property] = value;
        currentShape.material.needsUpdate = true;
    }
}

// Toggle metallic material
function toggleMetallic(isMetallic) {
    if (!currentShape) return;

    const shapeType = document.getElementById('shapeSelect').value;
    const geometry = currentShape.geometry;

    scene.remove(currentShape);

    if (isMetallic) {
        if (shapeType === 'cube') {
            const materials = shapeColors.map(color =>
                new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.8,
                    roughness: 0.2
                })
            );
            currentShape = new THREE.Mesh(geometry, materials);
        } else {
            const material = new THREE.MeshStandardMaterial({
                color: shapeColors[0],
                metalness: 0.8,
                roughness: 0.2
            });
            currentShape = new THREE.Mesh(geometry, material);
        }
    } else {
        if (shapeType === 'cube') {
            const materials = shapeColors.map(color =>
                new THREE.MeshPhongMaterial({ color: color })
            );
            currentShape = new THREE.Mesh(geometry, materials);
        } else {
            const material = new THREE.MeshPhongMaterial({ color: shapeColors[0] });
            currentShape = new THREE.Mesh(geometry, material);
        }
    }

    currentShape.castShadow = true;
    currentShape.receiveShadow = true;
    scene.add(currentShape);
    updateShapeRotation();

    // Reapply current material settings
    const opacity = parseFloat(document.getElementById('opacity').value) / 100;
    const shininess = parseFloat(document.getElementById('shininess').value);
    const wireframe = document.getElementById('wireframeToggle').checked;

    updateMaterialProperty('opacity', opacity);
    updateMaterialProperty('transparent', opacity < 1);
    updateMaterialProperty('shininess', shininess);
    updateMaterialProperty('wireframe', wireframe);
}

// Randomize all settings
function randomizeSettings() {
    // Random shape
    const shapes = ['cube', 'sphere', 'torus', 'pyramid', 'cylinder'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    document.getElementById('shapeSelect').value = randomShape;
    createShape(randomShape);

    // Random rotation
    rotationX = Math.random() * 360;
    rotationY = Math.random() * 360;
    rotationZ = Math.random() * 360;
    document.getElementById('rotationX').value = rotationX;
    document.getElementById('rotationY').value = rotationY;
    document.getElementById('rotationZ').value = rotationZ;
    document.getElementById('rotationX-value').textContent = `${Math.round(rotationX)}°`;
    document.getElementById('rotationY-value').textContent = `${Math.round(rotationY)}°`;
    document.getElementById('rotationZ-value').textContent = `${Math.round(rotationZ)}°`;
    updateShapeRotation();

    // Random light color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    document.getElementById('lightColor').value = randomColor;
    light.color = new THREE.Color(randomColor);
    lightHelper.material.color = new THREE.Color(randomColor);

    // Random auto-rotation
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
    link.download = `cube-viz-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
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
            document.getElementById('rotationSpeed-value').textContent = '0.5';
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
            document.getElementById('rotationSpeed-value').textContent = '2.0';
            lightOrbitEnabled = true;
            document.getElementById('lightOrbit').checked = true;
            break;
        case 'ice':
            document.getElementById('bgColor').value = '#e3f2fd';
            scene.background = new THREE.Color('#e3f2fd');
            document.getElementById('lightColor').value = '#00bcd4';
            light.color = new THREE.Color('#00bcd4');
            lightHelper.material.color = new THREE.Color('#00bcd4');
            document.getElementById('fogToggle').checked = true;
            scene.fog = new THREE.Fog(0xe3f2fd, 5, 15);
            document.getElementById('metallicToggle').checked = true;
            toggleMetallic(true);
            break;
    }
}

// Reset all controls to default
function resetAll() {
    // Reset shape
    document.getElementById('shapeSelect').value = 'cube';
    createShape('cube');

    // Reset wireframe and fog
    document.getElementById('wireframeToggle').checked = false;
    document.getElementById('fogToggle').checked = false;
    scene.fog = null;

    // Reset background
    document.getElementById('bgColor').value = '#f5f5f5';
    scene.background = new THREE.Color(0xf5f5f5);

    // Reset rotation sliders
    document.getElementById('rotationX').value = 0;
    document.getElementById('rotationY').value = 0;
    document.getElementById('rotationZ').value = 0;
    document.getElementById('rotationX-value').textContent = '0°';
    document.getElementById('rotationY-value').textContent = '0°';
    document.getElementById('rotationZ-value').textContent = '0°';

    rotationX = 0;
    rotationY = 0;
    rotationZ = 0;
    updateShapeRotation();

    // Reset auto-rotation
    autoRotateX = false;
    autoRotateY = false;
    autoRotateZ = false;
    document.getElementById('autoRotateX').checked = false;
    document.getElementById('autoRotateY').checked = false;
    document.getElementById('autoRotateZ').checked = false;
    rotationSpeed = 1;
    document.getElementById('rotationSpeed').value = 1;
    document.getElementById('rotationSpeed-value').textContent = '1.0';

    // Reset zoom
    document.getElementById('zoomLevel').value = 5;
    document.getElementById('zoomLevel-value').textContent = '5';
    camera.position.z = 5;

    // Reset camera orbit
    cameraOrbitEnabled = false;
    document.getElementById('cameraOrbit').checked = false;

    // Reset light controls
    document.getElementById('lightColor').value = '#ffffff';
    document.getElementById('lightIntensity').value = 1;
    document.getElementById('lightX').value = 5;
    document.getElementById('lightY').value = 5;
    document.getElementById('lightZ').value = 5;

    document.getElementById('lightIntensity-value').textContent = '1.0';
    document.getElementById('lightX-value').textContent = '5';
    document.getElementById('lightY-value').textContent = '5';
    document.getElementById('lightZ-value').textContent = '5';

    light.color = new THREE.Color(0xffffff);
    light.intensity = 1;
    light.position.set(5, 5, 5);

    lightHelper.material.color = new THREE.Color(0xffffff);
    lightHelper.position.set(5, 5, 5);

    lightOrbitEnabled = false;
    document.getElementById('lightOrbit').checked = false;

    // Reset material properties
    document.getElementById('shininess').value = 30;
    document.getElementById('shininess-value').textContent = '30';
    document.getElementById('opacity').value = 100;
    document.getElementById('opacity-value').textContent = '100%';
    document.getElementById('metallicToggle').checked = false;
    toggleMetallic(false);

    // Reset rainbow mode
    rainbowModeEnabled = false;
    document.getElementById('rainbowMode').checked = false;

    // Reset pause
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

        updateShapeRotation();

        // Light orbit
        if (lightOrbitEnabled) {
            const radius = 7;
            light.position.x = Math.cos(time) * radius;
            light.position.z = Math.sin(time) * radius;
            lightHelper.position.copy(light.position);

            document.getElementById('lightX').value = light.position.x.toFixed(1);
            document.getElementById('lightZ').value = light.position.z.toFixed(1);
            document.getElementById('lightX-value').textContent = light.position.x.toFixed(1);
            document.getElementById('lightZ-value').textContent = light.position.z.toFixed(1);
        }

        // Camera orbit
        if (cameraOrbitEnabled) {
            const radius = camera.position.z;
            camera.position.x = Math.cos(time * 0.5) * radius * 0.3;
            camera.position.y = Math.sin(time * 0.3) * radius * 0.2;
            camera.lookAt(0, 0, 0);
        }

        // Rainbow mode
        if (rainbowModeEnabled && currentShape) {
            const hue = (time * 50) % 360;
            const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);

            if (Array.isArray(currentShape.material)) {
                currentShape.material.forEach(mat => mat.color = color);
            } else {
                currentShape.material.color = color;
            }
        }
    }

    renderer.render(scene, camera);

    // Update FPS counter
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
        frames = 0;
        lastTime = currentTime;
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);
