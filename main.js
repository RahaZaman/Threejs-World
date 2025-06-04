import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
	// Setup renderer
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ 
		antialias: true, 
		canvas,
		alpha: true // Enable transparency
	});
	renderer.setSize(800, 800); // Set fixed size
	renderer.setPixelRatio(window.devicePixelRatio);

	// Setup camera
	const fov = 75;
	const aspect = 1; // 800/800 = 1
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 5, 10);
	camera.lookAt(0, 0, 0);

	// Add OrbitControls
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true; // Add smooth damping effect
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 3;
	controls.maxDistance = 30;
	controls.maxPolarAngle = Math.PI / 2; // Prevent going below the ground
	controls.enableZoom = true;
	controls.zoomSpeed = 1.0;
	controls.rotateSpeed = 0.7;
	controls.panSpeed = 0.5;

	// Setup scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x111111); // Slightly lighter background

	// Create lights
	const lights = {
		ambient: new THREE.AmbientLight(0x404040, 1.0), // Increased intensity
		directional: new THREE.DirectionalLight(0xffffff, 1.5), // Added directional light with intensity
		hemisphere: new THREE.HemisphereLight(0xffffbb, 0x080820, 1), // Added hemisphere light with intensity
		point: new THREE.PointLight(0xff0000, 1.5, 100), // Increased intensity
		spot: new THREE.SpotLight(0xffffff, 1.5, 100, Math.PI / 6, 0.5, 1) // Increased intensity
	};

	// Position lights
	lights.directional.position.set(5, 5, 5);
	lights.point.position.set(5, 5, 5);
	lights.spot.position.set(-5, 5, -5);
	lights.spot.target.position.set(0, 0, 0);

	// Add lights to scene
	scene.add(lights.ambient);
	scene.add(lights.directional);
	scene.add(lights.hemisphere);
	scene.add(lights.point);
	scene.add(lights.spot);
	scene.add(lights.spot.target);

	// Setup light controls
	function setupLightControls() {
		// Ambient light controls
		const ambientLight = document.getElementById('ambient-light');
		const ambientIntensity = document.getElementById('ambient-intensity');
		ambientLight.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.ambient.intensity = value;
			ambientIntensity.textContent = value.toFixed(1);
		});

		// Point light controls
		const pointLight = document.getElementById('point-light');
		const pointIntensity = document.getElementById('point-intensity');
		const pointColor = document.getElementById('point-color');
		
		pointLight.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.point.intensity = value;
			pointIntensity.textContent = value.toFixed(1);
		});

		pointColor.addEventListener('input', (e) => {
			lights.point.color.set(e.target.value);
		});

		// Spot light controls
		const spotLight = document.getElementById('spot-light');
		const spotIntensity = document.getElementById('spot-intensity');
		const spotAngle = document.getElementById('spot-angle-control');
		const spotAngleValue = document.getElementById('spot-angle');

		spotLight.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.spot.intensity = value;
			spotIntensity.textContent = value.toFixed(1);
		});

		spotAngle.addEventListener('input', (e) => {
			const value = parseInt(e.target.value);
			lights.spot.angle = (value * Math.PI) / 180;
			spotAngleValue.textContent = value;
		});
	}

	setupLightControls();

	// Load the 3D model with materials
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.setPath('obj/');
		mtlLoader.load(
			'Goldfish_01.mtl',
			(materials) => {
				materials.preload();
				
				const objLoader = new OBJLoader();
				objLoader.setMaterials(materials);
				objLoader.setPath('obj/');
				objLoader.load(
					'Goldfish_01.obj',
					(root) => {
						console.log('Model loaded successfully:', root);
						
						// Scale the model to an appropriate size
						root.scale.set(50, 50, 50);
						
						// Position the model in front of the camera
						root.position.set(0, 0, -5);
						
						// Add the model to the scene
						scene.add(root);
						
						// Make the model rotate
						root.rotation.y = Math.PI / 4; // Initial rotation
						
						// Add the model to the animation loop
						shapes.push({
							mesh: root,
							rotationSpeed: 0.5
						});
					},
					// Progress callback
					(xhr) => {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					},
					// Error callback
					(error) => {
						console.error('Error loading model:', error);
					}
				);
			},
			// Progress callback for MTL
			(xhr) => {
				console.log((xhr.loaded / xhr.total * 100) + '% materials loaded');
			},
			// Error callback for MTL
			(error) => {
				console.error('Error loading materials:', error);
			}
		);
	}

	// Loading textures
	const textureLoader = new THREE.TextureLoader();
	const grayTexture = textureLoader.load('img/gray-texture.jpg');
	grayTexture.colorSpace = THREE.SRGBColorSpace;

	const blueTexture = textureLoader.load('img/blue-texture.jpg');
	blueTexture.colorSpace = THREE.SRGBColorSpace;

	// Create different types of geometries
	const geometries = {
		box: new THREE.BoxGeometry(1, 1, 1),
		sphere: new THREE.SphereGeometry(0.5, 32, 32),
		cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
		cone: new THREE.ConeGeometry(0.5, 1, 32),
		torus: new THREE.TorusGeometry(0.5, 0.2, 16, 100)
	};


	// Create multiple instances of different shapes
	const shapes = [];
	
	// Create a grid of shapes
	const gridSize = 5;
	const spacing = 2;
	let shapeIndex = 0;
	
	for (let x = -gridSize; x <= gridSize; x += spacing) {
		for (let z = -gridSize; z <= gridSize; z += spacing) {
			const geometryType = Object.keys(geometries)[shapeIndex % Object.keys(geometries).length];
			const color = new THREE.Color().setHSL(shapeIndex / 25, 0.5, 0.5);
			
			// Create an interesting pattern with textures
			let textureType = 'none';
			if (shapeIndex % 3 === 0) {
				textureType = 'gray';
			} else if (shapeIndex % 3 === 1) {
				textureType = 'blue';
			}
			
			const shape = makeInstance(geometries[geometryType], color, x, 0, z, textureType);
			shapes.push(shape);
			shapeIndex++;
		}
	}

	function makeInstance(geometry, color, x, y, z, textureType = 'none') {
		let material;
		switch(textureType) {
			case 'gray':
				material = new THREE.MeshPhongMaterial({
					map: grayTexture,
					color: 0xffffff,
					shininess: 30
				});
				break;
			case 'blue':
				material = new THREE.MeshPhongMaterial({
					map: blueTexture,
					color: 0xffffff,
					shininess: 30
				});
				break;
			default:
				material = new THREE.MeshPhongMaterial({ 
					color,
					shininess: 30
				});
		}
		
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
		mesh.position.set(x, y, z);
		return mesh;
	}

	// Handle window resize
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener('resize', onWindowResize);

	// Animation loop
	function render(time) {
		time *= 0.001;

		// Update controls
		controls.update();

		// Update lights (assuming you still want them to move)
		lights.point.position.x = Math.sin(time * 0.5) * 7; // Adjusted movement
		lights.point.position.z = Math.cos(time * 0.5) * 7; // Adjusted movement

		lights.spot.position.x = Math.sin(time * 0.7 + Math.PI) * 6; // Adjusted movement
		lights.spot.position.z = Math.cos(time * 0.7 + Math.PI) * 6; // Adjusted movement
		lights.spot.target.position.y = Math.sin(time * 0.3) * 2; // Make spot target move slightly

		// Update shapes
		shapes.forEach((shape, ndx) => {
			if (shape.mesh) {
				shape.mesh.rotation.y = time * shape.rotationSpeed;
			} else {
				const speed = 1 + ndx * 0.1;
				const rot = time * speed;
				shape.rotation.x = rot;
				shape.rotation.y = rot;
			}
		});

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();
