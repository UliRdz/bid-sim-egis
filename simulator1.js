// ============================================
// EGIS BID RESPONSE TEAM SIMULATOR
// ============================================

let GROQ_API_KEY = '';
let scene, camera, renderer;
let characters = [];
let roomba;
let player = {
    position: new THREE.Vector3(0, 1.6, 18),
    rotation: 0,
    velocity: new THREE.Vector3(),
    speed: 0.12,
    rotationSpeed: 0.04,
    isDancing: false,
    danceTime: 0
};

const keys = {};
let activeCharacter = null;
let nearbyCharacter = null;
let mouseX = 0;
let mouseY = 0;
let isPointerLocked = false;
let modalOpen = false; // Track if dialog is open

// Roomba state
let roombaFollowing = false;
let roombaTarget = null;

// Random events
const RANDOM_EVENTS = [
    {
        title: "Coffee Break! ☕",
        message: "The team is taking a quick coffee break. Productivity +10%!",
        probability: 0.15
    },
    {
        title: "Client Call 📞",
        message: "Important client call in progress. Everyone looks busy!",
        probability: 0.12
    },
    {
        title: "Deadline Alert ⏰",
        message: "Bid deadline is approaching! Stress levels rising!",
        probability: 0.10
    },
    {
        title: "Pizza Delivery 🍕",
        message: "Pizza has arrived! Morale boost for the entire team!",
        probability: 0.08
    },
    {
        title: "Fire Drill 🚨",
        message: "Just kidding! But everyone's heart skipped a beat.",
        probability: 0.05
    },
    {
        title: "Roomba Activated 🤖",
        message: "The Roomba has noticed you and is now following...",
        probability: 0.20,
        action: () => {
            roombaFollowing = true;
            roombaTarget = player.position.clone();
        }
    }
];

let lastEventTime = 0;
const EVENT_INTERVAL = 30000; // 30 seconds minimum between events

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8F9FA);
    scene.fog = new THREE.Fog(0xE8F4F8, 15, 40);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(player.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    setupLighting();

    // Environment
    createFloor();
    createWalls();
    createFurniture();
    createCharacters();
    createRoomba();
    createPlants();
    createCoffeeStation();

    // Event listeners
    setupEventListeners();

    // Show click to start
    document.getElementById('click-to-start').classList.add('show');

    // Start animation
    animate();

    // Random events
    setInterval(triggerRandomEvent, 5000); // Check every 5 seconds
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xF4A300, 0.5);
    mainLight.position.set(8, 15, 8);
    mainLight.castShadow = true;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x007C91, 0.3);
    fillLight.position.set(-8, 10, -8);
    scene.add(fillLight);

    // Ceiling lights
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            const light = new THREE.PointLight(0xC6D300, 0.4, 12);
            light.position.set(i * 10, 5.5, j * 8);
            scene.add(light);

            const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xC6D300,
                emissive: 0xC6D300,
                emissiveIntensity: 1
            });
            const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
            lightMesh.position.copy(light.position);
            scene.add(lightMesh);
        }
    }
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid pattern
    const gridHelper = new THREE.GridHelper(100, 50, 0x007C91, 0xE8F4F8);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

function createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xE8F4F8,
        roughness: 0.9
    });

    const accentStripMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF4A300,
        emissive: 0xF4A300,
        emissiveIntensity: 0.3
    });

    // Larger office dimensions
    const wallHeight = 6;
    const officeWidth = 70;
    const officeDepth = 60;

    // BACK WALL (North)
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(officeWidth, wallHeight, 0.5),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -officeDepth / 2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    scene.add(backWall);

    // LEFT WALL (West)
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, wallHeight, officeDepth),
        wallMaterial
    );
    leftWall.position.set(-officeWidth / 2, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    scene.add(leftWall);

    // RIGHT WALL (East)
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, wallHeight, officeDepth),
        wallMaterial
    );
    rightWall.position.set(officeWidth / 2, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // FRONT WALL (South)
    const frontWall = new THREE.Mesh(
        new THREE.BoxGeometry(officeWidth, wallHeight, 0.5),
        wallMaterial
    );
    frontWall.position.set(0, wallHeight / 2, officeDepth / 2);
    frontWall.receiveShadow = true;
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Accent stripes on each wall
    const stripeHeight = 0.15;
    const stripeDepth = 0.1;
    
    // Back wall stripes
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(officeWidth - 2, stripeHeight, stripeDepth),
            accentStripMaterial
        );
        stripe.position.set(0, 1.5 + i * 1.5, -officeDepth / 2 + 0.3);
        scene.add(stripe);
    }

    // Left wall stripes
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(stripeDepth, stripeHeight, officeDepth - 2),
            accentStripMaterial
        );
        stripe.position.set(-officeWidth / 2 + 0.3, 1.5 + i * 1.5, 0);
        scene.add(stripe);
    }

    // Right wall stripes
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(stripeDepth, stripeHeight, officeDepth - 2),
            accentStripMaterial
        );
        stripe.position.set(officeWidth / 2 - 0.3, 1.5 + i * 1.5, 0);
        scene.add(stripe);
    }

    // Front wall stripes
    for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(officeWidth - 2, stripeHeight, stripeDepth),
            accentStripMaterial
        );
        stripe.position.set(0, 1.5 + i * 1.5, officeDepth / 2 - 0.3);
        scene.add(stripe);
    }

    // Create logo frames on each wall (2 per wall = 8 total)
    createLogoFrames(officeWidth, officeDepth, wallHeight);
}

