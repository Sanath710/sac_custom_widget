var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

var load_libs_flag = false;
var widget_ID_Name = {};
var is_lib_loaded_exportToExcel = false;
var replaceZero = "";

//// -------- Data Objects Starts -----------
var DO_FY = {};
//// -------- Data Objects Ends -------------


function getRawValue(cell_data) {
    var regex = "<span style='display:none;'>(.*?)<\/span>";
    return parseFloat(cell_data.match(regex)[1])
}


; (function () {

        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            
          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <div id="root" style="width:100%; height:100%; padding:0%; overflow: auto; position: absolute; display: inline-grid;">
            <table id="example" class="table">
                <thead>
                </thead>
                <tbody></tbody>
            </table>
          </div>
        `

        var no_of_decimalPlaces = 1, no_of_decimalPlaces_K = 0, no_of_decimalPlaces_M = 1;

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
                await getScriptPromisify(
                    'https://cdn.datatables.net/2.0.1/js/dataTables.min.js'
                )
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
            }
            
            onCustomWidgetBeforeUpdate(changedProperties) {

                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dropdownsSelected = this._headers["DROPDOWN_SELECTED"];
                    this.no_of_decimalPlaces_K = this._headers["no_of_decimal_K"];
                    this.no_of_decimalPlaces_M = this._headers["no_of_decimal_M"];
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
                    this.no_of_decimalPlaces_K = this._headers["no_of_decimal_K"];
                    this.no_of_decimalPlaces_M = this._headers["no_of_decimal_M"];
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

            createDataObjects(call_from, is_scaled) {

var start = performance.now();

                if(call_from == "FY") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_FY = this._dataTableObj.columns('.perCols')[0];
                    var selCols_FY = this._dataTableObj.columns('.selColClass')[0];
    

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_FY["ScaledData"] == undefined) { DO_FY["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_FY.length; a++) {

                                var cell_data = row[numCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = cell_data.toString();
                                    }

                                    row[numCols_FY[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_FY.length; a++) {

                                var cell_data = row[vsPyCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    row[vsPyCols_FY[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_FY.length; a++) {

                                var cell_data = row[perCols_FY[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "- %"
                                    }

                                    row[perCols_FY[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_FY["ScaledData"][i] = row.slice();

                            if(DO_FY["ScaledData"]["KeyMap"] == undefined) {
                                DO_FY["ScaledData"]["KeyMap"] = {}
                            }

                            DO_FY["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.vsPy')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_FY["OriginalData"] == undefined) { DO_FY["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_FY["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_FY["OriginalData"]["KeyMap"] == undefined) {
                                DO_FY["OriginalData"]["KeyMap"] = {}
                            }

                            DO_FY["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "QT") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_QT = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_QT = this._dataTableObj.columns('.vsPy')[0];
                    var perCols_QT = this._dataTableObj.columns('.perCols')[0];
                    var selCols_QT = this._dataTableObj.columns('.selColClass')[0];

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_QT["ScaledData"] == undefined) { DO_QT["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_QT.length; a++) {

                                var cell_data = row[numCols_QT[a]];

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data) && cell_data.includes(",")) {
                                        cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    row[numCols_QT[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_QT.length; a++) {

                                var cell_data = row[vsPyCols_QT[a]];
                                // var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data) && cell_data.includes(",")) {
                                        // if(cell_data.includes("%")) {
                                        //     cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                        //     isPerCell = true;
                                        // } 
                                        // else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        // }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    // if(isPerCell) {
                                    //     cell_data = nFormat.format(cell_data).toString() + " %";
                                    // } else {
                                    cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    row[vsPyCols_QT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_QT.length; a++) {

                                var cell_data = row[perCols_QT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "- %"
                                    }

                                    row[perCols_QT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_QT["ScaledData"][i] = row.slice();

                            if(DO_QT["ScaledData"]["KeyMap"] == undefined) {
                                DO_QT["ScaledData"]["KeyMap"] = {}
                            }

                            DO_QT["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.vsPy')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_QT["OriginalData"] == undefined) { DO_QT["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_QT["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_QT["OriginalData"]["KeyMap"] == undefined) {
                                DO_QT["OriginalData"]["KeyMap"] = {}
                            }

                            DO_QT["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "MT") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_MT = this._dataTableObj.columns('.numericColsCSS.numCol')[0];
                    var varCols_MT = this._dataTableObj.columns('.varCol')[0];
                    var perCols_MT = this._dataTableObj.columns('.numericColsCSS.perColCSS')[0];

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_MT["ScaledData"] == undefined) { DO_MT["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_MT.length; a++) {

                                var cell_data = row[numCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0].toString().replace(/,{1,}/g,"")) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = cell_data.toString();
                                    }

                                    row[numCols_MT[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < varCols_MT.length; a++) {

                                var cell_data = row[varCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0].toString().replace(/,{1,}/g,"")) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + " %";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN") {
                                        cell_data = "-"
                                    }

                                    row[varCols_MT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_MT.length; a++) {

                                var cell_data = row[perCols_MT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%" || cell_data == "NaN %") {
                                        cell_data = "- %"
                                    }

                                    if(cell_data == "NaN") {
                                        cell_data = "-"
                                    }

                                    row[perCols_MT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_MT["ScaledData"][i] = row.slice();

                            if(DO_MT["ScaledData"]["KeyMap"] == undefined) {
                                DO_MT["ScaledData"]["KeyMap"] = {}
                            }

                            DO_MT["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS.numCol')[0];
                        var varcols = this._dataTableObj.columns('.varCol')[0];
                        var percols = this._dataTableObj.columns('.numericColsCSS.perColCSS')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_MT["OriginalData"] == undefined) { DO_MT["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0].toString().replace(/,{1,}/g,"")).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_MT["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_MT["OriginalData"]["KeyMap"] == undefined) {
                                DO_MT["OriginalData"]["KeyMap"] = {}
                            }

                            DO_MT["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "5Y") {

                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_5Y = this._dataTableObj.columns('.numericColsCSS')[0];
                    var vsPyCols_5Y = this._dataTableObj.columns('.varCols')[0];
                    var perCols_5Y = this._dataTableObj.columns('.perCols')[0];
    

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y["ScaledData"] == undefined) { DO_5Y["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_5Y.length; a++) {

                                var cell_data = row[numCols_5Y[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    row[numCols_5Y[a]] = parseFloat(cell_data).toFixed(0);
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_5Y.length; a++) {

                                var cell_data = row[vsPyCols_5Y[a]];
                                // var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]) / 1000;
                                            // isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                        }
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    row[vsPyCols_5Y[a]] = parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M);
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Starts ----------------
                            for(var a = 0; a < perCols_5Y.length; a++) {

                                var cell_data = row[perCols_5Y[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",") && cell_data != "-") {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    // if(isPerCell) {
                                    //     cell_data = nFormat.format(cell_data).toString() + "%";
                                    // } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    // }

                                    if(cell_data == "NaN%") {
                                        cell_data = "-"
                                    }

                                    row[perCols_5Y[a]] = parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M).toString()+"%";
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_5Y["ScaledData"][i] = row.slice();

                            if(DO_5Y["ScaledData"]["KeyMap"] == undefined) {
                                DO_5Y["ScaledData"]["KeyMap"] = {}
                            }

                            DO_5Y["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

                        var numcols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var varcols = this._dataTableObj.columns('.varCols')[0];
                        var percols = this._dataTableObj.columns('.perCols')[0];
                        
                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y["OriginalData"] == undefined) { DO_5Y["OriginalData"] = {} }

                            this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_5Y["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_5Y["OriginalData"]["KeyMap"] == undefined) {
                                DO_5Y["OriginalData"]["KeyMap"] = {}
                            }

                            DO_5Y["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }

                }
                else if(call_from == "5Y_QT") {

var start = performance.now();
                    var dt_tbl_obj = this._dataTableObj;
                    var numCols_5YQT =  Array.from(new Set(this._dataTableObj.columns('.numericColsCSS')[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0])));
                    var vsPyCols_5YQT = Array.from(new Set(this._dataTableObj.columns('.vsPy')[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                    var perCols_5YQT = Array.from(new Set(this._dataTableObj.columns('.perCols')[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));
                    
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Num-Var-Per Fetching -- Render_5YQT took approx : ") 
var start = performance.now();

                    if(is_scaled) {

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_M});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y_QT["ScaledData"] == undefined) { DO_5Y_QT["ScaledData"] = {} }

                            var row = dt_tbl_obj.rows().data()[i].slice();
                            
                            ///// ------------ For Num Cols Starts --------------
                            for(var a = 0; a < numCols_5YQT.length; a++) {

                                var cell_data = row[numCols_5YQT[a]];

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data) && cell_data.includes(",")) {
                                        cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    row[numCols_5YQT[a]] = cell_data;
                                
                                }
                                
                            }
                            ///// ------------ For Num Cols Ends ----------------

                            ///// ===============================================

                            ///// ------------ For vsPy Cols Starts -------------
                            for(var a = 0; a < vsPyCols_5YQT.length; a++) {

                                var cell_data = row[vsPyCols_5YQT[a]];

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data) && cell_data.includes(",")) {
                                        cell_data = parseFloat(cell_data.replace(/,{1,}/g,"")) / 1000;
                                    } else {
                                        cell_data = cell_data / 1000;
                                    }

                                    cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    row[vsPyCols_5YQT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For vsPy Cols Ends ---------------

                            ///// ===============================================

                            ///// ------------ For per Cols Ends ----------------
                            for(var a = 0; a < perCols_5YQT.length; a++) {

                                var cell_data = row[perCols_5YQT[a]];
                                var isPerCell = false;

                                if(cell_data != undefined && cell_data != "-") {

                                    if(isNaN(cell_data)) {
                                        if(cell_data.includes("%")) {
                                            cell_data = parseFloat(cell_data.split("%")[0]).toFixed(this.no_of_decimalPlaces_M);
                                            isPerCell = true;
                                        } 
                                        else if(cell_data.includes(",")) {
                                            cell_data = parseFloat(cell_data.replace(/,{1,}/g,"").replace(/%{1,}/g,"")).toFixed(this.no_of_decimalPlaces_M);
                                        }
                                    } else {
                                        cell_data = cell_data;
                                    }

                                    if(isPerCell) {
                                        cell_data = nFormat.format(cell_data).toString() + "%";
                                    } else {
                                        cell_data = nFormat.format(parseFloat(cell_data).toFixed(this.no_of_decimalPlaces_M));
                                    }

                                    if(cell_data == "NaN%") {
                                        cell_data = "-"
                                    }

                                    row[perCols_5YQT[a]] = cell_data;
                                
                                }

                            }
                            ///// ------------ For per Cols Ends ----------------

                            ///// ===============================================


                            DO_5Y_QT["ScaledData"][i] = row.slice();

                            if(DO_5Y_QT["ScaledData"]["KeyMap"] == undefined) {
                                DO_5Y_QT["ScaledData"]["KeyMap"] = {}
                            }

                            DO_5Y_QT["ScaledData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;

                        }

                    } else {

var start = performance.now();

                        var numcols =  Array.from(new Set(this._dataTableObj.columns('.numericColsCSS')[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0])));
                        var varcols =  Array.from(new Set(this._dataTableObj.columns('.vsPy')[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                        var percols =  Array.from(new Set(this._dataTableObj.columns('.perCols')[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));
  
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Num-Var-Per Fetching -- Render_5YQT took approx : ") 
var start = performance.now();

                        var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: this.no_of_decimalPlaces_K});

                        for(var i = 0; i < dt_tbl_obj.rows().count(); i++) {

                            if(DO_5Y_QT["OriginalData"] == undefined) { DO_5Y_QT["OriginalData"] = {} }

                            // this._dataTableObj.rows().data()
                            var removedDecimalRow = dt_tbl_obj.rows().data()[i].slice();
                            for(var rr = 0; rr < removedDecimalRow.length; rr++) {
                                if(numcols.includes(rr) || varcols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString()))) {
                                        if(removedDecimalRow[rr].toString().includes(".") && removedDecimalRow[rr].toString() != "-") {
                                            removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().replace(/,{1,}/g,"")).toFixed(this.no_of_decimalPlaces_K))
                                        }
                                    }
                                }
                                else if(percols.includes(rr)) {
                                    if(!isNaN(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(0))) {
                                        removedDecimalRow[rr] = nFormat.format(parseFloat(removedDecimalRow[rr].toString().split("%")[0]).toFixed(this.no_of_decimalPlaces_K)).toString()+"%";
                                    }
                                }
                            }

                            DO_5Y_QT["OriginalData"][i] = removedDecimalRow.slice();
                            // DO_FY["OriginalData"][i] = dt_tbl_obj.rows().data()[i];

                            if(DO_5Y_QT["OriginalData"]["KeyMap"] == undefined) {
                                DO_5Y_QT["OriginalData"]["KeyMap"] = {}
                            }

                            DO_5Y_QT["OriginalData"]["KeyMap"][dt_tbl_obj.rows().data()[i][0]+"_#_"+dt_tbl_obj.rows().data()[i][1]] = i;


                        }

                    }
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"K-Scaling -- Render_5YQT took approx : ") 

                }

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Creating Scaled Object took approx : ")

            }


            applyScaling_FY(scaleTo = "K") {

                // var dt_tbl_obj = this._dataTableObj;
                // var numCols_FY = this._dataTableObj.columns('.numericColsCSS')[0];
                // var vsPyCols_FY = this._dataTableObj.columns('.vsPy')[0];
                // var perCols_FY = this._dataTableObj.columns('.perCols')[0];

                if(scaleTo == "K") 
                {
                    DO_FY["Current_Scale"] = "K";

                    if(!Object.keys(DO_FY).includes("OriginalData")) {
                        this.createDataObjects("FY", false);
                    }

                    var selectionsIDs = [];

                    if(DO_FY["DRP"]) {
                        selectionsIDs = Object.keys(DO_FY["DRP"]);
                    }
                    
                    var reSelectIDs = []
                    // console.log(DO_FY);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {

                        this._dataTableObj.row(i).data(DO_FY["OriginalData"][i].slice()).draw();

                        if(selectionsIDs.includes(i.toString())) {
                            reSelectIDs.push(i);
                        }
                    }

                    for(var i = 0; i < reSelectIDs.length; i++) {
                        this.preserveSelection(reSelectIDs[i], Object.keys(DO_FY["DRP"][reSelectIDs[i]]), Object.values(DO_FY["DRP"][reSelectIDs[i]]), "FY");
                    }

                } 
                else 
                {
                    DO_FY["Current_Scale"] = "M";

                    this.createDataObjects("FY", true);

                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._dataTableObj.row(i).data(DO_FY["ScaledData"][i].slice()).draw();
                    }
                }

                console.log(DO_FY);

            }


            showPercentageWidVariance(scene = null) {

                if(this._callFrom == "MT") {

                    var showCols = [];
                    var hideCols = [];

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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            } else {
                                if(numCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(varCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            } else {
                                if(perCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                    }
                }
                else if(this._callFrom == "5Y") {

                    this._fixedCols = 17; 
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
                        numCols.push(this._fixedCols - 1); //// BASE CAGR
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(numCols.includes(i) || visibleCagrCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 7;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 7;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 7;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 7;
                        }
                    } 
                    else if(scene == "Var") {
                        // var perCols = this._dataTableObj.columns('.perColCSS')[0];
                        // var numCols = this._dataTableObj.columns('.numCol')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var varCols = this._dataTableObj.columns('.varCols')[0];
                        var showCols = [];
                        var hideCols = [];
                        varCols.push(this._fixedCols - 1); //// BASE CAGR
                        selCol.push(2); // selection column base
        
                        const filteredArray = varCols.filter(value => this._visibleCols.includes(value)).concat(this._gxDatesFiltered);
        
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < this._fixedCols; i++) {
                            if(i != 2 && (varCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        // filteredBase.pop();
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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(varCols.includes(i) || visibleCagrCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        
                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 6;
                        }

                    }
                    else if(scene == "Per") {
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        perCols.push(this._fixedCols - 1); //// BASE CAGR
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
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
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(perCols.includes(i) || visibleCagrCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 6;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 6;
                        }
                    }
                } 
                else if(this._callFrom == "QT") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
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
                                            // this._dataTableObj.column(j).visible(true);
                                            showCols.push(j)
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                    } 
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
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
                                            // this._dataTableObj.column(j).visible(true);
                                            showCols.push(j)
                                        }
                                        i = j-1;
                                    }
                                    ////// --------------------------------------------------
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);
                        
                    }
                }
                else if(this._callFrom == "5Y_QT") {

                    if(scene == "vsPy") {
                        
                        var numCols  =  Array.from(new Set(this._dataTableObj.columns('.numericColsCSS')[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0])));
                        var vsPyCols =  Array.from(new Set(this._dataTableObj.columns('.vsPy')[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
                        selCol.push(2); // selection column base

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < (this._measureOrder.length * 3) + this._measureOrder.length + 4; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if((filteredArray.includes(i) && !numCols.includes(i)) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    // if(this._gxDatesFiltered.includes(i)) {
                                    //     for(var j = i+1; j < i+1+5; j++) {
                                    //         this._dataTableObj.column(j).visible(true);
                                    //     }
                                    //     i = j-1;
                                    // }
                                    ////// --------------------------------------------------
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(vsPyCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i)
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);


                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 17;
                        }
                    } 
                    else if(scene == "Per") {

                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0]);
                        var perCols = this._dataTableObj.columns('.perCols')[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0]);
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
                        selCol.push(2); // selection column base
        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        // for(var i = 0; i < perCols.length; i++) {
                        //     filteredArray.push(perCols[i] - 10);
                        // }
                        // filteredArray = Array.from(new Set(filteredArray))

                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < (this._measureOrder.length * 3) + this._measureOrder.length + 4; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if((filteredArray.includes(i) && !numCols.includes(i)) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    // if(this._gxDatesFiltered.includes(i)) {
                                    //     for(var j = i+1; j < i+1+5; j++) {
                                    //         this._dataTableObj.column(j).visible(true);
                                    //     }
                                    //     i = j-1;
                                    // }
                                    ////// --------------------------------------------------
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            } else {
                                if(perCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 17;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 17;
                        }
                    }
                    else if(scene == "Num") {

                        var numCols  =  Array.from(new Set(this._dataTableObj.columns('.numericColsCSS')[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0])));
                        var perCols  =  Array.from(new Set(this._dataTableObj.columns('.perCols')[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));
                        var vsPyCols =  Array.from(new Set(this._dataTableObj.columns('.vsPy')[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
                        selCol.push(2); // selection column base
        
                        var filteredArray = numCols.filter(value => this._visibleCols.includes(value));
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < (this._measureOrder.length * 3) + this._measureOrder.length + 4; i++) {
                            if(i != 2 && (numCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 3; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            numCols = numCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if((filteredArray.includes(i) && !(perCols.includes(i) || vsPyCols.includes(i))) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    // if(this._gxDatesFiltered.includes(i)) {
                                    //     for(var j = i+1; j < i+1+5; j++) {
                                    //         this._dataTableObj.column(j).visible(true);
                                    //     }
                                    //     i = j-1;
                                    // }
                                    ////// --------------------------------------------------
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            } else {
                                if(numCols.includes(i)) {
                                    // this._dataTableObj.column(i).visible(true);
                                    showCols.push(i);
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i);
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                        ////// 
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 21;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 21;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 21;
                        }
                        if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                            document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 21;
                        }
                    }
                }
                else if(this._callFrom == "FY") {
                    if(scene == "vsPy") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var vsPyCols = this._dataTableObj.columns('.vsPy')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];

                        const filteredArray = vsPyCols.filter(value => this._visibleCols.includes(value));
                            
                        /// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (vsPyCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        /// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 4; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            vsPyCols = vsPyCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        // this._dataTableObj.column(i + 1).visible(true);
                                        showCols.push(i + 1);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        // this._dataTableObj.column(i).visible(true);
                                        showCols.push(i);
                                    }
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(vsPyCols.includes(i) || numCols.includes(i)) {
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        // this._dataTableObj.column(i).visible(true);
                                        showCols.push(i)
                                    }
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                    }
                    else if(scene == "Per") {
                        var numCols = this._dataTableObj.columns('.numericColsCSS')[0];
                        var perCols = this._dataTableObj.columns('.perCols')[0];
                        var selCol = this._dataTableObj.columns('.selColClass')[0];
                        var showCols = [];
                        var hideCols = [];
                        
                        var filteredArray = perCols.filter(value => this._visibleCols.includes(value));
                            
                        ///// -------------- Handling Base Scenario Visibility Starts ---------------------
                        const filteredBase = [];
                        for(var i = 0; i < 9; i++) {
                            if(i != 2 && (perCols.includes(i) || i == this._dimensions.indexOf("SCENARIO_NAME"))) {
                                filteredBase.push(i);
                            }
                        }
                        ///// -------------- Handling Base Scenario Visibility Ends -----------------------
        
                        for(var i = 4; i < this._hideExtraVisibleColumnFromIndex; i++) {
                            perCols = perCols.concat(selCol);
                            if(this._visibleCols.length > 0) {
                                if(filteredArray.includes(i) || filteredBase.includes(i) || this._gxDatesFiltered.includes(i)) {
                                    ////// Handling Numeric Cols ---------------------------
                                    if(this._gxDatesFiltered.includes(i)) {
                                        // this._dataTableObj.column(i + 1).visible(true);
                                        showCols.push(i + 1);
                                        i += 1;
                                    }
                                    ////// --------------------------------------------------
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        // this._dataTableObj.column(i).visible(true);
                                        showCols.push(i)
                                    }
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            } else {
                                if(perCols.includes(i) || numCols.includes(i)) {
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        // this._dataTableObj.column(i).visible(true);
                                        showCols.push(i)
                                    }
                                } else {
                                    // this._dataTableObj.column(i).visible(false);
                                    hideCols.push(i)
                                }
                            }
                        }

                        this._dataTableObj.columns(hideCols).visible(false);
                        this._dataTableObj.columns(showCols).visible(true);

                    }
                }
            }

            columnVisibility(hideCols, showCols) {

                if(this._resultSet != undefined) {

                    if(this._callFrom == "MT") {
                        if(hideCols[0] == "Num") {
                            this._stateShown = 'Num';
                            this.showPercentageWidVariance("Num");
                            if(hideCols[1] != undefined && document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
                        } 
                        else if(hideCols[0] == "Var") {
                            this._stateShown = 'Var';
                            this.showPercentageWidVariance("Var");
                            if(hideCols[1] != undefined &&  document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
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
                            if(hideCols[1] != undefined && document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
                        } 
                        else if(hideCols[0] == "Var") {
                            this._stateShown = 'Var';
                            this.showPercentageWidVariance("Var");
                            if(hideCols[1] != undefined && document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
                        }
                        else if(hideCols[0] == "Per") {
                            this._stateShown = 'Per';
                            this.showPercentageWidVariance("Per");
                        }
    
                        // Color Cagr
                        let cagrCols = this._dataTableObj.columns(".cagrCol")[0];
                        var cagrRowIndices = this._dataTableObj.rows().indexes();
                        stateShown5Y_FY = this._stateShown;
    
                        if(hideCols[0] == "Var" || hideCols[0] == "Per") {
                            for(var i = 0; i < cagrRowIndices.length; i++) {
                                for(var j = 0; j < cagrCols.length; j++) {
                                    var nodeVal = this._dataTableObj.cell(cagrRowIndices[i], cagrCols[j]).data().toString().replace(/,{1,}/g,"").replace(/%{1,}/g,"");
                                    var node = this._dataTableObj.cell(cagrRowIndices[i], cagrCols[j]).node();
                                    if(nodeVal >= "0" || nodeVal > 0) {
                                        node.style.color = "#2D7230";
                                    } else {
                                        node.style.color = "#A92626";
                                    }
                                }
                            }
                        } else {
                            for(var i = 0; i < cagrRowIndices.length; i++) {
                                for(var j = 0; j < cagrCols.length; j++) {
                                    var node = this._dataTableObj.cell(cagrRowIndices[i], cagrCols[j]).node();
                                    node.style.color = "#212121";
                                }
                            }
                        }
    
                    } 
                    else if (this._callFrom == "5Y_QT") {
                        if(hideCols[0] == "Var") {
                            this._stateShown = 'vsPy';
                            this.showPercentageWidVariance("vsPy");
                            if(hideCols[1] != undefined && document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
                        } 
                        else if(hideCols[0] == "Per") {
                            this._stateShown = 'Per';
                            this.showPercentageWidVariance("Per");
                        }
                        else if(hideCols[0] == "Num") {
                            this._stateShown = 'Num';
                            this.showPercentageWidVariance("Num");
                            if(hideCols[1] != undefined && document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)") != undefined) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = hideCols[1];
                            }
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
              
            }

            showScenarios(fixedCols, col_start_indices, top_header_names_to_show, no_of_succeeding_measures) {

                if(this._resultSet != undefined) {
                    
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
                        for(var i = 17; i < this._tableColumnNames.length; i++) {
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
                        for(var i = 5; i < 10; i++) {
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
                            if(i <= this._hideExtraVisibleColumnFromIndex) 
                            {
                                if(visibleCols.includes(i) && (showCols.includes(i) || gxDates.includes(i))) {
                                    if(gxDates.includes(i)) {
                                        this._gxDatesFiltered.push(i)
                                    }
                                    if(!this._hide_Individual_ExtraVisibleColumnOfIndices.includes(i)) {
                                        this._dataTableObj.column(i).visible(true);
                                    }
                                } else {
                                    this._dataTableObj.column(i).visible(false);
                                }
                            } 
                            else {
                                this._dataTableObj.column(i).visible(false);
                            }
                        }

                    }
                    else if (this._callFrom == "5Y_QT") {

                        let showCols = [];
                        let gxDates = this._dataTableObj.columns(".selColClass")[0];

                        if(this._stateShown == "Per") {
                            showCols =  Array.from(new Set(this._dataTableObj.columns(".perCols")[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));
                        } 
                        ///// --------------------- vsPy CASE -----------------------
                        else if(this._stateShown == "vsPy") { 
                            showCols =  Array.from(new Set(this._dataTableObj.columns(".vsPy")[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                        }
                        ///// --------------------- Num CASE -----------------------
                        else if(this._stateShown == "Num") { 
                            showCols =  Array.from(new Set(this._dataTableObj.columns(".numericColsCSS")[0].concat(this._dataTableObj.columns(".numericColsCSS.rightBorder")[0])));
                        }

                        // showCols = Array.from(new Set(showCols.concat(this._dataTableObj.columns(".numericColsCSS")[0])))

                        this._gxDatesFiltered = [];

                        ////// BASE CASE --------------------------
                        for(var i = 3; i < 55; i++) {
                            if(this._stateShown == "Per" && showCols.includes(i)) {
                                visibleCols.push(i)
                            } else if(this._stateShown == "Num" && showCols.includes(i))  {
                                visibleCols.push(i)
                            } else if (this._stateShown == "vsPy" && showCols.includes(i)) {
                                visibleCols.push(i)
                            }
                        }
                        ////// ------------------------------------

                        ////// For showing Columns from indices
                        for(var i = 0; i < colIndices.length; i++) {
                            
                            for(var j = parseInt(colIndices[i]); j < parseInt(colIndices[i]) + (this._measureOrder.length * 3) + this._measureOrder.length + 1; j++) {
                                
                                // if(this._stateShown == "Per" && showCols.includes(j)) {
                                //     visibleCols.push(j)
                                // } else if(this._stateShown == "Num" && showCols.includes(j))  {
                                //     visibleCols.push(j)
                                // } else if (this._stateShown == "vsPy" && showCols.includes(j)) {
                                    visibleCols.push(j)
                                // }

                                // if(gxDates.includes(j)) {
                                //     visibleCols.push(j)
                                //     this._gxDatesFiltered.push(j)
                                // }
                            }

                        }

                        this._visibleCols = visibleCols.slice();

                        ///// For Hiding Columns form Indices
                        for(var i = 3; i < this._tableColumnNames.length; i++) {

                            if(i < this._hideExtraVisibleColumnFromIndex + 53) 
                            {
                                if(visibleCols.includes(i)) {

                                    if(this._stateShown == "Per" && showCols.includes(i)) 
                                    {
                                        this._dataTableObj.column(i).visible(true);
                                    } 
                                    else if(this._stateShown == "Num" && showCols.includes(i))  
                                    {
                                        this._dataTableObj.column(i).visible(true);
                                    } 
                                    else if (this._stateShown == "vsPy" && showCols.includes(i)) 
                                    {
                                        this._dataTableObj.column(i).visible(true);
                                    }

                                    if(gxDates.includes(i)) {
                                        this._gxDatesFiltered.push(i)
                                        this._dataTableObj.column(i).visible(true);
                                    }

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

                    const list = document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead");

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
                    else if(this._callFrom == "QT") {
                    // else if(this._colOrder.includes("Q1") || this._colOrder.includes("Q2") || this._colOrder.includes("Q3") || this._colOrder.includes("Q4")) {
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
                    else if(this._callFrom == "5Y_QT") {

                        if(this._stateShown == "Num") {
                            ////// Empty Case
                            topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                            ////// Base Case
                            topHeader += `<th class='top-header' colspan='21' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                            ////// Rest Case
                            for(var i = 0; i < top_header_names_to_show.length; i++) {
                                topHeader += `<th class='top-header' colspan='21' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                            }
                        } else {
                            ////// Empty Case
                            topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                            ////// Base Case
                            topHeader += `<th class='top-header' colspan='17' id='${this._customTopHeader[0].replace(" ","")}' >${this._customTopHeader[0]}</th>`
                            ////// Rest Case
                            for(var i = 0; i < top_header_names_to_show.length; i++) {
                                topHeader += `<th class='top-header' colspan='17' id='${top_header_names_to_show[i].replace(" ","")}' >${top_header_names_to_show[i]}</th>`
                            }
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

                    document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);

                    if(this._callFrom == "5Y") {
                        ///////
                        if(this._stateShown != "Per" && this._stateShown != "Var") {
                            ////// 
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 7;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 7;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 7;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 7;
                            }
                        } else {
                            ////// 
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 6;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 6;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 6;
                            }
                            if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 6;
                            }
                        }
                    }
                    else if(this._callFrom == "5Y_QT") {
                        ///////
                        // if(this._stateShown != "Per" && this._stateShown != "Var") {
                        //     ////// 
                        //     if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                        //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 7;
                        //     }
                        //     if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                        //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 7;
                        //     }
                        //     if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                        //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 7;
                        //     }
                        //     if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                        //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 7;
                        //     }
                        //  } else {
                        //      ////// 
                        //      if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)")) {
                        //          document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = 6;
                        //      }
                        //      if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)")) {
                        //          document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = 6;
                        //      }
                        //      if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)")) {
                        //          document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = 6;
                        //      }
                        //      if(document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)")) {
                        //          document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").colSpan = 6;
                        //      }
                        //  }
                    }
                }
                
            }

            preserveSelection(rowid, selector_ids, valArr = [], call_from) {

                selector_ids = Array.from(selector_ids);

                /////////////// For Color ---------------- 
                var idArr = [], changeCellColr = [];

                var vsPyCols   =  Array.from(new Set(this._dataTableObj.columns(".vsPy")[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                var perCols    =  Array.from(new Set(this._dataTableObj.columns(".perCols")[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));
                var varCols_5Y = this._dataTableObj.columns(".varCols")[0];

                for(var i = 0; i < selector_ids.length; i++) {
                    var num = parseInt(selector_ids[i].split("_")[0]);
                    idArr.push(num);
                    for(var j = num; j < num + this._measureOrder.length; j++) {
                        if(vsPyCols.includes(j) || perCols.includes(j) || varCols_5Y.includes(j)) {
                            changeCellColr.push(j);
                        }
                    }
                }
                /////////////// For Color ---------------- 

                for(var i = 0; i < valArr.length; i++) {

                    this._dataTableObj
                    .rows()
                    .nodes()
                    .each(row => row.classList.remove('selected'));

                    this._dataTableObj.row(rowid).node().setAttribute("class","selected")
                        
                    for(var i = 0; i < valArr.length; i++) {
                        var selectorID = ".row_level_select_"+selector_ids[i];
                        var selElement = document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector(selectorID);
                        if(selElement && selElement.selectedIndex != undefined) {
                            selElement.selectedIndex = valArr[i];
                            // console.log(selector_ids)
                            // console.log(selElement)
                            selElement.dispatchEvent(new Event("change"));
                        }

                        // console.log(">>>",Object.keys(DO_FY["DRP_USR_TRIGGERED"]).includes(rowid.toString()));
                        // console.log("--->>>",Object.keys(DO_FY["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i]));

                        if(selElement) {
                            selElement.style.border = "none";
                            selElement.style.backgroundColor = "#DCE6EF";
                        }
                       
                        if(call_from == "FY") {

                            if( DO_FY["DRP_USR_TRIGGERED"] && 
                                DO_FY["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_FY["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "QT") {

                            if( DO_QT["DRP_USR_TRIGGERED"] && 
                                DO_QT["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_QT["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "MT") {
                            
                            if( DO_MT["DRP_USR_TRIGGERED"] && 
                                DO_MT["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_MT["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "5Y") {
                            
                            if( DO_5Y["DRP_USR_TRIGGERED"] && 
                                DO_5Y["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_5Y["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }
                        else if(call_from == "5Y_QT") {
                            
                            if(DO_5Y_QT["DRP_USR_TRIGGERED"] && 
                                DO_5Y_QT["DRP_USR_TRIGGERED"][rowid.toString()] != undefined && 
                                Object.keys(DO_5Y_QT["DRP_USR_TRIGGERED"][rowid.toString()]).includes(selector_ids[i])) {
                                
                                if(selElement) {
                                    selElement.style.backgroundColor="#C4DBEE";
                                    selElement.style.border = "2px solid #0460A9";
                                }

                            }

                        }

                    }

                    // var row_id = this._dataTableObj.row(':last')[0]
                    var row_id = rowid;
                    for(var j = 0; j < changeCellColr.length; j++) {

                        var node = this._dataTableObj.cell(row_id, changeCellColr[j]).node();
                        var data = this._dataTableObj.cell(row_id, changeCellColr[j]).data();

                        if(data <= 0 || data <= "0") {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }

                    }
                    
                }
            }

            setSelectorsSelectedValue(selector_ids, valArr = [], callFrom) {

                selector_ids = Array.from(selector_ids);

                /////////////// For Color ---------------- 
                var idArr = [], changeCellColr = [];

                var vsPyCols = this._dataTableObj.columns(".vsPy")[0];
                var perCols = this._dataTableObj.columns(".perCols")[0];


                for(var i = 0; i < selector_ids.length; i++) {
                    var num = parseInt(selector_ids[i].split("_")[0]);
                    idArr.push(num);
                    if(callFrom == "FY") {
                        for(var j = num; j <= num + this._measureOrder.length; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    } else if(callFrom == "QT") {
                        for(var j = num; j < num + this._colOrder.length * 3; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    } else if(callFrom == "MT") {

                        vsPyCols = this._dataTableObj.columns(".varCol")[0];
                        perCols = this._dataTableObj.columns(".perColCSS")[0];

                        // num += 3; 
                        changeCellColr = [];
                        changeCellColr = perCols.concat(vsPyCols);
                        // for(var j = num; j < num + this._colOrder.length * 3; j++) {
                        //     if(vsPyCols.includes(j) || perCols.includes(j)) {
                        //         changeCellColr.push(j);
                        //     }
                        // }
                    } else if(callFrom == "5Y") {

                        vsPyCols = this._dataTableObj.columns(".varCols")[0];
                        perCols = this._dataTableObj.columns(".perCols")[0];

                        for(var j = num; j < num + this._measureOrder.length; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    } else if(callFrom == "5Y_QT") {

                        vsPyCols =  Array.from(new Set(this._dataTableObj.columns(".vsPy")[0].concat(this._dataTableObj.columns(".vsPy.rightBorder")[0])));
                        perCols  =  Array.from(new Set(this._dataTableObj.columns(".perCols")[0].concat(this._dataTableObj.columns(".perCols.rightBorder")[0])));

                        num += 23;

                        for(var j = num; j < num + (this._measureOrder.length * 3) - 7; j++) {
                            if(vsPyCols.includes(j) || perCols.includes(j)) {
                                changeCellColr.push(j);
                            }
                        }
                    }
                   
                }
                /////////////// For Color ---------------- 


                for(var i = 0; i < valArr.length; i++) {

                    this._dataTableObj
                    .rows()
                    .nodes()
                    .each(row => row.classList.remove('selected'));

                    this._dataTableObj.row(':last').node().setAttribute("class","selected")
                        
                    for(var i = 0; i < valArr.length; i++) {
                        var selectorID = ".row_level_select_"+selector_ids[i];
                        var selElement = document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector(selectorID);
                        if(selElement && selElement.selectedIndex != undefined) {
                            selElement.selectedIndex = valArr[i];
                            // console.log(selector_ids)
                            // console.log(selElement)
                            selElement.dispatchEvent(new Event("change"));
                        }
                       
                    }

                    var row_id = this._dataTableObj.row(':last')[0]
                    // console.log(this._dataTableObj.row(':last').data())
                    for(var j = 0; j < changeCellColr.length; j++) {

                        var node = this._dataTableObj.cell(row_id, changeCellColr[j]).node();
                        var data = this._dataTableObj.cell(row_id, changeCellColr[j]).data();

                        if(data <= 0 || data <= "0") {
                            node.style.color = "#A92626";
                        } else {
                            node.style.color = "#2D7230";
                        }

                    }
                    
                }

                // document.querySelector("cw-table-v2").shadowRoot.querySelector("#\\30").selectedIndex = 2;
                // console.log(document.querySelector("cw-table-v2").shadowRoot.querySelector("#\\30").parentNode.parentNode.setAttribute("class","selected"));
                // console.log(document.querySelector("cw-table-v2").shadowRoot.querySelector("#\\30").parentNode.parentNode);
                // document.querySelector("cw-table-v2").shadowRoot.querySelector("#\\30").dispatchEvent(new Event("change"));
            }

            applyStyling_FY() {

                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("style").innerText += `
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

                #dimensionSwitch, #dimensionSwitch_1 {
                    padding: 4%;
                    border: none;
                    font-weight: bold;
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
    
                #example .actual,  #example .variance,  #example .percentage {
                    text-align:right!important;
                }

                #example .actual {
                    color:#212121!important;
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
    
                #example > tbody > tr.group > td.truncate {
                    max-width:50%;
                    padding-left: 0.3% !important;
                    white-space: nowrap;
                    overflow: hidden;
                    /* text-overflow: ellipsis; */
                }

                 #example > tbody > tr:not(.group) > td.truncate {
                    max-width:50%;
                    padding-left: 0.7% !important;
                    white-space: nowrap;
                    overflow: hidden;
                    /* text-overflow: ellipsis; */
                }

                /*
                #example .truncate {
                    padding: 0.7% !important;
                    max-width:50%;
                    padding-left: 2%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                */
    
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
    
                /* --------------------------- 1ST TOP TOTAL ROW ---------------------------- 
    
                #example > tbody > tr:nth-child(1) > td {
                    font-weight:bold;
                }

                #example > tbody > tr:nth-child(1) {
                    position:sticky!important;
                    top:80px!important;
                } */
                
                `;
            }

            gxDate_visibility(setAs) {

                var gx_date_indices = this._dataTableObj.columns('.col_gx_date')[0].slice(1,);

                if(setAs == "false" || setAs == false) {
                    this._dataTableObj.columns(gx_date_indices).visible(false);
                } else {
                    this._dataTableObj.columns(gx_date_indices).visible(true);
                }

                if(this._callFrom == "FY") {
                    if(setAs == "false" || setAs == false) {
                        // document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = "4";
                        document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = "4";
                        document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = "4";
                    } else {
                        document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").colSpan = "5";
                        document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").colSpan = "5";
                        document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(4)").colSpan = "5";
                    }
                }
              
            }

            setResultSet_FY(rs, colspan_to_top_headers, currentScale_and_Show) {

                // this.reinitialize_changedProperties_ClassVariables();
                var start = performance.now();

                if(this._table) {
                    this._table.remove();
                    this._root.innerHTML = `
                     <table id="example" class="table">
                        <thead>
                        </thead>
                        <tbody></tbody>
                    </table>    
                    `
                    this._table = this._shadowRoot.getElementById('example')
                    // console.log( document.querySelector("#"+this["parentNode"].id+" > cw-table-v2").shadowRoot.querySelector("#example > colgroup:nth-child(2)"))
                    // document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > colgroup:nth-child(2)").remove();
                }

                this._resultSet = [];


                this._callFrom = "FY";
                var headers = this._headers
                // console.log(headers);

                var remove = ["@MeasureDimension"]
                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._measureOrder = headers["@MeasureDimension"]

                this._dateColIndex = this._dimensions.indexOf("GX_Date");
                this._dateColName = this._dimensions[this._dateColIndex];
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Dimensions", this._dimensions)
                console.log("Measure Order", this._measureOrder)

             
                this._currentScaling = currentScale_and_Show["CurrentScale"];
                this._stateShown = currentScale_and_Show["Visible"];
                // this._varPreserveSelection = currentScale_and_Show["PreserveSelection"];
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
                // this._shownScenarios_ID_RS = currentScale_and_Show["ShowScenario"].split("_#_")[0].split(",");
                // this._shownScenarios_Text_RS = currentScale_and_Show["ShowScenario"].split("_#_")[1].split(",");
                this._versionChangeHeader = currentScale_and_Show["VersionChangeHeader"].split(",");

                no_of_decimalPlaces_K = this.no_of_decimalPlaces_K;
                no_of_decimalPlaces_M = this.no_of_decimalPlaces_M;
                
                if(this._currentScaling == "K") {
                    no_of_decimalPlaces = no_of_decimalPlaces_K;
                    replaceZero = "0";
                } else {
                    no_of_decimalPlaces = no_of_decimalPlaces_M;
                    replaceZero = "0.0";
                }

                console.log("No. of Decimal Places", no_of_decimalPlaces)

                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            if(rs[i]["@MeasureDimension"].formattedValue.includes("%")) {
                                var v = rs[i]["@MeasureDimension"].formattedValue;
                                if(v.includes("+")) {
                                    v = v.split("+")[1];
                                }
                                tempArr.push(v)
                            } else {
                                tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces).toString()+" <span style='display:none;'>"+rs[i]["@MeasureDimension"].rawValue.toString()+"</span>")
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
                                    var v = rs[i]["@MeasureDimension"].formattedValue;
                                    if(v.includes("+")) {
                                        v = v.split("+")[1];
                                    }
                                    tempArr.push(parseFloat(v))
                                } else {
                                    tempArr.push(parseFloat(rs[i]["@MeasureDimension"].formattedValue.replace(/,{1,}/g,"")).toFixed(no_of_decimalPlaces).toString()+" <span style='display:none;'>"+rs[i]["@MeasureDimension"].rawValue.toString()+"</span>")
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

                var end = performance.now();
                var time = end - start;
                console.log("setResultSet_FY took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                var start = performance.now();

                this.render_FY();

                var end = performance.now();
                var time = end - start;
                console.log("Render_FY took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

            }


            async render_FY() {

                // DO_FY = {}

                if (!this._resultSet) {
                    return
                }

                DO_FY["Current_Scale"] =  this._currentScaling;
                DO_FY["Parent_Child_Indices"] = {}

                if(this._varPreserveSelection == "FALSE") {
                    DO_FY = {};
                }

                this._widgetID = "#"+this["parentNode"].id+" > ";
                // this._stateShown = "vsPy";
                this._visibleCols = [];

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = this._dateColIndex;
                this._object_key_till = this._dimensions.indexOf("Scenario_Name");
                this._customDateName = "";

                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                // col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                var classname_col = "actual";

                  
                function dimensionVisibility_FY(state, _widgetID) {

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id

                    if(selOptID == "country") {
                        tbl.column(0).visible(true);
                        tbl.column(1).visible(false);
                    } 
                    else if(selOptID == "brand") {
                        tbl.column(0).visible(false);
                        tbl.column(1).visible(true);

                        // $('#example thead th:eq(1)').html('My new column name')
                        document.querySelector(_widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(1)").innerHTML = state;
                        document.querySelector(_widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").innerHTML = state;
                    } 
                    else {
                        tbl.column(0).visible(true);
                        tbl.column(1).visible(true);

                        document.querySelector(_widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(1)").innerHTML = state;
                        document.querySelector(_widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").innerHTML = "Brand";
                    }

                    // console.log(state, selOptID)
                }

                window.dimensionVisibility_FY = dimensionVisibility_FY;

                if(Object.keys(this._customHeaderNames).length > 0) {

                    for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                        if(i == 0) {
                            table_cols.push({
                                title: `<select id='dimensionSwitch' onChange='dimensionVisibility_FY(this, "${this._widgetID.toString()}")'> <option id='country' selected='selected' >Country</option> <option id='brand'>Brand</option> <option id='country_brand'>Country & Brand</option></select>`
                            })
                        } 
                        else {
                            if(this._customHeaderNames["DIMEN_NAME"][i] != "Scenario_Name") {
                                if(this._dateColName == this._customHeaderNames["DIMEN_NAME"][i]) {
                                    table_cols.push({
                                        title: this._customHeaderNames["DIMEN_NAME"][i],
                                        className:"col_gx_date"
                                    })
                                    this._customDateName = this._customHeaderNames["DIMEN_NAME"][i];
                                } else {
                                    table_cols.push({
                                        title: this._customHeaderNames["DIMEN_NAME"][i]
                                    })
                                }
                            }
                        }
                    }
        
                    for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                        if(j == 3) {
                            classname_col = "percentage";
                        }
                        else if(j == 1) {
                            classname_col = "variance";
                        }
                        else {
                            classname_col = "actual";
                        }
                        table_cols.push({
                            title: this._customHeaderNames["MES_NAME"][j],
                            className:classname_col
                        })
                    }
                       
                    for(var i = 0; i < 2; i++) {

                        table_cols.push({
                            title: this._customDateName,
                            className:"col_gx_date"
                        })

                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            if(j == 3) {
                                classname_col = "percentage";
                            }
                            else if(j == 1) {
                                classname_col = "variance";
                            }
                            else {
                                classname_col = "actual";
                            }
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j],
                                className:classname_col
                            })
                        }
                    }

                } else {
                    // for (var i = 0; i < col_dimension.length; i++) {
                    //     if(col_dimension[i] != "Scenario_Name") {
                    //         if(col_dimension[i] == this._dateColName) {
                    //             table_cols.push({
                    //                 title: col_dimension[i],
                    //                 className:"col_gx_date"
                    //             })
                    //         } else {
                    //             table_cols.push({
                    //                 title: col_dimension[i]
                    //             })
                    //         }
                    //     }
                    // }
        
                    // for(var j = 0; j < this._measureOrder.length; j++) {
                    //     if(j == this._measureOrder.length - 2 || j == this._measureOrder.length - 1) {
                    //         classname_col = "percentage";
                    //     } 
                    //     else if(j == this._measureOrder.length - 3 || j == this._measureOrder.length - 4) {
                    //         classname_col = "variance";
                    //     }
                    //     else {
                    //         classname_col = "actual";
                    //     }
                    //     table_cols.push({
                    //         title: col_measures[j],
                    //         className:classname_col
                    //     })
                    // }
                       
                    // for(var i = 0; i < 2; i++) 
                    // {
                    //     table_cols.push({
                    //         title: this._customDateName,
                    //         className:"col_gx_date"
                    //     })

                    //     for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                    //         if(j == this._customHeaderNames["MES_NAME"].length - 3 || j == this._customHeaderNames["MES_NAME"].length - 2 || j == this._customHeaderNames["MES_NAME"].length - 1) {
                    //             classname_col = "percentage";
                    //         }
                    //         else if(j == this._customHeaderNames["MES_NAME"].length - 6  || j == this._customHeaderNames["MES_NAME"].length - 5 || j == this._customHeaderNames["MES_NAME"].length - 4) {
                    //             classname_col = "variance";
                    //         }
                    //         else {
                    //             classname_col = "actual";
                    //         }
                    //         table_cols.push({
                    //             title: this._customHeaderNames["MES_NAME"][j],
                    //             className:classname_col
                    //         })
                    //     }
                    // }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._hideExtraVisibleColumnFromIndex)
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;


                //// ------------------------ var cols indices starts ---------------------------------
                var colorColIndices = new Set();
                var considerCons = ["percentage", "variance"];
                var numColsForDecimal = [], varColsForDecimal = [], perColsForDecimal = [];

                // var alignCols = ["actual", "percentage", "variance"]
                // var alignRight = new Set();

                for(var i = 0; i < this._tableColumnNames.length; i++) {
                    if(considerCons.includes(this._tableColumnNames[i]["className"])) {
                       colorColIndices.add(i);
                    }
                    // if(alignCols.includes(this._tableColumnNames[i]["className"])) {
                    //    alignRight.add(i)
                    // }
                    if(this._tableColumnNames[i]["className"] == "actual") {
                       numColsForDecimal.push(i);
                    }
                    if(this._tableColumnNames[i]["className"] == "variance") {
                       varColsForDecimal.push(i);
                    }
                    if(this._tableColumnNames[i]["className"] == "percentage") {
                       perColsForDecimal.push(i);
                    }
                }
                //// ------------------------ var cols indices ends -----------------------------------

                //// ------------------------ Show Totals on Row Block Starts ---------------------------------
                // this._fixedIndices = this._fixedIndices.concat(this._dropdownIndices);
                // var templateGroupTotal = ["Total"];

                // for(var i = 0; i < this._tableColumnNames.length; i++) {
                //     if(this._dropdownIndices.includes(i)) {
                //         indices.push(-1);
                //     } 
                //     else if (!this._fixedIndices.includes(i)) {
                //         indices.push(i);
                //     }
                //     ////// -------------- For subset group total on rowgroup level starts --------------------
                //     if(i > 0) {
                //         if(this._customHeaderNames["SCENARIO_NAME"].includes(this._tableColumnNames[i].title) || this._tableColumnNames[i].title == this._dateColName) {
                //             templateGroupTotal.push("");
                //         } else {
                //             templateGroupTotal.push("");
                //         }
                //     }
                //     ////// -------------- For subset group total on rowgroup level Ends ----------------------
                // }

                // this._indices = indices;

                //// ------------------------ Show Totals on Row Block Ends ---------------------------------

                // --------------- Hide Columns STARTS ---------------
                var hideCols = [1, 6]

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                //     hideCols.push(i)
                // }

                // for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                //     hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                // }

                // --------------- Hide Columns ENDS ---------------


                var tbl = undefined;
                var groupBy = new Set();

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }

                this._dataTableObj = new DataTable(this._table, {
                    layout: {},
                    columns: table_cols,
                    bAutoWidth: false, 
                    columnDefs: [
                        {
                            defaultContent: '-',
                            // targets: hideCols, //_all
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
                            targets:numColsForDecimal,
                            render: function ( data, type, row ) {
                                var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: 0});
                                if(data != undefined && data != "-") {
                                    data =  nFormat.format(parseFloat(data.toString().replace(/,{1,}/g,"")).toFixed(0));
                                }
                                return data
                            },
                        },
                        {
                            targets:varColsForDecimal,
                            render: function ( data, type, row ) {
                                var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});
                                if(data != undefined && data != "-") {
                                    data =  nFormat.format(parseFloat(data.toString().replace(/,{1,}/g,"")).toFixed(0));
                                }
                                return data
                            },
                        },
                        {
                            targets:perColsForDecimal,
                            render: function ( data, type, row ) {
                                if(data != undefined && !data.toString().includes("%")) {
                                    data =  data.toString()+" %";
                                }
                                return data
                            },
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
                    displayLength: 25,
                    // initComplete: function (settings, json) {
                    //     alert('DataTables has finished its initialisation.');
                    // },
                    bPaginate: false,
                    searching: false,
                    ordering: false,
                    info: false,     // Showing 1 of N Entries...
                    destroy: true,
                })

                tbl = this._dataTableObj

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                // console.log(this._dataTableObj)

                ////// -------------------------- Show Total Row ------------------------
                // var showTotalRow = ["Total", "Total"];
                // var showTotalonRowUpdateFlag = false;
                // for(var i = 2; i < this._tableColumnNames.length; i++) {
                //     if(this._indices.includes(i)) {
                //         showTotalRow.push("")
                //     } else {
                //         showTotalRow.push("")
                //     }
                // }
                // tbl.row.add(showTotalRow).draw(false)
                /////  ------------------------------------------------------------------

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 3; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i].replace(" ","")}' >${this._customTopHeader[i]}</th>`
                    }
                } 

                topHeader += "</tr>";

                // console.log(this._widgetID+"cw-table-v2")

