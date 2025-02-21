<template>
  <div class="globe-container">
    <svg ref="globeRef"></svg>
    <div v-if="hoveredCountry" class="country-tooltip">
      {{ hoveredCountry }}
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default {
  name: 'Globe',
  data() {
    return {
      width: 1000,
      height: 600,
      sensitivity: 75,
      hoveredCountry: null,
      rotation: [0, 0],
      countries: null,
      // Add boundary constraints
      bounds: {
        minX: 400,
        maxX: 600,
        minY: 280,
        maxY: 300
      }
    };
  },
  mounted() {
    this.initGlobe();
  },
  methods: {
    // Helper function to constrain translation within bounds
    constrainToBounds(tx, ty) {
      return [
        Math.max(this.bounds.minX, Math.min(this.bounds.maxX, tx)),
        Math.max(this.bounds.minY, Math.min(this.bounds.maxY, ty))
      ];
    },

    async initGlobe() {
      try {
        const svg = d3.select(this.$refs.globeRef)
            .attr('width', this.width)
            .attr('height', this.height);

        const projection = d3.geoEquirectangular()
            .scale(180)
            .center([0, 0])
            .translate([this.width / 2, this.height / 2]);

        const path = d3.geoPath().projection(projection);

        svg.append('rect')
            .attr('fill', '#E6F3FF')
            .attr('width', this.width)
            .attr('height', this.height);

        const response = await fetch('/ne_10m_admin_0_countries_lakes_simplified_v2.json');
        const topology = await response.json();
        const objectName = Object.keys(topology.objects)[0];
        this.countries = topojson.feature(topology, topology.objects[objectName]);

        const countryPaths = svg.append('g')
            .selectAll('path')
            .data(this.countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#80CFA9')
            .attr('stroke', '#FFF')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
              d3.select(event.currentTarget)
                  .attr('fill', '#4CAF50')
              this.hoveredCountry = d.properties.name || d.properties.NAME || d.id;
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget)
                  .attr('fill', '#80CFA9')
              this.hoveredCountry = null;
            });

        let previousMousePosition = [0, 0];
        let currentTranslate = projection.translate();

        // Modified drag behavior with boundaries
        svg.call(d3.drag()
            .on('start', (event) => {
              previousMousePosition = [event.x, event.y];
              currentTranslate = projection.translate();
            })
            .on('drag', (event) => {
              const currentMousePosition = [event.x, event.y];
              const deltaX = currentMousePosition[0] - previousMousePosition[0];
              const deltaY = currentMousePosition[1] - previousMousePosition[1];

              // Calculate new translation with constraints
              const newTranslate = this.constrainToBounds(
                  currentTranslate[0] + deltaX,
                  currentTranslate[1] + deltaY
              );

              projection.translate(newTranslate);
              countryPaths.attr('d', path);

              // Update current translation for next drag event
              currentTranslate = newTranslate;
              previousMousePosition = currentMousePosition;
            }));

        // Modified zoom behavior with boundaries
        const zoom = d3.zoom()
            .scaleExtent([0.7, 8])
            .on('zoom', (event) => {
              const transform = event.transform;
              const scale = 180 * transform.k;

              // Calculate new translation with constraints
              const translate = this.constrainToBounds(
                  transform.x + this.width / 2,
                  transform.y + this.height / 2
              );

              projection
                  .scale(scale)
                  .translate(translate);

              countryPaths.attr('d', path);
            });

        // Add zoom constraints
        svg.call(zoom)
            .call(zoom.transform, d3.zoomIdentity
                .translate(this.width / 2, this.height / 2)
                .scale(1));

        // Add clip path to prevent drawing outside the container
        svg.append('defs')
            .append('clipPath')
            .attr('id', 'map-boundary')
            .append('rect')
            .attr('width', this.width)
            .attr('height', this.height);

        // Apply clip path to the map group
        countryPaths.attr('clip-path', 'url(#map-boundary)');

      } catch (error) {
        console.error('Error initializing globe:', error);
      }
    }
  },
};
</script>

<style scoped>
.globe-container {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 600px;
  margin: 0 auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.country-tooltip {
  position: absolute;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  font-size: 14px;
  top: 20px;
  left: 20px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>