function createLogoFrames(officeWidth, officeDepth, wallHeight) {
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0F2A3D,
        roughness: 0.3,
        metalness: 0.5
    });

    const frameSize = 3;
    const frameThickness = 0.15;
    const frameDepth = 0.1;

    // Logo file paths
    const logoFiles = [
        './assets/logo-1.png',
        './assets/logo-2.png',
        './assets/logo-3.png',
        './assets/logo-4.png',
        './assets/logo-5.png',
        './assets/logo-6.png',
        './assets/logo-7.jpg',
        './assets/logo-8.jpg'
    ];

    let logoIndex = 0;

    // Helper function to create a framed logo
    function createFrame(position, rotation, logoPath) {
        const frameGroup = new THREE.Group();

        // Frame border
        const frameBorder = new THREE.Mesh(
            new THREE.BoxGeometry(frameSize + 0.2, frameSize + 0.2, frameThickness),
            frameMaterial
        );
        frameBorder.castShadow = true;
        frameGroup.add(frameBorder);

        // White background
        const background = new THREE.Mesh(
            new THREE.BoxGeometry(frameSize, frameSize, frameThickness / 2),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        background.position.z = frameThickness / 4;
        frameGroup.add(background);

        // Load logo image
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            logoPath,
            (texture) => {
                const logoMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    transparent: true
                });
                const logoPlane = new THREE.Mesh(
                    new THREE.PlaneGeometry(frameSize - 0.4, frameSize - 0.4),
                    logoMaterial
                );
                logoPlane.position.z = frameThickness / 2 + 0.05;
                frameGroup.add(logoPlane);
            },
            undefined,
            (error) => {
                // If logo fails to load, show placeholder text
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 512;
                canvas.height = 512;
                context.fillStyle = '#F8F9FA';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#0F2A3D';
                context.font = 'bold 48px Poppins';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('LOGO', 256, 220);
                context.font = '32px Inter';
                context.fillText(logoPath.split('/').pop(), 256, 280);
                
                const texture = new THREE.CanvasTexture(canvas);
                const logoMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    transparent: true
                });
                const logoPlane = new THREE.Mesh(
                    new THREE.PlaneGeometry(frameSize - 0.4, frameSize - 0.4),
                    logoMaterial
                );
                logoPlane.position.z = frameThickness / 2 + 0.05;
                frameGroup.add(logoPlane);
            }
        );

        frameGroup.position.copy(position);
        frameGroup.rotation.y = rotation;
        scene.add(frameGroup);
    }

    // BACK WALL - 2 frames
    createFrame(
        new THREE.Vector3(-15, 3.5, -officeDepth / 2 + frameDepth),
        0,
        logoFiles[logoIndex++]
    );
    createFrame(
        new THREE.Vector3(15, 3.5, -officeDepth / 2 + frameDepth),
        0,
        logoFiles[logoIndex++]
    );

    // LEFT WALL - 2 frames
    createFrame(
        new THREE.Vector3(-officeWidth / 2 + frameDepth, 3.5, -12),
        Math.PI / 2,
        logoFiles[logoIndex++]
    );
    createFrame(
        new THREE.Vector3(-officeWidth / 2 + frameDepth, 3.5, 12),
        Math.PI / 2,
        logoFiles[logoIndex++]
    );

    // RIGHT WALL - 2 frames
    createFrame(
        new THREE.Vector3(officeWidth / 2 - frameDepth, 3.5, -12),
        -Math.PI / 2,
        logoFiles[logoIndex++]
    );
    createFrame(
        new THREE.Vector3(officeWidth / 2 - frameDepth, 3.5, 12),
        -Math.PI / 2,
        logoFiles[logoIndex++]
    );

    // FRONT WALL - 2 frames
    createFrame(
        new THREE.Vector3(-15, 3.5, officeDepth / 2 - frameDepth),
        Math.PI,
        logoFiles[logoIndex++]
    );
    createFrame(
        new THREE.Vector3(15, 3.5, officeDepth / 2 - frameDepth),
        Math.PI,
        logoFiles[logoIndex++]
    );
}

