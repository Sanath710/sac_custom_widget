var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

var load_libs_flag = false;
var widget_ID_Name = {};

; (function () {

        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            @import url("https://cdnjs.cloudflare.com/ajax/libs/three-dots/0.3.2/three-dots.min.css");
            
          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <div id="root" style="width:100%; height:100%; padding:0%; overflow: auto; position: absolute; display: inline-grid;">
            <table id="example" class="table" style="visibility:hidden;">
                <thead>
                </thead>
                <tbody></tbody>
            </table>
            <div class="dot-flashing" id='loader' style="align-self:center; justify-self:center; visibility:hidden;"></div>
          </div>
        `

        var total_cols = 0;
        var fixRowsObj = {};
        const masterRows = [];
        var indices = [];

        class CustomTable extends HTMLElement {

            constructor() {
                console.clear()
                super()
                this._shadowRoot = this.attachShadow({ mode: 'open' })
                this._shadowRoot.appendChild(prepared.content.cloneNode(true))
                this._root = this._shadowRoot.getElementById('root')
                this._table = this._shadowRoot.getElementById('example')
                this._dotsLoader = this._shadowRoot.getElementById('loader');
                this._props = {}

                if(!load_libs_flag) {
                    this.loadLibraries()
                    load_libs_flag = true;
                }
                // this.render_FY()
            }

            async loadLibraries() {
                var start = performance.now();
                this._dotsLoader.style.visibility = "visible";
                await getScriptPromisify(
                    'https://cdn.datatables.net/2.0.1/js/dataTables.min.js'
                )
                // await getScriptPromisify(
                //     'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                // )
                // await getScriptPromisify(
                //     'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                // )
                // console.log("----", DataTable)
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
                // this._dotsLoader.style.visibility = "hidden";
            }
            
            onCustomWidgetBeforeUpdate(changedProperties) {

                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dropdownsSelected = this._headers["DROPDOWN_SELECTED"];
                    this._fixedIndices = this._headers["FIXED_INDICES"].map(Number);
                    this._dropdownIndices = this._headers["DROPDOWN_INDICES"].map(Number);
                }

                if(changedProperties["_dateColName"]) {
                    this._dateColName = changedProperties["_dateColName"]; //selectionColumn
                }

                if(changedProperties["_hideExtraVisibleColumnFromIndex"]) {
                    this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
                }

                if(changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"]) {
                    this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
                }

                if(changedProperties["_customHeaderNames"]) {
                    this._customHeaderNames = changedProperties["_customHeaderNames"];
                    this._customTopHeader = this._customHeaderNames["TOP_HEADER"];
                }

                // console.log("BU")

            }

            onCustomWidgetAfterUpdate(changedProperties) {

                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dropdownsSelected = this._headers["DROPDOWN_SELECTED"];
                    this._fixedIndices = this._headers["FIXED_INDICES"].map(Number);
                    this._dropdownIndices = this._headers["DROPDOWN_INDICES"].map(Number);
                }

                if(changedProperties["_dateColName"]) {
                    this._dateColName = changedProperties["_dateColName"]; //selectionColumn
                }

                if(changedProperties["_hideExtraVisibleColumnFromIndex"]) {
                    this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
                }

                if(changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"]) {
                    this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
                }

                if(changedProperties["_customHeaderNames"]) {
                    this._customHeaderNames = changedProperties["_customHeaderNames"];
                    this._customTopHeader = this._customHeaderNames["TOP_HEADER"];
                }

                // console.log("AU")
            }

            setResultSet_FY(rs, col_to_row = -1, colspan_to_top_headers) {

                // this.reinitialize_changedProperties_ClassVariables();

                this._dotsLoader.style.visibility = "visible";
                this._table.style.visibility = "hidden";
                this._root.style.display = "inline-grid";

                this._resultSet = [];
                this._nonNumericColumnIndices_UnitConversion = new Set();
                this._masterRows_UnitConversion = [];
                this._masterRows_UnitConversion_Flag = false;
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row; // Row Grouping

                var headers = this._headers
                // console.log(headers);
                console.log(this._dropdownsSelected)

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                // this._customHeaderNames = customHeaderNames;

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
                        this._nonNumericColumnIndices_UnitConversion.add(k);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            } else {
                                tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")))
                            }
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
                                if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue))
                                } else {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")))
                                }
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

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);

                this.render_FY();

            }

            showTotal() {

                var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);

                // 4,5,6,7,-1,9,10,11,12,-1,14,15,16,17,-1,19,20,21,22

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    }
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                }
                
                for(var i = 0; i < indices.length; i++) {
                    var sum = 0;
                    if(indices[i] != -1) {
                        var d = this._dataTableObj.column(indices[i]).data();
                        for(var j = 0; j < d.length; j++) {
                            if(isNaN(d[j])) {
                                if(d[j].includes("%")) {
                                    sum = "- %";
                                } else {
                                    sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                }
                            } else {
                                sum += parseFloat(d[j])
                            }
                        }
                    }
                    var rowIDTotal = this._dataTableObj.rows()[0][0];
                    // console.log( this._dataTableObj.rows(), this._dataTableObj.cells(rowIDTotal, 4).data())
                    this._dataTableObj.cell(rowIDTotal, indices[i].toString()).data(sum)
                    // console.log(sum)
                }
            }

            applyScaling_FY(scaleTo = "K", numberOfDecimals = 2) {

                this._dotsLoader.style.visibility = "visible";
                this._table.style.visibility = "hidden";
                this._root.style.display = "inline-grid";

                var t = this._dataTableObj;
                var lcl_tableColumnNames = this._tableColumnNames;
                this._scaleTo = scaleTo;
                scaleTo = scaleTo.toUpperCase();

                // console.log(">>>>>>",this._dataTableObj.rows().data(), "Count---", this._dataTableObj.rows().count())
               
                var lcl_nonNumericColumns = Array.from(this._nonNumericColumnIndices_UnitConversion);
                // console.log(lcl_tableColumnNames, "------",lcl_nonNumericColumns)

                if(!this._masterRows_UnitConversion_Flag) {
                    // this._dataTableObj.rows().every(function(idx) {
                    //     this._masterRows_UnitConversion.push(t.cell(idx))
                    // });
                    this._masterRows_UnitConversion_Flag = true;
                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        // console.log(this._dataTableObj.rows().data()[i])
                        this._masterRows_UnitConversion.push(this._dataTableObj.rows().data()[i].slice());
                    }
                    // console.log(this._masterRows_UnitConversion)
                    // console.log(this._dataTableObj.rows().count());
                }


                var lcl_masterRows_UnitConversion = this._masterRows_UnitConversion.slice(); 
                var lcl_scaledRows = [];

                // console.log("ROW : ",this._dataTableObj.rows())
                // this._dataTableObj.rows().every(function(idx) {
                for(var idx = 0; idx < this._dataTableObj.rows()[0].length; idx++) {
                    var tempRow = [];
                    for(var i = 0; i < lcl_tableColumnNames.length; i++) {
                        var cell = t.cell(this._dataTableObj.rows()[0][idx], i);
                        if(!lcl_nonNumericColumns.includes(i)) {
                            if(cell.data() != undefined && isNaN(lcl_masterRows_UnitConversion[idx][i])) {
                                if(!lcl_masterRows_UnitConversion[idx][i].includes("%")) {
                                    if(scaleTo == "M") {
                                        cell.data(parseFloat(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(/,{1,}/g,""))/1000).toFixed(numberOfDecimals))
                                    } 
                                    else {
                                        cell.data(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(/,{1,}/g,"")))
                                    }
                                }
                            } else {
                                if(scaleTo == "M") {
                                    cell.data(parseFloat(parseFloat(lcl_masterRows_UnitConversion[idx][i])/1000).toFixed(numberOfDecimals))
                                } 
                                else {
                                    cell.data(parseFloat(lcl_masterRows_UnitConversion[idx][i]))
                                }
                            }
                            // if(cell.data() != undefined && !isNaN(lcl_masterRows_UnitConversion[idx][i]) && !lcl_masterRows_UnitConversion[idx][i].includes("%")) {
                            //     if(scaleTo == "M") {
                            //         cell.data(parseFloat(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(/,{1,}/g,""))/1000).toFixed(numberOfDecimals))
                            //     } 
                            //     else {
                            //         cell.data(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(/,{1,}/g,"")))
                            //     }
                            // }
                        }
                        tempRow.push(cell.data())
                    }
                    lcl_scaledRows.push(tempRow.slice());
                    // console.log(tempRow)
                } 

                if(this._masterRows_UnitConversion) {
                    var i = 0;
                    for(var key in fixRowsObj) {
                        fixRowsObj[key] = lcl_scaledRows[i]
                        i++;
                    }
                }
                // console.log(fixRowsObj,"---",lcl_scaledRows)
                this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

            }

            columnVisibility(hideCols, showCols) {

                if(hideCols[0] != -1) {
                    for(var i = 0; i < hideCols.length; i++) {
                        console.log(hideCols[i])
                        this._dataTableObj.column(hideCols[i]).visible(false);
                    }
                }

                if(showCols[0] != -1) {
                    for(var i = 0; i < showCols.length; i++) {
                        this._dataTableObj.column(showCols[i]).visible(true);
                    }
                }
            }

            showScenarios(fixedCols, col_start_indices, top_header_names_to_show, no_of_succeeding_measures) {

                var colIndices = col_start_indices;
                var no_of_succeeding = no_of_succeeding_measures;
                var headerNames_to_show = this._fixedScenario.slice();
                headerNames_to_show = headerNames_to_show.concat(top_header_names_to_show);
                var fixedCols = fixedCols;
                var visibleCols = []; 

                ////// Fixed cols i.e base case
                for(var i = 0; i <= fixedCols; i++) {
                    visibleCols.push(i);
                }

                // // console.log(colIndices, "---", no_of_succeeding)

                ////// For showing Columns from indices
                for(var i = 0; i < colIndices.length; i++) {
                    for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i])+no_of_succeeding; j++) {
                        // console.log(j, "->", parseInt(colIndices[i])+no_of_succeeding)
                        this._dataTableObj.column(j).visible(true);
                        visibleCols.push(j)
                    }
                }

                // console.log(visibleCols)

                /////// hiddenCols = hiddenCols.concat(this._hide_Individual_ExtraVisibleColumnOfIndices);

                ////// For Hiding Columns from indices (Pre-Decided)
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(!visibleCols.includes(i)) {
                        this._dataTableObj.column(i).visible(false);
                        // console.log(i)
                    }
                }

                // console.log(this._dataTableObj.column(2).data())

                const list = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }

                var topHeader = "<tr role='row'>";

                // QTR Case
                if(this._colOrder.includes("Q1") || this._colOrder.includes("Q2") || this._colOrder.includes("Q3") || this._colOrder.includes("Q4")) {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${this._customTopHeader[1].replace(" ","")}' >${this._customTopHeader[1]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${this._customTopHeader[1].replace(" ","")}' >${this._customTopHeader[1]}</th>`
                    }
                } 
                // Full Year Case
                else { 
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                    }
                }

               
                topHeader += `</tr>`;

                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
            }

            setSelectorsSelectedValue(selector_ids, valArr = []) {

                selector_ids = Array.from(selector_ids);

                for(var i = 0; i < valArr.length; i++) {

                    this._dataTableObj
                    .rows()
                    .nodes()
                    .each(row => row.classList.remove('selected'));

                    this._dataTableObj.row(':last').node().setAttribute("class","selected")
                        
                    for(var i = 0; i < valArr.length; i++) {
                        var selectorID = ".row_level_select_"+selector_ids[i];
                        var selElement = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector(selectorID);
                        if(selElement && selElement.selectedIndex != undefined) {
                            selElement.selectedIndex = valArr[i];
                            // console.log(selector_ids)
                            // console.log(selElement)
                            selElement.dispatchEvent(new Event("change"));
                        }
                       
                    }
                    
                }

                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#\\30").selectedIndex = 2;
                // console.log(document.querySelector("cw-combine-table").shadowRoot.querySelector("#\\30").parentNode.parentNode.setAttribute("class","selected"));
                // console.log(document.querySelector("cw-combine-table").shadowRoot.querySelector("#\\30").parentNode.parentNode);
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#\\30").dispatchEvent(new Event("change"));
            }

            applyStyling_FY() {

                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
    
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                select {
                    padding-top:0%;
                    background-color:inherit;
                    outline:none;
                }
    
                option {
                    background-color:#DCE6EF;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:grey;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
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
                    text-wrap:nowrap;
                    background-color:white;
                    height:48px;
                    border-bottom:1px solid #CBCBCB!important;
                    font-family: Arial;
                    font-size:14px;
                    align-content: center;
                }
    
                #example .numericColsCSS {
                    text-align:right!important;
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
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example{
                    position: absolute;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- HIDE 1ST GROUP ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    display:none;
                }
                `;
            }

            async render_FY() {

                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                // document.querySelector("#__widget0 > cw-combine-table").shadowRoot.querySelector("#example > tbody > tr:nth-child(2)")
                // console.log(document.querySelectorAll("cw-combine-table"),this, )
                // this._table.style.visibility = "hidden";


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
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"numericColsCSS"
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
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:"numericColsCSS"
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
                                title: col_measures[j],
                                className:"numericColsCSS"
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
                                    title: col_measures[j],
                                    className:"numericColsCSS"
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                  //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                }

                this._indices = indices;

                //// ------------------------ Show Totals on Row Block Ends ---------------------------------

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined;
                // $(this._table).on('init.dt', function () {
                //     console.log('Table initialisation complete: ' + new Date().getTime());
                // })
                // .DataTable();

                ////// Handling situation for what if data table library didn't got loaded ... 
                // try {
                //     new DataTable()
                // } catch(err) {
                //     console.log("-------- Exception caught & handled ... : "+err);
                //     await this.loadLibraries();
                // }

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
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
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
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
                        bAutoWidth: false, 
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
                        bDestroy: true,
                    })

                   
                }

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                this._dataTableObj = tbl;
                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("0")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > tbody > tr:nth-child(1) > td").style.display = "none";
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length + 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        // Base Case/Scenario
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._scenarioOrder[i].replace(" ","")}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                                for(var j = 0; j < this._scenarioOrder.length; j++) {
                                    if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                        if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                            topHeader += `<th class='top-header' id='${this._scenarioOrder[j].replace(" ","")}' colspan='${this._colspan_RestCase}'>${this._scenarioOrder[j]}`;
                                        } 
                                    }
                                }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               
                // @--- uncomment below line
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                console.log(this._widgetID+"cw-combine-table")
                if(document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                    // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                }

//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                tbl.on('click', 'tbody tr', e => {
                    // tbl.$('tr').removeClass('selected');
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    // var rowList = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelectorAll("#example > tbody tr").remove('selected');
                    // console.log(rowList)

                    // console.log(classList, classList.length, "MAIN_____________")
                    if(classList.length != 1) {
                        classList.add('selected')
                    }
                    
                    // console.log(tbl.row('.selected').data())
                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var is_col_updated = false;

                function updateTotalOnRowUpdate(updateFrom, no_of_mes) {
                    // console.log(updateFrom)
                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        var sum = 0;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {
                            if(isNaN(d[j]) && d[j].includes("%")) {
                                sum = "- %"
                            } else {
                                sum += parseFloat(d[j])
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        var rowIDTotal = tbl.rows()[0][0];
                        tbl.cell(rowIDTotal, i).data(sum)
                    }
                }
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom) 
                {

                    // let updateRowFlag = true;
                    //  var a = tbl.on('click', 'tbody tr', e => {
                    //     let classList = e.currentTarget.classList
                    //     tbl
                    //         .rows()
                    //         .nodes()
                    //         .each(row => row.classList.remove('selected'))

                    //     if(classList.length != 1) {
                    //         classList.add('selected')
                    //     }
                    // })
                    // console.log("ASYNC",a)

                    var selectData = tbl.row('.selected').data()
                    // console.log("Selected Row : ", selectData)

                    var ROW_ID = tbl.row('.selected')[0][0];
                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    // console.log(state.id,">>>>>>>>>>>>>>>>>>>>.")
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    var sliced = selOptVal.slice(sliceFrom, ), data = {};

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
                    // @---
                    // row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state
                    row_updated_arr[sliceFrom + parseInt(state.id)] = state

                    // var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var sliceLen = sliceFrom + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                    var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                                    + parseInt(state.id) // selection id present at column
                                    + 1;  // to avoid selection column in count
                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#00a4eb";
                        state.style.color="white";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes);
                    }
                }

                window.updateRow = updateRow

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );
                var caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;

                for(var i = 0, prev_key = "", seqID = 0; i < this._resultSet.length;) {

                    if(this._fixedScenario.includes(this._resultSet[i][fixedScenarioAt])) {
                        caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;
                        // var obj = Object.fromEntries(this._scenarioOrder.slice(1,).map(key => [key, []]));
                        var obj = {};
                        var fixRows = [];
                        dateName = new Set();
                        if(this._colOrder[0] == "FY") {
                            var index = this._resultSet[i].length - this._measureOrder.length;
                            fixRows = this._resultSet[i].slice()
                        }
                        // @-- bug fix...
                        if(this._resultSet[i + 1] != undefined && this._resultSet[i].slice(0, fixedScenarioAt).join("_#_") == this._resultSet[i + 1].slice(0, fixedScenarioAt).join("_#_")) {
                            i+=1;
                        }
// console.log(obj);
                    }

                    var key = fixRows.slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_")+"_#_";
                    // console.log(fixRows)
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );
                    dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

// console.log(key)
                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {

                        // console.log(this._resultSet[i][fixedScenarioAt])
                        // ----------------  For Dynamic Trggering of Selection Element At Particular Base ---------------
                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            caughtDropDownsAt.add(caughtDropDownsCnt)
                        }
                        caughtDropDownsCnt++;
                        // -----------------------------------------------------------------------------------------------

                        for(var j = 0; j < fixedScenarioAt; j++) {
                            tempKey += this._resultSet[i][j]+"_#_"
                        }
                        // fixRows.splice(fixRows.length, 0, ...this._resultSet[i].slice(this._dimensions.length - 1, ))
                        var scene = this._resultSet[i].slice(fixedScenarioAt, )[0];
                        // console.log("---",scene)
                        if(!this._fixedScenario.includes(scene)) {
                            obj[scene] = this._resultSet[i].slice(this._dimensions.length - 1, )
                        }
                        // console.log(this._resultSet[i].slice(this._dimensions.length - 1, ))
                        seqID++;
                        if(seqID >= scenarioSeq.length) {
                            seqID = 0;
                        }

                        // console.log(scenarioSeq[seqID],"---", scene)
                        dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        i += 1;
                    }

// console.log(fixRows);

                    // Final Assignment of fixRows
                    if(this._resultSet[i] != undefined && fixRows.slice(0, fixedScenarioAt).join("_#_") != this._resultSet[i].slice(0, fixedScenarioAt).join("_#_")) {
                        // dateName = new Set(Object.keys(obj).filter(v => !this._fixedScenario.includes(v)))
                        var dname = [], c = 0; // ----
                        for(const [k, v] of Object.entries(obj)) {
                            // console.log(obj)
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    if(fixRows.length != table_cols.length){
                                        fixRows = fixRows.concat(v)
                                        dname.push(v[0])// ----
                                    }
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")
                        
                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                         // @ ------------------------------------------------------------------ REMOVE IF NEC 
                         if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                                // console.log("--------",fixRows[this._dimensions.indexOf(this._dateColName)],"----",this._dimensions.indexOf(this._dateColName))
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                            // console.log(fixRows, "----<")
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                    } else if(this._resultSet[i] == undefined) {

                        var dname = [], c = 0;// ----
                        for(const [k, v] of Object.entries(obj)) {
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    fixRows = fixRows.concat(v)
                                    dname.push(v[0])// ----
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")

                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                        // @ ------------------------------------------------------------------ REMOVE IF NEC 
                        if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                        // console.log(fixRows,obj,"-------")
                    }
                    // console.log("--",scenarioSeq[seqID], "---",this._scenarioOrder[this._scenarioOrder.length - 1])
                   
                    // console.log(key, tempKey);

                    if(table_cols.length == fixRows.length) {
                        seqID = 0;
                        var dateNameArr = Array.from(dateName);
                        var sliceLen = this._resultSet[0].length;
                        var sliced = fixRows.slice(sliceLen)
                        var cnt = 0;
                        var options = "";
                        var dropdownIDs = new Set();

                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {

                            // dropdown change dynamic trigger through js 
                            if(cnt < 3) {
                                dropdownIDs.add(k+"_"+this._dataTableObj.rows().count());
                            }

                            var select_html = `<select id='${k}' class='row_level_select row_level_select_${k}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length})'>`;
                                var options = "";
                                for(var p = 0; p < dateNameArr.length; p++) {
                                    if(optIdx == p) {
                                        options += `<option class='optionTag' id='${p}' selected>${dateNameArr[p]}</option>`
                                    } else {
                                        options += `<option class='optionTag' id='${p}' >${dateNameArr[p]}</option>`
                                    }
                                }
                                select_html += options + `</select>`;
                                sliced[k] = select_html;
                                this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1);
                                cnt++;
                            k += this._measureOrder.length;
                            optIdx += 1;
                        }
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);
                        // console.log(fixRows,"-----")

                        ////// ----------------- Parsing string numeric value to numeric value -------------
                        // console.log(this._nonNumericColumnIndices_UnitConversion, fixRows)
                        // var lcl_nonNumCols =  this._nonNumericColumnIndices_UnitConversion.slice();
                        // for(var p = 0; p < fixRows.length; p++) {
                        //     if(!lcl_nonNumCols.includes(p) && (!fixRows[p].includes("%") || !fixRows[p].includes("-"))) {

                        //     }
                        // }   
                        ////// -----------------------------------------------------------------------------

                        fixRowsObj[fixRows[0]+"_#_"+fixRows[1]] = fixRows
                        masterRows.push(fixRows.slice());
                        tbl.row.add(fixRows).draw(false)
                
                        // console.log(">>>>>>><<<<<<<<<", caughtDropDownsAt);
                        var drpIndicesAt = Array.from(caughtDropDownsAt);
                        this.setSelectorsSelectedValue(dropdownIDs, drpIndicesAt)
                // console.log("SELECT ELEMENT : ", document.querySelector("cw-combine-table").shadowRoot.querySelector("#\\30"))
                        fixRows = [];
                        this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1)
                        // console.log(fixRows)
                    }

                    prev_key = key;

                }

                // Styling Block Starts

                this.applyStyling_FY();

                if (this._tableCSS) {
                    // console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }


                this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector("#__widget5 > cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)")
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)").click();
                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                showTotalonRowUpdateFlag = true;
                this.showTotal();


                // Styling Block Ends here
            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- QUARTER -------------------------------------------------------
            // ==========================================================================================================================
            setResultSet_QT(rs, col_to_row = -1, colspan_to_top_headers) {

                this._dotsLoader.style.visibility = "visible";
                this._table.style.visibility = "hidden";
                this._root.style.display = "inline-grid";

                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping

                var headers = this._headers;
                // console.log("-----",headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);

                // this._customHeaderNames = customHeaderNames;
                // this._customTopHeader = this._customHeaderNames["TOP_HEADER"];

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

                // widget_ID_Name[this["widgetName"]] = this["offsetParent"].id;
                // console.log("Mapped Widgets : ",widget_ID_Name);

                this.render_QT();

            }

            applyStyling_QT() {

                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
                /*
                #example > tbody > tr:nth-child(2) > td.truncate {
                    font-weight:bold;
                }
    
                */
                #example > select {
                    padding-top:0%;
                    background-color:inherit;
                    outline:none;
                }
                option {
                    background-color:#DCE6EF;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:grey;
                    color:white;
                    /* selected */
                }
    
                #example th {
                    text-wrap: nowrap;
                    border-bottom: 1px solid #CBCBCB;
                    background-color:#F2F2F2;
                    align-content: center;
                    font-family: Arial;
                    color:black;
                    font-size:14px;
                }
    
                /*
                #example > tbody > tr:nth-child(2) {
                    font-weight:bold;
                }
    */
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
    
                #example .numericColsCSS {
                    text-align:right!important;
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
                    max-width:50%;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    /* text-overflow: ellipsis; */
                }
    
                /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */
    
                #example > thead {
                    position: sticky;
                    top:0%!important;
                    border-bottom: 1px solid #CBCBCB;
                    background-color: yellow;
                }
    
                #example {
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none.dt-type-numeric {
                    text-overflow:unset!important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- HIDE 1ST GROUP ROW ---------------------------- 
    
                #example > tbody > tr:nth-child(1) > td {
                    display:none;
                }
                */
                `;
            }

            async render_QT() {
                
                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
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
        
                    for(var k = 0; k < this._customHeaderNames["MES_NAME"].length; k++) {
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"numericColsCSS"
                            })
                        }
                    }

                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i],
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:"numericColsCSS"
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
                                title: this._colOrder[j],
                                className:"numericColsCSS"
                            })
                        }
                    }
                    
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._scenarioOrder[i],
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:"numericColsCSS"
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
                }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {
                        },
                        // fixedColumns: {
                        //     start: 12
                        // },
                        // scrollCollapse: true,
                        // scrollX: true,
                        columns: table_cols,
                        // bAutoWidth: true, 
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
                        // fixedColumns: {
                        //     start: 2
                        // },
                        // scrollCollapse: true,
                        // scrollX: true,
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

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                this._dataTableObj = tbl;

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

                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                // if(groupColumn != -1) {
                //     topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                // } else {
                    // topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                // }
                topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;


                if(this._customTopHeader) {
                    for(var i = 0; i < this._customTopHeader.length; i++) { //-4 to neglect last two scenarios to be included as top-most header...
                        // Base Case/Scenario
                        if(i%2==0) {
                            topHeader += `<th class='top-header baseCase' colspan='${this._colspan_BaseCase}'>${this._customTopHeader[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                            topHeader += `<th class='top-header restCase' colspan='${this._colspan_RestCase}'>${this._customTopHeader[i]}</th>`;
                        }
                    }
                } else {
                    for(var i = 0; i < topHeaderData.length - 4; i++) { //-4 to neglect last two scenarios to be included as top-most header...
                        // Base Case/Scenario
                        if(this._scenarioOrder.includes(topHeaderData[i])) {
                            topHeader += `<th class='top-header baseCase' colspan='${this._colspan_BaseCase}'>${topHeaderData[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                            topHeader += `<th class='top-header restCase' colspan='${this._colspan_RestCase}'>${topHeaderData[i]}</th>`;
                        }
                    }
                }
               
                
                topHeader += "</tr>";

                // @--- uncomment below line
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                if(document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                    // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                }
//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                // Top Most Header Block Ends

                tbl.on('click', 'tbody tr', e => {
                    let classList = e.currentTarget.classList
                    tbl
                        .rows()
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    if(classList.length != 1) {
                        classList.add('selected')
                    }
                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                // fixRowsObj = {};
                var masterObj = {};
                // const masterRows = [];
                var hMap = {};
                var is_col_updated = false;

                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
                {

                    tbl.on('click', 'tbody tr', e => {
                        let classList = e.currentTarget.classList
                        tbl
                            .rows()
                            .nodes()
                            .each(row => row.classList.remove('selected'))
                        if(classList.length != 1) {
                            classList.add('selected')
                        }
                    })

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
                    // console.log("0000",data, data[selOptID])

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

                    if(isSelectionUpdatedByUser) {
                        state.style.backgroundColor = "#00a4eb";
                        state.style.color = "white";
                    }

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
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set()
                        }

                        if(masterObj[masterKey.join("_#_")][selColumnName] == undefined) {
                            masterObj[masterKey.join("_#_")][selColumnName] = structuredClone(obj);
                        }

                        masterObj[masterKey.join("_#_")][selColumnName][scene] = this._resultSet[i].slice(this._resultSet[i].length - this._measureOrder.length, )
                        masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        
                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

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
                    var flag = false;

                    if(finalRow.length == (this._dimensions.length - 1) + this._colOrder.length * 2) {
                        var repeatBase = finalRow.slice(this._dimensions.indexOf(this._dateColName) - 1, );
                        for(var l = finalRow.length, lcl_cnt = 0; l < table_cols.length; l++) {
                            finalRow.push(repeatBase[lcl_cnt])
                            if(lcl_cnt >= repeatBase.length) {
                                lcl_cnt = 0;
                            }
                            lcl_cnt++;
                        }
                        flag = true;
                    } 
                    else if(finalRow.length < table_cols.length) {
                        for(var l = finalRow.length; l < table_cols.length; l++) {
                            finalRow.push("-")
                        }
                    }

                    // // Adding Dropdowns to finalRow
                    var sliceLen = this._colOrder.length * this._measureOrder.length + fixedScenarioAt + 1;
                    var sliced = finalRow.slice(sliceLen)
                    // console.log("---------", sliced)
                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice(1, );
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set();

                    // console.log(dropdownArr);


                    var selectionCnt = 0, cnt = 0;
                    var options = "";
                    var flag_sel = sliced[0];
                    var isSelectionUpdatedByUser = false;
                    var dropdownIDs = new Set();

                    for(var kk = 0, optIdx = 0; kk < sliced.length; kk++) {

                        // dropdown change dynamic trigger through js 
                        if(cnt < 3) {
                            dropdownIDs.add(kk+"_"+this._dataTableObj.rows().count());
                        }

                        if(selectionCnt >= dropdownArr.length) {
                            if(flag) {
                                sliced[kk] = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'><option selected>${flag_sel}</option></select>`;
                            } else {
                                var emptySelect = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                                var emptyOption = `<option selected disabled></option>`;
                                for(var p = 0; p < dropdownArr.length; p++) {
                                    if(dropdownSel.includes(dropdownArr[p])) {
                                        caughtDropDownsAt.add(p)
                                    }
                                    if(optIdx == p) {
                                        emptyOption += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                    } else {
                                        emptyOption += `<option id='${p}' >${dropdownArr[p]}</option>`
                                    }
                                }
                                emptySelect += emptyOption + `</select>`;
                                sliced[kk] = emptySelect;
                            }
                        } else {
                            var select_html = `<select id='${kk}' class='row_level_select row_level_select_${kk}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + (this._colOrder.length * this._measureOrder.length)}, ${this._colOrder.length * this._measureOrder.length})'>`;
                            var options = "";
                            for(var p = 0; p < dropdownArr.length; p++) {
                                if(dropdownSel.includes(dropdownArr[p])) {
                                    caughtDropDownsAt.add(p)
                                }
                                if(optIdx == p) {
                                    options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                                } else {
                                    options += `<option id='${p}' >${dropdownArr[p]}</option>`
                                }
                            }
                            select_html += options + `</select>`;
                            sliced[kk] = select_html;
                        }
                       
                        cnt++;
                        kk += this._colOrder.length * this._measureOrder.length;
                        selectionCnt++;
                        optIdx += 1;
                    }
                    // console.log(sliced)
                    finalRow = finalRow.slice(0, sliceLen).concat(sliced);


                    tbl.row.add(finalRow).draw(false)
                    this.setSelectorsSelectedValue(dropdownIDs, Array.from(caughtDropDownsAt));
                    // console.log(finalRow);
                }

                // Styling Block Starts
                this.applyStyling_QT();

                if (this._tableCSS.length > 1) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    console.log(this._rowCSS)
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    console.log(this._colCSS)
                    document
                        .querySelector(this._widgetID+'cw-combine-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }
                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
                this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").click();
                // Styling Block Ends here

                isSelectionUpdatedByUser = true;
            }
        }
        customElements.define('cw-combine-table', CustomTable)
    })()