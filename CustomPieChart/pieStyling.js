var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}
;(function () {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
        <style>
              #pallete-box input[type="color"] {
                appearance: none;
                width: 27px;
                height: 32px;
                border-radius: 100%;
                border: none;
                margin: 1px;
                padding-left: 1%;
                padding-right: 1%;
                padding-top: 1.5%;
                overflow: hidden;
                background-color: transparent;
                cursor: pointer;
            }
    
            // input[type="color" i]::-webkit-color-swatch {
            //     border-radius: 100%;
            // }
            
            #pallete-box {
                margin: 0%;
                margin-right: 2%;
                padding-left: 1.5%;
                padding-right: 1.5%;
                width: max-content;
            }
    
            button {
                background-color: #24a0ed;
                border: none;
                color: white;
                padding: 12px 12px;
                text-align: center;
                font-size: 14px;
                margin: 0px;
                transition-duration: 0.4s;
                cursor: pointer;
            }
    
            section {
                margin-left: 2%;
                padding: 0.2%;
                border: 1px solid #bfbfbf;
            }
        </style>
        <div id="root-styling" style="width: 100%; height: 100%;">
            <span style="display:flex;">
                <section id="pallete-box" style="display: none;">
                    <input type="color" name="color1" value="#a4133c" id="color1" style="margin-left:0%!important;"/>
                    <input type="color" name="color2" value="#c9184a" id="color2" />
                    <input type="color" name="color3" value="#ff4d6d" id="color3" />
                    <input type="color" name="color4" value="#ff758f" id="color4" />
                    <input type="color" name="color5" value="#ff8fa3" id="color5" />
                    <input type="color" name="color6" value="#ffb3c1" id="color6" />
                    <input type="color" name="color7" value="#ffccd5" id="color7" />
                </section>
                <button id="btnChooseColor">Choose Colors</button>
            </span>
        </div>
            `

  class customPieChartStyling extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root-styling')
      this._props = {}
      this._shadowRoot
        .getElementById('btnChooseColor')
        .addEventListener('click', this.palleteVisibility.bind(this));
    }

    onCustomWidgetBeforeUpdate (changedProperties) {
      this._props = { ...this._props, ...changedProperties }
    }

    onCustomWidgetAfterUpdate (changedProperties) {
      console.log(changedProperties)
      this.myDataBinding = changedProperties["myDataBinding"];
    }

    palleteVisibility () {
      var pallete_box = document
        .querySelector('cw-pie-styling')
        .shadowRoot.querySelector('#pallete-box')
      var btnColor = document
        .querySelector('cw-pie-styling')
        .shadowRoot.querySelector('#btnChooseColor')
      var visibility = pallete_box.checkVisibility()

      if (visibility) {

        pallete_box.style.display = 'none'
        btnColor.innerHTML = 'Choose Color'

        var colorPallateArr = []
        for (var i = 1; i <= 7; i++) {
          colorPallateArr.push(
            document
              .querySelector('cw-pie-styling')
              .shadowRoot.querySelector('#color' + i).value
          )
        }
        
        // this.colorPallate = colorPallateArr
        // console.log(this.colorPallate)

        // setColorPallate(colorPallateArr)

        this.colorPallate = colorPallateArr;

        this.dispatchEvent(
          new CustomEvent('propertiesChanged', {
            detail: {
              properties: {
                colorPallate: colorPallateArr
              }
            }
          })
        )
        return
      }

      pallete_box.style.display = 'block'
      btnColor.innerHTML = 'Apply Color'
    }

    // set setColorPallate(colorPallateArr) {
    //     this.colorPallate = colorPallateArr;
    // }

    // getColors () {
    //   var colorPallateArr = []
    //   for (var i = 1; i <= 7; i++) {
    //     colorPallateArr.push(
    //       document
    //         .querySelector('cw-pie-styling')
    //         .shadowRoot.querySelector('#color' + i).value
    //     )
    //   }
    //   this.colorPallate = colorPallateArr;
    //   console.log(colorPallateArr)
    // }
  }

  customElements.define('cw-pie-styling', customPieChartStyling)
})()
