<template>
  <div class="map-wrapper">
    <div class="map-container">
      <div v-if="loading" class="loading">Loading map...</div>
      <svg ref="svg" v-show="!loading">
        <defs>
          <radialGradient id="globe-gradient" cx="50%" cy="50%">
            <stop offset="80%" stop-color="#fff"/>
            <stop offset="100%" stop-color="#dadada"/>
          </radialGradient>
        </defs>
        <circle class="globe-background"/>
        <g ref="mapGroup"></g>
        <g ref="labelGroup"></g>
      </svg>
      <div v-if="selectedCountry" class="country-label">
        {{ selectedCountry.name }}
      </div>
      <div v-if="hoveredCountry" class="tooltip" :style="tooltipStyle">
        {{ hoveredCountry }}
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { feature } from 'topojson-client'

export default {
  name: 'WorldMap',
  data() {
    return {
      width: 800,
      height: 800, // Made square for better globe appearance
      svg: null,
      projection: null,
      path: null,
      map: null,
      loading: true,
      g: null,
      labelGroup: null,
      selectedCountry: null,
      hoveredCountry: null,
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },
      rotation: [0, 0],
      initialMousePosition: null
    }
  },
  mounted() {
    this.initializeMap()
  },
  methods: {
    async initializeMap() {
      try {
        this.svg = d3.select(this.$refs.svg)
            .attr('width', this.width)
            .attr('height', this.height)

        // Add the globe background
        this.svg.select('.globe-background')
            .attr('cx', this.width / 2)
            .attr('cy', this.height / 2)
            .attr('r', this.width / 2.2)
            .attr('fill', 'url(#globe-gradient)')

        this.g = d3.select(this.$refs.mapGroup)
        this.labelGroup = d3.select(this.$refs.labelGroup)

        // Use orthographic projection for globe effect
        this.projection = d3.geoOrthographic()
            .scale(this.width / 2.2)
            .translate([this.width / 2, this.height / 2])
            .clipAngle(90)

        this.path = d3.geoPath().projection(this.projection)

        const response = await fetch('/ne_10m_admin_0_countries.topojson')
        const topology = await response.json()
        const objectName = Object.keys(topology.objects)[0]
        this.map = feature(topology, topology.objects[objectName])

        this.drawMap()
        this.setupDrag()
        this.loading = false
      } catch (error) {
        console.error('Error initializing map:', error)
        this.loading = false
      }
    },
    setupDrag() {
      const drag = d3.drag()
          .on('start', (event) => {
            this.initialMousePosition = [event.x, event.y]
          })
          .on('drag', (event) => {
            if (this.initialMousePosition) {
              const dx = event.x - this.initialMousePosition[0]
              const dy = event.y - this.initialMousePosition[1]

              this.rotation[0] = (this.rotation[0] + dx * 0.5) % 360
              this.rotation[1] = Math.min(Math.max(this.rotation[1] - dy * 0.5, -90), 90)

              this.projection.rotate([this.rotation[0], this.rotation[1]])
              this.redrawMap()
            }
            this.initialMousePosition = [event.x, event.y]
          })

      this.svg.call(drag)
    },
    redrawMap() {
      this.g.selectAll('path')
          .attr('d', this.path)
    },
    drawMap() {
      if (!this.map) return

      this.g.selectAll('path')
          .data(this.map.features)
          .enter()
          .append('path')
          .attr('d', this.path)
          .attr('class', 'country')
          .attr('fill', 'none')
          .attr('stroke', '#404040')
          .attr('stroke-width', 0.5)
          .on('mousemove', (event, d) => {
            this.hoveredCountry = d.properties.NAME || d.properties.name
            this.tooltipStyle = {
              left: `${event.pageX + 10}px`,
              top: `${event.pageY + 10}px`
            }
          })
          .on('mouseout', () => {
            this.hoveredCountry = null
          })
          .on('click', (event, d) => {
            this.selectedCountry = {
              name: d.properties.NAME || d.properties.name,
              details: d.properties
            }
          })
    }
  }
}
</script>

<style scoped>
.map-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}

.map-container {
  width: 800px;
  height: 800px;
  position: relative;
  overflow: hidden;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

svg {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

svg:active {
  cursor: grabbing;
}

.country {
  transition: fill 0.2s;
}

.country:hover {
  fill: #b3b3b3 !important;
  cursor: pointer;
}

.globe-background {
  fill: url(#globe-gradient);
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
}

.country-label {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #666;
}
</style>