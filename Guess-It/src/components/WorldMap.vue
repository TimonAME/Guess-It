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
      width: 800,
      height: 800,
      sensitivity: 75,
      hoveredCountry: null,
      rotation: [0, 0],
      countries: null,
    };
  },
  mounted() {
    this.initGlobe();
  },
  methods: {
    async initGlobe() {
      try {
        // Create SVG
        const svg = d3.select(this.$refs.globeRef)
            .attr('width', this.width)
            .attr('height', this.height);

        // Create projection
        const projection = d3.geoOrthographic()
            .scale(300)
            .center([0, 0])
            .rotate(this.rotation)
            .translate([this.width / 2, this.height / 2]);

        // Create path generator
        const path = d3.geoPath().projection(projection);

        // Add water
        svg.append('circle')
            .attr('fill', '#A6D5FF')
            .attr('stroke', '#000')
            .attr('stroke-width', '0.2')
            .attr('cx', this.width / 2)
            .attr('cy', this.height / 2)
            .attr('r', projection.scale());

        // Load your topojson data
        const response = await fetch('/ne_10m_admin_0_countries_lakes_simplified_v2.json');
        const topology = await response.json();

        // Log the topology structure to debug
        console.log('Topology structure:', topology);

        // Find the correct object name in your topology
        const objectName = Object.keys(topology.objects)[0];

        // Convert topojson to geojson
        this.countries = topojson.feature(topology, topology.objects[objectName]);

        // Add countries
        const countryPaths = svg.append('g')
            .selectAll('path')
            .data(this.countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#69b3a2')
            .attr('stroke', '#000')
            .attr('stroke-width', 0.3)
            .on('mouseover', (event, d) => {
              // Adjust this according to your data structure
              this.hoveredCountry = d.properties.name || d.properties.NAME || d.id;
            })
            .on('mouseout', () => {
              this.hoveredCountry = null;
            });

        // Enable rotation
        let dragging = false;
        let previousMousePosition = [0, 0];

        svg.call(d3.drag()
            .on('start', (event) => {
              dragging = true;
              previousMousePosition = [event.x, event.y];
            })
            .on('drag', (event) => {
              if (!dragging) return;

              const currentMousePosition = [event.x, event.y];
              const deltaX = (currentMousePosition[0] - previousMousePosition[0]) / this.sensitivity;
              const deltaY = (currentMousePosition[1] - previousMousePosition[1]) / this.sensitivity;

              this.rotation = [
                this.rotation[0] + deltaX,
                this.rotation[1] - deltaY,
              ];

              projection.rotate(this.rotation);
              countryPaths.attr('d', path);

              previousMousePosition = currentMousePosition;
            })
            .on('end', () => {
              dragging = false;
            }));

        // Enable zoom
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', (event) => {
              const newScale = 300 * event.transform.k;
              projection.scale(newScale);

              // Update globe elements
              svg.select('circle').attr('r', projection.scale());
              countryPaths.attr('d', path);
            });

        svg.call(zoom);

      } catch (error) {
        console.error('Error initializing globe:', error);
      }
    },
  },
};
</script>

<style scoped>
.globe-container {
  position: relative;
  width: 800px;
  height: 800px;
  margin: 0 auto;
}

.country-tooltip {
  position: absolute;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  top: 20px;
  left: 20px;
}
</style>