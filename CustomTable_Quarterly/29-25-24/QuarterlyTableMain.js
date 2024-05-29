var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}
var isLibAvail = false;
; (function () {
        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");


            #root {
                white-space: nowrap;
                scrollbar-width: thin;
            }
           
            tbody, td, tfoot, th, thead, tr {
                border-color: inherit;
                border-style: none;
                border-width: 0;
            }

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

            #example > thead > tr:nth-child(1) > th:nth-child(1) {
                background-color:#F2F2F2!important;
            }

            /* ------------------------- BASE CASE ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(2n) {
                background-color:#E0E0E0;
            }

            /* ------------------------- REST CASE ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(2n+1) {
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
		  	<table id="example" class="table" style="width:100%">
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
                this.loadLibraries()
                this.render()
            }

            async loadLibraries() {
                var start = performance.now();
                // console.log(isLibAvail)
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

      await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')






                    isLibAvail = true
                }
                // console.log("----", DataTable)
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
            }
            
            // onCustomWidgetBeforeUpdate(changedProperties) {
            //   this._props = { ...this._props, ...changedProperties };
            // }

            // onCustomWidgetAfterUpdate(changedProperties) {
            // }

            // onCustomWidgetResize (width, height) {
            //   this.render()
            // }

            setResultSet(rs, col_to_row = -1, headers, customHeaderNames, selColumnName, hideExtraVisibleColumnFromIndex, hide_Individual_ExtraVisibleColumnOfIndices, colspan_to_top_headers) {
                
                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping
                this._hideColsFrom = hideExtraVisibleColumnFromIndex;

                console.log("-----",headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                this._dateColName = selColumnName; //selectionColumn
                this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)

                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                    }
                    
                    dims.add(rs[i]["COL_NAME"].description);
                    
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                // this.render();

            }

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

                // var start = performance.now();
                // if (!isLibAvail) {
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                //     )
                //     isLibAvail = true
                // }
                // var end = performance.now();
                // var time = end - start;
                // console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

               
                if(Object.keys(this._customHeaderNames).length > 0) {
                    for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                        table_cols.push({
                            title: this._customHeaderNames["DIMEN_NAME"][i]
                        })
                    }
        
                    // for(var j = 0; j < this._colOrder.length; j++) {
                    //     table_cols.push({
                    //         title: this._colOrder[j]
                    //     })
                    // }

                    for(var k = 0; k < this._customHeaderNames["MES_NAME"].length; k++) {
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j]
                            })
                        }
                    }
                       
                    // for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                    //     if(this._scenarioOrder[i] != "FY") {
                    //         table_cols.push({
                    //             title: this._customHeaderNames["SCENARIO_NAME"][i]
                    //         })
                    //     }
                    //     for(var j = 0; j < this._colOrder.length; j++) {
                    //         table_cols.push({
                    //             title: this._colOrder[j]
                    //         })
                    //     }
                    // }

                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i]
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j]
                                })
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < col_dimension.length; i++) {
                        table_cols.push({
                            title: col_dimension[i]
                        })
                    }

                    table_cols.push({
                        title: this._dateColName
                    })
        
                    for(var k = 0; k < this._measureOrder.length; k++) {
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j]
                            })
                        }
                    }
                    
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._scenarioOrder[i]
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j]
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

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideColsFrom; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {
                            topStart: {
                                			buttons: [
                                                {
                                                    extend:'excel',
                                                    class:'btn-excel'
                                                }
                                            ]
                                		}
                        },
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
                        processing: true,
                        // serverSide: true,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true,
                    })
                } else {
                    tbl = new DataTable(this._table, {
                        layout: {
                            topStart: {
                                buttons: ['copy', 'excel', 'pdf', 'colvis']
                            }
                        },
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
                        // bProcessing: true,
                        // bServerSide: true,
                        processing: true,
                        // serverSide: true,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                }

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeaderData = [];
                var tempMes = this._measureOrder.slice(1, );

                for(var i = 0; i < this._scenarioOrder.length; i++) {
                    topHeaderData.push(this._scenarioOrder[i]);
                    for(var j = 0; j < tempMes.length; j++) {
                        topHeaderData.push(tempMes[j]);
                    }
                }

                console.log("Top Header Data : \n",topHeaderData)

                var topHeader = "<tr>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                }
                for(var i = 0; i < topHeaderData.length - 4; i++) { //-4 to neglect last two scenarios to be included as top-most header...
                    // Base Case/Scenario
                    if(this._scenarioOrder.includes(topHeaderData[i])) {
                        topHeader += `<th class='top-header baseCase' colspan='${this._colspan_BaseCase}'>${topHeaderData[i]}</th>`
                    } else {
                        // Rest Case/Scenario
                        topHeader += `<th class='top-header restCase' colspan='${this._colspan_RestCase}'>${topHeaderData[i]}</th>`;
                    }
                }
                
                topHeader += "</tr>";

                // @--- uncomment below line
                document.querySelector("quarterly-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
//  ------------------------------ TO BE UNCOMMENTED ----------------------

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
                var fixRowsObj = {}, masterObj = {};
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
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log(selectData, sliceFrom)

                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)
                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    var sliced = selOptVal.slice(sliceFrom, ), data = {};
                    // console.log(sliced)

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
                        data[index] = sliced.slice(i, i + changeLength)
                        i += changeLength
                        index += 1
                    }
                    console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));

                    row_updated_arr[sliceFrom + parseInt(state.id)] = state

                    var sliceLen = sliceFrom + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + changeLength; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                }

                window.updateRow = updateRow

                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                // var scenarioObj = {}
                // // var scenarioObj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // scenarioObj["DropDownFieldName"] = new Set();
                // console.log(scenarioObj)
                var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);

                for(var i = 0, prev_key = "", seqID = 0, scenarioMissing = false; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    var scenarioObj = {}
                    scenarioObj["DropDownFieldName"] = new Set();

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        // console.log(this._resultSet[i])
                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][this._dimensions.length];
                        var selColumnName = this._resultSet[i][this._dimensions.indexOf(this._dateColName)];

                        // console.log(scene, "---", )

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            masterObj[masterKey.join("_#_")] = {};
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"] = new Set();
                        }

                        if(masterObj[masterKey.join("_#_")][selColumnName] == undefined) {
                            masterObj[masterKey.join("_#_")][selColumnName] = structuredClone(obj);
                        }

                        masterObj[masterKey.join("_#_")][selColumnName][scene] = this._resultSet[i].slice(this._resultSet[i].length - this._measureOrder.length, )
                        masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        // console.log(masterObj[masterKey.join("_#_")][selColumnName][scene],"----")

                        // console.log(structuredClone(masterObj))
                        // console.log(this._resultSet[i])

                        i += 1;
                    }
                    prev_key = key;
                }

                console.log("---",structuredClone(masterObj))


                // Final Row Assignment
                for(const [k, v] of Object.entries(masterObj)) {
                    // console.log(k)
                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // console.log(v);
                    finalRow.push(Array.from(v["DropDownFieldName"])[0])

                    // Pushing Quarter Measures to finalRow
                    // for(var o = 0, cnt = 1; o < this._measureOrder.length; o++) {
                        // if(o == 0) {
                        //     finalRow.push(Array.from(v["DropDownFieldName"])[o])
                        // }
                        // var relocate_idx = 0

                        var cnt = 1;
                        for(const v1 in v) {
                            // console.log(v, "---", v1)
                            if(v1 != "DropDownFieldName") {
                                // console.log(this._colOrder.length * this._measureOrder.length)
                                
                                for(var e = 0; e < this._measureOrder.length; e++)  {
                                    for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                        // console.log(v1, km, vm)
                                        // finalRow.push(km)
                                        // console.log(vm[e])
                                        if(vm[e] != undefined) {
                                            finalRow.push(vm[e])
                                        } else {
                                            finalRow.push("-")
                                        }
                                        if(cnt == this._colOrder.length * this._measureOrder.length) {
                                            finalRow.push("--selection--")
                                            cnt = 0;
                                            // console.log("HELLO...")
                                        }
                                        cnt++;
                                        // console.log(relocate_idx)
                                    }
                                }
                               
                                // relocate_idx++;
                                // finalRow.pop()
                               
                        //         // finalRow.push("--Selection--")
                        //         // console.log(masterObj[k][v1])
                            } else {
                                // dropdown data
                            }
                        // }
                    }
                    

                    finalRow.pop()
                    fixRowsObj[k] = finalRow


                    // console.log("--------->>>>>>>", finalRow)
                    // Handling case where whole base-1/2/3/... scenario is not present ... 
                    if(finalRow.length < table_cols.length) {
                        for(var l = finalRow.length; l < table_cols.length; l++) {
                            finalRow.push("-")
                        }
                    }

                    // // Adding Dropdowns to finalRow
                    var sliceLen = this._colOrder.length * this._measureOrder.length + fixedScenarioAt + 1;
                    var sliced = finalRow.slice(sliceLen)
                    // console.log("---------", sliced)
                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice(1, );
                    // console.log(dropdownArr);


                    var selectionCnt = 0;
                    var options = "";
                    for(var kk = 0, optIdx = 0; kk < sliced.length; kk++) {

                        if(selectionCnt >= dropdownArr.length) {
                            var emptySelect = `<select id='${kk}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                            var emptyOption = `<option selected disabled></option>`;
                            for(var p = 0; p < dropdownArr.length; p++) {
                                if(optIdx == p) {
                                    emptyOption += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                } else {
                                    emptyOption += `<option id='${p}' >${dropdownArr[p]}</option>`
                                }
                            }
                            emptySelect += emptyOption + `</select>`;
                            sliced[kk] = emptySelect;
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                            var options = "";
                            for(var p = 0; p < dropdownArr.length; p++) {
                                if(optIdx == p) {
                                    options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                } else {
                                    options += `<option id='${p}' >${dropdownArr[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            sliced[kk] = select_html;
                        }
                       
                        kk += this._colOrder.length * this._measureOrder.length;
                        selectionCnt++;
                        optIdx += 1;
                    }
                    // console.log(sliced)
                    finalRow = finalRow.slice(0, sliceLen).concat(sliced);


                    tbl.row.add(finalRow).draw(false)
                    // console.log(finalRow);
                }

                // Styling Block Starts
                if (this._tableCSS.length > 1) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    console.log(this._rowCSS)
                    document
                        .querySelector('quarterly-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector('quarterly-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    console.log(this._colCSS)
                    document
                        .querySelector('quarterly-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                console.log("hi");

                callExport(tbl);
                // Styling Block Ends here
            }
        }
        customElements.define('quarterly-custom-table', CustomTable)
    })()
