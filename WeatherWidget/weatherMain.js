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
                  <div id="map_div" style="width: 100%; height: 100%;">
                  </div>
                `

  class WeatherWidget extends HTMLElement {
    constructor () {
      //   console.clear()
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('map_div')
      this._props = {}
    }

    onCustomWidgetBeforeUpdate (changedProperties) {
      this._props = { ...this._props, ...changedProperties }
    }

    onCustomWidgetAfterUpdate (changedProperties) {
      this._myDataBinding = changedProperties['myDataBinding']
      console.log('After Update')
      console.log(this._myDataBinding)
      this.render()
    }

    async render () {
      await getScriptPromisify('https://www.gstatic.com/charts/loader.js')

      if (this._myDataBinding.state != 'success') {
        return
      }
    }
  }
  customElements.define('cw-weather-widget', WeatherWidget)
})()
