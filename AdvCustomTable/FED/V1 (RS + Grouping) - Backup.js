var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

    ; (function (isLibAvail = false) {
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
          <div id="root" style="width: 100%; height: 100%; padding:0.5%; padding-top:0%; overflow:scroll;">
		  	<table id="example" class="table row-border" style="width:100%">
              <thead>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `

        var total_cols = 0

        class CustomTable extends HTMLElement {
            constructor() {
                console.clear()
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

            onCustomWidgetAfterUpdate(changedProperties) {
                if ('myDataBinding' in changedProperties) {
                    this.myDataBinding = changedProperties['myDataBinding']
                    this.render()
                }
            }

            // onCustomWidgetResize (width, height) {
            //   this.render()
            // }

            setResultSet(cnt, rs, col_to_row = -1, topMostHeaderSeq) {
                // console.log(rs);
                this._resultSet = {}
                this._selectionColumnsCount = cnt
                this._col_to_row = col_to_row // Row Grouping
                this._dimensions = new Set()
                this._measures = new Set()
                this._excludeHeaders = topMostHeaderSeq['Exclude']
                this._topMostHeaderSeq = topMostHeaderSeq
                delete this._topMostHeaderSeq['Exclude']
                console.log(this._topMostHeaderSeq)

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
                // total_cols = this._dimensions.length + this._measures.length

                console.log(this._resultSet)
                // console.log(this._dimensions);
                // console.log(this._measures);
                //   console.log(total_cols);

                // --------------------------------------- NEW RS

                console.log(this._topMostHeaderSeq)
                this._newResultSet = []
                this._cols =
                    this._topMostHeaderSeq[Object.keys(this._topMostHeaderSeq)[0]]
                this._newDimensions = this._dimensions.filter(
                    e =>
                        !(
                            Object.keys(this._topMostHeaderSeq).includes(e) ||
                            this._excludeHeaders.includes(e)
                        )
                )
                console.log('New Dimensions without Header Cols')
                console.log(this._newDimensions)
                console.log('Measures')
                console.log(this._measures)

                for (var i = 0; i < rs.length;) {
                    var key = rs[i][this._newDimensions[0]].description
                    var tempArr = []
                    while (key == rs[i][this._newDimensions[0]].description) {
                        tempArr = []
                        var dims = new Set()

                        // Getting Dimensions
                        for (
                            var k = 0;
                            k < this._newDimensions.length - this._selectionColumnsCount + 1;
                            k++
                        ) {
                            dims.add(rs[i][this._newDimensions[k]].description)
                        }

                        dims = Array.from(dims)

                        for (var j = 0; j < this._cols.length; j++) {
                            if (i >= rs.length) {
                                break
                            }

                            // Getting Measures
                            if (
                                this._cols[j] ==
                                rs[i][Object.keys(this._topMostHeaderSeq)[0]].description
                            ) {
                                tempArr.push(rs[i]['@MeasureDimension'].formattedValue)
                            } else {
                                while (
                                    this._cols[j] !=
                                    rs[i][Object.keys(this._topMostHeaderSeq)[0]].description
                                ) {
                                    tempArr.push('-')
                                    j += 1
                                    if (j >= this._cols.length) {
                                        break
                                    }
                                }
                                if (tempArr.length >= this._cols.length) {
                                    break
                                }
                                tempArr.push(rs[i]['@MeasureDimension'].formattedValue)
                                // j += 1;
                            }
                            key = rs[i][this._newDimensions[0]].description
                            i++
                        }
                        if (i >= rs.length) {
                            break
                        }

                        for (var sel = 0; sel < this._selectionColumnsCount; sel++) {
                            dims.push('-selection-')
                        }

                        this._newResultSet.push(dims.concat(tempArr))
                    }
                    if (i >= rs.length) {
                        // var dims = new Set();
                        // for(var k = 0; k < this._newDimensions.length - this._selectionColumnsCount + 1; k++) {
                        //     dims.add(rs[i - 1][this._newDimensions[k]].description);
                        // }

                        // dims = Array.from(dims);

                        for (var sel = 0; sel < this._selectionColumnsCount; sel++) {
                            dims.push('-selection-')
                        }

                        this._newResultSet.push(dims.concat(tempArr))

                        break
                    }
                }

                console.log('New ResultSet')
                console.log(this._newResultSet)

                // ---------------------------------------
            }

            // =====================

            // buildNestedDict(keys, currentObject = {}) {
            //     const key = keys.shift()
            //     if (!key) {
            //         return currentObject
            //     }
            //     currentObject[key] = this.buildNestedDict(keys, {})
            //     return currentObject
            // }

            // appendToDeepestChild(obj, value) {
            //     if (Object.keys(obj).length === 0) {
            //         return value
            //     }
            //     const key = Object.keys(obj)[0]
            //     obj[key] = this.appendToDeepestChild(obj[key], value)
            //     return obj
            // }

            // ====================

            applyStyling(table_css_styling, row_css_styling, col_css_styling) {
                this._tableCSS = table_css_styling
                this._rowCSS = row_css_styling
                this._colCSS = col_css_styling
                this.render()
            }

            async render() {
                if (!this._newResultSet) {
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

                var col_dimension = this._newDimensions
                var col_addOns = this._cols
                // var tbl_col = this._topMostHeaderSeq[Object.keys(this._topMostHeaderSeq)[0]];

                for (var i = 0; i < col_dimension.length; i++) {
                    table_cols.push({
                        title: col_dimension[i]
                    })
                }

                for (var i = 0; i < this._selectionColumnsCount; i++) {
                    table_cols.push({
                        title: 'Measures'
                    })
                }

                // console.log("----",this._cols);

                for (var i = 0; i < col_addOns.length; i++) {
                    table_cols.push({
                        title: col_addOns[i]
                    })
                }

                console.log('Data Table Columns : ', table_cols)

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
                            }
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
                                                table_cols.length +
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
                        // info: false,     // Showing 1 of N Entries...
                        bDestroy: true
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
                        // info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                }

                tbl.on('click', 'tbody tr', e => {
                    let classList = e.currentTarget.classList
                    tbl
                        .rows('.selected')
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    classList.add('selected')

                    // console.log(tbl.row('.selected').data())
                })

                function updateRow(
                    initial,
                    state,
                    no_of_dimensions,
                    selection_cnt
                ) {

                    // console.log(initial)

                    var selectData = tbl.row('.selected').data()
                    // console.log(selectData)

                    var row_updated_arr = selectData.slice(0, no_of_dimensions)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')

                    // var select_elements = document
                    //     .querySelector('adv-custom-table')
                    //     .shadowRoot.querySelectorAll('select')
                    // sel_arr[state.id.split('_!_')[0]] = state
                    // row_updated_arr = row_updated_arr.concat(sel_arr)

                    // var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    // console.log(selOptID)
                    // console.log(selOptVal)

                    row_updated_arr.push(state)
                    row_updated_arr = row_updated_arr.concat(selOptVal.slice(row_updated_arr.length,))

                    tbl.row('.selected').data(row_updated_arr)
                }

                window.updateRow = updateRow

                for (var i = 0; i < this._newResultSet.length; ) 
                {
                    var k = '', initial = [], firstPortionDims = [], iniCnt = i;

                    for (var j = 0; j < this._newDimensions.length; j++) {
                        k += this._newResultSet[i][j] + '_#_'
                        initial.push(this._newResultSet[i])
                        // firstPortionDims.push(this._newResultSet[i][j])
                        i++
                        if (i >= this._newResultSet.length || initial.length >= this._measures.length) {
                            break
                        }
                    }

                    // console.log(initial)

                    for(var f = iniCnt; f < iniCnt + this._newDimensions.length; f++){
                        if(this._newResultSet[f] == undefined) {
                            break
                        }
                        if(firstPortionDims.length <= 0) {
                            firstPortionDims = this._newResultSet[f].slice(0, this._newDimensions.length)
                        }
                        console.log("***",this._newResultSet[f].slice(0, this._newDimensions.length))
                    }



                    // console.log(this._newResultSet[i])
                    // for(var h = firstPortionDims.length; h < this._newDimensions.length; h++) {
                    //     if(firstPortionDims.length >= this._newDimensions.length && this._newResultSet[i][h] != undefined) {
                    //         break;
                    //     }
                    //     firstPortionDims.push(this._newResultSet[i][h])
                    // }

                    // if (!(i >= this._newResultSet.length || initial.length >= this._measures.length)) {
                    //     initial.push(this._newResultSet[i])
                    //     // firstPortionDims.push(this._newResultSet[i][j])
                    // }

                    // console.log(firstPortionDims)

                    console.log('--', k, i, initial, initial.length, this._measures.length)

                    let selectElement = `<select style="margin-top:-10%;" onChange='updateRow(${JSON.stringify(initial)}, this,  ${this._newDimensions.length}, ${this._selectionColumnsCount})'>`
                    for (var q = 0; q < this._measures.length; q++) {
                        selectElement += `<option id='${this._measures[q]}' value='${JSON.stringify(initial[q])}' >${this._measures[q]
                            }</option>`
                    }

                    if (i > this._newResultSet.length) {
                        break
                    }

                    selectElement += '</select>'
                    firstPortionDims.push(selectElement)
                    //// this._newResultSet[i][this._newDimensions.length - this._selectionColumnsCount + 1] = selectElement
                    
                    // var addRow = this._newResultSet[i].slice(0, this._newDimensions.length + this._selectionColumnsCount)
                    var addRow = firstPortionDims.concat(initial[0].slice(this._newDimensions.length + this._selectionColumnsCount, ))
                    console.log(addRow)
                    // console.log(firstPortionDims)
                    
                    tbl.row.add(addRow).draw(false)
                    // // tbl.row.add(this._newResultSet[i]).draw(false)
                }

                // Styling Block Starts

                if (this._tableCSS.length > 1) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    console.log(this._rowCSS)
                    document
                        .querySelector('adv-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector('adv-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    console.log(this._colCSS)
                    document
                        .querySelector('adv-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                // Styling Block Ends here
            }
        }
        customElements.define('adv-custom-table', CustomTable)
    })()