function createFurniture() {
    // Materials
    const deskMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x007C91,
        roughness: 0.7,
        metalness: 0.2
    });

    const monitorMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.3,
        metalness: 0.5
    });

    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A90E2,
        emissive: 0x4A90E2,
        emissiveIntensity: 0.3
    });

    const keyboardMaterial = new THREE.MeshStandardMaterial({
        color: 0x2C3E50,
        roughness: 0.6
    });

    const chairMaterial = new THREE.MeshStandardMaterial({
        color: 0xF4A300,
        roughness: 0.5
    });

    // Create character desks with computers
    characters.forEach((char, index) => {
        const deskGroup = new THREE.Group();

        // Main desk surface
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 1.2),
            deskMaterial
        );
        desk.position.y = 0.75;
        desk.castShadow = true;
        desk.receiveShadow = true;
        deskGroup.add(desk);

        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08);
        const legPositions = [
            [-1.1, 0.375, -0.5],
            [1.1, 0.375, -0.5],
            [-1.1, 0.375, 0.5],
            [1.1, 0.375, 0.5]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, deskMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            deskGroup.add(leg);
        });

        // Computer monitor
        const monitorStand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8),
            monitorMaterial
        );
        monitorStand.position.set(0, 0.88, -0.2);
        deskGroup.add(monitorStand);

        const monitorBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.02, 0.2),
            monitorMaterial
        );
        monitorBase.position.set(0, 0.81, -0.2);
        deskGroup.add(monitorBase);

        const monitorFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.4, 0.05),
            monitorMaterial
        );
        monitorFrame.position.set(0, 1.15, -0.2);
        monitorFrame.castShadow = true;
        deskGroup.add(monitorFrame);

        // Monitor screen (glowing)
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.35, 0.02),
            screenMaterial
        );
        screen.position.set(0, 1.15, -0.17);
        deskGroup.add(screen);

        // Keyboard
        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.02, 0.15),
            keyboardMaterial
        );
        keyboard.position.set(0, 0.81, 0.1);
        keyboard.castShadow = true;
        deskGroup.add(keyboard);

        // Mouse
        const mouse = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.03, 0.09),
            new THREE.MeshStandardMaterial({ color: 0x2C3E50 })
        );
        mouse.position.set(0.35, 0.82, 0.15);
        mouse.castShadow = true;
        deskGroup.add(mouse);

        // Office supplies (coffee mug)
        const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
            new THREE.MeshStandardMaterial({ color: 0xF4A300 })
        );
        mug.position.set(-0.5, 0.86, -0.3);
        deskGroup.add(mug);

        // Papers/documents
        const papers = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.01, 0.28),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        papers.position.set(0.6, 0.81, -0.1);
        papers.rotation.y = 0.3;
        deskGroup.add(papers);

        // Pen holder
        const penHolder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6),
            new THREE.MeshStandardMaterial({ color: 0x007C91 })
        );
        penHolder.position.set(-0.7, 0.84, 0.2);
        deskGroup.add(penHolder);

        // Position desk
        deskGroup.position.set(
            char.position.x,
            0,
            char.position.z + 1.5
        );
        scene.add(deskGroup);

        // Office chair
        const chairGroup = new THREE.Group();
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.3, 0.08, 16),
            chairMaterial
        );
        seat.position.y = 0.5;
        seat.castShadow = true;
        chairGroup.add(seat);

        // Seat cushion detail
        const seatTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.33, 0.33, 0.02, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0xE67E22,
                roughness: 0.7
            })
        );
        seatTop.position.y = 0.55;
        chairGroup.add(seatTop);

        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.6, 0.08),
            chairMaterial
        );
        backrest.position.set(0, 0.8, -0.2);
        backrest.castShadow = true;
        chairGroup.add(backrest);

        // Backrest cushion
        const backrestCushion = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.55, 0.05),
            new THREE.MeshStandardMaterial({ 
                color: 0xE67E22,
                roughness: 0.7
            })
        );
        backrestCushion.position.set(0, 0.8, -0.18);
        chairGroup.add(backrestCushion);

        // Armrests
        const armrestGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.3);
        const armrestMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2C3E50,
            roughness: 0.4,
            metalness: 0.3
        });

        const leftArmrest = new THREE.Mesh(armrestGeometry, armrestMaterial);
        leftArmrest.position.set(-0.3, 0.6, -0.05);
        leftArmrest.castShadow = true;
        chairGroup.add(leftArmrest);

        const rightArmrest = new THREE.Mesh(armrestGeometry, armrestMaterial);
        rightArmrest.position.set(0.3, 0.6, -0.05);
        rightArmrest.castShadow = true;
        chairGroup.add(rightArmrest);

        // Central pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0x2C3E50,
                metalness: 0.6
            })
        );
        pole.position.y = 0.25;
        chairGroup.add(pole);

        // Base (star shape simplified as cylinder)
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0x2C3E50,
                metalness: 0.7
            })
        );
        base.position.y = 0.03;
        base.castShadow = true;
        chairGroup.add(base);

        // Wheels
        const wheelGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x34495E,
            metalness: 0.5
        });

        for (let i = 0; i < 5; i++) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            const angle = (i / 5) * Math.PI * 2;
            wheel.position.set(
                Math.cos(angle) * 0.22,
                0.04,
                Math.sin(angle) * 0.22
            );
            chairGroup.add(wheel);
        }

        // Position chair behind desk
        chairGroup.position.set(
            char.position.x,
            0,
            char.position.z + 2.2
        );
        chairGroup.castShadow = true;
        scene.add(chairGroup);
    });

    // Add 4 additional standalone office desks with computers
    const standaloneDesks = [
        { x: -15, z: 15 },
        { x: 15, z: 15 },
        { x: -15, z: -20 },
        { x: 15, z: -20 }
    ];

    standaloneDesks.forEach((pos, index) => {
        const officeGroup = new THREE.Group();

        // Desk
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 1.2),
            deskMaterial
        );
        desk.position.y = 0.75;
        desk.castShadow = true;
        desk.receiveShadow = true;
        officeGroup.add(desk);

        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08);
        const legPositions = [
            [-1.1, 0.375, -0.5],
            [1.1, 0.375, -0.5],
            [-1.1, 0.375, 0.5],
            [1.1, 0.375, 0.5]
        ];

        legPositions.forEach(legPos => {
            const leg = new THREE.Mesh(legGeometry, deskMaterial);
            leg.position.set(...legPos);
            leg.castShadow = true;
            officeGroup.add(leg);
        });

        // Computer setup
        const monitorStand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8),
            monitorMaterial
        );
        monitorStand.position.set(0, 0.88, -0.2);
        officeGroup.add(monitorStand);

        const monitorFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.4, 0.05),
            monitorMaterial
        );
        monitorFrame.position.set(0, 1.15, -0.2);
        monitorFrame.castShadow = true;
        officeGroup.add(monitorFrame);

        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.35, 0.02),
            screenMaterial
        );
        screen.position.set(0, 1.15, -0.17);
        officeGroup.add(screen);

        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.02, 0.15),
            keyboardMaterial
        );
        keyboard.position.set(0, 0.81, 0.1);
        keyboard.castShadow = true;
        officeGroup.add(keyboard);

        // Mouse
        const mouse = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.03, 0.09),
            new THREE.MeshStandardMaterial({ color: 0x2C3E50 })
        );
        mouse.position.set(0.35, 0.82, 0.15);
        officeGroup.add(mouse);

        // Desk lamp
        const lampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 0.02, 8),
            new THREE.MeshStandardMaterial({ color: 0x2C3E50, metalness: 0.6 })
        );
        lampBase.position.set(-0.8, 0.81, -0.4);
        officeGroup.add(lampBase);

        const lampArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x2C3E50, metalness: 0.6 })
        );
        lampArm.position.set(-0.8, 1.0, -0.4);
        lampArm.rotation.x = 0.5;
        officeGroup.add(lampArm);

        const lampHead = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.12, 8),
            new THREE.MeshStandardMaterial({ color: 0xC6D300 })
        );
        lampHead.position.set(-0.8, 1.15, -0.25);
        lampHead.rotation.x = Math.PI;
        officeGroup.add(lampHead);

        // Add a small light
        const deskLight = new THREE.PointLight(0xC6D300, 0.3, 3);
        deskLight.position.set(-0.8, 1.1, -0.25);
        officeGroup.add(deskLight);

        // Notebook
        const notebook = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.01, 0.24),
            new THREE.MeshStandardMaterial({ color: 0xF4A300 })
        );
        notebook.position.set(0.6, 0.81, 0.2);
        notebook.rotation.y = -0.4;
        officeGroup.add(notebook);

        // Position desk
        officeGroup.position.set(pos.x, 0, pos.z);
        scene.add(officeGroup);

        // Add chair for standalone desk
        const chair = createOfficeChair();
        chair.position.set(pos.x, 0, pos.z + 1);
        scene.add(chair);
    });
}

