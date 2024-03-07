var getScriptPromisify = src => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
    })
  }
  
  ;(function () {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
            <style type="text/css">
              @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
              @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
              @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
              
              input[type="search"]  {
                border:1px solid #dee2e6;
              }
  
              table.table.dataTable.table-striped > tbody > tr {
                border:0.1px solid #dee2e6;
                padding:1.2%;
              }
  
              table.table.dataTable.table-striped > tbody > tr > td {
                  padding-top:1%;
              }
  
              table.table.dataTable.table-striped > tbody > tr:nth-of-type(2n+1) > * {
                background-color:#f2f2f2;
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
            <div id="root" style="width: 100%; height: 100%; padding:1.5%;display:grid;">
            <table id="example" class="table table-striped" style="width:100%">
                <thead>
                </thead>
                <tbody></tbody>
              </table>
            </div>
           
          `
  
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
  
      onCustomWidgetBeforeUpdate (changedProperties) {
        this._props = { ...this._props, ...changedProperties }
      }
  
      onCustomWidgetAfterUpdate (changedProperties) {
        if ('myDataBinding' in changedProperties) {
          this.myDataBinding = changedProperties['myDataBinding']
          // this.render()
        }
      //   console.log('hello1')
      //   console.log(this.myDataBinding)
      }
  
      // onCustomWidgetResize (width, height) {
      //   this.render()
      // }
  
      async render () {
        // await getScriptPromisify('https://code.jquery.com/jquery-3.7.1.js');
  
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
        await getScriptPromisify(
          'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
        )
        await getScriptPromisify(
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js'
        )
        await getScriptPromisify(
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js'
        )
        await getScriptPromisify(
          'https://cdn.datatables.net/buttons/3.0.0/js/buttons.html5.min.js'
        )
        await getScriptPromisify(
          'https://cdn.datatables.net/buttons/3.0.0/js/buttons.print.min.js'
        )
        // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')
  
        if (!this.myDataBinding || this.myDataBinding.state !== 'success') {
          return
        }
  
        console.log('Data Binding Success')
  
        var table_cols = []
  
        var col_dimension = this.myDataBinding.metadata.dimensions
        var col_measure = this.myDataBinding.metadata.mainStructureMembers
  
        for (
          var i = 0;
          i < this.myDataBinding.metadata.feeds.dimensions.values.length;
          i++
        ) {
          var k = 'dimensions_' + i.toString()
          table_cols.push({
            title: col_dimension[k].id
          })
        }
  
        for (
          var i = 0;
          i < this.myDataBinding.metadata.feeds.measures.values.length;
          i++
        ) {
          var k = 'measures_' + i.toString()
          table_cols.push({
            title: col_measure[k].id
          })
        }
  
        console.log(table_cols)
  
        //   this._table.append(
        //     $('<tfoot/>').append($("#example thead tr").clone())
        // );
  
        const tbl = new DataTable(this._table, {
          // initComplete: function () {
          //   this.api()
          //     .columns()
          //     .every(function () {
          //       let column = this
  
          //       // Create select element
          //       let select = document.createElement('select')
          //       select.add(new Option('Select'))
          //       column.header().replaceChildren(select)
  
          //       // Apply listener for user change in value
          //       select.addEventListener('change', function () {
          //         column.search(select.value, { exact: true }).draw()
          //       })
  
          //       // Add list of options
          //       column
          //         .data()
          //         .unique()
          //         .sort()
          //         .each(function (d, j) {
          //           select.add(new Option(d))
          //         })
          //     })
          // },
          layout: {
            topStart: {
              buttons: ['copy', 'excel', 'pdf', 'colvis']
            }
          },
          columns: table_cols,
          columnDefs: [
            {
              defaultContent: '-',
              targets: '_all'
              // className: 'dt-body-left'
            }
          ],
          bDestroy: true
        })
  
        tbl.on('click', 'tbody tr', e => {
          let classList = e.currentTarget.classList
  
          // if (classList.contains('selected')) {
          //   classList.remove('selected')
          // } else {
          tbl
            .rows('.selected')
            .nodes()
            .each(row => row.classList.remove('selected'))
          classList.add('selected')
  
          // console.log(tbl.row('.selected').data())
          // console.log(localStorage.getItem('measureKey'));
  
          // var selectData = tbl.row('.selected').data();
          // var lStorage = JSON.parse(localStorage.getItem('measureKey'));
          // console.log( lStorage['measures_0'].raw)
  
          // tbl.row('.selected').data([selectData[0], selectData[1], selectData[2], lStorage['measures_0'].raw, lStorage['measures_1'].raw]);
          // this._currentElement.innerText = "hello";
  
          // tbl.row(".selected").data([1,2,3,4,5]).draw();
  
          // }
        })
  
        //   tbl.on('click', 'td', function () {
        //     // var cell = tbl.cell(this);
        //     console.log(tbl.row('.selected').data())
        //     // console.log(cell.data());
        //     // note - call draw() to update the table's draw state with the new data
        // });
  
        //   tbl.on('click', 'tr', function () {
        //     var id = tbl.row(this).data();
  
        //     // alert('Clicked row id ' + id);
        // });
  
        // console.log(this.myDataBinding)
  
        var transformed_data = []
  
        var cnt_dimensions = this.myDataBinding.metadata.feeds.dimensions.values
        var cnt_measures = this.myDataBinding.metadata.feeds.measures.values
  
        for (var i = 0; i < this.myDataBinding.data.length; i++) {
          // var tbl_row_data = []
  
          // Dynamic 'N' keys
          var key = ''
  
          for (var j = 0; j < cnt_dimensions.length; j++) {
            var dim_key = cnt_dimensions[j]
            key += this.myDataBinding.data[i][dim_key].label + '_#_'
            // tbl_row_data.push(this.myDataBinding.data[i][dim_key].label)
          }
  
          //  Dynamic 'N' values
          var measure_objs = {}
  
          for (var j = 0; j < cnt_measures.length; j++) {
            var measure_key = cnt_measures[j]
            measure_objs[measure_key] = this.myDataBinding.data[i][measure_key]
            // tbl_row_data.push(this.myDataBinding.data[i][measure_key].formatted)
          }
  
          // if (tbl_row_data.length > 0) {
          //   tbl.row.add(tbl_row_data).draw(false)
          //   tbl.columns.adjust().draw()
          // }
          // console.log("Tbl");
          // console.log(tbl_row_data);
  
          var temp_obj = {}
          temp_obj[key] = measure_objs
  
          transformed_data.push(temp_obj)
        }
  
        console.log('Formatted Data')
        console.log(transformed_data)
  
        var dim = Object.keys(transformed_data[0])[0].split('_#_')
        $('select').on('change', function (e) {
          console.log('hello' + e)
        })
  
        function updateData (val, state) {
          var selectData = tbl.row('.selected').data()
          var parsedData = JSON.parse(val)
  
          var row_updated_arr = []
  
          for (
            var i = 0;
            i < selectData.length - Object.keys(parsedData).length;
            i++
          ) {
            row_updated_arr.push(selectData[i])
          }
  
          for (var s in parsedData) {
            row_updated_arr.push(parsedData[s].raw)
          }
  
          // console.log(row_updated_arr)
          state
            .getElementsByTagName('option')
            [state.options.selectedIndex].setAttribute('selected', 'selected')
          row_updated_arr[2] = state
          tbl.row('.selected').data(row_updated_arr)
  
          // console.log(tbl.row('.selected').data()[2])
          // console.log(state);
  
          // tbl
          // 	.row('.selected')
          // 	.data([
          // 		selectData[0],
          // 		selectData[1],
          // 		selectData[2],
          // 		parsedData['measures_0'].raw,
          // 		parsedData['measures_1'].raw
          // 	])
        }
  
        window.updateData = updateData
  
        function setSelectedOption (state) {
          // var v = state.value
          // console.log(v);
          // state.value = v;
          // state.options[state.options.selectedIndex].selected = true;
          // state.getElementsByTagName("option")[state.options.selectedIndex].setAttribute("selected", "selected");
          // console.log(state);
          // state.options[state.options.selectedIndex].selected = true;
          // console.log(state[state.selectedIndex].id);
          // console.log(state.value);
        }
  
        window.setSelectedOption = setSelectedOption
  
        // }localStorage.setItem(\"measureKey\",this.value)
        for (var i = 0, init_index = 0; i < transformed_data.length; ) {
          var dim_year =
            "<select id='" +
            Object.keys(transformed_data[i]) +
            "' onChange='updateData(this.value, this);'>"
  
          var temp_dim = Object.keys(transformed_data[i])[0].split('_#_')
  
          // console.log(Object.keys(transformed_data[i]).length);
          // var init_index = 0;
          // console.log(transformed_data[i][trans_key]);
          // break;
  
          while (dim[0] == temp_dim[0] && dim[1] == temp_dim[1]) {
            var opt_key = Object.keys(transformed_data[i])
            // console.log(transformed_data[i][opt_key])
  
            dim_year +=
              "<option id='" +
              init_index +
              "' value='" +
              JSON.stringify(transformed_data[i][opt_key]) +
              "'>" +
              temp_dim[2] +
              '</option>'
            i += 1
            init_index += 1
            if (i >= transformed_data.length) {
              break
            }
            temp_dim = Object.keys(transformed_data[i])[0].split('_#_')
          }
  
          dim_year += '</select>'
  
          var row_arr = [dim[0], dim[1], dim_year]
  
          var k = Object.keys(transformed_data[i - init_index])
          for (var s in transformed_data[i - init_index][k]) {
            row_arr.push(transformed_data[i - init_index][k][s].raw)
          }
  
          init_index = 0
  
          tbl.row.add(row_arr).draw(false)
          // console.log(transformed_data[init_index])
          // console.log(transformed_data[init_index][k])
  
          if (i >= transformed_data.length) {
            break
          }
  
          dim = Object.keys(transformed_data[i])[0].split('_#_')
          dim_year = ''
  
          // console.log(dim);
          // if(i > 8) {
          //   break;
          // }
        }
      }
    }
  
    customElements.define('custom-table', CustomTable)
  })()
  