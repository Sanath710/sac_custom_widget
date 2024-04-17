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
            
            /*
            table.table.dataTable.table-striped > tbody > tr {
              border:0.1px solid #dee2e6;
              padding:1.2%;
            }
            */

            /*
            table.dataTable thead th, table.dataTable thead td, table.dataTable tbody tr , table.dataTable tbody td  {
                border: none;
            }
            */

            /*
            #example td:nth-of-type(1) {
                background-color:red!important;
            }
            */

            /*
			table.table.dataTable.table-striped > tbody > tr > td {
				padding-top:1%;
			}
            */

            /*
			table.table.dataTable.table-striped > tbody > tr.group {
				background-color: rgb(187, 211, 247)!important;
			}
            */

            /*
			table.table.dataTable.table-striped > tbody > tr.group:nth-of-type(2n+1) > * {
				box-shadow: none!important;
				background-color: rgb(187, 211, 247)!important;
			}
            */
	
            /*
			select {
				background-color: transparent;
                font-family: Arial;
                font-size:14px;
                text-align: center;

				padding: 5px;
                min-width: -webkit-fill-available;
                margin-top: -5%;
				border: none;
				border-radius: 5px;
			}
            */

            /* ------------------------- CUSTOM STYLING --------------------------------- */

            select {
                padding-top:0%;
                background-color:inherit;
                outline:none;
            }

            #example th {
                border-bottom: 1px solid #CBCBCB;
                background-color:#F2F2F2;
                align-content: center;
                font-family: Arial;
                color:black;
                font-size:14px;
            }

            /* ------------------------- TOP MOST - HEADER ROW ------------------------- */

            #example .top-header {
                height:32px;
                max-height:32px;
                font-family: Arial;
                color:black;
                font-size:14px;
                font-weight:bold;
                text-align: center;
                padding-top:0%!important;
                padding-bottom:0%!important;
            }

            /* ------------------------- BASE CASE ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(2) {
                background-color:#E0E0E0;
            }

            /* ------------------------- SCENARIO 1 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(3) {
                background-color:#D9D9D9;
            }

            /* ------------------------- SCENARIO 2 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(4) {
                background-color:#CBCBCB;
            }

            /* ------------------------- SCENARIO 3 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(5) {
                background-color:#BDBDBD;
            }

            /* ------------------------- 2nd MOST HEADER ------------------------- */
            
            #example > thead > tr:nth-child(2) {
                height:48px; 
            }

            /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */

            .scenarios {
                background-color:inherit;
                font-family: Arial;
                color:black;
                font-size:14px;
                text-align:center;
                font-weight:bold;
                height:30px;
                border:none;
                cursor: pointer;
            }

            /* ------------------------- GROUPED ROW ------------------------- */

            #example .group > td {
                height:32px;
                padding: 0px 10px!important;
                align-content: center;
                font-weight:bold;
                color: #212121;
                font-family: Arial;
                background-color:#E0E0E0
            }

            /* ------------------------- NORMAL ROW ------------------------- */

            #example td {
                background-color:white;
                height:48px;
                border-bottom:1px solid #CBCBCB!important;
                font-family: Arial;
                font-size:14px;
                align-content: center;
            }

            /* ------------------------- ROW LEVEL SELECT ------------------------- */

            #example .row_level_select {
                font-family: Arial;
                font-size: 14px;
                height: 30px;
                background-color: #DCE6EF;
                border-radius:4px;
                border:none;
                outline:none;
                cursor: pointer;
            }
 
            /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */

            #example .truncate {
                max-width:130px;
                padding-left: 2%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.js"></script>
          <div id="root" style="width: 100%; height: 100%; padding:0.5%; padding-top:0%; overflow: scroll;">
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
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []
                for(var i = 19; i < table_cols.length; i++) {
                    hideCols.push(i)
                }
                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : hideCols,
                                visible: false,
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:1, className:"truncate"
                            }
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
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
                                                '<tr class="group"><td colspan="' +
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
                                targets: hideCols, //_all
                                visible:false
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

                // Top Most Header Block Starts
                var topHeader = "<tr>";
                
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
                // 
                // for(var i = 0; i < this._scenarioOrder.length; i++) {
               
                for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                    if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                        topHeader += `<th class='top-header' colspan='${this._measureOrder.length + 1}'>${this._scenarioOrder[i]}</th>`
                    } else {
                        topHeader += 
                        `<th class='top-header' colspan='${this._measureOrder.length + 1}'>
                            <select id='${i}' class='scenarios' onchange='updateColumns(this, ${this._dimensions.length}, ${this._excludeHeaders.length}, ${this._measureOrder.length}, ${this._scenarioOrder.length - this._fixedScenario.length})'>`;
                            var opts = ""
                            for(var j = 0; j < this._scenarioOrder.length; j++) {
                                if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                    if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                        opts += `<option  id='${j}' selected>${this._scenarioOrder[j]}</option>`;
                                    } else {
                                        opts += `<option id='${j}' >${this._scenarioOrder[j]}</option>`;
                                    }
                                }
                            }
                        topHeader += opts + `</select>
                        </th>`
                    }
                }
                

                topHeader += "</tr>";

                document.querySelector("adv-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);

                // console.log(topHeader)
               
                // Top Most Header Block Ends


                tbl.on('click', 'tbody tr', e => {
                    let classList = e.currentTarget.classList
                    tbl
                        .rows('.selected')
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    classList.add('selected')
                    // console.log(tbl.row('.selected').data())
                })
                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var fixRowsObj = {};
                const masterRows = [];
                var hMap = {};
                var is_col_updated = false;

                function updateColumns(state, no_of_dimens, no_of_excludes, no_of_mes, scenario_len) {

                    is_col_updated = true;
                    console.log("MASTER", masterRows)
                    var selectData = tbl.rows().data()
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    var sliceTill = no_of_dimens - no_of_excludes + ((no_of_mes + 1) * selOptID);

                    for(var i = 0; i < scenario_len; i++) {
                        var idxAt = no_of_dimens - no_of_excludes + no_of_mes + ((no_of_mes + 1) * i);
                        hMap[i] = idxAt
                    }

                    console.log("HMAP - ",hMap);

                    for(var i = 0; i < selectData.length; i++) {

                        var updatedColData = selectData[i]; 
                        var mr = masterRows[i].slice(sliceTill - 1, sliceTill + no_of_mes);
                        // console.log("MR", mr, "----", hMap[state.id - 1], "---", state.id)
                        // console.log(mr, "---", mr.length, "---", updatedColData, "+++", hMap[state.id - 1])

                        for(var j = 0, cntr = hMap[state.id - 1]; j < mr.length; j++) {
                            if(j == 0) {
                                if(updatedColData[cntr].id == undefined) {
                                    const parser = new DOMParser();
                                    const htmlDoc = parser.parseFromString(updatedColData[cntr], 'text/html'); 
                                    var idx_0_state = htmlDoc.getElementsByTagName("select")[0];
                                    idx_0_state.getElementsByTagName("option")[selOptID - 1].selected = 'selected';
                                    updatedColData[cntr] = idx_0_state;
                                    // console.log(selOptID - 1, idx_0_state, "---", mr[0],"--->",updatedColData[cntr]);
                                } else {
                                    var idx_0_state = updatedColData[cntr]
                                    idx_0_state.getElementsByTagName("option")[selOptID - 1].selected = 'selected';
                                    // console.log("ELSE---------",idx_0_state);
                                    updatedColData[cntr] = idx_0_state;
                                }
                               

                            // console.log(htmlDoc)
                            } 
                            else {
                                // console.log(updatedColData[cntr], prevSel, hMap[prevSel])
                                updatedColData[cntr] = mr[j]
                            }
                            // console.log(updatedColData[cntr])
                            // console.log("---")
                            cntr += 1;
                            // console.log(sliceTill - 1)
                            // console.log("----")
                            // sliceTill += 1;
                        }

                        // console.log("------", updatedColData);
                        tbl.row(i).data(updatedColData)
                    }

                    // console.log(selectData, "---", state.id, "---",selOptID)

                }

                window.updateColumns = updateColumns;
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // selectData.splice(hMap[0] + 1, 1, ...masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes))
                    // console.log(selectData)


                    // console.log("UPDATE - ROW -->",selectData)
                    var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    var sliced = selOptVal.slice(no_of_dimens - no_of_excludes + no_of_mes, ), data = {};


                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------


                    // console.log("SLICED ---- ", sliced)
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

                    // console.log(row_updated_arr)
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
                        var dateNameArr = Array.from(dateName);
                        var sliceLen = this._dimensions.length - this._excludeHeaders.length + this._measureOrder.length;
                        var sliced = fixRows.slice(sliceLen)
                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {
                            var select_html = `<select id='${k}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}")'>`;
                            var options = "";
                            for(var p = 0; p < dateNameArr.length; p++) {
                                if(optIdx == p) {
                                    options += `<option id='${p}' selected>${dateNameArr[p]}</option>`
                                } else {
                                    options += `<option id='${p}' >${dateNameArr[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            sliced[k] = select_html;
                            k += this._measureOrder.length;
                            optIdx += 1;
                        }
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);

                        if(table_cols.length == fixRows.length) {
                            fixRowsObj[fixRows[0]+"_#_"+fixRows[1]] = fixRows
                            masterRows.push(fixRows.slice());
                            tbl.row.add(fixRows).draw(false)
                        }
                       
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