// Helper function to create office chair
function createOfficeChair() {
    const chairGroup = new THREE.Group();
    
    const chairMaterial = new THREE.MeshStandardMaterial({
        color: 0xF4A300,
        roughness: 0.5
    });

    // Seat
    const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.3, 0.08, 16),
        chairMaterial
    );
    seat.position.y = 0.5;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.6, 0.08),
        chairMaterial
    );
    backrest.position.set(0, 0.8, -0.2);
    backrest.castShadow = true;
    chairGroup.add(backrest);

    // Base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8),
        new THREE.MeshStandardMaterial({ 
            color: 0x2C3E50,
            metalness: 0.7
        })
    );
    base.position.y = 0.03;
    chairGroup.add(base);

    // Central pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
        new THREE.MeshStandardMaterial({ 
            color: 0x2C3E50,
            metalness: 0.6
        })
    );
    pole.position.y = 0.25;
    chairGroup.add(pole);

    return chairGroup;
}

function createCharacters() {
    Object.entries(CHARACTERS).forEach(([key, data]) => {
        const characterGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: data.color,
            roughness: 0.6,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        characterGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFDBB5,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.15;
        head.castShadow = true;
        characterGroup.add(head);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 2.25, 0.3);
        characterGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 2.25, 0.3);
        characterGroup.add(rightEye);

        // Name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#' + data.color.toString(16).padStart(6, '0');
        context.lineWidth = 8;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#0F2A3D';
        context.font = 'bold 36px Poppins';
        context.textAlign = 'center';
        context.fillText(data.name, 256, 50);
        context.fillStyle = '#000000';
        context.font = '20px Inter';
        context.fillText(data.role, 256, 85);

        const texture = new THREE.CanvasTexture(canvas);
        const tagMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        });
        const tagGeometry = new THREE.PlaneGeometry(2, 0.5);
        const tag = new THREE.Mesh(tagGeometry, tagMaterial);
        tag.position.y = 3;
        characterGroup.add(tag);

        // Arms (simple)
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
        const armMaterial = new THREE.MeshStandardMaterial({ color: data.color });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 1, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 1, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        characterGroup.add(rightArm);

        characterGroup.position.set(data.position.x, 0, data.position.z);
        characterGroup.userData = { key, data, leftArm, rightArm, body };
        scene.add(characterGroup);
        characters.push(characterGroup);
    });
}