//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                tbl.on('click', 'tbody tr', e => {

                    // let classList = e.currentTarget.classList
                    // tbl
                    //     .rows()
                    //     .nodes()
                    //     .each(row => row.classList.remove('selected'));
                    
                    // if(classList.length != 1) {

                    //     classList.add('selected');

                    //     if(DO_FY["DRP_USR_TRIGGERED"] == undefined) {
                    //         DO_FY["DRP_USR_TRIGGERED"] = {}
                    //     }
    
                    //     if(DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] == undefined) {
                    //         DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()] = {}
                    //     }
    
                    // }

                    // // console.log(typeof(e.target.classList), Object.keys(e.target.classList), e)
                    // if(e.target.classList && e.target.classList[0] == "row_level_select") {
                    //     var sid = e.target.classList[1].split("row_level_select_")[1];
                    //     DO_FY["DRP_USR_TRIGGERED"][tbl.row('.selected').index()][sid] = 1;
                    // }

                })

                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var fixRowsObj = {}, masterObj = {};
                var is_col_updated = false;

               
                for(var i = 0, prev_key = ""; i < this._resultSet.length;) {

                    var key = this._resultSet[i].slice(0, this._object_key_till).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {

                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._object_key_till).join("_#_");

                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }

                        var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        var scene = this._resultSet[i][fixedScenarioAt];
                        var scenarios_key = this._resultSet[i][this._object_key_till];
                        

                        if(masterObj[masterKey.join("_#_")] == undefined) {
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                            masterObj[masterKey.join("_#_")] = {};
                        }

                        if(masterObj[masterKey.join("_#_")][scene] == undefined) {
                            masterObj[masterKey.join("_#_")][scene] = {};
                        }

                        if(masterObj[masterKey.join("_#_")][scene][scenarios_key] == undefined) {
                            masterObj[masterKey.join("_#_")][scene][scenarios_key] = [];
                        }

                        masterObj[masterKey.join("_#_")][scene][scenarios_key] = this._resultSet[i].slice(this._object_key_till + 1, )

                        i += 1;
                    }

                    prev_key = key;
                }

                console.log("Master Object - FY", structuredClone(masterObj))


                // Final Row Assignment
                var lastRowId = undefined;
                var manual_rowID = 1;

                for(const [k, v] of Object.entries(masterObj)) {

                    var finalRow = [];
                    
                    // Pushing Dimensions to finalRow.
                    var dim = k.split("_#_");
                    for(var f = 0; f < dim.length; f++) {
                        finalRow.push(dim[f])
                    }

                    // Pushing Measures to finalRow

                    for(const v1 in v) {
                            
                        finalRow.push(v1); //pushing gx date

                        for(const v2 in masterObj[k][v1]) {
                
                            if(masterObj[k][v1][v2].length == 0) {
                                for(var h = 0; h < this._measureOrder.length + 1; h++) {
                                    finalRow.push(replaceZero+" <span style='display:none;'>0</span>")
                                }
                            } else {
                                finalRow = finalRow.concat(masterObj[k][v1][v2]);
                            }

                            finalRow.push(v1); //pushing gx date

                        }
                       
                    }

                    finalRow.pop();

                    ////// If only BASE is present STARTS -----------------------------------------
                    // var onlyBaseAvailable = false, sliced = undefined;
                    // if(masterObj[k]["DropDownFieldName"].size == 1) {
                    //     sliced = finalRow.slice(k.split("_#_").length, this._dimensions.length - 1 + this._measureOrder.length);
                    //     var cnt = 0;
                    //     for(var i = sliced.length + k.split("_#_").length; i < table_cols.length; i++) {
                    //         if(cnt >= sliced.length) {
                    //             cnt = 0;
                    //         }
                    //         finalRow[i] = sliced[cnt]
                    //         cnt++;
                    //     }
                    //     onlyBaseAvailable = true;
                    //     // console.log(sliced, "-------", finalRow);
                    // }
                    ////// If only BASE is present ENDS ------------------------------------------
                    // var baseRepeatedFlag = false;

                    // if(finalRow.length < table_cols.length) {

                    //     var repeatBase = finalRow.slice(fixedScenarioAt, this._measureOrder.length + fixedScenarioAt + 1);

                    //     for(var fr = 0, rb = 0; fr < this._measureOrder.length * 3 + (fixedScenarioAt + 1); fr++) {

                    //         finalRow.push(repeatBase[rb]);

                    //         rb++;

                    //         if(rb > repeatBase.length - 1) {
                    //             rb = 0;
                    //         }

                    //     }

                    // }

                    fixRowsObj[k] = finalRow.slice()
                    finalRow = finalRow.slice(0, this._tableColumnNames.length)

var start = performance.now();

                    ////// ================================ Group by Row Starts =========================================
                    // if(!Array.from(groupBy).includes(finalRow[0])) {
                    //     groupBy.add(finalRow[0])
                    //     templateGroupTotal[1] = finalRow[0]
                    //     var node = tbl.row.add(templateGroupTotal.slice()).draw(false).node()
                    //     node.classList.add("group")
                    //     node.rowId = manual_rowID;
                    //     manual_rowID++;

                    //     lastRowId = node.rowId;

                    //     if(DO_FY["Parent_Child_Indices"] == undefined) {
                    //         DO_FY["Parent_Child_Indices"] = {}
                    //     }
                       
                    //     if(DO_FY["Parent_Child_Indices"][lastRowId] == undefined) {
                    //         DO_FY["Parent_Child_Indices"][lastRowId] = []
                    //     }
                    // }
                    ////// ================================ Group by Row Ends ============================================

                    var node = tbl.row.add(finalRow.slice(0, table_cols.length)).draw().node();
                    node.rowId = manual_rowID;
                    var rid = tbl.rows().indexes().toArray()[tbl.rows().indexes().toArray().length - 1];

                    // if(!DO_FY["Parent_Child_Indices"][lastRowId].includes(node.rowId)) {
                    //     DO_FY["Parent_Child_Indices"][lastRowId].push(node.rowId)
                    // }

                    manual_rowID++;

                    console.log(finalRow);

                //     if(!onlyBaseAvailable) {

                //         var cga = Array.from(caughtDropDownsAt);
                //         master_dropdownArr = Array.from(master_dropdownArr).slice(1, );

                //         if(master_dropdownArr.length < 3) {
                //             for(var md = master_dropdownArr.length; md < 3; md++) {
                //                 master_dropdownArr.push(0);
                //             }
                //         }

                //         if(cga.length < 3) {
                //             for(var b = 0; b < master_dropdownArr.length; b++) {
                //                 if(cga.length >= 3) {
                //                     break;
                //                 }
                //                 cga.push(master_dropdownArr[b]);
                //             }
                //         }

                //         var drp = Array.from(dropdownIDs);

                //         if(DO_FY["DRP"] == undefined) {
                //             DO_FY["DRP"] = {}
                //         }

                //         if(this._varPreserveSelection == "TRUE"){
                //             if(DO_FY["DRP_USR_TRIGGERED"] == undefined) {
                //                 DO_FY["DRP_USR_TRIGGERED"] = {}
                //             }
                //             if(DO_FY["DRP_USR_TRIGGERED"]["Added"] ==  undefined) {
                //                 DO_FY["DRP_USR_TRIGGERED"]["Added"] = []
                //             }
                //             for(var rowid = 0; rowid < Object.keys(DO_FY["DRP_USR_TRIGGERED"]).length; rowid++) {
                                
                //                 if(DO_FY["DRP_USR_TRIGGERED"] && Object.keys(DO_FY["DRP"]).includes(Object.keys(DO_FY["DRP_USR_TRIGGERED"])[rowid])) {
                                    
                //                     var tbl_row_id = Object.keys(DO_FY["DRP_USR_TRIGGERED"])[rowid];

                //                     for(var selID = 0; selID < Object.keys(DO_FY["DRP_USR_TRIGGERED"][tbl_row_id]).length; selID++) {

                //                         if(tbl_row_id && tbl_row_id != "Added") {

                //                             var select_element_id = Object.keys(DO_FY["DRP_USR_TRIGGERED"][tbl_row_id])[selID];

                //                             if(select_element_id && Object.keys(DO_FY["DRP_USR_TRIGGERED"][tbl_row_id]).includes(select_element_id)) {
                //                                 if(!DO_FY["DRP_USR_TRIGGERED"]["Added"].includes(tbl_row_id+"_#_"+select_element_id) && DO_FY["DRP"][tbl_row_id] && DO_FY["DRP"][tbl_row_id][select_element_id]) {
                //                                     DO_FY["DRP_USR_TRIGGERED"][tbl_row_id][select_element_id] =  DO_FY["DRP"][tbl_row_id][select_element_id]
                //                                     DO_FY["DRP_USR_TRIGGERED"]["Added"].push(tbl_row_id+"_#_"+select_element_id)
                //                                 }
                //                             }
                //                         }

                //                     }

                //                 }

                //             }
                //         }

                //         if(DO_FY["DRP"][rid] == undefined) {
                //             DO_FY["DRP"][rid] = {}
                //         }

                //         DO_FY["DRP"][rid][drp[0]] = cga[0];
                //         DO_FY["DRP"][rid][drp[1]] = cga[1];
                //         DO_FY["DRP"][rid][drp[2]] = cga[2];

                //         this.setSelectorsSelectedValue(dropdownIDs, cga, "FY");
                //     }

                }

