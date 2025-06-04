# Three.js World 
*CSE 160: Introduction to Computer Graphics*

## Project Overview

This project is a recreation of a first-person exploration application using the Three.js library. It serves as a practical exercise in leveraging a high-level 3D JavaScript library to create a complex 3D scene with various objects, lighting, textures, and user interaction. The project demonstrates fundamental concepts of 3D graphics and the practical application of Three.js for web-based visualizations.

## Features and Functionality

This Three.js World application includes the following features:

*   **Diverse 3D Shapes:** The scene is populated with over 20 primary 3D shapes, including cubes, spheres, cylinders, cones, and toruses, demonstrating the use of various Three.js geometries.
*   **Texturing:** Objects in the scene are textured using loaded image files (`gray-texture.jpg`, `blue-texture.jpg`), showcasing texture mapping onto 3D geometry.
*   **Animation:** Multiple objects within the scene are animated with rotation, adding dynamic visual interest to the world.
*   **3D Model Loading:** A custom 3D model in OBJ format (`Drone.obj`) with its associated material file (`Drone.mtl`) is loaded and displayed in the scene.
*   **Multiple Light Sources:** The scene is illuminated by a combination of Ambient, Directional, and Hemisphere lights, providing varied lighting effects.
*   **Interactive Light Controls:** A dedicated UI panel allows users to dynamically adjust the intensity of all lights and the position (direction) of the directional light.
*   **Textured Skybox:** A panoramic image (`new-york-skybox.jpg`) is loaded and used as a textured skybox background, creating an immersive environment.
*   **Perspective Camera:** The scene is viewed through a perspective camera, providing a realistic sense of depth.
*   **Camera Controls:** OrbitControls are implemented, allowing users to navigate the 3D scene using mouse interactions (rotate, pan, zoom).
*   **Interactive Color Change (Wow Point):** As an extra feature, users can click on 3D objects in the scene to randomly change their color, adding a fun and interactive element.

## Technologies and Tools Used

*   **HTML5:** Provides the structure for the web page and the canvas element for WebGL rendering, along with UI controls.
*   **CSS3:** Styles the HTML elements and layout for the control panel and scene, ensuring a clean and user-friendly interface.
*   **JavaScript:** Implements the core application logic, handles user input, manages the 3D scene state, loads assets, and interacts with the Three.js library.

### Key Components:

*   **Three.js:** The primary high-level 3D JavaScript library used for building and rendering the 3D scene.
*   **OBJLoader:** Three.js addon used for loading 3D models in the OBJ format.
*   **MTLLoader:** Three.js addon used for loading material libraries associated with OBJ models.
*   **TextureLoader:** Three.js utility for loading image textures.
*   **OrbitControls:** Three.js addon providing interactive camera navigation via mouse.
*   **Raycaster:** Three.js class used for picking objects in the 3D scene based on mouse input.
*   **THREE.Box3 and THREE.Vector3:** Used for calculating the bounding box of loaded models to assist in scaling and positioning.

## Future Improvements

Potential areas for future development include:

*   Implementing additional camera controls (e.g., FirstPersonControls).
*   Adding more complex animations or interactive behaviors.
*   Including more diverse 3D models and textures.
*   Implementing shadows for more realistic rendering.
*   Optimizing performance for larger scenes.

## 🏆 Credits & Acknowledgments

- Developed independently as part of CSE 160: Introduction to Computer Graphics at UC Santa Cruz.
- Built upon the Three.js library and its official examples/addons.
- Special thanks to the course instructors for their guidance and feedback.
- 3D model (`Goldfish_01.obj`, `Goldfish_01.mtl`) obtained from [Poly Pizza](https://poly.pizza/m/DNbUoMtG3H).

---

© Rahamat Zaman - UC Santa Cruz