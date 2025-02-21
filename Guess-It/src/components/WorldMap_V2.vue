<template>
  <div class="globe-container">
    <!-- PIXI will append the WebGL canvas here -->
    <div ref="pixiContainer"></div>
    <div v-if="hoveredCountry" class="country-tooltip">
      {{ hoveredCountry }}
    </div>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default {
  name: 'GlobeFast',
  data() {
    return {
      width: 800,
      height: 800,
      hoveredCountry: null,
      app: null,         // PIXI.Application instance
      projection: null   // d3.geoOrthographic projection instance
    };
  },
  mounted() {
    this.initPixi();
  },
  methods: {
    async initPixi() {
      // Create a bare PIXI.Application and initialize with options.
      this.app = new PIXI.Application();
      this.app.init({
        width: this.width,
        height: this.height,
        backgroundColor: 0xA6D5FF, // water background color
        antialias: true
      });
      // In PIXI v8, "canvas" is the new recommended property but it might be undefined.
      // Fall back to the deprecated "view" property if necessary.
      const pixiCanvas = this.app.canvas || this.app.view;
      this.$refs.pixiContainer.appendChild(pixiCanvas);

      // Create a D3 orthographic projection.
      this.projection = d3.geoOrthographic()
          .scale(300)
          .translate([this.width / 2, this.height / 2])
          .rotate([0, 0])
          .clipAngle(90); // clip the back of the globe

      // Load TopoJSON data (adjust the path as needed)
      try {
        const response = await fetch('/ne_10m_admin_0_countries_lakes_simplified_v2.json');
        const topology = await response.json();
        const objectName = Object.keys(topology.objects)[0];
        const geojson = topojson.feature(topology, topology.objects[objectName]);
        this.drawCountries(geojson.features);
      } catch (error) {
        console.error('Error loading TopoJSON:', error);
      }
    },

    // Draw each country using PIXI.Graphics
    drawCountries(features) {
      features.forEach(feature => {
        const graphics = new PIXI.Graphics();
        graphics.interactive = true;
        graphics.buttonMode = true;

        const countryName = feature.properties.name || feature.properties.NAME || feature.id || 'Unknown';

        // Set up pointer events to display the country tooltip.
        graphics.on('pointerover', () => {
          this.hoveredCountry = countryName;
        });
        graphics.on('pointerout', () => {
          this.hoveredCountry = null;
        });

        // Draw the country with a fill and a thin stroke.
        graphics.lineStyle(0.5, 0x000000);
        graphics.beginFill(0x69b3a2);

        // Handle Polygon and MultiPolygon geometries.
        if (feature.geometry.type === 'Polygon') {
          this.drawPolygon(graphics, feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygon => {
            this.drawPolygon(graphics, polygon);
          });
        }
        graphics.endFill();
        this.app.stage.addChild(graphics);
      });
    },

    // Convert polygon rings into drawing commands using PIXI.Graphics.
    drawPolygon(graphics, rings) {
      rings.forEach(ring => {
        if (!ring.length) return;
        const projPoints = ring.map(coord => this.projection(coord));
        if (!projPoints || !projPoints[0]) return;
        graphics.moveTo(projPoints[0][0], projPoints[0][1]);
        for (let i = 1; i < projPoints.length; i++) {
          graphics.lineTo(projPoints[i][0], projPoints[i][1]);
        }
        graphics.closePath();
      });
    }
  }
};
</script>

<style scoped>
.globe-container {
  position: relative;
  width: 800px;
  height: 800px;
}

.country-tooltip {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  color: #fff;
  border-radius: 4px;
  pointer-events: none;
}
</style>