function createRoomba() {
    const roombaGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        roughness: 0.4,
        metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    roombaGroup.add(body);

    // Button
    const buttonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC6D300,
        emissive: 0xC6D300,
        emissiveIntensity: 0.5
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.y = 0.12;
    roombaGroup.add(button);

    // Sensor
    const sensorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const sensorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.8
    });
    const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensor.position.set(0, 0.15, 0.5);
    roombaGroup.add(sensor);

    roombaGroup.position.set(8, 0.1, 8);
    roombaGroup.userData = { speed: 0.03, angle: 0 };
    scene.add(roombaGroup);
    roomba = roombaGroup;
}

function createPlants() {
    const positions = [
        { x: -20, z: -10 },
        { x: 20, z: -10 },
        { x: -20, z: 10 },
        { x: 20, z: 10 }
    ];

    positions.forEach(pos => {
        const plantGroup = new THREE.Group();

        // Pot
        const potGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.6, 8);
        const potMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x007C91,
            roughness: 0.8
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.3;
        pot.castShadow = true;
        plantGroup.add(pot);

        // Plant leaves
        for (let i = 0; i < 5; i++) {
            const leafGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const leafMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2ECC71,
                roughness: 0.7
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                Math.cos(i * 1.2) * 0.3,
                0.6 + Math.random() * 0.4,
                Math.sin(i * 1.2) * 0.3
            );
            leaf.scale.set(1, 1.5, 0.5);
            plantGroup.add(leaf);
        }

        plantGroup.position.set(pos.x, 0, pos.z);
        scene.add(plantGroup);
    });
}

