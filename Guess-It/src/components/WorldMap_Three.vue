<template>
  <div ref="globeContainer" class="globe-container"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as topojson from 'topojson-client';

export default {
  name: 'Globe',
  mounted() {
    this.initGlobe();
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  },
  methods: {
    async initGlobe() {
      // Set up the scene, camera, and renderer
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.globeContainer.appendChild(this.renderer.domElement);

      // Create a material for the sea (globe surface)
      const seaMaterial = new THREE.MeshBasicMaterial({ color: 0x1e90ff }); // Dodger blue

      // Create LOD for the globe
      const lod = new THREE.LOD();

      // High detail
      const highDetailGeometry = new THREE.SphereGeometry(5, 64, 64);
      const highDetailMesh = new THREE.Mesh(highDetailGeometry, seaMaterial);
      lod.addLevel(highDetailMesh, 0);

      this.scene.add(lod);

      // Set camera position
      this.camera.position.z = 15;

      // Add orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableZoom = true;
      this.controls.enablePan = false;

      // Load and map TopoJSON data
      await this.loadAndMapTopoJSON();

      // Start animation loop
      this.animate();
    },
    async loadAndMapTopoJSON() {
      try {
        const response = await fetch('/ne_10m_admin_0_countries.json');
        const topology = await response.json();
        const geojson = topojson.feature(topology, topology.objects[Object.keys(topology.objects)[0]]);

        geojson.features.forEach(feature => {
          if (!feature.geometry) {
            return; // Skip features with null geometry
          }

          const { type, coordinates } = feature.geometry;

          if (type === 'Polygon') {
            this.addPolygonToScene(coordinates);
          } else if (type === 'MultiPolygon') {
            coordinates.forEach(polygon => this.addPolygonToScene(polygon));
          }
        });
      } catch (error) {
        console.error('Error loading TopoJSON:', error);
      }
    },
    addPolygonToScene(polygon) {
      polygon.forEach(ring => {
        const points = ring.map(([lon, lat]) => {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);
          const x = 5 * Math.sin(phi) * Math.cos(theta);
          const y = 5 * Math.cos(phi);
          const z = -5 * Math.sin(phi) * Math.sin(theta);
          return new THREE.Vector3(x, y, z);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x32cd32 }); // Lime green
        const line = new THREE.Line(geometry, lineMaterial);
        this.scene.add(line);
      });
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.scene.rotation.y += 0.000; // Rotate the globe
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
};
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>