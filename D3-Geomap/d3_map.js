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
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-family: sans-serif;
        }
        .map-wrapper .province-info {
        background: white;
        position: absolute;
        top: 150px;
        right: 20px;
        width: 300px;
        padding: 10px;
        border-radius: 5px;
        font-family: sans-serif;
        }
        .map-wrapper .background {
        fill: #021019;
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
        if(changedProps.myDataBinding.state == "success") {
            this.myDataBinding = changedProps["myDataBinding"];
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

    async render (root) {

      await getScriptPromisify('https://d3js.org/d3.v3.min.js')
      await getScriptPromisify('https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.4/vue.min.js')
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
                <li>ID: {{ getId(currentProvince) }}</li>
            </ul>
            </div>

            <svg></svg>
        </div>
        </div>`

      // console.log(root,d3,root.querySelector("#__widget0 > d3-geomap").shadowRoot.querySelector("#app > div"));

      var divisions = this.myDataBinding.data.map(dim => dim.dimensions_0.id);
      var total_projects = this.myDataBinding.data.map(dim => dim.measures_0.raw);

      console.log("----", divisions, total_projects);


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
            return props.id || props.code || props.CODE || props.REGION || props.DIVISION || 'N/A'
          },
          loadGeoJson () {
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
              .querySelector('#__widget0 > d3-geomap')
              .shadowRoot.querySelector('#app > div > svg')
          )
          .attr('width', size.width)
          .attr('height', size.height)
          .selectAll('*')
          .remove()

        svg = d3.select(
          document
            .querySelector('#__widget0 > d3-geomap')
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

      function fillFn (d) {
        const props = d.properties || {}
        const len = props.DIVISION || 0
        // const len = (props.name || props.nom || props.state || '').length || 5
        const scale = d3.scale
          .linear()
          .domain(Array.from(new Set(total_projects)))
          .range(
                [
                    "#f4ebff",
                    "#eadfff",
                    "#e0d3ff",
                    "#d6c8ff",
                    "#ccbaff",
                    "#c2a3fd",
                    "#b89afb",
                    "#ae8ff9",
                    "#a796e8",
                    "#9d88f0",
                    "#967af3",
                    "#896deb",
                    "#7f61dd",
                    "#7555cf",
                    "#6b66c6",
                    "#6156b7",
                    "#5748a9",
                    "#4d3a9b",
                    "#432c8d",
                    "#391e80"
                ]
            )
        return scale(len)
      }
    }
  }

  customElements.define('d3-geomap', Main)
})()