function createCoffeeStation() {
    const coffeeGroup = new THREE.Group();

    // Counter
    const counterGeometry = new THREE.BoxGeometry(3, 1, 1.5);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF4A300,
        roughness: 0.6
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.y = 0.5;
    counter.castShadow = true;
    coffeeGroup.add(counter);

    // Coffee machine
    const machineGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.5);
    const machineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        roughness: 0.3,
        metalness: 0.7
    });
    const machine = new THREE.Mesh(machineGeometry, machineMaterial);
    machine.position.set(0, 1.4, 0);
    machine.castShadow = true;
    coffeeGroup.add(machine);

    // Cups
    for (let i = 0; i < 3; i++) {
        const cupGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8);
        const cupMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.set(-0.8 + i * 0.3, 1.08, 0.3);
        cup.castShadow = true;
        coffeeGroup.add(cup);
    }

    coffeeGroup.position.set(-18, 0, 12);
    scene.add(coffeeGroup);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    
    document.addEventListener('keydown', (e) => {
        // Only prevent movement if modal is open
        if (modalOpen && (e.key === 'z' || e.key === 'q' || e.key === 's' || e.key === 'd')) {
            return; // Don't register movement keys when modal is open
        }
        keys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    document.addEventListener('mousemove', onMouseMove);

    // Pointer lock
    const canvas = renderer.domElement;
    canvas.addEventListener('click', () => {
        if (!modalOpen) { // Only allow pointer lock when modal is closed
            canvas.requestPointerLock();
            document.getElementById('click-to-start').classList.remove('show');
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === canvas;
        if (!isPointerLocked && !modalOpen) {
            document.getElementById('click-to-start').classList.add('show');
        }
    });

    document.getElementById('close-dialog').addEventListener('click', closeDialog);
}

function onMouseMove(event) {
    if (isPointerLocked) {
        mouseX += event.movementX * 0.002;
        mouseY -= event.movementY * 0.002;
        mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// GAME LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    updatePlayer();
    updateCharacters();
    updateRoomba();
    checkNearbyCharacters();

    renderer.render(scene, camera);
}

function updatePlayer() {
    // Only allow movement if modal is NOT open
    if (!modalOpen) {
        const moveVector = new THREE.Vector3();

        // ZQSD controls (French keyboard)
        if (keys['z']) moveVector.z -= 1;  // Forward
        if (keys['s']) moveVector.z += 1;  // Backward
        if (keys['q']) moveVector.x -= 1;  // Left
        if (keys['d']) moveVector.x += 1;  // Right

        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation);
            moveVector.multiplyScalar(player.speed);
            player.position.add(moveVector);
        }

        // Arrow key rotation (when pointer not locked)
        if (!isPointerLocked) {
            if (keys['arrowleft']) player.rotation += player.rotationSpeed;
            if (keys['arrowright']) player.rotation -= player.rotationSpeed;
        }

        // Mouse rotation (when pointer locked)
        if (isPointerLocked) {
            player.rotation = mouseX;
        }

        // Dancing
        if (keys[' '] && !player.isDancing) {
            player.isDancing = true;
            player.danceTime = 0;
            document.getElementById('dance-indicator').classList.add('show');
        }

        if (player.isDancing) {
            player.danceTime += 0.1;
            camera.position.y = player.position.y + Math.sin(player.danceTime) * 0.2;
            
            if (player.danceTime > 10) {
                player.isDancing = false;
                document.getElementById('dance-indicator').classList.remove('show');
            }
        } else {
            camera.position.y = player.position.y;
        }

        // Interaction
        if (keys['e'] && nearbyCharacter && !activeCharacter) {
            openDialog(nearbyCharacter);
            keys['e'] = false;
        }
    }

    // ESC always works to close dialog
    if (keys['escape']) {
        if (modalOpen) {
            closeDialog();
        }
        if (isPointerLocked) {
            document.exitPointerLock();
        }
        keys['escape'] = false;
    }

    // Update camera
    camera.position.x = player.position.x;
    camera.position.z = player.position.z;
    camera.rotation.y = player.rotation;
    camera.rotation.x = isPointerLocked ? mouseY : 0;

    // Bounds (wider office)
    player.position.x = Math.max(-33, Math.min(33, player.position.x));
    player.position.z = Math.max(-28, Math.min(28, player.position.z));
}

function updateCharacters() {
    const time = Date.now() * 0.001;
    
    characters.forEach((char) => {
        // Make name tags face camera
        const tag = char.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry');
        if (tag) {
            tag.lookAt(camera.position);
        }

        const userData = char.userData;
        
        // Animate arms
        if (userData.leftArm && userData.rightArm) {
            const walkSpeed = userData.isWalking ? 4 : 2;
            userData.leftArm.rotation.x = Math.sin(time * walkSpeed) * 0.3;
            userData.rightArm.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.3;
        }

        // Check distance to player
        const distanceToPlayer = player.position.distanceTo(char.position);
        
        // Initialize movement data if not exists
        if (!userData.targetPosition) {
            userData.targetPosition = char.position.clone();
            userData.moveTimer = Math.random() * 5;
            userData.idleTimer = Math.random() * 3;
            userData.isWalking = false;
        }

        // Stop if player is nearby (within interaction range)
        if (distanceToPlayer < 4) {
            userData.isWalking = false;
            userData.moveTimer = 2; // Wait a bit before moving again
            
            // Face the player
            const direction = new THREE.Vector3().subVectors(player.position, char.position);
            direction.y = 0;
            if (direction.length() > 0.1) {
                const targetRotation = Math.atan2(direction.x, direction.z);
                char.rotation.y = targetRotation;
            }
        } else {
            // Normal movement behavior when player is far
            userData.moveTimer -= 0.016; // Roughly 60fps

            if (userData.moveTimer <= 0) {
                // Time to pick a new destination
                const angle = Math.random() * Math.PI * 2;
                const distance = 3 + Math.random() * 8;
                
                userData.targetPosition = new THREE.Vector3(
                    char.position.x + Math.cos(angle) * distance,
                    0,
                    char.position.z + Math.sin(angle) * distance
                );
                
                // Keep within bounds
                userData.targetPosition.x = Math.max(-30, Math.min(30, userData.targetPosition.x));
                userData.targetPosition.z = Math.max(-25, Math.min(25, userData.targetPosition.z));
                
                userData.moveTimer = 3 + Math.random() * 4; // Move for 3-7 seconds
                userData.isWalking = true;
            }

            // Move towards target
            if (userData.isWalking) {
                const direction = new THREE.Vector3().subVectors(userData.targetPosition, char.position);
                direction.y = 0;
                
                if (direction.length() > 0.5) {
                    // Still moving towards target
                    direction.normalize();
                    const moveSpeed = 0.03;
                    char.position.add(direction.multiplyScalar(moveSpeed));
                    
                    // Rotate to face movement direction
                    const targetRotation = Math.atan2(direction.x, direction.z);
                    char.rotation.y += (targetRotation - char.rotation.y) * 0.1; // Smooth rotation
                    
                    // Bob up and down while walking
                    char.position.y = Math.sin(time * 8) * 0.05;
                } else {
                    // Reached target
                    userData.isWalking = false;
                    char.position.y = 0;
                    userData.idleTimer = 2 + Math.random() * 3; // Idle for 2-5 seconds
                    userData.moveTimer = userData.idleTimer;
                }
            }
        }

        // Occasional random gestures when idle
        if (!userData.isWalking && Math.random() < 0.002) {
            const body = userData.body;
            if (body) {
                body.rotation.y = Math.sin(time * 4) * 0.15;
            }
        }
    });
}

function updateRoomba() {
    if (!roomba) return;

    const time = Date.now() * 0.001;

    if (roombaFollowing) {
        // Follow player
        const direction = new THREE.Vector3().subVectors(player.position, roomba.position);
        direction.y = 0;
        
        if (direction.length() > 2) {
            direction.normalize().multiplyScalar(roomba.userData.speed);
            roomba.position.add(direction);
            
            // Rotate to face player
            roomba.rotation.y = Math.atan2(direction.x, direction.z);
        }
    } else {
        // Random movement
        roomba.userData.angle += (Math.random() - 0.5) * 0.1;
        roomba.position.x += Math.cos(roomba.userData.angle) * roomba.userData.speed;
        roomba.position.z += Math.sin(roomba.userData.angle) * roomba.userData.speed;
        roomba.rotation.y = roomba.userData.angle;

        // Bounds
        if (Math.abs(roomba.position.x) > 20) roomba.userData.angle += Math.PI;
        if (Math.abs(roomba.position.z) > 20) roomba.userData.angle += Math.PI;
    }

    // Wobble
    roomba.rotation.z = Math.sin(time * 5) * 0.05;
}

function checkNearbyCharacters() {
    let closest = null;
    let minDist = 3.5;

    characters.forEach(char => {
        const dist = player.position.distanceTo(char.position);
        if (dist < minDist) {
            minDist = dist;
            closest = char;
        }
    });

    nearbyCharacter = closest;

    const hudCharacter = document.getElementById('nearby-character');
    const crosshair = document.getElementById('crosshair');

    if (nearbyCharacter && !modalOpen) {
        hudCharacter.innerHTML = `<strong>Nearby:</strong> ${nearbyCharacter.userData.data.name} - Press E`;
        crosshair.classList.add('interact');
    } else {
        hudCharacter.innerHTML = '';
        crosshair.classList.remove('interact');
    }
}

// ============================================
// DIALOG SYSTEM
// ============================================

function openDialog(character) {
    activeCharacter = character;
    const data = character.userData.data;

    // Set modal open flag
    modalOpen = true;

    // Exit pointer lock when dialog opens
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }

    document.getElementById('dialog-character-name').textContent = data.name;
    document.getElementById('dialog-character-role').textContent = data.role;

    let presetQuestionsHTML = '';
    if (data.presetQuestions && data.presetQuestions.length > 0) {
        presetQuestionsHTML = `
            <div class="preset-questions">
                <h5>Quick Questions:</h5>
                ${data.presetQuestions.map((q, i) => 
                    `<button class="question-btn" onclick="askPresetQuestion('${q.replace(/'/g, "\\'")}')">${q}</button>`
                ).join('')}
            </div>
        `;
    }

    const content = `
        <div class="dialog-section">
            <h4>🎯 Mission</h4>
            <p>${data.mission}</p>
        </div>
        <div class="dialog-section">
            <h4>📦 What I Provide</h4>
            <p>${data.deliverables}</p>
        </div>
        <div class="dialog-section">
            <h4>⚖️ Governance & Rules</h4>
            <p>${data.governance}</p>
        </div>
        <div class="dialog-section">
            <h4>🚩 Red Flags</h4>
            <p>${data.redFlags}</p>
        </div>
        ${presetQuestionsHTML}
        <div class="ai-input-group">
            <label>Ask me a custom question:</label>
            <input type="text" id="ai-question" placeholder="Type your question here...">
            <button onclick="askAI()">Ask AI</button>
            <div id="ai-response"></div>
        </div>
    `;

    document.getElementById('dialog-content').innerHTML = content;
    document.getElementById('dialog-box').classList.add('active');
}

function closeDialog() {
    document.getElementById('dialog-box').classList.remove('active');
    activeCharacter = null;
    modalOpen = false; // Clear modal open flag
    
    // Show click to start message again
    if (!isPointerLocked) {
        document.getElementById('click-to-start').classList.add('show');
    }
}

async function askPresetQuestion(question) {
    document.getElementById('ai-question').value = question;
    await askAI();
}

async function askAI() {
    const question = document.getElementById('ai-question').value.trim();
    if (!question) return;

    const data = activeCharacter.userData.data;
    await askAIWithRAG(question, data);
}

// ============================================
// RANDOM EVENTS
// ============================================

function triggerRandomEvent() {
    const now = Date.now();
    if (now - lastEventTime < EVENT_INTERVAL) return;

    for (const event of RANDOM_EVENTS) {
        if (Math.random() < event.probability) {
            showToast(event.title, event.message);
            if (event.action) event.action();
            lastEventTime = now;
            break;
        }
    }
}

function showToast(title, message) {
    const toast = document.getElementById('event-toast');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// WELCOME SCREEN
// ============================================

const apiKeyInput = document.getElementById('groq-api-key');
const startButton = document.getElementById('start-button');
const welcomeScreen = document.getElementById('welcome-screen');

apiKeyInput.addEventListener('input', () => {
    startButton.disabled = apiKeyInput.value.trim().length < 10;
});

startButton.addEventListener('click', () => {
    GROQ_API_KEY = apiKeyInput.value.trim();
    welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        init();
    }, 500);
});

// Logo loading
const logoLeft = document.getElementById('logo-left');
const logoRight = document.getElementById('logo-right');

const logoLeftImg = new Image();
logoLeftImg.src = './assets/logo-left.png';
logoLeftImg.onload = () => {
    logoLeft.innerHTML = '';
    logoLeft.appendChild(logoLeftImg);
    logoLeftImg.style.maxWidth = '100%';
    logoLeftImg.style.maxHeight = '100%';
};

const logoRightImg = new Image();
logoRightImg.src = './assets/logo-right.png';
logoRightImg.onload = () => {
    logoRight.innerHTML = '';
    logoRight.appendChild(logoRightImg);
    logoRightImg.style.maxWidth = '100%';
    logoRightImg.style.maxHeight = '100%';
};
