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
		skyboxTexture.mapping = THREE.EquirectangularReflectionMapping;
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
		ambientIntensity.value = lights.ambient.intensity;
		ambientIntensityValue.textContent = lights.ambient.intensity.toFixed(2);
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

		directionalIntensity.value = lights.directional.intensity;
		directionalIntensityValue.textContent = lights.directional.intensity.toFixed(2);
		directionalPosX.value = lights.directional.position.x;
		directionalPosXValue.textContent = lights.directional.position.x.toFixed(1);
		directionalPosY.value = lights.directional.position.y;
		directionalPosYValue.textContent = lights.directional.position.y.toFixed(1);
		directionalPosZ.value = lights.directional.position.z;
		directionalPosZValue.textContent = lights.directional.position.z.toFixed(1); 

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

	// Load the Drone 3D model with materials
	let loadedDroneModel = null; // Variable to store the loaded drone model
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.setPath('obj/');
		mtlLoader.load(
			'Drone.mtl',
			(materials) => {
				materials.preload();

				const objLoader = new OBJLoader();
				objLoader.setMaterials(materials);
				objLoader.setPath('obj/');
				objLoader.load(
					'Drone.obj',
					(root) => {
						console.log('Drone model loaded successfully:', root);

						// Calculate bounding box to determine size and center
						const box = new THREE.Box3().setFromObject(root);
						const size = box.getSize(new THREE.Vector3());
						const center = box.getCenter(new THREE.Vector3());

						console.log('Drone model bounding box size:', size);
						console.log('Drone model bounding box center:', center);

						// size of the drone
						const desiredSize = 5;

						// Calculate a uniform scale factor based on the largest dimension
						const maxDimension = Math.max(size.x, size.y, size.z);
						const scaleFactor = desiredSize / maxDimension;

						// Apply the scale factor to the model
						root.scale.set(scaleFactor, scaleFactor, scaleFactor);

						// Position the model by offsetting it so its center is at the desired world coordinate
						const targetPosition = new THREE.Vector3(0, 2, 0);
						root.position.copy(targetPosition).sub(center).add(root.position);

						// Add the model to the scene
						scene.add(root);

						// Model rotation
						root.rotation.y = Math.PI / 4;

						// Store the model reference
						loadedDroneModel = root;

						console.log('Drone model final position:', loadedDroneModel.position);
						console.log('Drone model final scale:', loadedDroneModel.scale);

					},
					// Progress callback
					(xhr) => {
						console.log((xhr.loaded / xhr.total * 100) + '% Drone loaded');
					},
					// Error callback
					(error) => {
						console.error('Error loading Drone model:', error);
					}
				);
			},
			// Progress callback for MTL
			(xhr) => {
				console.log((xhr.loaded / xhr.total * 100) + '% Drone materials loaded');
			},
			// Error callback for MTL
			(error) => {
				console.error('Error loading Drone materials:', error);
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
		const rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		// Update the picking ray with the camera and mouse position
		raycaster.setFromCamera(mouse, camera);

		// Calculate objects intersecting the picking ray
		const interactiveObjects = [...shapes];
		if (loadedDroneModel) {
			loadedDroneModel.traverse((child) => {
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
					 // Fallback for other material types if they have a color property
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
			 if (shape.isMesh) {
				const speed = 1 + ndx * 0.1;
				const rot = time * speed;
				shape.rotation.x = rot;
				shape.rotation.y = rot;
			 }
		});

		// Animate the loaded Drone model
		if (loadedDroneModel) {
			 loadedDroneModel.rotation.y = time * 0.5; // rotation speed
		}

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();
