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
          </div>
        `

        var total_cols = 0;
        var fixRowsObj = {};
        var groupRowMapping = {};
        const masterRows = [];
        var indices = [], indices_QT = [], indices_MT = [];
        var gbl_finalPerCols_FY = {}, gbl_finalPerCols_QT = {}, gbl_finalPerCols_MT = {};
        var no_of_decimalPlaces = 5;
        var stateShown = "Num";

        class CustomTable extends HTMLElement {

            constructor() {
                // console.clear()
                super()
                this._shadowRoot = this.attachShadow({ mode: 'open' })
                this._shadowRoot.appendChild(prepared.content.cloneNode(true))
                this._root = this._shadowRoot.getElementById('root')
                this._table = this._shadowRoot.getElementById('example')
                // this._dotsLoader = this._shadowRoot.getElementById('loader');
                this._props = {}

                if(!load_libs_flag) {
                    this.loadLibraries()
                    load_libs_flag = true;
                }
            }

            async loadLibraries() {
                var start = performance.now();
                // this._dotsLoader.style.visibility = "visible";
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

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

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

            showTotal(callFrom) {

                var indices = [];
                this._callFrom = callFrom;
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);

                // 4,5,6,7,-1,9,10,11,12,-1,14,15,16,17,-1,19,20,21,22

                ////// ================================== Highest Overall Total Block Starts ==================================

                // for(var i = 0; i < this._tableColumnNames.length; i++) {
                //     if(this._dropdownIndices.includes(i)) {
                //         indices.push(-1);
                //     }
                //     else if (!this._fixedIndices.includes(i)) {
                //         indices.push(i);
                //     }
                // }
                
              
                var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol", "varCols", "perCols", "vsPy"]
                var CAGR_Indices = [];
                var numericCols = [];
                var cagrFlag = false;
                for(var i = 0; i < this._tableColumnNames.length; i++) {

                    if(considerConditions.includes(this._tableColumnNames[i]["className"])) {
                        indices.push(i);
                    } else if (this._tableColumnNames[i]["className"] == "cagrCol"){
                        indices.push(-2);
                        CAGR_Indices.push(i);
                    } else {
                        indices.push(-1);
                    }
                    ///// Numeric Col Indices
                    if(this._tableColumnNames[i]["className"] == "numericColsCSS" || this._tableColumnNames[i]["className"] == "numericColsCSS numCol") {
                        numericCols.push(i)
                    }

                }
                
                // var cols = {7:[4,5], 8:[4,6],}
                var tempRef = [], refrenceIndex = 0;
                var finalPerCols = {}
                // var cols = {
                //     7:[4,5],
                //     8:[4,6],
                //     13:[10,11],
                //     14:[10,12],
                //     19:[16,17],
                //     20:[16,18],
                // }
                var changeIndex = 0;
                for(var i = 0; i < indices.length; i++) {
                    var sum = 0;
                    var rowIDTotal = this._dataTableObj.rows()[0][0];
                    if(indices[i] != -1 && indices[i] != -2) {
                        var d = this._dataTableObj.column(indices[i]).data();
                        for(var j = 0; j < d.length; j++) {
                            if(isNaN(d[j])) {
                                if(d[j].includes("%")) {
                                    // sum = "- %";
                                    // console.log(indices[i] , tempRef);
                                    if(callFrom == "FY") {

                                        var no_of_per_cols = 2;
                                        if(indices.slice(refrenceIndex, indices[i] + 2).filter(item => item !== -1).length > 0) {
                                            tempRef = indices.slice(refrenceIndex, indices[i] + 2).filter(item => item !== -1)
                                        }
                                        finalPerCols[indices[i]] = tempRef.slice()
    
                                        var value = this._dataTableObj.cell(rowIDTotal, tempRef[0]).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, tempRef[0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1).toString()+" %"
                                        }
                                        
                                    } 
                                    else if(callFrom == "QT") {

                                        // var no_of_per_cols = 5, sum = "-";
                                        // if(indices.slice(refrenceIndex, indices[i] + no_of_per_cols).filter(item => item !== -1).length > 0) {
                                        //     tempRef = indices.slice(refrenceIndex, indices[i] + no_of_per_cols).filter(item => item !== -1).slice(0, 15)
                                        // }
                                        // finalPerCols[indices[i]] = tempRef.slice() 
    
                                        var value = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1).toString()+" %"
                                        }

                                    }
                                    else if(callFrom == "MT") {

                                        var no_of_per_cols = 1;
                                        if(indices.slice(refrenceIndex, indices[i] + 1).filter(item => item !== -1).length > 0) {
                                            tempRef = indices.slice(refrenceIndex, indices[i] + 1).filter(item => item !== -1)
                                        }
                                        finalPerCols[indices[i]] = tempRef.slice()

                                        var value = this._dataTableObj.cell(rowIDTotal, tempRef[0]).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, tempRef[0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1).toString()+" %"
                                        }

                                    }
                                    else if(callFrom == "5Y") {

                                        var value = this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data()
                                        var val_minus_act = this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data()

                                        if(isNaN(value)) {
                                            value = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                        if(isNaN(val_minus_act)){
                                            val_minus_act = parseFloat(this._dataTableObj.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }

                                        var act1 = value - val_minus_act

                                        if(value == 0 && act1 == 0) {
                                            sum = "-"
                                        } else if(value == 0) {
                                            sum = "-100%"
                                        } else if (act1 == 0) {
                                            sum = "100%";
                                        } else {
                                            sum = (val_minus_act / act1).toString()+" %"
                                        }

                                    }
                                  
                                } else {
                                    if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                        sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                    }
                                }
                            } else {
                                if(!isNaN(parseFloat(d[j]))) {
                                    sum += parseFloat(d[j])
                                }
                            }
                        }
                        // console.log(finalPerCols)

                    } 
                    ///// -------------------------------------- CAGR Calculation Starts ------------------------------------
                    //// CAGR = ((Vfinal/Vbegin)^1/t) - 1
                    else if (indices[i] == -2) {
                        cagrFlag = true;
                        var Vbegin= 0, Vfinal = 0, t = (1/4);  
                        Vbegin = this._dataTableObj.cell(rowIDTotal, CAGR_Indices[0] - 15).data()
                        Vfinal = this._dataTableObj.cell(rowIDTotal, CAGR_Indices[0] - 11).data()
                        sum = Math.pow((Vfinal/Vbegin), t) - 1; //// CAGR sum
                        indices[i] =  CAGR_Indices[0];
                        CAGR_Indices = CAGR_Indices.slice(1, );
                    }
                    ///// -------------------------------------- CAGR Calculation Ends --------------------------------------

                    var colorFlag = false;
                    if(!isNaN(sum)) {
                        sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        if(sum > "0" || sum > 0) {
                            colorFlag = true;
                        }
                    } else {
                        if(callFrom == "MT") {
                            refrenceIndex = indices[i] + 1; // 2 bcz 1 for GX_Entry_Date Col & + 1 for next indice 
                        } else if(callFrom == "QT") {
                            // None...
                        }
                        else {
                            refrenceIndex = indices[i] + 2;
                        }
                        if(sum > "0" || sum > 0) {
                            colorFlag = true;
                        }
                        sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                    }

                    var node = this._dataTableObj.cell(rowIDTotal, indices[i].toString()).data(sum).node()
                    if(!numericCols.includes(i) && !cagrFlag) {
                        if(!colorFlag) {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }
                    }
                }
               
                gbl_finalPerCols_FY = finalPerCols;
                console.log(finalPerCols)
                
                ///// ------------------------ Hide Extra Cols STARTS -------------------------
                if(callFrom == "MT") {
                    var varCols = this._dataTableObj.columns(".varCol")[0];
                    var perCols = this._dataTableObj.columns(".perColCSS")[0];
                    var hideColsOfIndex = varCols.concat(perCols);
                    for(var inx = 0; inx < hideColsOfIndex.length; inx++) {
                        this._dataTableObj.column(hideColsOfIndex[inx]).visible(false);
                    }
                } 
                else if(callFrom == "QT") {
                    var perCols = this._dataTableObj.columns(".perCols")[0];
                    for(var inx = 0; inx < perCols.length; inx++) {
                        this._dataTableObj.column(perCols[inx]).visible(false);
                    }
                }
                else if(callFrom == "FY") {
                    var perCols = this._dataTableObj.columns(".perCols")[0];
                    for(var inx = 0; inx < perCols.length; inx++) {
                        this._dataTableObj.column(perCols[inx]).visible(false);
                    }
                }
                else if(callFrom == "5Y") {
                    var varCols = this._dataTableObj.columns(".varCols")[0];
                    var perCols = this._dataTableObj.columns(".perCols")[0];
                    var hideColsOfIndex = varCols.concat(perCols);
                    for(var inx = 0; inx < hideColsOfIndex.length; inx++) {
                        this._dataTableObj.column(hideColsOfIndex[inx]).visible(false);
                    }
                }
                ///// ------------------------ Hide Extra Cols ENDS ---------------------------
                ////// ================================== Highest Overall Total Block Ends ==================================
            }

            applyScaling_FY(scaleTo = "K", numberOfDecimals = 2) {

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

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
                // this._dotsLoader.style.visibility = "hidden";
                // this._table.style.visibility = "visible";
                // this._root.style.display = "block";

            }

            showPercentageWidVariance(scene = null) {

                if(this._callFrom == "MT") 
                {
                    if(scene == "Num") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        var numCols = numCols.concat(selCol);
                        var filteredArray = [];

                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = numCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
    
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(numCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(numCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Var") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var varCols = this._dataTableObj.columns('.varCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        varCols = varCols.concat(selCol);
                        var filteredArray = [];
                       
                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = varCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(varCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(varCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(varCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
    
                        var filteredArray = [];

                        ////// For showing Columns from indices
                        for(var i = 0; i < this._colIndices.length; i++) {
                            for(var j = parseInt(this._colIndices[i]); j <= parseInt(this._colIndices[i]) + this._no_of_succeeding; j++) {
                                filteredArray.push(j)
                            }
                        }
                        filteredArray = perCols.filter(value => filteredArray.includes(value)).concat(Array.from(new Set(this._gxDatesFiltered)))
    
                        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME")) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
    
                        for(var i = 2; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                }
                else if(this._callFrom == "5Y") 
                {
                    this._fixedCols = 20; 
                    var visibleCagrCols = new Set();
                    var cagrCols = this._dataTableObj.columns('.cagrCol')[0];
                    visibleCagrCols.add(cagrCols[0]) ///// BASE CAGR

                    if(this._headerNames_to_show) {
                        if(this._headerNames_to_show.includes("Scenario 1")) {
                            visibleCagrCols.add(cagrCols[1])
                        } 
                        if(this._headerNames_to_show.includes("Scenario 2"))  {
                            visibleCagrCols.add(cagrCols[2])
                        }
                        if(this._headerNames_to_show.includes("Scenario 3"))  {
                            visibleCagrCols.add(cagrCols[3])
                        }
                    } else {
                        for(var i = 0; i < 4; i++) {
                            visibleCagrCols.add(cagrCols[i])
                        }
                    }

                    visibleCagrCols = Array.from(visibleCagrCols);


                    if(scene == "Num") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        numCols.push(3); //// BASE GX Date
                        numCols.push(this._fixedCols - 1); //// BASE CAGR
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        var numCols = numCols.concat(selCol);
                        const filteredArray = numCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (numCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            // if(numCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(numCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Var") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var varCols = this._dataTableObj.columns('.varCols')[0];
                        varCols.push(this._fixedCols - 1); //// BASE CAGR
                        varCols.push(3); //// BASE GX Date
                        selCol.push(2); // selection column base
        
                        const filteredArray = varCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (varCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            varCols = varCols.concat(selCol);
                            // if(varCols.includes(i)) {
                            //     this._dataTableObj.column(i).visible(true);
                            // } else {
                            //     this._dataTableObj.column(i).visible(false);
                            // }
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(varCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        perCols.push(this._fixedCols - 1); //// BASE CAGR
                        perCols.push(3); //// BASE GX Date
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        const filteredArray = perCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || visibleCagrCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                } 
                else if(this._callFrom == "QT") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 8; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        for(var j = i+1; j < i+1+5; j++) {
                                            this._dataTableObj.column(j).visible(true);
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    } 
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        selCol.push(2); // selection column base
        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        // for(var i = 0; i < perCols.length; i++) {
                        //     filteredArray.push(perCols[i] - 10);
                        // }
                        // filteredArray = Array.from(new Set(filteredArray))

                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 18; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 8; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        for(var j = i+1; j < i+1+5; j++) {
                                            this._dataTableObj.column(j).visible(true);
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                }
                else if(this._callFrom == "FY") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 5; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        this._dataTableObj.column(i + 1).visible(true);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }
                    }
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 5; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        this._dataTableObj.column(i + 1).visible(true);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    this._dataTableObj.column(i).visible(true);
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            }
                        }

                    }
                }
            }

            columnVisibility(hideCols, showCols) {

                if(this._callFrom == "MT") {
                    if(hideCols[0] == "Num") {
                        this._stateShown = 'Num';
                        this.showPercentageWidVariance("Num");
                    } 
                    else if(hideCols[0] == "Var") {
                        this._stateShown = 'Var';
                        this.showPercentageWidVariance("Var");
                    }
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }

                } 
                else if (this._callFrom == "5Y") {
                    if(hideCols[0] == "Num") {
                        this._stateShown = 'Num';
                        this.showPercentageWidVariance("Num");
                    } 
                    else if(hideCols[0] == "Var") {
                        this._stateShown = 'Var';
                        this.showPercentageWidVariance("Var");
                    }
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }

                } 
                else if (this._callFrom == "QT") {
                    if(hideCols[0] == "vsPy") {
                        this._stateShown = 'vsPy';
                        this.showPercentageWidVariance("vsPy");
                    } 
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }
                }
                else if (this._callFrom == "FY") {
                    if(hideCols[0] == "vsPy") {
                        this._stateShown = 'vsPy';
                        this.showPercentageWidVariance("vsPy");
                    } 
                    else if(hideCols[0] == "Per") {
                        this._stateShown = 'Per';
                        this.showPercentageWidVariance("Per");
                    }
                }
                ///// ------------------------- For Non - MT  ------------------------------
                else {
                    if(hideCols[0] != -1) {
                        for(var i = 0; i < hideCols.length; i++) {
                            // console.log(hideCols[i])
                            this._dataTableObj.column(hideCols[i]).visible(false);
                        }
                    }
    
                    if(showCols[0] != -1) {
                        for(var i = 0; i < showCols.length; i++) {
                            this._dataTableObj.column(showCols[i]).visible(true);
                        }
                    }
                }
                stateShown =  this._stateShown;
            }

            showScenarios(fixedCols, col_start_indices, top_header_names_to_show, no_of_succeeding_measures) {

                var colIndices = col_start_indices;
                var no_of_succeeding = no_of_succeeding_measures;
                var headerNames_to_show = this._fixedScenario.slice();
                headerNames_to_show = headerNames_to_show.concat(top_header_names_to_show);
                this._headerNames_to_show =headerNames_to_show;
                var fixedCols = fixedCols;
                this._fixedCols = fixedCols;
                var visibleCols = [];
                this._colIndices = colIndices.slice();
                this._no_of_succeeding = no_of_succeeding;


                if(this._callFrom == "MT") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perColCSS")[0];
                    } else if(this._stateShown == "Var") {
                        showCols = this._dataTableObj.columns(".varCol")[0];
                    } else {
                        showCols = this._dataTableObj.columns(".numCol")[0];
                    }
                    this._gxDatesFiltered = [];

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            visibleCols.push(j)
                        }
                    }

                    var visiCols = [];

                    ///// For Hiding Columns form Indices
                    for(var i = fixedCols; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                                visiCols.push(i)
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                       
                    }

                    this._visibleCols = visiCols.slice();

                } 
                else if(this._callFrom == "5Y") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];
                    let cagrCols = this._dataTableObj.columns(".cagrCol")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } else if(this._stateShown == "Var") {
                        showCols = this._dataTableObj.columns(".varCols")[0];
                    } else {
                        showCols = this._dataTableObj.columns(".numericColsCSS")[0];
                    }
                    this._gxDatesFiltered = [];

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            
                            visibleCols.push(j)
                            
                            if(cagrCols.includes(j)) {
                                showCols.push(j);
                            }

                        }
                    }

                    this._visibleCols = visibleCols.slice();

                    ///// For Hiding Columns form Indices
                    for(var i = 20; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                       
                    }
                    
                }
                else if (this._callFrom == "QT") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } 
                    ///// --------------------- vsPy CASE -----------------------
                    else { 
                        showCols = this._dataTableObj.columns(".vsPy")[0];
                    }

                    showCols = Array.from(new Set(showCols.concat(this._dataTableObj.columns(".numericColsCSS")[0])))

                    this._gxDatesFiltered = [];

                    ////// BASE CASE --------------------------
                    for(var i = 8; i < 18; i++) {
                        visibleCols.push(i)
                    }
                    ////// ------------------------------------

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            visibleCols.push(j)
                        }
                    }

                    this._visibleCols = visibleCols.slice();

                    ///// For Hiding Columns form Indices
                    for(var i = 8; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }

                }
                else if (this._callFrom == "FY") {

                    let showCols = [];
                    let gxDates = this._dataTableObj.columns(".selColClass")[0];

                    if(this._stateShown == "Per") {
                        showCols = this._dataTableObj.columns(".perCols")[0];
                    } 
                    ///// --------------------- vsPy CASE -----------------------
                    else { 
                        showCols = this._dataTableObj.columns(".vsPy")[0];
                    }

                    showCols = Array.from(new Set(showCols.concat(this._dataTableObj.columns(".numericColsCSS")[0])))

                    this._gxDatesFiltered = [];

                    ////// BASE CASE --------------------------
                    for(var i = 5; i < 9; i++) {
                        visibleCols.push(i)
                    }
                    ////// ------------------------------------

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            if(!visibleCols.includes(j)) {
                                visibleCols.push(j)
                            }
                        }
                    }

                    this._visibleCols = Array.from(new Set(visibleCols.slice()));

                    ///// For Hiding Columns form Indices
                    for(var i = 8; i < this._tableColumnNames.length; i++) {
                        if(i < this._hideExtraVisibleColumnFromIndex) 
                        {
                            if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                if(gxDates.includes(i)) {
                                    this._gxDatesFiltered.push(i)
                                }
                                this._dataTableObj.column(i).visible(true);
                            } else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        } 
                        else {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }

                }
                else {
                    ////// Fixed cols i.e base case
                    for(var i = 0; i <= fixedCols; i++) {
                        visibleCols.push(i);
                    }

                    ////// For showing Columns from indices
                    for(var i = 0; i < colIndices.length; i++) {
                        for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i]) + no_of_succeeding; j++) {
                            // console.log(j, "->", parseInt(colIndices[i])+no_of_succeeding)
                            this._dataTableObj.column(j).visible(true);
                            visibleCols.push(j)
                        }
                    }

                    ////// For Hiding Columns from indices (Pre-Decided)
                    for(var i = 0; i < this._tableColumnNames.length; i++) {
                        if(!visibleCols.includes(i)) {
                            this._dataTableObj.column(i).visible(false);
                        }
                    }
                }
               
                // console.log(this._dataTableObj.column(2).data())

                const list = document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }

                var topHeader = "<tr role='row'>";

                // Monthly Case
                if(this._callFrom == "MT") {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                    }
                }
                // QTR Case
                else if(this._colOrder.includes("Q1") || this._colOrder.includes("Q2") || this._colOrder.includes("Q3") || this._colOrder.includes("Q4")) {
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
                else if(this._callFrom == "5Y") {
                    ////// Empty Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    ////// Base Case
                    topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                    ////// Rest Case
                    for(var i = 0; i < top_header_names_to_show.length; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_RestCase}' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
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
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
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
                    background-color:#E0E0E0!important;
                }

                #example .clTotalRow > td {
                    background-color:#b7d0e621;
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
    
                #example {
                    position: absolute;
                    width:100%!important;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }
                
                `;
            }

            async render_FY() {

                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "vsPy";
                this._visibleCols = [];
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

                var classname_col = "numericColsCSS";

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
                            if(j == this._customHeaderNames["MES_NAME"].length - 2 || j == this._customHeaderNames["MES_NAME"].length - 1) {
                                classname_col = "perCols";
                            }
                            else if(j == this._customHeaderNames["MES_NAME"].length - 3 || j == this._customHeaderNames["MES_NAME"].length - 4) {
                                classname_col = "vsPy";
                            }
                            // else if(j == this._customHeaderNames["MES_NAME"].length - 4) {
                            //     classname_col = "vsPy1";
                            // }
                            else {
                                classname_col = "numericColsCSS";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                if(j == this._customHeaderNames["MES_NAME"].length - 2 || j == this._customHeaderNames["MES_NAME"].length - 1) {
                                    classname_col = "perCols";
                                } 
                                else if(j == this._customHeaderNames["MES_NAME"].length - 3 || j == this._customHeaderNames["MES_NAME"].length - 4) {
                                    classname_col = "vsPy";
                                }
                                // else if(j == this._customHeaderNames["MES_NAME"].length - 4) {
                                //     classname_col = "vsPy1";
                                // }
                                else {
                                    classname_col = "numericColsCSS";
                                }
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:classname_col
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
                            if(j == this._measureOrder.length - 2 || j == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            } 
                            else if(j == this._measureOrder.length - 3 || j == this._measureOrder.length - 4) {
                                classname_col = "vsPy";
                            }
                            // else if(j == this._measureOrder.length - 4) {
                            //     classname_col = "vsPy1";
                            // }
                            else {
                                classname_col = "numericColsCSS";
                            }
                            table_cols.push({
                                title: col_measures[j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                if(j == this._measureOrder.length - 2 || j == this._measureOrder.length - 1) {
                                    classname_col = "perCols";
                                } 
                                else if(j == this._measureOrder.length - 3 || j == this._measureOrder.length - 4) {
                                    classname_col = "vsPy";
                                }
                                // else if(j == this._measureOrder.length - 4) {
                                //     classname_col = "vsPy1";
                                // }
                                else {
                                    classname_col = "numericColsCSS";
                                }
                                table_cols.push({
                                    title: col_measures[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                 //// ------------------------ var cols indices starts ---------------------------------
                 var colorColIndices = new Set();
                 var considerCons = ["perCols", "vsPy"];
                 for(var i = 0; i < this._tableColumnNames.length; i++) {
                     if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        colorColIndices.add(i);
                     }
                 }
                 //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                    ////// -------------- For subset group total on rowgroup level starts --------------------
                    if(i > 0) {
                        // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                        if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                            templateGroupTotal.push("");
                        } else {
                            // console.log(this._tableColumnNames[i].title)
                            templateGroupTotal.push("");
                        }
                    }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

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
                                targets : "_all",
                               
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:hideCols,  visible: false
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                "targets": Array.from(colorColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
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

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     $('<tr class="group"><td>'+group+'</td>'+templateGroupTotal).addClass(group.toString().replace(" ",""))
                            //                     // '<tr class="group"><td colspan="' +
                            //                     // table_cols.length +
                            //                     // '">' +
                            //                     // group +
                            //                     // '</td></tr>'
                                                
                            //                 )
                            //             last = group
                            //         }
                            //     })
                                // api
                                // .column(groupColumn + 1, { page: 'current' })
                                // .data()
                                // .each(function (group, i) {
                                //     // if (last !== group) {
                                //         $(rows)
                                //             .eq(i)
                                //             .before(
                                //                 $(templateGroupTotal).addClass(group.toString().replace(" ",""))
                                //             )
                                //         // last = group
                                //     // }
                                // })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
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
                        destroy: true,
                    })

                   
                }

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                tbl.col
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
                // if(document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                //     // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                // }

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

                function updateTotalOnRowUpdate(updateFrom, no_of_mes, updateFromRowID) {
                    
                    ///// ----------------------- For Subset Group Total
                    // var parentID = undefined;
                    // for(var [k, v] of Object.entries(groupRowMapping)) {
                    //     if(v.includes(updateFromRowID)) {
                    //         parentID = k;
                    //         break;
                    //     }
                    // }
                    // var subsetChildren = groupRowMapping[parentID].slice(1, );

                    var indices = [];
                    for(var i = 0; i < table_cols.length; i++) {
                        if(table_cols[i]["className"] == "numericColsCSS") {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                    }
                    var no_of_per_cols = 2;
                    // var finalPerCols = {}

                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var rowIDTotal = tbl.rows()[0][0];

                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {
                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]
                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                if(isNaN(d[j]) && d[j].includes("%")) {
                                    // sum = "- %"
                                    // if(indices.slice(refrenceIndex, indices[i] + 2).filter(item => item !== -1).length > 0) {
                                    //     tempRef = indices.slice(refrenceIndex, indices[i] + 2).filter(item => item !== -1)
                                    // }
                                    // finalPerCols[indices[i]] = tempRef.slice()

                                    var value = tbl.cell(rowIDTotal, gbl_finalPerCols_FY[indices[i].toString()][0]).data()
                                    var val_minus_act = tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data()
                                    // var act1 = value - val_minus_act
                                    // sum = (val_minus_act / act1).toString()+" %"

                                    if(isNaN(value)) {
                                        value = parseFloat(tbl.cell(rowIDTotal, gbl_finalPerCols_FY[indices[i].toString()][0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                    }
                                    if(isNaN(val_minus_act)) {
                                        val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                    }

                                    var act1 = value - val_minus_act

                                    if(value == 0 && act1 == 0) {
                                        sum = "-"
                                    } else if(value == 0) {
                                        sum = "-100%"
                                    } else if (act1 == 0) {
                                        sum = "100%";
                                    } else {
                                        sum = (val_minus_act / act1).toString()+" %"
                                    }
                                    // if(!isNaN(parseFloat(d[j]))) {
                                    //     sum += parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                    // }
                                } else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            // refrenceIndex = indices[i] + 2; // 2 bcz 1 for GX_Entry_Date Col & + 1 for next indice 
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }
                        tbl.cell(rowIDTotal, i).data(sum)
                        ////// =============================== Top-Most Total Update Ends ====================================
                        /////  -----------------------------------------------------------------------------------------------
                        ////// =============================== Subset Group Total Update Starts ==============================
                        // for(var k = updateFrom; k < updateFrom + no_of_mes; k++) {
                        //     var subsetSum = 0;
                        //     for(var idx = 0; idx < subsetChildren.length; idx++) {
                        //         var dc = tbl.cell(subsetChildren[idx], k).data();
                        //         if(!isNaN(dc)) {
                        //             subsetSum += dc;
                        //         } else {
                        //             if(gbl_finalPerCols_FY[k.toString()][0]) {
                        //                 var value = tbl.cell(subsetChildren[idx], gbl_finalPerCols_FY[k.toString()][0]).data()
                        //                 var val_minus_act = tbl.cell(subsetChildren[idx], k - no_of_per_cols).data()
                        //                 // var act1 = value - val_minus_act
                        //                 // subsetSum = (val_minus_act / act1).toString()+" %"
                        //                 if(isNaN(value)) {
                        //                     value = parseFloat(tbl.cell(subsetChildren[idx], gbl_finalPerCols_FY[k.toString()][0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                        //                 }
                        //                 if(isNaN(val_minus_act)) {
                        //                     val_minus_act = parseFloat(tbl.cell(subsetChildren[idx], k - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                        //                 }
    
                        //                 var act1 = value - val_minus_act
    
                        //                 if(value == 0 && act1 == 0) {
                        //                     subsetSum = "-"
                        //                 } else if(value == 0) {
                        //                     subsetSum = "-100%"
                        //                 } else if (act1 == 0) {
                        //                     subsetSum = "100%";
                        //                 } else {
                        //                     subsetSum = (val_minus_act / act1).toString()+" %"
                        //                 }
                        //             }
                        //         }
                        //     }
                        //     if(!isNaN(dc)) {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces))
                        //     } else {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces).toString()+"%")
                        //     }
                        // }
                        ////// =============================== Subset Group Total Update Ends ================================
                    }
                   
                }
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, sliceFromBase) 
                {


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

                    var sliced = selOptVal.slice(sliceFromBase, ), data = {};

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
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes, ROW_ID);
                    }
                }

                window.updateRow = updateRow

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );
                var caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;
                var grpRowBy = this._resultSet[0]

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

                        ////// -----------------------------  Show Group-Wise Total Starts --------------------------
                        if(grpRowBy != fixRows[0]) {
                                templateGroupTotal[0] = fixRows[0].slice();
                                templateGroupTotal[1] = fixRows[0].slice();
                                // console.log(templateGroupTotal)
                                for(var ttl = 2; ttl < fixRows.length; ttl++) {
                                    if(isNaN(fixRows[ttl])) {
                                        templateGroupTotal[ttl] = " "
                                    }
                                }
                                var newRow = tbl.row.add(templateGroupTotal.slice())
                                    .draw(false)
                                    .node();
                                // console.log(newRow, templateGroupTotal)
                                newRow.classList.add("group")
                                newRow.classList.add(fixRows[0].toString().replace(" ","")+"_"+fixRows[1].toString().replace(" ",""))
                                grpRowBy = fixRows[0]
                        }
                        ////// -----------------------------  Show Group-Wise Total Ends --------------------------
                   
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
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

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
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

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

                            var select_html = `<select id='${k}' class='row_level_select row_level_select_${k}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
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


                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector("#__widget5 > cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)")
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)").click();
                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                showTotalonRowUpdateFlag = true;
                this.showTotal("FY");

                // Styling Block Ends here
            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- QUARTER -------------------------------------------------------
            // ==========================================================================================================================
            setResultSet_QT(rs, col_to_row = -1, colspan_to_top_headers) {

                // this._dotsLoader.style.visibility = "visible";
                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

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
                #example select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    border-bottom:1px solid #CBCBCB;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
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
                    background-color:#E0E0E0!important;
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
                    width:100%!important;
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

                /* ------------------------- TOTAL TOP-MOST ROW ------------------------------ */

                #example > tbody > tr:nth-child(1) {
                    font-weight:bold;
                }
    
                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }

                `;
            }

            async render_QT() {
                
                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "vsPy";
                this._visibleCols = [];
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

                var classname_col = "numericColsCSS";
               
                if(Object.keys(this._customHeaderNames).length > 0) {


                    for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                        table_cols.push({
                            title: this._customHeaderNames["DIMEN_NAME"][i]
                        })
                    }
        
                    for(var k = 0; k < this._customHeaderNames["MES_NAME"].length; k++) {
                        if(k == this._customHeaderNames["MES_NAME"].length - 1) {
                            classname_col = "perCols";
                        } else if(k == this._customHeaderNames["MES_NAME"].length - 2) {
                            classname_col = "vsPy";
                        } else {
                            classname_col = "numericColsCSS";
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:classname_col
                            })
                        }
                    }

                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i].includes(this._fixedScenario)) {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i],
                                className:"selColClass"
                            })
                        }
                        for(var k = 0; k < this._measureOrder.length; k++) {
                            if(k == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            } else if(k == this._measureOrder.length - 2) {
                                classname_col = "vsPy";
                            } else {
                                classname_col = "numericColsCSS";
                            }
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:classname_col
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
                        title: this._dateColName,
                        className:"selColClass"
                    })
        
                    for(var k = 0; k < this._measureOrder.length; k++) {
                        if(k == this._measureOrder.length - 1) {
                            classname_col = "perCols";
                        } else if(k == this._measureOrder.length - 2) {
                            classname_col = "vsPy";
                        } else {
                            classname_col = "numericColsCSS";
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:classname_col
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
                            if(k == this._measureOrder.length - 1) {
                                classname_col = "perCols";
                            }  else if(k == this._measureOrder.length - 2) {
                                classname_col = "vsPy";
                            } else {
                                classname_col = "numericColsCSS";
                            }
                            for(var j = 0; j < this._colOrder.length; j++) {
                                table_cols.push({
                                    title: this._colOrder[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var perColIndices = new Set();
                var considerCons = ["perCols", "vsPy"];
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        perColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = [];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices_QT.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices_QT.push(i);
                    }
                    if(this._tableColumnNames[i].className == "numericColsCSS") {
                        templateGroupTotal.push("");
                    } else {
                        templateGroupTotal.push("");
                    }
                    // ////// -------------- For subset group total on rowgroup level starts --------------------
                    // if(i > 0) {
                    //     // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                    //     if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                    //         templateGroupTotal.push("");
                    //     } else {
                    //         // console.log(this._tableColumnNames[i].title)
                    //         templateGroupTotal.push(0);
                    //     }
                    // }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }
                // templateGroupTotal[0] = "Total"
                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

                this._indices = indices_QT;


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
                var groupBy = new Set();

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
                            },
                            {
                                "targets": Array.from(perColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
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

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     '<tr class="group"><td colspan="' +
                            //                     table_cols.length +
                            //                     '">' +
                            //                     group +
                            //                     '</td></tr>'
                            //                 )
                            //             last = group
                            //         }
                            //     })
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

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = templateGroupTotal.slice();
                showTotalRow[0], showTotalRow[1] = "Total", "Total"
                var showTotalonRowUpdateFlag = false;
                tbl.row.add(showTotalRow).draw(false)
                /////  ------------------------------------------------------------------

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

                function updateTotalOnRowUpdate(updateFrom, changeLength, updateFromRowID) {
                    
                    ///// ----------------------- For Subset Group Total
                    // var parentID = undefined;
                    // for(var [k, v] of Object.entries(groupRowMapping)) {
                    //     if(v.includes(updateFromRowID)) {
                    //         parentID = k;
                    //         break;
                    //     }
                    // }
                    // var subsetChildren = groupRowMapping[parentID].slice(1, );

                    var indices = [];
                    let considerConditions = ["numericColsCSS", "perCols"];

                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                    }
                    var no_of_per_cols = 5;

                    for(var i = updateFrom; i < updateFrom + changeLength; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {
                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]
                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                if(isNaN(d[j])) {
                                    // sum = "- %"
                                    if(d[j].includes("%")) {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,"")))) {
                                            var value = tbl.cell(rowIDTotal, indices[i] - 10).data()
                                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data()
                                            // var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"
                                            if(isNaN(value)) {
                                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)) {
                                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
        
                                            var act1 = value - val_minus_act
        
                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1).toString()+" %"
                                            }
                                            // sum += parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                            sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                        }
                                    }
                                } else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                        } else {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%";
                        }
                        var rowIDTotal = tbl.rows()[0][0];
                        tbl.cell(rowIDTotal, i).data(sum)
                        ////// =============================== Top-Most Total Update Ends ====================================
                        /////  -----------------------------------------------------------------------------------------------
                        ////// =============================== Subset Group Total Update Starts ==============================
                        // for(var k = updateFrom; k < updateFrom + changeLength; k++) {
                        //     var subsetSum = 0;
                        //     for(var idx = 0; idx < subsetChildren.length; idx++) {
                        //         var dc = tbl.cell(subsetChildren[idx], k).data();
                        //         if(isNaN(dc)) {
                        //             if(!dc.includes("%") && parseFloat(dc.replace(/,{1,}/g,""))) {
                        //                 subsetSum += parseFloat(dc.replace(/,{1,}/g,""))
                        //             } else if(dc.includes("%")) {
                        //                 // subsetSum = "-%";
                        //                 if(gbl_finalPerCols_FY[k.toString()][0]) {
                        //                     var value = tbl.cell(subsetChildren[idx], gbl_finalPerCols_FY[k.toString()][0]).data().replace(/,{1,}/g,"")
                        //                     var val_minus_act = tbl.cell(subsetChildren[idx], k - no_of_per_cols).data().replace(/,{1,}/g,"")
                        //                     var act1 = parseFloat(value) - parseFloat(val_minus_act)
                        //                     subsetSum = (val_minus_act / act1).toString()+" %"
                        //                 }
                        //             }
                        //         }
                        //         else {
                        //             subsetSum += dc;
                        //         }
                        //     }
                        //     if(!isNaN(subsetSum)) {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces))
                        //     } else {
                        //         tbl.cell(parseInt(parentID), k).data(parseFloat(subsetSum).toFixed(no_of_decimalPlaces).toString()+"%")
                        //     }
                        // }
                        ////// =============================== Subset Group Total Update Ends ================================
                    }
                   
                }

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

                    var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                                    + parseInt(state.id) // selection id present at column
                                    + 1;  // to avoid selection column in count

                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, changeLength, ROW_ID);
                    }

                }

                window.updateRow = updateRow

                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                // var scenarioObj = {}
                // // var scenarioObj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // scenarioObj["DropDownFieldName"] = new Set();
                // console.log(scenarioObj)
                // var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);

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

                    if(finalRow.length == (this._dimensions.length - 1) + this._colOrder.length * 3) {
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
                    // var isSelectionUpdatedByUser = false;
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

                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================

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
                
                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").click();
                // Styling Block Ends here

                // isSelectionUpdatedByUser = true;
                showTotalonRowUpdateFlag = true;
                this.showTotal("QT");
            }

            // ==========================================================================================================================
            // ---------------------------------------------------------- Monthly -------------------------------------------------------
            // ==========================================================================================================================

            applyStyling_MT() {
                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("style").innerText += `
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: none;
                    border-width: 0;
                }
    
                /* ------------------------- CUSTOM STYLING --------------------------------- */
    
                #example {
                    width: 100%!important;
                }

                #example select {
                    padding-top:0%;
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    border-bottom:1px solid #CBCBCB;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
                    color:white;
                    /* selected */
                }

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
    
                #example th {
                    text-wrap:nowrap;
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
                    left:0%;
                    font-family: Arial;
                    background-color:#E0E0E0!important;
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
    
                #example {
                    border-collapse: separate;
                    width:100%!important;
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

                /* ------------------------- TOTAL TOP-MOST ROW ------------------------------ */

                #example > tbody > tr:nth-child(1) {
                    font-weight:bold;
                    position:sticky!important;
                    top:80px!important;
                }

                
                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }
                
                `;
            }

            setResultSet_MT(rs, col_to_row = -1, colspan_to_top_headers) {
                
                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping
                // this._hideColsFrom = hideColsFrom;

                var headers = this._headers
                console.log(headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']

                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
                // this._dateColName = selColumnName; //selectionColumn
               
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
                    }
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

                this.render_MT();

            }

            async render_MT() {
                
                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "Num"; // for num - numeric, var - variance, per - percentage;
                this._visibleCols = [];

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
                    for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"numericColsCSS numCol"
                        })
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"varCol"
                        })
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:"numericColsCSS perColCSS"
                        })
                    }
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i] != "FY") {
                            table_cols.push({
                                title: this._customHeaderNames["SCENARIO_NAME"][i],
                                className:"selColClass"
                            })
                        }
                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"numericColsCSS numCol"
                            })
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"varCol"
                            })
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:"numericColsCSS perColCSS"
                            })
                        }
                    }
                }
                else {
                    for (var i = 0; i < col_dimension.length; i++) {
                        table_cols.push({
                            title: col_dimension[i]
                        })
                    }
                    for(var j = 0; j < this._colOrder.length; j++) {
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"numericColsCSS"
                        })
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"varCol"
                        })
                        table_cols.push({
                            title: this._colOrder[j],
                            className:"numericColsCSS perColCSS"
                        })
                    }
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i] != "FY") {
                            table_cols.push({
                                title: this._scenarioOrder[i],
                                className:"selColClass"
                            })
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"numericColsCSS"
                            })
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"varCol"
                            })
                            table_cols.push({
                                title: this._colOrder[j],
                                className:"numericColsCSS perColCSS"
                            })
                        }
                    }
                }
                
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var varColIndices = new Set();
                var considerCons = ["numericColsCSS perColCSS", "varCol", "perColCSS"];
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                        varColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                 //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices_MT.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices_MT.push(i);
                    }
                    if(this._tableColumnNames[i].className == "numericColsCSS") {
                        templateGroupTotal.push(0);
                    } else {
                        templateGroupTotal.push("");
                    }
                    // ////// -------------- For subset group total on rowgroup level starts --------------------
                    // if(i > 0) {
                    //     // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                    //     if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                    //         templateGroupTotal.push("");
                    //     } else {
                    //         // console.log(this._tableColumnNames[i].title)
                    //         templateGroupTotal.push(0);
                    //     }
                    // }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

                this._indices = indices_MT;
                
                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }
                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                var groupBy = new Set();


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
                            },
                            {
                                "targets": Array.from(varColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                       
                        // drawCallback: function (settings) {
                        //     var api = this.api()
                        //     var rows = api.rows({ page: 'current' }).nodes()
                        //     var last = null

                        //     api
                        //         .column(groupColumn, { page: 'current' })
                        //         .data()
                        //         .each(function (group, i) {
                        //             if (last !== group) {
                        //                 $(rows)
                        //                     .eq(i)
                        //                     .before(
                        //                         '<tr class="group"><td colspan="' +
                        //                         table_cols.length +
                        //                         '">' +
                        //                         group +
                        //                         '</td></tr>'
                        //                     )
                        //                 last = group
                        //             }
                        //         })
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        processing: true,
                        // serverSide: true,
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

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
                    } else {
                        showTotalRow.push("")
                    }
                }
                tbl.row.add(showTotalRow).draw(false)

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr>";
                
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
                // 
                // for(var i = 0; i < this._scenarioOrder.length; i++) {
    
                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colOrder.length + 1}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            for(var j = 0; j < this._scenarioOrder.length; j++) {
                                if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                    if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                        topHeader += 
                                        `<th class='top-header' colspan='${this._colOrder.length + 1}'>${this._scenarioOrder[j]}`;
                                        // console.log(this._scenarioOrder[j])
                                    } 
                                    // else {
                                    //     opts += `<option id='${j}' >${this._scenarioOrder[j]}</option>`;
                                    // }
                                }
                            }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               

                // @--- uncomment below line
                // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
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
                var fixRowsObj = {}, masterObj = {};
                const masterRows = [];
                var hMap = {};
                var is_col_updated = false;
                
                function updateTotalOnRowUpdate(updateFrom, changeLength, updateFromRowID) {
                    
                    var indices = [];
                   
                    // for(var i = 0; i < table_cols.length; i++) {
                    //     if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS perColCSS" || table_cols[i]["className"] == "varCol") {
                    //         indices.push(i);
                    //     } else {
                    //         indices.push(-1);
                    //     }
                    // }
                    var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol"]
                    var numericCols = [];
                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }
                    }

                    var no_of_per_cols = 1;

                    for(var i = updateFrom; i < updateFrom + changeLength; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"]

                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i)) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
                                var flagColor = false, data = undefined;
                                
                                if(isNaN(tbl.cell(cell_rid, cell_cid).data())) {
                                    data = parseFloat(tbl.cell(cell_rid, cell_cid).data());
                                    if(tbl.cell(cell_rid, cell_cid).data().includes("%")) {
                                        data = parseFloat(tbl.cell(cell_rid, cell_cid).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""));
                                    }
                                }

                                if(data < 0) {
                                    flagColor = true;
                                }

                                if(flagColor) {
                                    cell_node.style.color = "#A92626";
                                } else {
                                    cell_node.style.color = "#2D7230";
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------

                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                if(isNaN(d[j])) {
                                    // sum = "- %"
                                    if(d[j].includes("%")) {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,"")))) {
                                            var value = tbl.cell(rowIDTotal, gbl_finalPerCols_FY[indices[i].toString()][0]).data()
                                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data()
                                            // var act1 = value - val_minus_act
                                            // sum = (val_minus_act / act1).toString()+" %"
                                            if(isNaN(value)) {
                                                value = parseFloat(tbl.cell(rowIDTotal, gbl_finalPerCols_FY[indices[i].toString()][0]).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
                                            if(isNaN(val_minus_act)) {
                                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                            }
        
                                            var act1 = value - val_minus_act
        
                                            if(value == 0 && act1 == 0) {
                                                sum = "-"
                                            } else if(value == 0) {
                                                sum = "-100%"
                                            } else if (act1 == 0) {
                                                sum = "100%";
                                            } else {
                                                sum = (val_minus_act / act1).toString()+" %"
                                            }
                                            // sum += parseFloat(d[j].replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                                        }
                                    } else {
                                        if(!isNaN(parseFloat(d[j].replace(/,{1,}/g,"")))) {
                                            sum += parseFloat(d[j].replace(/,{1,}/g,""))
                                        }
                                    }
                                } else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)){
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                        } else {
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%";
                        }
                        var rowIDTotal = tbl.rows()[0][0];
                        var node = tbl.cell(rowIDTotal, i).data(sum).node();

                        if(!numericCols.includes(i)) {
                            if(!colorFlag) {
                                node.style.color = "#A92626";
                            } else {
                                node.style.color = "#2D7230";
                            }
                        }
                        ////// =============================== Top-Most Total Update Ends ====================================
                    }
                   
                }

                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // selectData.splice(hMap[0] + 1, 1, ...masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes))
                    // console.log(selectData, sliceFrom)


                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    // @ ---
                    // var sliced = selOptVal.slice(no_of_dimens - no_of_excludes + no_of_mes, ), data = {};
                    // console.log(selOptVal)
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
                    // console.log(tbl.columns('.perColCSS'))

                    var updateFrom = parseInt(sliceFrom)  // length of fixed columns (till base scenario)
                                    + parseInt(state.id) // selection id present at column
                                    + 1;  // to avoid selection column in count
                    if(showTotalonRowUpdateFlag) {
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, changeLength, ROW_ID);
                    }
                }

                window.updateRow = updateRow

                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                var scenarioObj = Object.fromEntries(this._scenarioOrder.slice().map(key => [key, structuredClone(obj)]));
                scenarioObj["DropDownFieldName"] = new Set();
                // console.log(scenarioObj)
                // var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);

                for(var i = 0, prev_key = "", seqID = 0, scenarioMissing = false; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

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
                        var scene = this._resultSet[i][fixedScenarioAt];

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            masterObj[masterKey.join("_#_")]["DropDownSelected"] = new Set()
                        }

                        if(masterObj[masterKey.join("_#_")][scene] != undefined){
                            masterObj[masterKey.join("_#_")][scene][this._resultSet[i].slice(this._dimensions.length - 1, )[0]] = this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), )
                            // console.log(this._resultSet[i].slice(this._dimensions.indexOf(this._dateColName), ),"---")
                            masterObj[masterKey.join("_#_")]["DropDownFieldName"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }

                        if(this._dropdownsSelected.includes(this._resultSet[i][fixedScenarioAt].toUpperCase())) {
                            masterObj[masterKey.join("_#_")]["DropDownSelected"].add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        }
                        // console.log(structuredClone(masterObj))
                        // console.log(this._resultSet[i])

                        i += 1;
                    }

                    prev_key = key;
                }

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

                    // Pushing Measures to finalRow
                    var varianceCol = [];

                    for(const v1 in v) {
                        if(v1 != "DropDownFieldName") {
                            // finalRow.push(Array.from(v["DropDownFieldName"])[0])
                            var f = false;
                            for(const [km, vm] of Object.entries(masterObj[k][v1])) {
                                // console.log(masterObj[k][v1], km, vm)
                                // if(vm[vm.length - 2] != undefined) {
                                //     finalRow.push(vm[vm.length - 2])
                                // } else {
                                //     finalRow.push("-")
                                // }
                                // if(vm.length == 0) {
                                //     for(var h = 0; h < this._measureOrder.length; h++) {
                                //         finalRow.push("-")
                                //     }
                                // } else {
                                if(vm.length == 0) {
                                    for(var h = 0; h < this._measureOrder.length; h++) {
                                        finalRow.push("-")
                                    }
                                } else {
                                    if(masterObj[k]["DropDownFieldName"].size > 1) {
                                        for(var h = 2; h < 2 + this._measureOrder.length; h++) {
                                            if(vm[h] != undefined) {
                                                finalRow.push(vm[h])
                                            } else {
                                                finalRow.push("-")
                                            }
                                        }
                                    } else {
                                        f = true;
                                        for(var h = 2; h < 2 + this._measureOrder.length; h++) {
                                            if(vm[h] != undefined) {
                                                finalRow.push(vm[h])
                                            }
                                        }
                                    }
                                }
                                   
                                // }
                            }
                            if(!f) {
                                finalRow.push("--Selection--")
                            }
                            // varianceCol.push("--Selection--")
                            // console.log(masterObj[k][v1])
                        } else {
                            // dropdown data
                        }
                    }

                    finalRow.pop()
                    // var len = finalRow.slice().length;
                    // var temp = finalRow.slice();
                    // finalRow.push("--Variance--")
                    finalRow = finalRow.concat(varianceCol).slice(0, table_cols.length);
                    fixRowsObj[k] = finalRow.slice()


                    // console.log("--------->>>>>>>", finalRow)
                    var flag = false;

                    //////// if only base is coming ----------- 
                    var emptyFinal = finalRow.slice(0, 2);
                    if(masterObj[k]["DropDownFieldName"].size == 1) {
                        var repeatBase = finalRow.slice(this._dimensions.indexOf(this._dateColName) - 1, ((this._colOrder.length + 1) * this._measureOrder.length));
                        for(var l = 0, lcl_cnt = 0; l < table_cols.length; l++) {

                            if(emptyFinal.length == table_cols.length) {
                                break;
                            }

                            if(lcl_cnt >= repeatBase.length) {
                                lcl_cnt = 0;
                            }

                            emptyFinal.push(repeatBase[lcl_cnt])

                            lcl_cnt++;
                        }
                        flag = true;
                        finalRow = emptyFinal.slice();
                    } 
                    else if(finalRow.length < table_cols.length) {
                        for(var l = finalRow.length; l < table_cols.length; l++) {
                            finalRow.push("-")
                        }
                    }
                   

                    // Adding Dropdowns to finalRow
                    var varianceCnt = this._measureOrder.length
                    var sliceLen = (this._colOrder.length * varianceCnt) + fixedScenarioAt + 1;
                    var sliced = finalRow.slice(sliceLen)
                    // console.log("---------", sliced)
                    var dropdownIDs = new Set();
                    var selectionCnt = 0, cnt = 0;
                    var flag_sel = sliced[0];
                    var dropdownArr = Array.from(masterObj[k]["DropDownFieldName"]).slice(1,);
                    var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    var caughtDropDownsAt = new Set();
                    // var dropdownSel = Array.from(masterObj[k]["DropDownSelected"]).slice();
                    // console.log(dropdownArr);


                    for(var kk = 0, optIdx = 0; kk < sliced.length; kk++) {

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
                      
                        // console.log("!!!!",sliced[kk])
                        cnt++;
                        kk += this._colOrder.length * varianceCnt; // 2 bcz of variance ... 
                        selectionCnt++;
                        optIdx += 1;
                    }
                    // for(var kk = 0, optIdx = 0; kk < len; kk++) {
                    //     var select_html = `<select id='${kk}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${finalRow[0]}_#_${finalRow[1]}", ${fixedScenarioAt + 1 + this._colOrder.length}, ${this._colOrder.length})'>`;
                    //     var options = "";
                    //     for(var p = 0; p < dropdownArr.length; p++) {
                    //         if(optIdx == p) {
                    //             options += `<option id='${p}' selected>${dropdownArr[p]}</option>`
                    //         } else {
                    //             options += `<option id='${p}' >${dropdownArr[p]}</option>`
                    //         }
                    //     }
                    //     select_html += options + `</select>`;
                    //     // console.log("!!!!",sliced[kk])
                    //     sliced[kk] = select_html;
                    //     kk += this._colOrder.length;
                    //     optIdx += 1;
                    // }
                    // console.log(sliced)
                    finalRow = finalRow.slice(0, sliceLen).concat(sliced);

                    ////// ================================ Group by Row Starts =========================================
                    if(!Array.from(groupBy).includes(finalRow[0])) {
                        groupBy.add(finalRow[0])
                        templateGroupTotal[1] = finalRow[0]
                        var node = tbl.row.add(templateGroupTotal).draw(false).node()
                        node.classList.add("group")
                    }
                    ////// ================================ Group by Row Ends ============================================


                    tbl.row.add(finalRow).draw(false);
                    if(!flag){
                        this.setSelectorsSelectedValue(dropdownIDs, Array.from(caughtDropDownsAt));
                    }
                    // tbl.row.child(finalRow)
                    // console.log(finalRow);
                }

                this.applyStyling_MT();

                // Styling Block Starts
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

                // Styling Block Ends here
                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                showTotalonRowUpdateFlag = true;
                this.showTotal("MT");
                   
               
            }

            setResultSet_5Y(rs, col_to_row = -1, colspan_to_top_headers) {

                // this.reinitialize_changedProperties_ClassVariables();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table" style="visibility:hidden;">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                // this._dotsLoader.style.visibility = "visible";
                // this._table.style.visibility = "hidden";
                // this._root.style.display = "inline-grid";

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

                this.render_5Y();

            }

            applyStyling_5Y() {

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
                    background-color:#DCE6EF;
                    outline:none;
                }
    
                option {
                    background-color:white;
                    color:black;
                }
                
                select:focus>option:checked {
                    background:#0460A9;
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
                    background-color:#E0E0E0!important;
                }

                #example .clTotalRow > td {
                    background-color:#b7d0e621;
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
    
                #example {
                    position: absolute;
                    width:100%!important;
                    border-collapse: separate;
                }
    
                .mt-2 {
                    margin-top: 0% !important;
                }
    
                /* ------------------------- REMOVE TOP MOST PADDING ------------------------- */
    
                #example_wrapper > div.dt-layout-row.dt-layout-table > div {
                    padding:0%!important;
                }
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- */
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                }

                /* --------------------------- FREEZE 1ST COLUMN ---------------------------- */

                #example > thead > tr:nth-child(2) > th.truncate.dt-orderable-none, #example > thead > tr:nth-child(1) > th:nth-child(1),
                #example > tbody > tr:nth-child(2) > td.truncate, #example > tbody > tr > td.truncate
                {
                    position:sticky;
                    left:0px;
                }

                td.truncate, #example > tbody > tr > td:not(.truncate) {
                    mix-blend-mode: hue;
                    scroll-behavior: smooth;
                }
                
                `;
            }

            async render_5Y() {

                if (!this._resultSet) {
                    return
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                this._stateShown = "Num";
                this._visibleCols = [];
               
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
        
                        var classname_col = "";

                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j],
                                    className:classname_col
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            table_cols.push({
                                title: col_dimension[i]
                            })
                        }
        
                        var classname_col = "";

                        for(var j = 0; j < this._measureOrder.length; j++) {
                            if(j < 5) {
                                classname_col = "numericColsCSS";
                            } else if (j < 10) {
                                classname_col = "varCols";
                            } else if (j < 15) {
                                classname_col = "perCols";
                            } else {
                                classname_col = "cagrCol";
                            }
                            table_cols.push({
                                title: col_measures[j],
                                className:classname_col
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i],
                                    className:"selColClass"
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                if(j < 5) {
                                    classname_col = "numericColsCSS";
                                } else if (j < 10) {
                                    classname_col = "varCols";
                                } else if (j < 15) {
                                    classname_col = "perCols";
                                } else {
                                    classname_col = "cagrCol";
                                }
                                table_cols.push({
                                    title: col_measures[j],
                                    className:classname_col
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                //// ------------------------ var cols indices starts ---------------------------------
                var varColIndices = new Set();
                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._tableColumnNames[i]["className"] == "varCols" || this._tableColumnNames[i]["className"] == "perCols") {
                        varColIndices.add(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // var indices = [];
                this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                var templateGroupTotal = ["Total"];
                // var templateGroupTotal = `<tr class="clTotalRow"><td>Total</td>`;
                // var templateGroupTotal = "";

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(this._dropdownIndices.includes(i)) {
                        indices.push(-1);
                    } 
                    else if (!this._fixedIndices.includes(i)) {
                        indices.push(i);
                    }
                    ////// -------------- For subset group total on rowgroup level starts --------------------
                    if(i > 0) {
                        // templateGroupTotal += '<td class="numericColsCSS">'+i+'</td>';
                        if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                            templateGroupTotal.push("");
                        } else {
                            // console.log(this._tableColumnNames[i].title)
                            templateGroupTotal.push("");
                        }
                    }
                    ////// -------------- For subset group total on rowgroup level Ends ----------------------
                }

                // templateGroupTotal += `</tr>`;
                
                // console.log($(templateGroupTotal));

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
                                targets : "_all",
                               
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:hideCols,  visible: false
                            },
                            { 
                                targets:1, className:"truncate"
                            },
                            {
                                "targets": Array.from(varColIndices),
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    if (cellData >= 0 || cellData >= "0") {
                                        $(td).css('color', '#2D7230')
                                    }
                                    else if (cellData < 0 || cellData < "0") {
                                        $(td).css('color', '#A92626')
                                    }
                                }
                            },
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

                            // api
                            //     .column(groupColumn, { page: 'current' })
                            //     .data()
                            //     .each(function (group, i) {
                            //         if (last !== group) {
                            //             $(rows)
                            //                 .eq(i)
                            //                 .before(
                            //                     $('<tr class="group"><td>'+group+'</td>'+templateGroupTotal).addClass(group.toString().replace(" ",""))
                            //                     // '<tr class="group"><td colspan="' +
                            //                     // table_cols.length +
                            //                     // '">' +
                            //                     // group +
                            //                     // '</td></tr>'
                                                
                            //                 )
                            //             last = group
                            //         }
                            //     })
                                // api
                                // .column(groupColumn + 1, { page: 'current' })
                                // .data()
                                // .each(function (group, i) {
                                //     // if (last !== group) {
                                //         $(rows)
                                //             .eq(i)
                                //             .before(
                                //                 $(templateGroupTotal).addClass(group.toString().replace(" ",""))
                                //             )
                                //         // last = group
                                //     // }
                                // })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        destroy: true,
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
                        destroy: true,
                    })

                   
                }

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                tbl.col
                this._dataTableObj = tbl;
                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                var showTotalRow = ["Total", "Total"];
                var showTotalonRowUpdateFlag = false;
                for(var i = 2; i < this._tableColumnNames.length; i++) {
                    if(this._indices.includes(i)) {
                        showTotalRow.push("")
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
                // if(document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                //     // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                // }

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

                function updateTotalOnRowUpdate(updateFrom, no_of_mes, updateFromRowID) {

                    var indices = [];
                    // for(var i = 0; i < table_cols.length; i++) {
                    //     if(table_cols[i]["className"] == "numericColsCSS") {
                    //         indices.push(i);
                    //     } else {
                    //         indices.push(-1);
                    //     }
                    // }
                    var considerConditions = ["numericColsCSS", "numericColsCSS perColCSS", "varCol", "numericColsCSS numCol", "varCols", "perCols"]
                    var CAGR_Indices = [updateFrom + no_of_mes - 1];
                    var numericCols = [];

                    for(var i = 0; i < table_cols.length; i++) {
                        if(considerConditions.includes(table_cols[i]["className"])) {
                            indices.push(i);
                        } else if (table_cols[i]["className"] == "cagrCol"){
                            indices.push(-2);
                        } else {
                            indices.push(-1);
                        }
                        ///// Numeric Col Indices
                        if(table_cols[i]["className"] == "numericColsCSS" || table_cols[i]["className"] == "numericColsCSS numCol") {
                            numericCols.push(i)
                        }
                    }

                    // var no_of_per_cols = 2;

                    for(var i = updateFrom; i < updateFrom + no_of_mes; i++) {
                        ////// =============================== Top-Most Total Update Starts =================================
                        var sum = 0;
                        var rowIDTotal = tbl.rows()[0][0];

                        var flag = false;
                        var d = tbl.column(i).data();
                        for(var j = 1; j < d.length; j++) {

                            var node = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];


                            ///// ---------------------- For cell color red or green starts ---------------------------
                            if(!numericCols.includes(i) && i < updateFrom + no_of_mes - 1) {
                                var cell_rid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["row"];
                                var cell_cid = tbl.column(i).nodes()[j]["_DT_CellIndex"]["column"];
                                var cell_node = tbl.cell(cell_rid, cell_cid).node();
    
                                if(tbl.cell(cell_rid, cell_cid).data() < 0) {
                                    cell_node.style.color = "#A92626";
                                } else {
                                    cell_node.style.color = "#2D7230";
                                }
                            }
                            ///// ---------------------- For cell color red or green ends -----------------------------
                           
                            if(!Object.keys(groupRowMapping).includes(j.toString()) && !Object.keys(groupRowMapping).includes(node.toString())){
                                if(isNaN(d[j]) && d[j].includes("%") && indices[i] != -2) {

                                    ////// Future ---- to be made dynamic logic
                                    flag = true;

                                }
                                else if(indices[i] == -2) {

                                    var Vbegin= 0, Vfinal = 0, t = (1/4);  
                                    Vbegin = tbl.cell(rowIDTotal, CAGR_Indices[0] - 15).data()
                                    Vfinal = tbl.cell(rowIDTotal, CAGR_Indices[0] - 11).data()
                                    sum = Math.pow((Vfinal/Vbegin), t) - 1; //// CAGR sum
                                    indices[i] =  CAGR_Indices[0];
                                    CAGR_Indices = CAGR_Indices.slice(1, );
                                    break;

                                } 
                                else {
                                    if(!isNaN(parseFloat(d[j]))) {
                                        sum += parseFloat(d[j])
                                    }
                                }
                            }
                        }
                        if(flag) {

                            var value = tbl.cell(rowIDTotal, indices[i] - 10).data()
                            var val_minus_act = tbl.cell(rowIDTotal, indices[i] - 5).data()

                            if(isNaN(value)) {
                                value = parseFloat(tbl.cell(rowIDTotal, indices[i] - 10).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }
                            if(isNaN(val_minus_act)){
                                val_minus_act = parseFloat(tbl.cell(rowIDTotal, indices[i] - 5).data().replace(/,{1,}/g,"").replace(/%{1,}/g,""))
                            }

                            var act1 = value - val_minus_act

                            if(value == 0 && act1 == 0) {
                                sum = "-"
                            } else if(value == 0) {
                                sum = "-100%"
                            } else if (act1 == 0) {
                                sum = "100%";
                            } else {
                                sum = (val_minus_act / act1).toString()+" %"
                            }

                        }
                        // console.log(d,"<<<<",sum)
                        var colorFlag = false;
                        if(!isNaN(sum)) {
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces)
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                        } else {
                            if(sum > "0" || sum > 0) {
                                colorFlag = true;
                            }
                            // refrenceIndex = indices[i] + 2; // 2 bcz 1 for GX_Entry_Date Col & + 1 for next indice 
                            sum = parseFloat(sum).toFixed(no_of_decimalPlaces).toString()+"%"
                        }
                        var node = tbl.cell(rowIDTotal, i).data(sum).node();

                        if(!numericCols.includes(i) && i < updateFrom + no_of_mes - 1) {
                            if(!colorFlag) {
                                node.style.color = "#A92626";
                            } else {
                                node.style.color = "#2D7230";
                            }
                        }
                    }
                   
                }
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, sliceFromBase) 
                {


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

                    var sliced = selOptVal.slice(sliceFromBase, ), data = {};

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
                        state.style.backgroundColor="#C4DBEE";
                        state.style.border = "2px solid #0460A9";
                        state.style.color="#2C2C2C";
                        updateTotalOnRowUpdate(updateFrom, no_of_mes, ROW_ID);
                    }
                }

                window.updateRow = updateRow

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );
                var caughtDropDownsAt = new Set(), caughtDropDownsCnt = 0;
                var grpRowBy = this._resultSet[0]

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

                        ////// -----------------------------  Show Group-Wise Total Starts --------------------------
                        if(grpRowBy != fixRows[0]) {
                                templateGroupTotal[0] = fixRows[0].slice();
                                templateGroupTotal[1] = fixRows[0].slice();
                                // console.log(templateGroupTotal)
                                for(var ttl = 2; ttl < fixRows.length; ttl++) {
                                    if(isNaN(fixRows[ttl])) {
                                        templateGroupTotal[ttl] = " "
                                    }
                                }
                                var newRow = tbl.row.add(templateGroupTotal.slice())
                                    .draw(false)
                                    .node();
                                // console.log(newRow, templateGroupTotal)
                                newRow.classList.add("group")
                                newRow.classList.add(fixRows[0].toString().replace(" ","")+"_"+fixRows[1].toString().replace(" ",""))
                                grpRowBy = fixRows[0]
                        }
                        ////// -----------------------------  Show Group-Wise Total Ends --------------------------
                   
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
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

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
                        dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])

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

                            var select_html = `<select id='${k}' class='row_level_select row_level_select_${k}_${this._dataTableObj.rows().count()}' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length}, ${this._dimensions.indexOf(this._dateColName)})'>`;
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

                this.applyStyling_5Y();

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


                // this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                // document.querySelector("#__widget5 > cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)")
                // document.querySelector("cw-combine-table").shadowRoot.querySelector("#example > thead > tr > th:nth-child(2)").click();
                document.querySelector(this._widgetID+"cw-combine-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                showTotalonRowUpdateFlag = true;
                this.showTotal("5Y");

                // Styling Block Ends here
            }

        }
        customElements.define('cw-combine-table', CustomTable)
    })()
