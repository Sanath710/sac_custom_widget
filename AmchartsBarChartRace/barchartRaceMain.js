var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

  ; (function (mes = undefined, dim = undefined) {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
        <style>
        #root {
            width: 100%;
            height: 100%;
          }
        </style>
        <div id="root"></div>
        `

    class barchartRace extends HTMLElement {
      constructor() {
        console.clear()
        super()
        this._shadowRoot = this.attachShadow({ mode: 'open' })
        this._shadowRoot.appendChild(prepared.content.cloneNode(true))
        this._root = this._shadowRoot.getElementById('root')
        this._props = {}
      }

      onCustomWidgetBeforeUpdate(changedProperties) {
        this._props = { ...this._props, ...changedProperties }
      }

      onCustomWidgetAfterUpdate(changedProperties) {
        if ('myDataBinding' in changedProperties) {
          this._myDataBinding = changedProperties['myDataBinding']
        }
        console.log(this._myDataBinding)
        this.render()
      }

      transformDataset() {

        this._years = new Set()

        for (var i = 0; i < this._myDataBinding['data'].length; i++) {
          this._years.add(this._myDataBinding['data'][i]['dimensions_0'].label)
        }
        console.log(this._years)

        this._dataset = Object.fromEntries(Array.from(this._years).map(key => [key, []]))
        console.log(this._dataset)
        
        var temp = this._myDataBinding['data'][0]["dimensions_0"].label;

        this._dim = this._myDataBinding['metadata']["dimensions"]["dimensions_1"].description;
        this._mes = this._myDataBinding['metadata']['mainStructureMembers']["measures_0"].label;
        
        for (var i = 0; i < this._myDataBinding['data'].length;) {
          
          var temp1 = this._myDataBinding['data'][i]["dimensions_0"].label;
          
          while(JSON.stringify(temp) == JSON.stringify(temp1)) {

            var obj = {}
            obj[this._dim] = this._myDataBinding['data'][i]["dimensions_1"].label;
            obj[this._mes] = this._myDataBinding['data'][i]["measures_0"].raw;

            this._dataset[temp].push(obj)

            i++;

            if(i >= this._myDataBinding['data'].length) {
              break;
            }

            temp1 = this._myDataBinding['data'][i]["dimensions_0"].label;

          }

          if(i >= this._myDataBinding['data'].length) {
            break;
          }

          temp = this._myDataBinding['data'][i]["dimensions_0"].label;
        
        }

        console.log(this._dataset);
        console.log(JSON.stringify(this._dataset));
        mes = this._mes;
        dim = this._dim;

      }

      async render() {

        await getScriptPromisify('https://cdn.amcharts.com/lib/4/core.js')
        await getScriptPromisify('https://cdn.amcharts.com/lib/4/charts.js')
        await getScriptPromisify('https://cdn.amcharts.com/lib/4/themes/animated.js')

        this.transformDataset()

        am4core.useTheme(am4themes_animated);

        var chart = am4core.create(this._root, am4charts.XYChart)
        chart.padding(40, 40, 40, 40)

        chart.numberFormatter.bigNumberPrefixes = [
          { number: 1e3, suffix: 'K' },
          { number: 1e6, suffix: 'M' },
          { number: 1e9, suffix: 'B' }
        ]

        var label = chart.plotContainer.createChild(am4core.Label)
        label.x = am4core.percent(97)
        label.y = am4core.percent(95)
        label.horizontalCenter = 'right'
        label.verticalCenter = 'middle'
        label.dx = -15
        label.fontSize = 50

        var playButton = chart.plotContainer.createChild(am4core.PlayButton)
        playButton.x = am4core.percent(97)
        playButton.y = am4core.percent(95)
        playButton.dy = -2
        playButton.verticalCenter = 'middle'
        playButton.events.on('toggled', function (event) {
          if (event.target.isActive) {
            play()
          } else {
            stop()
          }
        })

        var stepDuration = 4000

        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis())
        categoryAxis.renderer.grid.template.location = 0
        categoryAxis.dataFields.category = this._dim
        categoryAxis.renderer.minGridDistance = 1
        categoryAxis.renderer.inversed = true
        categoryAxis.renderer.grid.template.disabled = true

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis())
        valueAxis.min = 0
        valueAxis.rangeChangeEasing = am4core.ease.linear
        valueAxis.rangeChangeDuration = stepDuration
        valueAxis.extraMax = 0.1

        var series = chart.series.push(new am4charts.ColumnSeries())
        series.dataFields.categoryY = this._dim
        series.dataFields.valueX = this._mes
        series.tooltipText = '{valueX.value}'
        series.columns.template.strokeOpacity = 0
        series.columns.template.column.cornerRadiusBottomRight = 5
        series.columns.template.column.cornerRadiusTopRight = 5
        series.interpolationDuration = stepDuration
        series.interpolationEasing = am4core.ease.linear

        var labelBullet = series.bullets.push(new am4charts.LabelBullet())
        labelBullet.label.horizontalCenter = 'right'
        labelBullet.label.text =
          "{values.valueX.workingValue.formatNumber('#.0as')}"
        labelBullet.label.textAlign = 'end'
        labelBullet.label.dx = -10

        chart.zoomOutButton.disabled = true

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add('fill', function (fill, target) {
          return chart.colors.getIndex(target.dataItem.index)
        })

        console.log(this._years)
        var yearArr = Array.from(this._years)
        yearArr = yearArr.sort();

        var year = yearArr[0];

        console.log("Year",year)
        label.text = year.toString()

        var interval

        function play() {
          interval = setInterval(function () {
            nextYear()
          }, stepDuration)
          nextYear()
        }

        function stop() {
          if (interval) {
            clearInterval(interval)
          }
        }

        function nextYear() {
          year++

          if (year > yearArr[yearArr.length - 1]) {
            year =yearArr[0]
          }

          var newData = allData[year]
          var itemsWithNonZero = 0

          for (var i = 0; i < chart.data.length; i++) {
            if(newData[i] != undefined) {
              chart.data[i][mes] = newData[i][mes]
              if (chart.data[i][mes] > 0) {
                itemsWithNonZero++
              }
            }
          }

          if (year == yearArr[0]) { //---------------------------------------
            series.interpolationDuration = stepDuration / 4
            valueAxis.rangeChangeDuration = stepDuration / 4
          } else {
            series.interpolationDuration = stepDuration
            valueAxis.rangeChangeDuration = stepDuration
          }

          chart.invalidateRawData()
          label.text = year.toString()

          categoryAxis.zoom({
            start: 0,
            end: itemsWithNonZero / categoryAxis.dataItems.length
          })
        }

        categoryAxis.sortBySeries = series

        // var allData = {
        //   2003: [
        //     {
        //       network: 'Facebook',
        //       MAU: 0
        //     },
        //     {
        //       network: 'Flickr',
        //       MAU: 0
        //     },
        //     {
        //       network: 'Google Buzz',
        //       MAU: 0
        //     },

        //     {
        //       network: 'Friendster',
        //       MAU: 4470000
        //     },
        //  }

        var allData = this._dataset;
        console.log("All Data", allData[year])
        chart.data = JSON.parse(JSON.stringify(allData[year]))
        categoryAxis.zoom({ start: 0, end: 1 / chart.data.length })

        series.events.on('inited', function () {
          setTimeout(function () {
            playButton.isActive = true // this starts interval
          }, 2000)
        })
      }
    }
    customElements.define('cw-barchart-race', barchartRace)
  })()
