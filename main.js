import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Raycaster } from 'three';
import { Vector2 } from 'three';

function main() {
	// Setup renderer
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ 
		antialias: true, 
		canvas,
		alpha: true
	});
	renderer.setSize(800, 800);
	renderer.setPixelRatio(window.devicePixelRatio);

	// Setup camera
	const fov = 75;
	const aspect = 1;
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 5, 10);
	camera.lookAt(0, 0, 0);

	// Add OrbitControls
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 3;
	controls.maxDistance = 30;
	controls.maxPolarAngle = Math.PI / 2;
	controls.enableZoom = true;
	controls.zoomSpeed = 1.0;
	controls.rotateSpeed = 0.7;
	controls.panSpeed = 0.5;

	// Setup scene
	const scene = new THREE.Scene();

	// Loading textures
	const textureLoader = new THREE.TextureLoader();

	const grayTexture = textureLoader.load('img/gray-texture.jpg');
	grayTexture.colorSpace = THREE.SRGBColorSpace;

	const blueTexture = textureLoader.load('img/blue-texture.jpg');
	blueTexture.colorSpace = THREE.SRGBColorSpace;

	// Load the panoramic skybox texture
	const skyboxTexture = textureLoader.load('img/new-york-skybox.jpg', () => {
		scene.background = skyboxTexture;
		skyboxTexture.mapping = THREE.EquirectangularReflectionMapping; // Use equirectangular mapping for panoramic image
	});
	skyboxTexture.colorSpace = THREE.SRGBColorSpace; // Set color space

	// Create lights (Ambient, Directional, and Hemisphere)
	const lights = {
		ambient: new THREE.AmbientLight(0x404040, 1.0),
		directional: new THREE.DirectionalLight(0xffffff, 1.5),
		hemisphere: new THREE.HemisphereLight(0xffffbb, 0x080820, 1),
	};

	// Position lights initially
	lights.directional.position.set(5, 5, 5);

	// Add lights to scene
	scene.add(lights.ambient);
	scene.add(lights.directional);
	scene.add(lights.hemisphere);

	// State variable for dynamic light movement
	let dynamicLightMovementEnabled = false;

	// Setup light sources functionality
	function setupLightControls() {

		// Ambient light controls
		const ambientIntensity = document.getElementById('ambient-intensity');
		const ambientIntensityValue = document.getElementById('ambient-intensity-value');
		ambientIntensity.value = lights.ambient.intensity; // Initialize slider value
		ambientIntensityValue.textContent = lights.ambient.intensity.toFixed(2); // Initialize text value
		ambientIntensity.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.ambient.intensity = value;
			ambientIntensityValue.textContent = value.toFixed(2);
		});

		// Directional light controls
		const directionalIntensity = document.getElementById('directional-intensity');
		const directionalIntensityValue = document.getElementById('directional-intensity-value');
		const directionalPosX = document.getElementById('directional-pos-x');
		const directionalPosXValue = document.getElementById('directional-pos-x-value');
		const directionalPosY = document.getElementById('directional-pos-y');
		const directionalPosYValue = document.getElementById('directional-pos-y-value');
		const directionalPosZ = document.getElementById('directional-pos-z');
		const directionalPosZValue = document.getElementById('directional-pos-z-value');

		directionalIntensity.value = lights.directional.intensity; // Initialize slider value
		directionalIntensityValue.textContent = lights.directional.intensity.toFixed(2); // Initialize text value
		directionalPosX.value = lights.directional.position.x; // Initialize slider value
		directionalPosXValue.textContent = lights.directional.position.x.toFixed(1); // Initialize text value
		directionalPosY.value = lights.directional.position.y; // Initialize slider value
		directionalPosYValue.textContent = lights.directional.position.y.toFixed(1); // Initialize text value
		directionalPosZ.value = lights.directional.position.z; // Initialize slider value
		directionalPosZValue.textContent = lights.directional.position.z.toFixed(1); // Initialize text value

		directionalIntensity.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.directional.intensity = value;
			directionalIntensityValue.textContent = value.toFixed(2);
		});

		directionalPosX.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.directional.position.x = value;
			directionalPosXValue.textContent = value.toFixed(1);
		});
		directionalPosY.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.directional.position.y = value;
			directionalPosYValue.textContent = value.toFixed(1);
		});
		directionalPosZ.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.directional.position.z = value;
			directionalPosZValue.textContent = value.toFixed(1);
		});

		// Hemisphere light controls
		const hemisphereIntensity = document.getElementById('hemisphere-intensity');
		const hemisphereIntensityValue = document.getElementById('hemisphere-intensity-value');
		hemisphereIntensity.value = lights.hemisphere.intensity; // Initialize slider value
		hemisphereIntensityValue.textContent = lights.hemisphere.intensity.toFixed(2); // Initialize text value
		hemisphereIntensity.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			lights.hemisphere.intensity = value;
			hemisphereIntensityValue.textContent = value.toFixed(2);
		});
	}

	setupLightControls();

	// Load the 3D model with materials
	let loadedModel = null; // Variable to store the loaded model
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
						
						// Scale the model
						root.scale.set(50, 50, 50);
						
						// Position the model in front of the camera
						root.position.set(0, 0, -5);
						
						// Add the model to the scene
						scene.add(root);
						
						// Model rotation
						root.rotation.y = Math.PI / 4; 
						
						// Store the model reference
						loadedModel = root;
						
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

	// Setup Raycaster
	const raycaster = new Raycaster();
	const mouse = new Vector2();

	// Handle click event
	function onClick(event) {
		// Calculate mouse position in normalized device coordinates (-1 to +1) for both components
		const rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		// Update the picking ray with the camera and mouse position
		raycaster.setFromCamera(mouse, camera);

		// Calculate objects intersecting the picking ray
		// Combine all objects to check for intersection
		const interactiveObjects = [...shapes];
		if (loadedModel) {
			loadedModel.traverse((child) => {
				if (child.isMesh) {
					interactiveObjects.push(child);
				}
			});
		}

		const intersects = raycaster.intersectObjects(interactiveObjects);

		if (intersects.length > 0) {
			// first intersected object (the closest one)
			const intersectedObject = intersects[0].object;

			// Generate a random color
			const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());

			// Change the object's material color
			if (intersectedObject.material) {

				 if (intersectedObject.material.isMeshPhongMaterial) {
					 if (!intersectedObject.material.map) {
						 intersectedObject.material.color.set(randomColor);
					 } else {
						 // Create a new material with the random color and without the texture map
						 const newMaterial = new THREE.MeshPhongMaterial({
							 color: randomColor,
							 shininess: intersectedObject.material.shininess
						 });
						 intersectedObject.material = newMaterial;
					 }
				 } else if (intersectedObject.material.isMeshBasicMaterial) {
					  if (!intersectedObject.material.map) {
						 intersectedObject.material.color.set(randomColor);
					 } else {
						  const newMaterial = new THREE.MeshBasicMaterial({
							 color: randomColor,
						 });
						  intersectedObject.material = newMaterial;
					 }
				 } else {
					 if (intersectedObject.material.color) {
						  intersectedObject.material.color.set(randomColor);
					 }
				 }
			}
		}
	}
	canvas.addEventListener('click', onClick, false);

	// Handle window resize
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	window.addEventListener('resize', onWindowResize);

	// Animation loop
	function render(time) {
		time *= 0.001;

		// Update controls
		controls.update();

		// Update shapes
		shapes.forEach((shape, ndx) => {
			// Check if shape is a Mesh before accessing properties
			 if (shape.isMesh) {
				const speed = 1 + ndx * 0.1;
				const rot = time * speed;
				shape.rotation.x = rot;
				shape.rotation.y = rot;
			 }
		});

		// Animate the loaded model
		if (loadedModel) {
			 loadedModel.rotation.y = time * 0.5; // rotation speed
		}

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();
