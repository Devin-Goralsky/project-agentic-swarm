// Scene, Camera, Renderer setup
let scene, camera, renderer, cube, light, lightHelper;
let rotationX = 0, rotationY = 0, rotationZ = 0;

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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Create cube with materials that respond to light
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0xff6b6b }), // Right face - red
        new THREE.MeshPhongMaterial({ color: 0x4ecdc4 }), // Left face - cyan
        new THREE.MeshPhongMaterial({ color: 0xffe66d }), // Top face - yellow
        new THREE.MeshPhongMaterial({ color: 0x95e1d3 }), // Bottom face - mint
        new THREE.MeshPhongMaterial({ color: 0xf38181 }), // Front face - pink
        new THREE.MeshPhongMaterial({ color: 0xaa96da })  // Back face - purple
    ];

    cube = new THREE.Mesh(geometry, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

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

    // Setup controls
    setupControls();

    // Start animation loop
    animate();
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

// Setup slider controls
function setupControls() {
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
        updateCubeRotation();
    });

    rotationYSlider.addEventListener('input', (e) => {
        rotationY = parseFloat(e.target.value);
        rotationYValue.textContent = `${rotationY}°`;
        updateCubeRotation();
    });

    rotationZSlider.addEventListener('input', (e) => {
        rotationZ = parseFloat(e.target.value);
        rotationZValue.textContent = `${rotationZ}°`;
        updateCubeRotation();
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

    // Reset button
    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', resetAll);
}

// Update cube rotation based on slider values
function updateCubeRotation() {
    cube.rotation.x = (rotationX * Math.PI) / 180;
    cube.rotation.y = (rotationY * Math.PI) / 180;
    cube.rotation.z = (rotationZ * Math.PI) / 180;
}

// Reset all controls to default
function resetAll() {
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
    updateCubeRotation();

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
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);