var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Set Selector Selected Value -- Render_FY took approx : ") 
var start = performance.now();

                this.applyStyling_FY();
                
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Set Styling -- Render_FY took approx : ") 
var start = performance.now();


                // if (this._tableCSS) {
                //     // console.log(this._tableCSS)
                //     this._table.style.cssText = this._tableCSS
                // }

                // if (this._rowCSS) {
                //     console.log(this._rowCSS)
                //     document
                //         .querySelector(this._widgetID+'cw-table-v2')
                //         .shadowRoot.querySelectorAll('td')
                //         .forEach(el => (el.style.cssText = this._rowCSS))
                //     document
                //         .querySelector(this._widgetID+'cw-table-v2')
                //         .shadowRoot.querySelectorAll('th')
                //         .forEach(el => (el.style.cssText = this._rowCSS))
                // }

                // if (this._colCSS) {
                //     console.log(this._colCSS)
                //     document
                //         .querySelector(this._widgetID+'cw-table-v2')
                //         .shadowRoot.querySelector('style').innerText += this._colCSS
                // }


var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Table CSS - SAC Side -- Render_FY took approx : ") 
var start = performance.now();

                const list = document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead");

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }


//                 showTotalonRowUpdateFlag = true;
                document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
                
                
var end = performance.now();
// var time = end - start;
// console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Top Most Header -- Render_FY took approx : ") 
                                
