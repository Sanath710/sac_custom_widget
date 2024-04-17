var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

;(function (isLibAvail = false) {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            
            table.table.dataTable.table-striped > tbody > tr {
              border:0.1px solid #dee2e6;
              padding:1.2%;
            }

            table.dataTable thead th, table.dataTable thead td, table.dataTable tbody tr , table.dataTable tbody td  {
                border: none;
            }

            #example td {
                border-color: inherit;
                border-style: none;
                border-width: 0;
            }

            /*
            #example td:nth-of-type(1) {
                background-color:red!important;
            }
            */

			table.table.dataTable.table-striped > tbody > tr > td {
				padding-top:1%;
			}

			table.table.dataTable.table-striped > tbody > tr.group {
				background-color: rgb(187, 211, 247)!important;
			}

			table.table.dataTable.table-striped > tbody > tr.group:nth-of-type(2n+1) > * {
				box-shadow: none!important;
				background-color: rgb(187, 211, 247)!important;
			}
	
			select {
				background-color: #3498db; 
				color: #fff; 
				padding: 2px;
				border: none;
				border-radius: 5px;
			}

          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.js"></script>
          <div id="root" style="width: 100%; height: 100%; padding:1.5%;overflow:scroll;">
		  	<table id="example" class="table row-border" style="width:100%">
              <thead>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `

  var total_cols = 0

  class CustomTable extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._table = this._shadowRoot.getElementById('example')
      this._props = {}
      this.render()
    }

    // onCustomWidgetBeforeUpdate(changedProperties) {
    //   this._props = { ...this._props, ...changedProperties };
    // }

    // onCustomWidgetAfterUpdate(changedProperties) {
    //   if ("myDataBinding" in changedProperties) {
    //     this.myDataBinding = changedProperties["myDataBinding"];
    //   }
    // }

    // onCustomWidgetResize (width, height) {
    //   this.render()
    // }

    async setResultSet (cnt, rs, col_to_row = -1) {
      var rs = await rs
      // console.log(rs);
      this._resultSet = {}
      this._selectionColumnsCount = cnt
      this._col_to_row = col_to_row // Row Grouping
      this._dimensions = new Set()
      this._measures = new Set()

      for (var i = 0; i < rs.length; i++) {
        var k = ''
        var rs_keys = Object.keys(rs[i])

        for (var j = 0; j < rs_keys.length; j++) {
          if (rs_keys[j] != '@MeasureDimension') {
            k += rs[i][rs_keys[j]].id + '_#_'
          }

          if (
            !(rs_keys[j] in this._dimensions) &&
            rs_keys[j] != '@MeasureDimension'
          ) {
            this._dimensions.add(rs_keys[j])
          }
        }

        if (!this._resultSet.hasOwnProperty(k)) {
          this._resultSet[k] = []
        }

        var mObj = {}
        mObj[rs[i]['@MeasureDimension'].description] =
          rs[i]['@MeasureDimension'].rawValue
        this._measures.add(rs[i]['@MeasureDimension'].description)

        this._resultSet[k].push(mObj)
      }

      this._dimensions = Array.from(this._dimensions)
      this._measures = Array.from(this._measures)
      total_cols = this._dimensions.length + this._measures.length

      console.log(this._resultSet)
      // console.log(this._dimensions);
      // console.log(this._measures);
      // console.log(total_cols);
    }

    applyStyling (table_css_styling, row_css_styling, col_css_styling) {

      this._tableCSS = table_css_styling
      this._rowCSS = row_css_styling
      this._colCSS = col_css_styling

      this.render()
    }

    async render () {
      if (!this._resultSet) {
        return
      }

      if (!isLibAvail) {
        await getScriptPromisify(
          'https://cdn.datatables.net/2.0.1/js/dataTables.js'
        )
        await getScriptPromisify(
          'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
        )
        await getScriptPromisify(
          'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
        )
        await getScriptPromisify(
          'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
        )
        await getScriptPromisify(
          'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
        )
        isLibAvail = true
      }
      //   await getScriptPromisify(
      //     'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      //   )
      //   await getScriptPromisify(
      //     'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js'
      //   )
      //   await getScriptPromisify(
      //     'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js'
      //   )
      //   await getScriptPromisify(
      //     'https://cdn.datatables.net/buttons/3.0.0/js/buttons.html5.min.js'
      //   )
      //   await getScriptPromisify(
      //     'https://cdn.datatables.net/buttons/3.0.0/js/buttons.print.min.js'
      //   )

      // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

      console.log('ResultSet Success')

      var table_cols = []

      var col_dimension = this._dimensions
      var col_measure = this._measures

      for (var i = 0; i < col_dimension.length; i++) {
        table_cols.push({
          title: col_dimension[i]
        })
      }

      for (var i = 0; i < col_measure.length; i++) {
        table_cols.push({
          title: col_measure[i]
        })
      }

      //   console.log(table_cols);

      var groupColumn = this._col_to_row

      var tbl = undefined
      if (groupColumn != -1) {
        tbl = new DataTable(this._table, {
          layout: {},
          columns: table_cols,
          columnDefs: [
            {
              defaultContent: '-',
              targets: '_all',
              visible: false,
              targets: groupColumn
              // className: 'dt-body-left'
            },
            { width: '100%', targets: 1 }
          ],
          order: [[groupColumn, 'asc']],
          displayLength: 25,
          drawCallback: function (settings) {
            var api = this.api()
            var rows = api.rows({ page: 'current' }).nodes()
            var last = null

            api
              .column(groupColumn, { page: 'current' })
              .data()
              .each(function (group, i) {
                if (last !== group) {
                  $(rows)
                    .eq(i)
                    .before(
                      '<tr class="group" style="background-color:#eee!important;"><td colspan="' +
                        total_cols +
                        '">' +
                        group +
                        '</td></tr>'
                    )

                  last = group
                }
              })
          },
          bPaginate: false,
          searching: false,
          ordering: false,
          bDestroy: true,
        })
      } else {
        tbl = new DataTable(this._table, {
          layout: {},
          columns: table_cols,
          columnDefs: [
            {
              defaultContent: '-',
              targets: '_all'
              // className: 'dt-body-left'
            }
          ],
          bPaginate: false,
          searching: false,
          ordering: false,
          bDestroy: true,
        })
      }

      // const tbl = new DataTable(this._table, {
      // 	layout: {
      // 		topStart: {
      // 			buttons: ['copy', 'excel', 'pdf', 'colvis']
      // 		}
      // 	},
      // 	columns: table_cols,
      // 	columnDefs: [
      // 		{
      // 			defaultContent: '-',
      // 			targets: '_all',
      // 			visible: false, targets: groupColumn
      // 			// className: 'dt-body-left'
      // 		}
      // 	],
      // 	order: [[groupColumn, 'asc']],
      // 	displayLength: 25,
      // 	drawCallback: function (settings) {
      // 		var api = this.api();
      // 		var rows = api.rows({ page: 'current' }).nodes();
      // 		var last = null;

      // 		api.column(groupColumn, { page: 'current' })
      // 			.data()
      // 			.each(function (group, i) {
      // 				if (last !== group) {
      // 					$(rows)
      // 						.eq(i)
      // 						.before(
      // 							'<tr class="group"><td colspan="'+(total_cols)+'">' +
      // 							group +
      // 							'</td></tr>'
      // 						);

      // 					last = group;
      // 				}
      // 			});
      // 	},
      // 	bPaginate: false,
      // 	bDestroy: true
      // })

      tbl.on('click', 'tbody tr', e => {
        let classList = e.currentTarget.classList
        tbl
          .rows('.selected')
          .nodes()
          .each(row => row.classList.remove('selected'))
        classList.add('selected')

        // console.log(tbl.row('.selected').data())
      })

      function updateRow (
        result_obj,
        state,
        no_of_dimensions,
        no_of_selections,
        no_of_measures,
        selection_cnt
      ) {
        var selectData = tbl.row('.selected').data()
        var search_key = state.value
        var final_search_id = state.value + '_#_'
        var row_updated_arr = selectData.slice(
          0,
          no_of_dimensions - no_of_selections
        )
        var sel_arr = selectData.slice(
          no_of_dimensions - no_of_selections,
          no_of_dimensions
        )

        state
          .getElementsByTagName('option')
          [state.options.selectedIndex].setAttribute('selected', 'selected')

        var select_elements = document
          .querySelector('adv-custom-table')
          .shadowRoot.querySelectorAll('select')
        sel_arr[state.id.split('_!_')[0]] = state
        row_updated_arr = row_updated_arr.concat(sel_arr)

        const getSelectedText = el => {
          if (el.selectedIndex === -1) {
            return null
          }
          return el.options[el.selectedIndex].text
        }

        for (var i = 0, cntr = 0; i < select_elements.length; i++) {
          var k = select_elements[i].id
            .split('_#_')
            .slice(0, no_of_dimensions - no_of_selections)
            .join('_#_')
            .split('_!_')
            .slice(1)
          if (k == search_key) {
            // #Bug Fixed... Pass extra variable selection_cnt to function for conditional termination of loop
            if (cntr >= selection_cnt) {
              break
            }

            var node_val = getSelectedText(select_elements[i])
            final_search_id += node_val + '_#_'
            cntr += 1
          }
        }

        if (result_obj[final_search_id] == undefined) {
          for (var i = 0; i < no_of_measures; i++) {
            row_updated_arr.push('-')
          }
          tbl.row('.selected').data(row_updated_arr)
          return
        }

        for (var i = 0; i < result_obj[final_search_id].length; i++) {
          for (var s in result_obj[final_search_id][i]) {
            row_updated_arr.push(result_obj[final_search_id][i][s])
          }
        }

        tbl.row('.selected').data(row_updated_arr)
      }

      window.updateRow = updateRow

      var dim = Object.keys(this._resultSet)[0].split('_#_')
      dim.pop()

      var only_dims = dim.slice(0, -Math.abs(this._selectionColumnsCount))

      for (
        var i = 0, init_index = 0;
        i < Object.keys(this._resultSet).length;

      ) {
        only_dims = dim.slice(0, -Math.abs(this._selectionColumnsCount))

        var temp_dim = Object.keys(this._resultSet)[i].split('_#_')
        temp_dim.pop()
        var selections = temp_dim.slice(-Math.abs(this._selectionColumnsCount))
        var c = selections.slice()

        for (var j = 0; j < this._selectionColumnsCount; j++) {
          temp_dim.pop()
        }

        for (var j = 0; j < selections.length; j++) {
          selections[j] = `<select id="${j}_!_${temp_dim
            .slice(0, this._dimensions.length - this._selectionColumnsCount)
            .join('_#_')}" onChange='updateRow(${JSON.stringify(
            this._resultSet
          )}, this, ${this._dimensions.length}, ${
            this._selectionColumnsCount
          }, ${this._measures.length}, ${this._selectionColumnsCount})'>`
        }

        for (var j = 0; j < c.length; j++) {
          c[j] = new Set()
        }

        while (JSON.stringify(only_dims) == JSON.stringify(temp_dim)) {
          var temp_dim = Object.keys(this._resultSet)[i].split('_#_')
          temp_dim.pop()

          var selections_arr = temp_dim.slice(
            -Math.abs(this._selectionColumnsCount)
          )

          for (var j = 0; j < this._selectionColumnsCount; j++) {
            temp_dim.pop()
          }

          if (JSON.stringify(only_dims) != JSON.stringify(temp_dim)) {
            break
          }

          for (var k = 0; k < selections.length; k++) {
            var opt =
              '<option id="' +
              selections_arr[k] +
              '" value="' +
              temp_dim.join('_#_') +
              '">' +
              selections_arr[k] +
              '</option>'
            c[k].add(opt)
          }

          i += 1
          init_index += 1

          if (i >= Object.keys(this._resultSet).length) {
            break
          }
        }

        for (var s = 0; s < c.length; s++) {
          c[s].forEach(function (val) {
            selections[s] += val
          })
          selections[s] += '</select>'
        }

        var final_row = only_dims.concat(selections)

        for (var s in this._resultSet[dim.join('_#_') + '_#_']) {
          for (k in this._resultSet[dim.join('_#_') + '_#_'][s]) {
            final_row.push(this._resultSet[dim.join('_#_') + '_#_'][s][k])
          }
        }

        tbl.row.add(final_row).draw(false)
        selections = []

        if (i >= Object.keys(this._resultSet).length) {
          break
        }

        dim = Object.keys(this._resultSet)[i].split('_#_')
        dim.pop()
      }

      // Styling Block Starts

      if (this._tableCSS.length > 1) {
        console.log(this._tableCSS)
        this._table.style.cssText = this._tableCSS
      }

      if (this._rowCSS.length > 1) {
        console.log(this._rowCSS)
        document.querySelector('adv-custom-table').shadowRoot.querySelectorAll('td').forEach(el => (el.style.cssText = this._rowCSS))
        document.querySelector('adv-custom-table').shadowRoot.querySelectorAll('th').forEach(el => (el.style.cssText = this._rowCSS))
      }

      if(this._colCSS.length > 1) {
        console.log(this._colCSS)
        document.querySelector("adv-custom-table").shadowRoot.querySelector("style").innerText += this._colCSS
      }

      // Styling Block Ends here
    }
  }
  customElements.define('adv-custom-table', CustomTable)
})()
