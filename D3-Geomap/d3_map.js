var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

;(function () {
  const template = document.createElement('template')

  template.innerHTML = `
    <style>
        html,
        body {
            height: 100%;
            margin: 0;
        }
        #app {
            height: 100%;
        }
        .map-wrapper .province-title {
            position: absolute;
            top: 50px;
            left: 60%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: sans-serif;
        }
        .map-wrapper .province-info {
        background: white;
            position: absolute;
            top: 80px;
            right: 20px;
            width: 210px;
            border: 2px solid black;
            padding: 10px;
            border-radius: 5px;
            font-family: sans-serif;
        }
        .map-wrapper .background {
            fill: white;
            pointer-events: all;
        }
        .map-wrapper .map-layer {
            fill: #08304b;
            stroke: #021019;
            stroke-width: 1px;
        }
        .scale-control,
        .country-control {
            position: absolute;
            z-index: 10;
            background: rgba(255, 255, 255, 0.8);
            padding: 10px;
            border-radius: 5px;
            font-family: sans-serif;
        }
        .scale-control {
            top: 20px;
            right: 20px;
        }
        .country-control {
            top: 20px;
            left: 20px;
        }
        .legend text {
            fill: #333;
            font-weight:bold;
            font-size: 10px;
        }
        .legend-axis path,
        .legend-axis line {
            fill: none;
            /*   stroke: pink; */
            shape-rendering: crispEdges;
        }
    </style>
    
    <div id="root"></div>
    `

  class Main extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      //   this.render(this._root)
    }

    // ------------------
    // LifecycleCallbacks
    // ------------------
    async onCustomWidgetBeforeUpdate (changedProps) {}

    async onCustomWidgetAfterUpdate (changedProps) {
      //   if (changedProps.text) {
      //     this.render(this._root)
      //   }
      if (changedProps.myDataBinding.state == 'success') {
        this.myDataBinding = changedProps['myDataBinding']
        this.render(this._root)
      }
    }

    async onCustomWidgetResize (width, height) {
      this.render(this._root)
    }

    async onCustomWidgetDestroy () {
      this.dispose()
    }

    dispose () {
      this._renderer.dispose()
    }

    loadData () {
        
      this.dataFromSAC = {}
      this.dimension_names = []
      this.measure_names = []

      //// dimension names
      Object.keys(this.myDataBinding.metadata.dimensions).forEach((key, idx) =>
        this.dimension_names.push(
          this.myDataBinding.metadata.dimensions[key].description
        )
      )
      //// measure names
      Object.keys(this.myDataBinding.metadata.mainStructureMembers).forEach(
        (key, idx) =>
          this.measure_names.push(
            this.myDataBinding.metadata.mainStructureMembers[key].label
          )
      )

      console.log(
        'Dimension Names : ',
        this.dimension_names,
        '\nMeasure Names : ',
        this.measure_names
      )

      for (var i = 0; i < this.myDataBinding.data.length; i++) {
        let key = ''
        let object = this.myDataBinding.data[i]

        for (var j in object) {
          if (!(object[j].id in this.dataFromSAC) && j == 'dimensions_0') {
            key = object[j].id
            this.dataFromSAC[key] = {}
            continue
          }

          let checkpoint = j.split('_')

          if (checkpoint[0] == 'dimensions') {
            this.dataFromSAC[key][this.dimension_names[checkpoint[1]]] =
              object[j].id
          } else {
            this.dataFromSAC[key][this.measure_names[checkpoint[1]]] =
              object[j].raw
          }
        }
      }

      console.log('SAC object : ', this.dataFromSAC)
    }

    async render (root) {
      await getScriptPromisify('https://d3js.org/d3.v3.min.js')
      await getScriptPromisify(
        'https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.4/vue.min.js'
      )
      // this.dispose()

      // root.querySelector("#__widget0 > d3-geomap").shadowRoot.querySelector("#app > div")

      root.innerHTML = `<div id="app">
        <div class="map-wrapper">

            <!-- Country Selector -->
            <div class="country-control">
                <label for="countrySelect">Select : </label>
                <span v-for="(url, name) in geoJsonSources">
                    <input type="radio" v-model="selectedCountry" @change="loadGeoJson" name="countrySelect" :value="url" />
                    <label>{{name}}</label>  &nbsp;&nbsp;
                </span>
            </div>


            <!-- Map Labels -->
            <h2 v-if="province" class="province-title">{{ getName(province) }}</h2>

            <div v-if="currentProvince" class="province-info">
            <h3 class="text-center">{{ getName(currentProvince) }}</h3>
            <ul>
                <li>{{ getId(currentProvince) }}</li>
            </ul>
            </div>

            <svg></svg>
        </div>
        </div>`

      this.loadData()

      var dataFromSAC = this.dataFromSAC
      var measure_names = this.measure_names
      var widget_id = '#' + this._root.offsetParent.id + ' > ' + this.localName
      // console.log(root,d3,root.querySelector("#__widget0 > d3-geomap").shadowRoot.querySelector("#app > div"));

      var divisions = this.myDataBinding.data.map(dim => dim.dimensions_0.id)
      var total_projects = this.myDataBinding.data.map(
        dim => dim.measures_0.raw
      )

      //// bining - legend range

      var min = Math.min(...total_projects);
      var max = Math.max(...total_projects);
      const bins = (max - 5 > 0) ? max - 5 : 7

      var step = Math.ceil((max - min + 1) / bins)

      var legendRange = []
      for (let i = min; i <= max; i += step) {
        legendRange.push(i)
      }

      ///// legend range ends

      console.log('----', this.myDataBinding, divisions, total_projects)

      const app = new Vue({
        el: root,
        data: {
          province: undefined,
          currentProvince: undefined,
          mapScale: 0.18,
          selectedCountry: '',
          geoJsonSources: {
            County:
              'https://raw.githubusercontent.com/Kalpesh-Gohil-18/CW/refs/heads/master/County.json',
            Division:
              'https://raw.githubusercontent.com/Kalpesh-Gohil-18/CW/refs/heads/master/division.json'
          }
        },
        methods: {
          selectProvince (feature) {
            this.province = feature
          },
          openInfo (feature) {
            let key =
              feature.properties.COUNTY_NAM || feature.properties.DIVISION
            let value = 'N/A'
            if (dataFromSAC[key]) {
              value = dataFromSAC[key][measure_names[0]]
            }
            feature.properties['display_info'] =
              measure_names[0] + ' : ' + value
            this.currentProvince = feature
          },
          closeInfo () {
            this.currentProvince = undefined
          },
          getName (feature) {
            const props = feature?.properties || {}
            return (
              props.COUNTY_NAM ||
              props.DIVISION ||
              props.name ||
              props.NAME ||
              props.province ||
              props.code ||
              'Unknown'
            )
          },
          getId (feature) {
            const props = feature?.properties || {}
            return (
              props.display_info ||
              props.id ||
              props.code ||
              props.CODE ||
              props.REGION ||
              props.DIVISION ||
              'N/A'
            )
          },
          async loadGeoJson () {
            this.data_geojson = await (await fetch(this.selectedCountry)).json()
            console.log(this.data_geojson)

            d3.json(this.selectedCountry, (error, mapData) => {
              if (error) {
                alert('Failed to load map.')
                return
              }
              window.mapData = mapData
              setupMap(mapData)
            })
          }
        },
        watch: {
          mapScale (newScale) {
            const numericScale = Number(newScale)
            if (window.mapData) {
              app.mapScale = numericScale // update with number
              setupMap(window.mapData)
            }
          }
        },
        mounted () {
          this.selectedCountry = this.geoJsonSources['County']
          this.loadGeoJson()
          window.addEventListener('resize', () => {
            if (window.mapData) setupMap(window.mapData)
          })
        }
      })

      let centered = null
      let currentTransform = { x: 0, y: 0, k: 1 }
      let size, projection, path, svg, g, mapLayer

      function initializeSize () {
        size = {
          width: 817,
          height: 606
        }
      }

      function setupMap (mapData) {
        initializeSize()

        projection = d3.geo.mercator()
        path = d3.geo.path().projection(projection)

        const bounds = d3.geo.bounds(mapData)
        const bottomLeft = bounds[0]
        const topRight = bounds[1]

        const center = d3.geo.centroid(mapData)
        const baseScale =
          250 *
          Math.min(
            size.width / (topRight[0] - bottomLeft[0]),
            size.height / (topRight[1] - bottomLeft[1])
          )
        const scale = baseScale * app.mapScale

        projection
          .scale(scale)
          .center(center)
          .translate([size.width / 2, size.height / 2])

        currentTransform = { x: size.width / 2, y: size.height / 2, k: 1 }

        svg = d3
          .select(
            document
              .querySelector(widget_id)
              .shadowRoot.querySelector('#app > div > svg')
          )
          .attr('width', size.width)
          .attr('height', size.height)
          .selectAll('*')
          .remove()

        svg = d3.select(
          document
            .querySelector(widget_id)
            .shadowRoot.querySelector('#app > div > svg')
        )

        svg
          .append('rect')
          .attr('class', 'background')
          .attr('width', size.width)
          .attr('height', size.height)
          .on('click', () => clicked(null))

        g = svg.append('g')
        mapLayer = g.append('g').classed('map-layer', true)

        mapLayer
          .selectAll('path')
          .data(mapData.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('vector-effect', 'non-scaling-stroke')
          .style('fill', fillFn)
          .on('mouseover', mouseover)
          .on('mouseout', mouseout)
          .on('click', clicked)

        applyTransform()
        defineLegend()
      }

      function clicked (d) {
        let x, y, k

        if (d && centered !== d) {
          const centroid = path.centroid(d)
          x = centroid[0]
          y = centroid[1]
          k = 4
          centered = d
          app.openInfo(d)
        } else {
          x = size.width / 2
          y = size.height / 2
          k = 1
          centered = null
          app.closeInfo()
        }

        currentTransform = { x, y, k }

        mapLayer.selectAll('path').style('fill', function (d) {
          return centered && d === centered ? '#D5708B' : fillFn(d)
        })

        g.transition()
          .duration(750)
          .attr(
            'transform',
            'translate(' +
              size.width / 2 +
              ',' +
              size.height / 2 +
              ')scale(' +
              k +
              ')translate(' +
              -x +
              ',' +
              -y +
              ')'
          )
      }

      function applyTransform () {
        g.transition()
          .duration(0)
          .attr(
            'transform',
            'translate(' +
              size.width / 2 +
              ',' +
              size.height / 2 +
              ')scale(' +
              currentTransform.k +
              ')translate(' +
              -currentTransform.x +
              ',' +
              -currentTransform.y +
              ')'
          )
      }

      function mouseover (d) {
        d3.select(this).style('fill', '#1483ce')
        if (d) {
          app.selectProvince(d)
          app.openInfo(d)
        }
      }

      function mouseout (d) {
        app.selectProvince(undefined)
        mapLayer.selectAll('path').style('fill', function (d) {
          return centered && d === centered ? '#D5708B' : fillFn(d)
        })
        app.closeInfo()
      }

      const colorScale = d3.scale
        .linear()
        .domain(Array.from(new Set(total_projects)))
        .range([
            'white',
          '#f4ebff',
          '#eadfff',
          '#e0d3ff',
          '#d6c8ff',
          '#ccbaff',
          '#c2a3fd',
          '#b89afb',
          '#ae8ff9',
          '#a796e8',
          '#9d88f0',
          '#967af3',
          '#896deb',
          '#7f61dd',
          '#7555cf',
          '#6b66c6',
          '#6156b7',
          '#5748a9',
          '#4d3a9b',
          '#432c8d',
          '#391e80',
        ])

      function fillFn (d) {
        const props = d.properties || {}
        const len = (dataFromSAC[props.COUNTY_NAM]) ? dataFromSAC[props.COUNTY_NAM][measure_names[0]] : 0
        // const len = (props.name || props.nom || props.state || '').length || 5
        return colorScale(len)
      }

      function defineLegend () {

        if (!size || !size.height) {
          console.warn("Legend skipped: 'size' is not initialized yet.")
          return
        }

        const legendWidth = 300
        const legendHeight = 12
        const padding = 10
        const xPos = legendWidth - 270 // bottom right corner
        const yPos = size.height - 60

        const legendGroup = d3
          .select(
            document
              .querySelector(widget_id)
              .shadowRoot.querySelector('#app > div > svg')
          )
          .append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${xPos}, ${yPos})`)

        // Define the gradient
        const defs = legendGroup.append('defs')
        const linearGradient = defs
          .append('linearGradient')
          .attr('id', 'legend-gradient')
          .attr('x1', '0%')
          .attr('x2', '100%')

        linearGradient
          .selectAll('stop')
          .data(
            colorScale.range().map((color, i) => ({
              offset: `${(i / (colorScale.range().length - 1)) * 100}%`,
              color
            }))
          )
          .enter()
          .append('stop')
          .attr('offset', d => d.offset)
          .attr('stop-color', d => d.color)

        // Draw the gradient rectangle
        legendGroup
          .append('rect')
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .style('fill', 'url(#legend-gradient)')
          .style('stroke', '#aaa')
          .style('stroke-width', '0.5')

        // Add title label
        legendGroup
          .append('text')
          .attr('x', 0)
          .attr('y', -8)
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .text('Total Count')

        // Create axis scale
        const legendScale = d3.scale
          .linear()
          .domain([(min - 1 >= 0) ? min - 1 : min, max])
          .range([0, legendWidth])

        const legendAxis = d3.svg
          .axis()
          .scale(legendScale)
          .orient('bottom')
          .tickValues([(min - 1 >= 0) ? min - 1 : min, ...legendRange.slice(1, legendRange.length - 1), max])
          .tickFormat(d3.format('d'))

        // Add ticks below gradient
        legendGroup
          .append('g')
          .attr('class', 'legend-axis')
          .attr('transform', `translate(0, ${legendHeight + padding})`)
          .call(legendAxis)
          .selectAll('text')
          .style('font-size', '10px')
          .style('fill', '#333')

        legendGroup
          .selectAll('.legend-axis path, .legend-axis line')
          .style('stroke', '#ccc')
          .style('stroke-width', '0.5')
      }
    }
  }

  customElements.define('d3-geomap', Main)
})()