//                 DO_FY["Current_Scale"] = this._currentScaling;
                
//                 this.showTotal_FY();
            
// var start = performance.now();

//                 ///////// Show State on RS Change .......
//                 this.columnVisibility([this._stateShown],[])
//                 this.showScenarios(10, this._shownScenarios_ID_RS, this._shownScenarios_Text_RS, 7);
 
//  var end = performance.now();
//  var time = end - start;
//  console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Show/Hide -- Render_FY took approx : ")     

// var start = performance.now();

//                 if(this._varPreserveSelection == "TRUE" && DO_FY["DRP_USR_TRIGGERED"]) {
//                     for(var rowid = 0; rowid < Object.keys(DO_FY["DRP_USR_TRIGGERED"]).length; rowid++) {

//                         if(Object.keys(DO_FY["DRP"]).includes(Object.keys(DO_FY["DRP_USR_TRIGGERED"])[rowid])) {

//                             var tbl_row_id = Object.keys(DO_FY["DRP_USR_TRIGGERED"])[rowid];

//                             for(var selID = 0; selID < Object.keys(DO_FY["DRP_USR_TRIGGERED"][tbl_row_id]).length; selID++) {

//                                 if(tbl_row_id && tbl_row_id != "Added") {

//                                     var select_element_id = Object.keys(DO_FY["DRP_USR_TRIGGERED"][tbl_row_id])[selID];
//                                     var selectorID = ".row_level_select_"+select_element_id;
//                                     var selElement = document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector(selectorID);

