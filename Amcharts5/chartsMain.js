var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

var data1 = undefined;
;(function (
    root = undefined,
    chart = undefined,
    xAxis = undefined,
    yAxis = undefined,
    series1 = undefined,
    series2 = undefined,
    legend = undefined,
    dim = undefined,
    mes1 = undefined,
    mes2 = undefined) {
        
  const prepared = document.createElement('template')
  prepared.innerHTML = `
              <style>
              </style>
              <div id="root" style="width: 100%; height: 100%;">
              </div>
            `

  class customXYChart extends HTMLElement {
    constructor () {
      //   console.clear()
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._props = {}
      //   this.render()
    }

    onCustomWidgetBeforeUpdate (changedProperties) {
      this._props = { ...this._props, ...changedProperties }
    }

    onCustomWidgetAfterUpdate (changedProperties) {
      //   console.log(changedProperties)
      this._myDataBinding = changedProperties['myDataBinding']
      console.log(this._myDataBinding)
      this.render()
    }

    async render () {
      if (this._myDataBinding.state !== 'success') {
        return
      }

      dim =
        this._myDataBinding['metadata']['dimensions']['dimensions_0']
          .description
      mes1 =
        this._myDataBinding['metadata']['mainStructureMembers']['measures_0']
          .label
      mes2 =
        this._myDataBinding['metadata']['mainStructureMembers']['measures_1']
          .label

      var data = []
      for (var i = 0; i < this._myDataBinding['data'].length; i++) {
        var obj = {}
        obj[dim] = this._myDataBinding['data'][i]['dimensions_0'].label
        obj[mes1] = this._myDataBinding['data'][i]['measures_0'].raw
        obj[mes2] = this._myDataBinding['data'][i]['measures_1'].raw
        data.push(obj)
      }

      console.log(data)

      // Define data
      //   var data = [
      //     {
      //       category: 'Research',
      //       value1: 1000,
      //       value2: 588
      //     },
      //     {
      //       category: 'Marketing',
      //       value1: 1200,
      //       value2: 1800
      //     },
      //     {
      //       category: 'Sales',
      //       value1: 850,
      //       value2: 1230
      //     }
      //   ]

      if (!root) {

        await getScriptPromisify('//cdn.amcharts.com/lib/5/index.js');
        await getScriptPromisify('//cdn.amcharts.com/lib/5/xy.js');
        await getScriptPromisify('//cdn.amcharts.com/lib/5/percent.js');

        root = am5.Root.new(this._root)
        console.log('root')
        console.log(root)

        console.log('Data')
        console.log(data)

        dim =
          this._myDataBinding['metadata']['dimensions']['dimensions_0']
            .description
        mes1 =
          this._myDataBinding['metadata']['mainStructureMembers']['measures_0']
            .label
        mes2 =
          this._myDataBinding['metadata']['mainStructureMembers']['measures_1']
            .label

        chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panY: false,
            wheelY: 'zoomX',
            layout: root.verticalLayout
          })
        )

        // Craete Y-axis
        yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {})
          })
        )

        // Create X-Axis
        xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            maxDeviation: 0.2,
            renderer: am5xy.AxisRendererX.new(root, {}),
            categoryField: dim
          })
        )

        // Create series
        series1 = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: 'Series',
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: mes1,
            categoryXField: dim,
            tooltip: am5.Tooltip.new(root, {})
          })
        )

        series2 = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: 'Series 1 ',
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: mes2,
            categoryXField: dim
          })
        )

        legend = chart.children.push(am5.Legend.new(root, {}))

      }

      console.log(root)

      console.log(dim)
      console.log(mes1)
      console.log(mes2)

      xAxis.data.setAll(data)

      series1.data.setAll(data)

      series2.data.setAll(data)

console.log(chart);



      // Add legend
      legend.data.setAll(chart.series.values)
    }
  }
  customElements.define('cw-xy-chart', customXYChart)
})()
