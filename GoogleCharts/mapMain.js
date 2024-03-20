var getScriptPromisify = src => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
    })
  }
  ;(function () {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
                  <style>
                  </style>
                  <div id="root" style="width: 100%; height: 100%;">
                  <button onclick="update('var1')">Variable 1</button>
  <button onclick="update('var2')">Variable 2</button>
                  </div>
                `
  
    class d3BarChart extends HTMLElement {
      constructor () {
        //   console.clear()
        super()
        this._shadowRoot = this.attachShadow({ mode: 'open' })
        this._shadowRoot.appendChild(prepared.content.cloneNode(true))
        this._root = this._shadowRoot.getElementById('root')
        this._props = {}
  
      }
  
      onCustomWidgetBeforeUpdate (changedProperties) {
        this._props = { ...this._props, ...changedProperties }
      }
  
      onCustomWidgetAfterUpdate (changedProperties) {
        this._myDataBinding = changedProperties['myDataBinding']
        console.log(this._myDataBinding)
        this.render()
      }
  
      async render () {
  
        await getScriptPromisify('https://d3js.org/d3.v4.js')
  
        if(this._myDataBinding.state != 'success') {
          return;
        }
  
        var data = [];
  
        for (var i = 0; i < this._myDataBinding['data'].length; i++) {
          var obj = {}
          obj['group'] = this._myDataBinding['data'][i]['dimensions_0'].label
          obj['var1'] = this._myDataBinding['data'][i]['measures_0'].raw
          obj['var2'] = this._myDataBinding['data'][i]['measures_1'].raw
          data.push(obj)
        }
  
        console.log(data)
  
        var margin = { top: 30, right: 30, bottom: 70, left: 60 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom
  
        // append the svg object to the body of the page
        var svg = d3
          .select(this._root)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  
        // Initialize the X axis
        var x = d3.scaleBand().range([0, width]).padding(0.2)
        var xAxis = svg
          .append('g')
          .attr('transform', 'translate(0,' + height + ')')
  
        // Initialize the Y axis
        var y = d3.scaleLinear().range([height, 0])
        var yAxis = svg.append('g').attr('class', 'myYaxis')
  
        // A function that create / update the plot for a given variable:
        function update (selectedVar) {
          // Parse the Data
         console.log(selectedVar);
  
              x.domain(
                data.map(function (d) {
                  return d.group
                })
              )
              xAxis.transition().duration(1000).call(d3.axisBottom(x))
  
              // Add Y axis
              y.domain([
                0,
                d3.max(data, function (d) {
                  return d[selectedVar]
                })
              ])
              yAxis.transition().duration(1000).call(d3.axisLeft(y).tickFormat(function(d){return d/100000 + " Million"}))
  
              // variable u: map data to existing bars
              var u = svg.selectAll('rect').data(data)
  
              // update bars
              u.enter()
                .append('rect')
                .merge(u)
                .transition()
                .duration(1000)
                .attr('x', function (d) {
                  return x(d.group)
                })
                .attr('y', function (d) {
                  return y(d[selectedVar])
                })
                .attr('width', x.bandwidth())
                .attr('height', function (d) {
                  return height - y(d[selectedVar])
                })
                .attr('fill', '#69b3a2')
        }
  
        window.update = update;
  
        // Initialize plot
        update('var1')
      }
    }
    customElements.define('cw-d3-barchart', d3BarChart)
  })()
  