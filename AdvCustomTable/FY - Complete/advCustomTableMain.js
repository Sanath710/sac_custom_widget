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
				padding: 5px;
                min-width: -webkit-fill-available;
                margin-top: -5%;
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

            setResultSet(selCnt, rs, col_to_row = -1, headers, customHeaderNames) {
                
                this._resultSet = [];
                this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                this._dateColName = "GX_ENTRY_NAME";
               
                this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(this._measureOrder[j] == rs[i]["@MeasureDimension"].description && rs[i]["@MeasureDimension"].rawValue != undefined) {
                            tempArr.push(rs[i]["@MeasureDimension"].rawValue)
                        } else {
                            while(this._measureOrder[j] != rs[i]["@MeasureDimension"].description) {
                                tempArr.push("-")
                                j+=1
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    break;
                                }
                                if(this._measureOrder[j] == rs[i]["@MeasureDimension"].description) {
                                    tempArr.push(rs[i]["@MeasureDimension"].rawValue)
                                }
                            }
                            if(tempArr.length > this._measureOrder.length) {
                                break;
                            }
                        }
                        // console.log(this._measureOrder[j], "-", rs[i]["@MeasureDimension"].description, rs[i])
                        for(var k = 0; k < this._dimensions.length; k++) {
                            dims.add(rs[i][this._dimensions[k]].description)
                        }
                        i++;
                        if(i > rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

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
                
                // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

                console.log('ResultSet Success')

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                if(this._colOrder[0] == "FY") {
                    // if(this._colOrder[0] != "FY") {
                    //     col_dimension = col_dimension.concat(this._colOrder)
                    // } 
                    if(Object.keys(this._customHeaderNames).length > 0) {
                         for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                            table_cols.push({
                                title: this._customHeaderNames["DIMEN_NAME"][i]
                            })
                        }
        
                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j]
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i]
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j]
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            table_cols.push({
                                title: col_dimension[i]
                            })
                        }
        
                        for(var j = 0; j < this._measureOrder.length; j++) {
                            table_cols.push({
                                title: col_measures[j]
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i]
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                table_cols.push({
                                    title: col_measures[j]
                                })
                            }
                        }
                    }
                }
               
                console.log('Data Table Columns : ', table_cols)

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                if (groupColumn != -1) {
                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: true, 
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
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                } else {
                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: true, 
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
                        info: false,     // Showing 1 of N Entries...
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

                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes) 
                {
                    var selectData = tbl.row('.selected').data()
                    var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    // console.log(selOptID)

                    var sliced = selOptVal.slice(no_of_dimens - no_of_excludes + no_of_mes, ), data = {};
                    // console.log(sliced)
                    for(var i = 1, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + no_of_mes)
                        i += no_of_mes
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));
                    row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state

                    var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }
                    // console.log("-----", row_updated_arr)
                    // console.log(tbl.row('.selected').data())
                    tbl.row('.selected').data(row_updated_arr)
                }

                window.updateRow = updateRow

                var dateName = new Set();

                for(var i = 0, prev_key = ""; i < this._resultSet.length;) {

                    if(this._fixedScenario.includes(this._resultSet[i][fixedScenarioAt])) {
                        var fixRows = [];
                        dateName = new Set();
                        if(this._colOrder[0] == "FY") {
                            var index = this._resultSet[i].length - this._measureOrder.length;
                            for(var j = 0; j < fixedScenarioAt; j++) {
                                fixRows.push(this._resultSet[i][j])
                            }
                            for(var k = 0; k < this._measureOrder.length; k++) {
                                fixRows.push(this._resultSet[i][index + k])
                            }
                        }
                        i+=1;
                    }

                    var key = fixRows.slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_")+"_#_";
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );
                    dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        // console.log(key, "---", tempKey)
                        for(var j = 0; j < fixedScenarioAt; j++) {
                            tempKey += this._resultSet[i][j]+"_#_"
                        }
                        // console.log(this._resultSet[i])
                        fixRows.splice(fixRows.length, 0, ...this._resultSet[i].slice(this._dimensions.length - 1, ))
                        dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        i += 1;
                    }

                    // console.log(key, "--", prev_key, "--", key != prev_key)
                    
                    if(key == prev_key) {
                        // console.log(fixRows)
                        dateName = Array.from(dateName);
                        // for(var k = 0; k < dateName.length; k++) {
                        //     options += `<option id='${k}' value='${JSON.stringify(fixRows)}'>${dateName[k]}</option>`
                        // }
                        var sliceLen = this._dimensions.length - this._excludeHeaders.length + this._measureOrder.length;
                        var sliced = fixRows.slice(sliceLen)
                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {
                            var select_html = `<select id='${k}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length})'>`;
                            var options = "";
                            for(var p = 0; p < dateName.length; p++) {
                                if(optIdx == p) {
                                    options += `<option id='${p}' value='${JSON.stringify(fixRows)}' selected>${dateName[p]}</option>`
                                } else {
                                    options += `<option id='${p}' value='${JSON.stringify(fixRows)}'>${dateName[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            // console.log("----")
                            sliced[k] = select_html;
                            k += this._measureOrder.length;
                            optIdx += 1;
                        }
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);
                        tbl.row.add(fixRows).draw(false)
                    }

                    prev_key = key;

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