//                                     this._dataTableObj
//                                     .rows()
//                                     .nodes()
//                                     .each(row => row.classList.remove('selected'));

//                                     this._dataTableObj.row(tbl_row_id).node().setAttribute("class","selected")

//                                     if(selElement && selElement.selectedIndex != undefined) {
//                                         selElement.selectedIndex = DO_FY["DRP_USR_TRIGGERED"][tbl_row_id][select_element_id];
//                                         selElement.dispatchEvent(new Event("change"));
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }

// var end = performance.now();
// var time = end - start;
// console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Trigger Selection -- Render_FY took approx : ") 
//         // }
 
 console.log(DO_FY, "DO_FY")
 
                //  if(this._versionChangeHeader.length > 0) {
                //      this.changeTableHeaderOnVersionChange(this._versionChangeHeader);
                //  }

                // Styling Block Ends here
            }


            showTotal_FY() {

var start = performance.now();

                var no_of_per_cols = 3;
                var top_most_total_row_id = 0;
                this._callFrom = "FY";
                var no_of_decimalPlaces = parseInt(this.no_of_decimalPlaces_K[0]);
                var subTotalRowIDs = Object.keys(DO_FY["Parent_Child_Indices"]);
                var TOP_MOST_TOTAL_ROW = this._dataTableObj.rows(0).data().toArray()[0]

                var numCols_FY  =  this._dataTableObj.columns('.numericColsCSS')[0];
                var varCols_FY  =  this._dataTableObj.columns('.vsPy')[0];
                var perCols_FY  =  this._dataTableObj.columns('.perCols')[0];

                if(this._currentScaling == "M") {
                    no_of_decimalPlaces = parseInt(this.no_of_decimalPlaces_M[0]) ;
                }

                var nFormat = new Intl.NumberFormat('en-US', {minimumFractionDigits: no_of_decimalPlaces});

                for(var e = 0; e < subTotalRowIDs.length; e++) {
                    
                    var currentSubTotalRowID = subTotalRowIDs[e];
                    
                    //// For Numeric 
                    for(var f = 0; f < numCols_FY.length; f++) {
                                        
                        var subsetTotal = 0, unformattedSubsetTotal = 0;
                        var sliceLen_Start = DO_FY["Parent_Child_Indices"][currentSubTotalRowID][0];
                        var columnarData = this._dataTableObj.column(numCols_FY[f]).data().toArray().slice(sliceLen_Start, sliceLen_Start + DO_FY["Parent_Child_Indices"][currentSubTotalRowID].length)
                                   
                        columnarData.forEach(v => {
                            if(v.toString() != "-" && v != "") {
                                unformattedSubsetTotal += getRawValue(v)
                                v = parseFloat(v.toString().replace(/,{1,}/g,""))
                                subsetTotal += v;
                            }
                        });

                        var node = this._dataTableObj.cell(currentSubTotalRowID, numCols_FY[f]).data(nFormat.format(parseFloat(subsetTotal).toFixed(0)).split(".")[0].toString()+" <span style='display:none;'>"+unformattedSubsetTotal+"</span>").node()
                                        
                        ////// ---------------------- Coloring the cell Starts --------------------------
                
                        if(subsetTotal >= 0 || subsetTotal >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }
                
                        ////// ---------------------- Coloring the cell Ends ----------------------------
                
                                        
                        if(TOP_MOST_TOTAL_ROW[numCols_FY[f]] == "") {
                            TOP_MOST_TOTAL_ROW[numCols_FY[f]] = 0
                        }

                        var val = TOP_MOST_TOTAL_ROW[numCols_FY[f]].toString().replace(/,{1,}/g,"")
                        if(val.toString().includes("span")) {
                            val = val.split("<span style='display:none;'>")[1].toString().split("</span>")[0].trim().toString().replace(/,{1,}/g,"")
                        }
            
                        TOP_MOST_TOTAL_ROW[numCols_FY[f]] = nFormat.format(parseFloat(TOP_MOST_TOTAL_ROW[numCols_FY[f]].toString().replace(/,{1,}/g,"")) + subsetTotal).toString()+" <span style='display:none;'>"+(parseFloat(val) + unformattedSubsetTotal)+"</span>"
                    }

                     /// For Variance
                     for(var f = 0; f < varCols_FY.length; f++) {
                        
                        var subsetTotal = 0, unformattedSubsetTotal = 0;
                        var sliceLen_Start = DO_FY["Parent_Child_Indices"][currentSubTotalRowID][0];
                        var columnarData = this._dataTableObj.column(varCols_FY[f]).data().toArray().slice(sliceLen_Start, sliceLen_Start + DO_FY["Parent_Child_Indices"][currentSubTotalRowID].length)
                        
                        columnarData.forEach(v => {
                            if(v.toString() != "-" && v != "") {
                                unformattedSubsetTotal += getRawValue(v)
                                v = parseFloat(v.toString().replace(/,{1,}/g,""))
                                subsetTotal += v;
                            }
                        });

                        var node = this._dataTableObj.cell(currentSubTotalRowID, varCols_FY[f]).data(nFormat.format(subsetTotal)+" <span style='display:none;'>"+unformattedSubsetTotal+"</span>").node()

                        ////// ---------------------- Coloring the cell Starts --------------------------

                        if(subsetTotal >= 0 || subsetTotal >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }

                        ////// ---------------------- Coloring the cell Ends ----------------------------

                        if(TOP_MOST_TOTAL_ROW[varCols_FY[f]] == "") {
                            TOP_MOST_TOTAL_ROW[varCols_FY[f]] = 0
                        }

                        var val = TOP_MOST_TOTAL_ROW[varCols_FY[f]].toString().replace(/,{1,}/g,"")
                        if(val.toString().includes("span")) {
                            val = val.split("<span style='display:none;'>")[1].toString().split("</span>")[0].trim().toString().replace(/,{1,}/g,"")
                            // val = val.split("<span")[0].trim().toString().replace(/,{1,}/g,"")
                        }
                        
                        TOP_MOST_TOTAL_ROW[varCols_FY[f]] = nFormat.format(parseFloat(TOP_MOST_TOTAL_ROW[varCols_FY[f]].toString().replace(/,{1,}/g,"")) + subsetTotal).toString()+" <span style='display:none;'>"+(parseFloat(val) + unformattedSubsetTotal)+"</span>"
                    }

                    /// For Percentage
                    for(var f = 0, idx = 0; f < perCols_FY.length; f++) {

                        var subsetTotal = 0;
    
                        var value = getRawValue(this._dataTableObj.cell(currentSubTotalRowID, perCols_FY[f] - (idx + 4)).data())
                        var val_minus_act = getRawValue(this._dataTableObj.cell(currentSubTotalRowID, perCols_FY[f] - no_of_per_cols).data())
    
                        if(isNaN(value)) {
                            value = parseFloat(getRawValue(this._dataTableObj.cell(currentSubTotalRowID, perCols_FY[f] - (idx + 4)).data().replace(/,{1,}/g,"").replace(/%{1,}/g,"")))
                        }
                        if(isNaN(val_minus_act)){
                            val_minus_act = parseFloat(getRawValue(this._dataTableObj.cell(currentSubTotalRowID, perCols_FY[f] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,"")))
                        }
    
                        var act1 = value - val_minus_act, truncateDecimal = false;
    
                        if(value == 0 && act1 == 0) {
                            subsetTotal = replaceZero.toString()
                        } else if(value == 0) {
                            subsetTotal = "-100.0 %"
                            truncateDecimal = true;
                        } else if (act1 == 0) {
                            subsetTotal = "100.0 %";
                            truncateDecimal = true;
                        } else {
                            subsetTotal = (val_minus_act / act1 * 100);
                            if(subsetTotal > 99999 || subsetTotal < -99999) {
                                subsetTotal = (0).toFixed(no_of_decimalPlaces);
                            } else {
                                subsetTotal = subsetTotal.toFixed(no_of_decimalPlaces)
                            }
                            subsetTotal = nFormat.format(subsetTotal).toString()+" %"
                            // subsetTotal = nFormat.format((val_minus_act / act1 * 100).toFixed(no_of_decimalPlaces)).toString()+" %"
                        }

                        if(truncateDecimal && no_of_decimalPlaces == 0) {
                            subsetTotal = subsetTotal.split(".")[0].toString()+" %";
                        }
    
                        var node = this._dataTableObj.cell(currentSubTotalRowID, perCols_FY[f]).data(subsetTotal).node()
    
                        ////// ---------------------- Coloring the cell Starts --------------------------
    
                        if(subsetTotal >= 0 || subsetTotal >= "0") {
                            node.style.color = "#2D7230";
                        } else {
                            node.style.color = "#A92626";
                        }
    
                        ////// ---------------------- Coloring the cell Ends ----------------------------
                        ///// ------------------- TOP MOST TOTAL PERCENTAGE STARTS ----------------------

                        var subsetTotal = 0;

                        var value = getRawValue(this._dataTableObj.cell(top_most_total_row_id, perCols_FY[f] - (idx + 4)).data())
                        var val_minus_act = getRawValue(this._dataTableObj.cell(top_most_total_row_id, perCols_FY[f] - no_of_per_cols).data())
    
                        if(isNaN(value)) {
                            value = parseFloat(getRawValue(this._dataTableObj.cell(top_most_total_row_id, perCols_FY[f] - (idx + 4)).data().replace(/,{1,}/g,"").replace(/%{1,}/g,"")))
                        }
                        if(isNaN(val_minus_act)){
                            val_minus_act = parseFloat(getRawValue(this._dataTableObj.cell(top_most_total_row_id, perCols_FY[f] - no_of_per_cols).data().replace(/,{1,}/g,"").replace(/%{1,}/g,"")))
                        }
    
                        // var act1 = value - val_minus_act
    
                        // if(value == 0 && act1 == 0) {
                        //     subsetTotal = replaceZero.toString()
                        // } else if(value == 0) {
                        //     subsetTotal = "-100.0 %"
                        // } else if (act1 == 0) {
                        //     subsetTotal = "100.0 %";
                        // } else {
                        //     subsetTotal = nFormat.format((val_minus_act / act1 * 100).toFixed(no_of_decimalPlaces)).toString()+" %"
                        // }

                        var act1 = value - val_minus_act, truncateDecimal = false;
    
                        if(value == 0 && act1 == 0) {
                            subsetTotal = replaceZero.toString()
                        } else if(value == 0) {
                            subsetTotal = "-100.0 %"
                            truncateDecimal = true;
                        } else if (act1 == 0) {
                            subsetTotal = "100.0 %";
                            truncateDecimal = true;
                        } else {
                            subsetTotal = (val_minus_act / act1 * 100);
                            if(subsetTotal > 99999 || subsetTotal < -99999) {
                                subsetTotal = (0).toFixed(no_of_decimalPlaces);
                            } else {
                                subsetTotal = subsetTotal.toFixed(no_of_decimalPlaces)
                            }
                            subsetTotal = nFormat.format(subsetTotal).toString()+" %"
                            // subsetTotal = nFormat.format((val_minus_act / act1 * 100).toFixed(no_of_decimalPlaces)).toString()+" %"
                        }

                        if(truncateDecimal && no_of_decimalPlaces == 0) {
                            subsetTotal = subsetTotal.split(".")[0].toString()+" %";
                        }
    
                        TOP_MOST_TOTAL_ROW[perCols_FY[f]] = subsetTotal
    
                        ///// ------------------- TOP MOST TOTAL PERCENTAGE ENDS --------------------------
  
                        idx++;

                        if(idx >= 3) {
                            idx = 0;
                        }
                          
                     }

                }

                // console.log("TOP_MOST_TOTAL_ROW ---", TOP_MOST_TOTAL_ROW)
                this._dataTableObj.row(top_most_total_row_id).data(TOP_MOST_TOTAL_ROW).draw(false)

                console.log("-----------------------------------",TOP_MOST_TOTAL_ROW)

                ///// ------------------- For Color Top-Most Total Starts --------------------------
        
                var loopCells = varCols_FY.concat(perCols_FY);
      
                for(var i = 0; i < loopCells.length; i++) {
        
                  var data =  this._dataTableObj.cell(top_most_total_row_id, loopCells[i]).data()
                  var node =  this._dataTableObj.cell(top_most_total_row_id, loopCells[i]).node()
        
                  if(node != undefined) {
        
                    if(data > 0 || data > "0") {
                        node.style.color = "#2D7230";
                    } else {
                        node.style.color = "#A92626";
                    }
        
                  }
        
                }
        
                ///// ------------------- For Color Top-Most Total Ends --------------------------
        
                ////// SUB-TOTAL CALCULATION ENDS //////
        
var end = performance.now();
var time = end - start;
console.log((Math.round(time/1000, 2)).toString()+"s to load..."+"Show Total () -- Render_FY took approx : ") 
   

            }

          
            changeTableHeaderOnVersionChange(header_names) {
                // if(this._callFrom == "QT") {
                //     if(this._versionChangeHeader[0] != undefined) {
                //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(3)").innerHTML = this._versionChangeHeader[0];
                //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(5)").innerHTML = this._versionChangeHeader[0];
                //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(7)").innerHTML = this._versionChangeHeader[0];
                //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(9)").innerHTML = this._versionChangeHeader[0];
                //     }
                // } else {
                //     if(this._versionChangeHeader[0] != undefined) {
                //         document.querySelector(this._widgetID+"cw-table-v2").shadowRoot.querySelector("#example > thead > tr:nth-child(1) > th:nth-child(2)").innerHTML = this._versionChangeHeader[0];
                //     }
                // }
            }
        }
        customElements.define('cw-table-v2', CustomTable)
    })()
