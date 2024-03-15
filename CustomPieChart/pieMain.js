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
            </div>
          `

  class customPieChart extends HTMLElement {
    constructor () {
      console.clear()
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._props = {}
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      console.log(changedProperties);
      this._myDataBinding  = changedProperties["myDataBinding"];
      console.log(this._myDataBinding);
      this.render(this._myDataBinding, this._props)
    }

    async render (myDataBinding, props) {

      await getScriptPromisify('https://cdn.amcharts.com/lib/4/core.js')
      await getScriptPromisify('https://cdn.amcharts.com/lib/4/charts.js')

      if(myDataBinding.state !== 'success') {
        return;
      }

      var chart = am4core.create(this._root, am4charts.PieChart);

      var data = [];

      var _dimensionName = myDataBinding["metadata"]["dimensions"]["dimensions_0"].description;
      var _measureName = myDataBinding["metadata"]["mainStructureMembers"]["measures_0"].label;

      var _dimensionName = 'City';
      var _measureName = 'Income';

      console.log(_dimensionName);
      console.log(_measureName);

      for(var i = 0; i < myDataBinding["data"].length; i++) {
        var obj = {};
        obj[_dimensionName] = myDataBinding["data"][i]["dimensions_0"].label;
        obj[_measureName] = myDataBinding["data"][i]["measures_0"].raw;
        data.push(obj);
      }

      chart.data = data;
      console.log(data);
      
      // // Add data
      // chart.data = [
      //   {
      //     country: 'Lithuania',
      //     litres: 501.9
      //   },
      //   {
      //     country: 'Czechia',
      //     litres: 301.9
      //   },
      //   {
      //     country: 'Ireland',
      //     litres: 201.1
      //   },
      //   {
      //     country: 'Germany',
      //     litres: 165.8
      //   },
      //   {
      //     country: 'Australia',
      //     litres: 139.9
      //   },
      //   {
      //     country: 'Austria',
      //     litres: 128.3
      //   },
      //   {
      //     country: 'UK',
      //     litres: 99
      //   },
      //   {
      //     country: 'Belgium',
      //     litres: 60
      //   },
      //   {
      //     country: 'The Netherlands',
      //     litres: 50
      //   }
      // ]

      // Add and configure Series
      var pieSeries = chart.series.push(new am4charts.PieSeries())

      // chart.events.on("hit", function(params){
      //   console.log("hello");
      //   console.log(params)
      // })

      
      pieSeries.slices.template.events.on("hit", function(ev){

        const selection = [];
        var series = ev.target.dataItem.component;
        
        series.slices.each(function(item) {
          if (item.isActive) {
            var k = {};
            k[_dimensionName] = item.dataItem._dataContext[_dimensionName]
            selection.push(k)
            console.log(item.dataItem._dataContext[_dimensionName]);
          }
        }) 

        const linkedAnalysis = props["dataBindings"].getDataBinding('myDataBinding').getLinkedAnalysis();

        if(selection.length > 0) {
          console.log("hello");
          linkedAnalysis.setFilters(selection);
        } else {
          linkedAnalysis.removeFilters();
        }
        
      });

      pieSeries.dataFields.value = _measureName;
      pieSeries.dataFields.category = _dimensionName;

    }
  }
  customElements.define('sample-pie', customPieChart);
})()
