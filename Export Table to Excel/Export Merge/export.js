var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

// ===================================================================================
// =============================== START : GLOBAL VARIABLE DECLARATION ================================
// ===================================================================================

var export_lib_check = 1;

// ===================================================================================
// =============================== END : GLOBAL VARIABLE DECLARATION =================
// ===================================================================================

(function () {

    // ===================================================================================
    // =============================== START : TEMPLATE CREATION ================================
    // ===================================================================================

    let template = document.createElement("template");
    template.innerHTML = `<div id="chart_div" style="width: 100%; height: 100%"></div>`;

    // ===================================================================================
    // =============================== END : TEMPLATE CREATION ================================
    // ===================================================================================

    //<----------------------------------------------------------------------------------->

    // ===================================================================================
    // =============================== START : MAIN CLASS ================================
    // ===================================================================================

    class amChartExport extends HTMLElement {

        constructor() {

            super();

            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._root = this._shadowRoot.getElementById("chart_div");

            this._props = {};
            this._firstConnection = false;

            this.addEventListener("click", event => {
                var eventclick = new Event("onClick");
                this.dispatchEvent(eventclick);
            });

        }

        //Fired when the widget is added to the html DOM of the page
        connectedCallback() {

            this._firstConnection = true;

        }

        //Fired when the widget is removed from the html DOM of the page (e.g. by hide)
        disconnectedCallback() {

        }

        //When the custom widget is updated, the Custom Widget SDK framework executes this function first
        onCustomWidgetBeforeUpdate(changedProperties) {

            this._props = { ...this._props, ...changedProperties }

            //    this.render(that, this._root, changedProperties);
        }

        //When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
        onCustomWidgetAfterUpdate(changedProperties) {

            var that = this;

            //  if (lib_check) {
            //     load_library();
            //  }

            if (this._firstConnection) {

                if (this.method === "export_table") {
                    export_1(that, this._root, changedProperties);
                }
                else if(this.method === "exportToExcel") {
                    exportResultSetToExcel(that)
                } 
                else {
                    export_2(that, this._root, changedProperties);
                }

            }

        }

        //When the custom widget is removed from the canvas or the analytic application is closed
        onCustomWidgetDestroy() {

        }

        _firePropertiesChanged() {
            // this.render_done = "true";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {

                    }
                }
            }));
        }



    }
    customElements.define("digital-sweep-sac-sample-export", amChartExport); 

    async function export_1(that, root1) {

        const start = Date.now();

        if (export_lib_check) {
            await getScriptPromisify("https://www.amcharts.com/lib/4/core.js");                 // amcharts 4 Libraries
            await getScriptPromisify("https://www.amcharts.com/lib/4/charts.js");
            await getScriptPromisify("https://www.amcharts.com/lib/4/themes/animated.js");
            export_lib_check = 0;
        }

        const Resultset = that.resultset;
        console.log("Resultset");
        console.log(Resultset);

        const Measures = that.measures;
        console.log("Measures");
        console.log(Measures);

        const Dimensions = that.dimensions;
        console.log("Dimensions");
        console.log(Dimensions);

        const Filters = that.filters;
        console.log("Filters");
        console.log(Filters);

        const Properties = JSON.parse(that.properties);
        console.log("Properties");
        console.log(Properties);

        const Filename = Properties["filename"];

        const not_number = Properties["not_number"].split("#");

        var fix_node_flag = true;

        if (Properties["fix_node"] === "") {
            fix_node_flag = false;
        }

        var mix = {
            ...Dimensions,
            ...Measures
        }

        var master_obj = {};

        if (fix_node_flag) {
            master_obj[Properties["fix_node"]["nodename"]] = Properties["fix_node"]["nodevalue"];
        }

        var dim_keys = Object.keys(Dimensions);
        var mes_keys = Object.keys(Measures);

        var mix_keys = dim_keys.concat(mes_keys);

        console.log(mix);

        for (var i = 0; i < mix_keys.length; i++) 
        {
            master_obj[mix[mix_keys[i]]] = "";
        }

        console.log(master_obj);

        var data_obj = {};


        var new_key = "";
        var old_key = "";

        for (i = 0; i < Resultset.length; i++) 
        {

            if (i === 0) 
            {

                for (var j = 0; j < dim_keys.length; j++) 
                {
                    new_key = new_key + Resultset[i][dim_keys[j]].description;

                    master_obj[Dimensions[dim_keys[j]]] = Resultset[i][dim_keys[j]].description;
                }

                if (Measures[Resultset[i]["@MeasureDimension"].description]) 
                {
                    if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                    {
                        master_obj[Measures[Resultset[i]["@MeasureDimension"].description]] = Resultset[i]["@MeasureDimension"].formattedValue;
                    }
                    else 
                    {
                        master_obj[Measures[Resultset[i]["@MeasureDimension"].description]] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                    }
                }
                data_obj[new_key] = master_obj;

            }
            else {

                var obj = {};
                new_key = "";

                if (fix_node_flag) {

                    obj[Properties["fix_node"]["nodename"]] = Properties["fix_node"]["nodevalue"];
                }

                for (var k = 0; k < dim_keys.length; k++) 
                {
                    new_key = new_key + Resultset[i][dim_keys[k]].description;

                    obj[Dimensions[dim_keys[k]]] = Resultset[i][dim_keys[k]].description;
                }

                if (data_obj[new_key]) 
                {

                    if (Measures[Resultset[i]["@MeasureDimension"].description]) 
                    {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                        {
                            data_obj[new_key][Measures[Resultset[i]["@MeasureDimension"].description]] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else 
                        {
                            data_obj[new_key][Measures[Resultset[i]["@MeasureDimension"].description]] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }
                    }

                }
                else 
                {
                    if (Measures[Resultset[i]["@MeasureDimension"].description]) 
                    {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                        {
                            obj[Measures[Resultset[i]["@MeasureDimension"].description]] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else 
                        {
                            obj[Measures[Resultset[i]["@MeasureDimension"].description]] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }
                    }
                    data_obj[new_key] = obj;
                }
            }

        }

        var data = Object.values(data_obj);
        console.log(data);

        var chart = am4core.create(root1, am4charts.XYChart);

        if (chart.logo) 
        {
            chart.logo.disabled = true;
        }

        chart.data = data;

        chart.events.on("ready", function () 
        {
            chart.exporting.filePrefix = Filename;

            chart.exporting.adapter.add("xlsxWorkbook", function (wb) 
            {
                // modify and add additional stuff to workbook object
                // ...
                wb.workbook.SheetNames.push("Information on Query");
                wb.workbook.Sheets["Information on Query"] = wb.xlsx.utils.aoa_to_sheet(Filters);
                return wb;
            });

            chart.exporting.export("xlsx");

            const millis = Date.now() - start;
            console.log(`seconds taken by cw = ${Math.floor(millis / 1000)}`);

        });
    }

    async function export_2(that, root1) {

        const start = Date.now();

        if (export_lib_check) {
            await getScriptPromisify("https://www.amcharts.com/lib/4/core.js");                 // amcharts 4 Libraries
            await getScriptPromisify("https://www.amcharts.com/lib/4/charts.js");
            await getScriptPromisify("https://www.amcharts.com/lib/4/themes/animated.js");
            export_lib_check = 0;
        }

        const Resultset = that.resultset;
        console.log("Resultset");
        console.log(Resultset);

        const Measures = that.measures;
        console.log("Measures");
        console.log(Measures);

        const Dimensions = that.dimensions;
        console.log("Dimensions");
        console.log(Dimensions);

        const Filters = that.filters;
        console.log("Filters");
        console.log(Filters);

        const Properties = JSON.parse(that.properties);
        console.log("Properties");
        console.log(Properties);

        const Filename = Properties["filename"];

        const Frequency = Properties["frequency"];

        const not_number = Properties["not_number"].split("#");

        var fix_node_flag = true;

        if (Properties["fix_node"] === "") {
            fix_node_flag = false;
        }

        // var mix = {
        //     ...Dimensions,
        //     ...Measures
        // }

        var global_obj = {};
        var master_obj = {};

        if (fix_node_flag) {
            global_obj[Properties["fix_node"]["nodename"]] = Properties["fix_node"]["nodevalue"];
        }
        var dates = [];

        var dim_keys = Object.keys(Dimensions);
        var mes_keys = Object.keys(Measures);

        for (var i = 0; i < dim_keys.length; i++) {
            global_obj[Dimensions[dim_keys[i]]] = "";
        }

        // var mix_keys = dim_keys.concat(mes_keys);

        // console.log(mix);

        // for (var i = 0; i < mix_keys.length; i++) {
        //     master_obj[mix[mix_keys[i]]] = "";
        // }

        // console.log(master_obj);

        var data_obj = {};


        var new_key = "";
        // var old_key = "";

        if (Frequency == "Monthly" || Frequency == "Yearly") {

            for (i = 0; i < Resultset.length; i++) {
                if (i === 0) {
                    for (var j = 0; j < dim_keys.length; j++) {
                        new_key = new_key + Resultset[i][dim_keys[j]].description;

                        master_obj[Dimensions[dim_keys[j]]] = Resultset[i][dim_keys[j]].description;
                    }

                    if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) {
                        master_obj[Resultset[i][mes_keys[0]].description + " "] = Resultset[i]["@MeasureDimension"].formattedValue;
                    }
                    else {
                        master_obj[Resultset[i][mes_keys[0]].description + " "] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                    }

                    if (!dates.includes(Resultset[i][mes_keys[0]].description + " ")) {
                        dates.push(Resultset[i][mes_keys[0]].description + " ");
                    }

                    data_obj[new_key] = master_obj;

                }
                else {
                    var obj = {};
                    new_key = "";

                    if (fix_node_flag) {
                        obj[Properties["fix_node"]["nodename"]] = Properties["fix_node"]["nodevalue"];
                    }

                    for (var k = 0; k < dim_keys.length; k++) {
                        new_key = new_key + Resultset[i][dim_keys[k]].description;

                        obj[Dimensions[dim_keys[k]]] = Resultset[i][dim_keys[k]].description;
                    }

                    if (data_obj[new_key]) {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) {
                            data_obj[new_key][Resultset[i][mes_keys[0]].description + " "] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else {
                            data_obj[new_key][Resultset[i][mes_keys[0]].description + " "] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }

                        if (!dates.includes(Resultset[i][mes_keys[0]].description + " ")) {
                            dates.push(Resultset[i][mes_keys[0]].description + " ");
                        }
                    }
                    else {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) {
                            obj[Resultset[i][mes_keys[0]].description + " "] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else {
                            obj[Resultset[i][mes_keys[0]].description + " "] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }

                        if (!dates.includes(Resultset[i][mes_keys[0]].description + " ")) {
                            dates.push(Resultset[i][mes_keys[0]].description + " ");
                        }

                        data_obj[new_key] = obj;
                    }
                }

            }

            var data = Object.values(data_obj);
            console.log(data);

            if("sort" in Properties)
            {

            }
            else
            {
                dates.sort();
            }
            
            for (var d = 0; d < dates.length; d++) {
                global_obj[dates[d]] = "";
            }
            console.log(global_obj);

            var b = data[0];

            var c = Object.assign({}, global_obj, b)
            console.log(c);

            data[0] = c;
            var chart = am4core.create(root1, am4charts.XYChart);

            if (chart.logo) {
                chart.logo.disabled = true;
            }
            chart.data = data;

        }
        else if (Frequency == "Quarterly") 
        {
            for (i = 0; i < Resultset.length; i++) 
            {
                if (i === 0) 
                {
                    for (var j = 0; j < dim_keys.length; j++) 
                    {
                        new_key = new_key + Resultset[i][dim_keys[j]].description;

                        master_obj[Dimensions[dim_keys[j]]] = Resultset[i][dim_keys[j]].description;
                    }

                    if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                    {
                        master_obj["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = Resultset[i]["@MeasureDimension"].formattedValue;
                    }
                    else 
                    {
                        master_obj["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                    }

                    if (!dates.includes(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description)) 
                    {
                        dates.push(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description);
                    }

                    data_obj[new_key] = master_obj;
                }
                else 
                {
                    var obj = {};
                    new_key = "";

                    if (fix_node_flag) 
                    {
                        obj[Properties["fix_node"]["nodename"]] = Properties["fix_node"]["nodevalue"];
                    }

                    for (var k = 0; k < dim_keys.length; k++) 
                    {
                        new_key = new_key + Resultset[i][dim_keys[k]].description;

                        obj[Dimensions[dim_keys[k]]] = Resultset[i][dim_keys[k]].description;
                    }

                    if (data_obj[new_key]) 
                    {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                        {
                            data_obj[new_key]["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else 
                        {
                            data_obj[new_key]["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }                        

                        if (!dates.includes(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description)) 
                        {
                            dates.push(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description);
                        }
                    }
                    else 
                    {
                        if (not_number.includes(Resultset[i]["@MeasureDimension"].description)) 
                        {
                            obj["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = Resultset[i]["@MeasureDimension"].formattedValue;
                        }
                        else 
                        {
                            obj["Q" + Resultset[i][mes_keys[0]].description + " " + Resultset[i][mes_keys[1]].description] = parseFloat(Resultset[i]["@MeasureDimension"].formattedValue.replaceAll(',', ''));
                        }
                        
                        if (!dates.includes(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description)) 
                        {
                            dates.push(Resultset[i][mes_keys[1]].description + "Q" + Resultset[i][mes_keys[0]].description);
                        }

                        data_obj[new_key] = obj;
                    }
                }
            }

            var data = Object.values(data_obj);
            console.log(data);

            if("sort" in Properties)
            {

            }
            else
            {
                dates.sort();
            }

            for (var d = 0; d < dates.length; d++) {
                global_obj[dates[d].substring(4) + " " + dates[d].substring(0, 4)] = "";
            }
            console.log(global_obj);

            var b = data[0];

            var c = Object.assign({}, global_obj, b)
            console.log(c);

            data[0] = c;
            var chart = am4core.create(root1, am4charts.XYChart);

            if (chart.logo) {
                chart.logo.disabled = true;
            }
            chart.data = data;

        }


        chart.events.on("ready", function () {
            chart.exporting.filePrefix = Filename;

            chart.exporting.adapter.add("xlsxWorkbook", function (wb) {
                // modify and add additional stuff to workbook object
                // ...
                wb.workbook.SheetNames.push("Information on Query");
                wb.workbook.Sheets["Information on Query"] = wb.xlsx.utils.aoa_to_sheet(Filters);
                return wb;
            });

            chart.exporting.export("xlsx");

            const millis = Date.now() - start;
            console.log(`seconds taken by cw = ${Math.floor(millis / 1000)}`);

        });
    }

   
    function exportResultSetToExcel(that) {

        var rset = that.resultset;
        that._resultSet = [];
        that._orderOfMeasures = Object.keys(that.measures);
        var info_OnQuery = that.filters;
        that._columnNames = that.properties["order_of_headers"];
        that._measureDimensionAtIndex = that._columnNames.indexOf("@MeasureDimension");
        that._columnValues = new Set();
        that._columnValueOrder = [];
        that._dimensions = new Set();
        that._measures = new Set();
        that._custom_DimensionHeader_Flag = false;
        that._custom_MeasureHeaders_Flag = false;
        var temp_key = [], cntr = 0;

        //Custom Header 
        that._custom_DimensionHeaders = that.dimensions;
        that._custom_MeasureHeaders = that.measures;
        that._numericColumnNames = that.properties["not_number"];

        // Xls
        that._colData_Xls = []

    // ------------------ Check Points -----------------   
        // console.log(rset)
        // console.log("Column Names")
        // console.log(that._columnNames)

        // console.log("Measure Dimension At Index")
        // console.log(that._measureDimensionAtIndex)
    // --------------------------------------------------

        // Xls
        var o = Object.fromEntries(that._columnNames.map(key => [key, new Set()]))

        for (var s in rset) {    

            for (var k of that._columnNames) {
                if (k != "@MeasureDimension") {
                    if(rset[s][k]) {
                        that._columnValues.add(rset[s][k].description);
                        // Xls
                        o[k].add(rset[s][k].description)
                    }
                } else {
                    o[k].add(rset[s][k].description)
                }
            }

            for (var l in rset[s]) {
                if (!(that._columnNames.includes(l)) && l != "@MeasureDimension") {
                    that._dimensions.add(l);
                    if (cntr == 0) {
                        temp_key.push(rset[0][l].description)
                    }
                }
                if (l == "@MeasureDimension") {
                    that._measures.add(rset[s][l].description);
                }
            }

            cntr += 1;
        }

        // Xls
        that._colData_Xls.push(o);

        that._dimensions = Array.from(that._dimensions);
        console.log("Dimensions");
        console.log(that._dimensions);
        // Xls
        console.log(that._colData_Xls)

        that._measures = Array.from(that._measures);
        console.log("Measures");
        console.log(that._measures);

        console.log("Order of Measures");
        console.log(that._orderOfMeasures);

        that._measures = that._orderOfMeasures;

        that._columnValues = Array.from(that._columnValues)
        that._columnValues = Object.keys(that.dimensions);

        // ------------------ Check Points -----------------   
            // console.log(that._measures)
            // console.log("Column Values");
            // console.log(that._columnValues);
        // -------------------------------------------------

        var temp_key_1 = temp_key.slice();
        var flag = false;

        for (var i = 0; i < rset.length;) {

            var obj = {};

            if (that._measureDimensionAtIndex != 1) {
                obj = Object.fromEntries(that._measures.map(key => [key, Object.fromEntries(that._columnValues.map(key => [key, "-"]))]));
            } else {
                obj = Object.fromEntries(that._columnValues.map(key => [key, Object.fromEntries(that._measures.map(key => [key, "-"]))]));
            }

            if(!flag) { 
                that._columnValueOrder = Object.keys(Object.fromEntries(that._columnValues.map(key => [key, "-"]))).slice() 
            }

            while (JSON.stringify(temp_key.join("_#_")) == JSON.stringify(temp_key_1.join("_#_"))) {

                for (var k = 0; k < that._columnValues.length; k++) {
                    for (var l = 0; l < that._columnNames.length; l++) {
                        if (rset[i][that._columnNames[l]].description == that._columnValues[k]) {
                            for (var m = 0; m < that._measures.length; m++) {
                                if (rset[i]["@MeasureDimension"].description == that._measures[m]) {
                                    if (that._measureDimensionAtIndex != 1) {
                                        obj[that._measures[m]][that._columnValues[k]] = rset[i]["@MeasureDimension"].formattedValue;
                                    } else {
                                        obj[that._columnValues[k]][that._measures[m]] = rset[i]["@MeasureDimension"].formattedValue;
                                    }
                                }
                            }
                        }
                    }
                }

                flag = true;
                that._resultSet[temp_key_1.join("_#_")] = obj

                i++;

                if (i >= rset.length) {
                    break;
                }

                temp_key_1 = [];
                for (var j = 0; j < that._dimensions.length; j++) {
                    temp_key_1.push(rset[i][that._dimensions[j]].description);
                }

            }

            if (i >= rset.length) {
                break;
            }

            temp_key = [];
            for (var j = 0; j < that._dimensions.length; j++) {
                temp_key.push(rset[i][that._dimensions[j]].description);
            }
        }

        console.log("Transformed Resultset")
        console.log(that._resultSet);

        // Info on Query
        info_OnQuery.push(["Dimensions",that._dimensions.join(", ")]);
        info_OnQuery.push(["Measures",that._measures.join(", ")]);
        // info_OnQuery.shift();
        // info_OnQuery.shift();
        that.filters = info_OnQuery;
        that._exportFileName = info_OnQuery[0][1];

        setExtras(that);
        exportToExcel(that);

        // ------------------ Check Points -----------------   
            // console.log("Column Values Sorted...")
            // that._columnValueOrder = Object.keys(that.dimensions);
            // console.log(that._columnValueOrder);
        // -------------------------------------------------

    }

    function prepareDataToBeExported(that) {

        that._dataToExcel = [];
        var rowArr = []

        // Actual Data Preparation
        for(var i = 0; i < that._dimensions.length - 1; i++) {
            rowArr.push("")
        }

        rowArr = []
        for(var k = 0; k < that._dimensions.length; k++) {
            rowArr.push(that._dimensions[k])
        }
        that._dataToExcel.push(rowArr);

        rowArr = []
        for(var i in that._resultSet) {
            rowArr = []
            var names = i.split("_#_")
            for(var j = 0; j < names.length; j++) {
                rowArr.push(names[j])
            }
            for(var k in that._resultSet[i]) {
                for(var v in that._resultSet[i][k]) {
                    if(that._numericColumnNames && that._numericColumnNames.includes(v)) {
                        if(that._resultSet[i][k][v] != "-") {
                            rowArr.push(parseFloat(that._resultSet[i][k][v].replaceAll(',', '')))
                        } else {
                            rowArr.push(that._resultSet[i][k][v])
                        }
                    } else {
                        rowArr.push(that._resultSet[i][k][v])
                    }
                }
            }
            that._dataToExcel.push(rowArr);
        }

        // Last Row Column (Header)
        for(var i = 0, j = 0; i < that._dataToExcel[that._dataToExcel.length - 1].length - that._dimensions.length; i++) {
            if(i == 0) {
                rowArr = [""];  
                if(that._columnNames[that._columnNames.length - 1] == "@MeasureDimension") {
                    rowArr.push(that._columnNames[that._columnNames.length - 1])
                } else {
                    rowArr.push(that._columnNames[that._columnNames.length - 1]);
                }
            }
            if(that._columnNames[that._columnNames.length - 1] == "@MeasureDimension") {
                if(that._custom_MeasureHeaders_Flag) {
                    rowArr.push(that._custom_MeasureHeaders[that._orderOfMeasures[j]]);
                } else {
                    rowArr.push(that._orderOfMeasures[j]);
                }
                j+=1;
                if(j >= that._orderOfMeasures.length) {
                    j = 0;
                }
            } else {
                if(that._custom_DimensionHeader_Flag) {
                    rowArr.push(that._custom_DimensionHeaders[that._columnValueOrder[j]]);
                } else {
                    rowArr.push(that._columnValueOrder[j]);
                }
                j+=1;
                if(j >= that._columnValueOrder.length) {
                    j = 0;
                }
            }
        }
        that._dataToExcel.unshift(rowArr);

        // First Row Column (Header)
        for(var i = 0; i < that._columnValueOrder.length; i++) {

            if(i == 0) {
                rowArr = [""]; 
                if(that._columnNames[0] == "@MeasureDimension") {
                    rowArr.push("");
                } else {
                    rowArr.push(that._columnNames[0]);
                }
            }

            if(that._columnNames[0] == "@MeasureDimension") {
                if(that._orderOfMeasures[i] == undefined) {
                    break;
                }
                if(that._custom_MeasureHeaders_Flag) {
                    rowArr.push(that._custom_MeasureHeaders[that._orderOfMeasures[i]]);
                } else {
                    rowArr.push(that._orderOfMeasures[i]);
                }
                for(var j = 0; j < that._columnValueOrder.length - 1; j++) {
                    rowArr.push("");
                }
            } else {
                if(that._custom_DimensionHeader_Flag) {
                    rowArr.push(that._custom_DimensionHeaders[that._columnValueOrder[i]]);
                } else {
                    rowArr.push(that._columnValueOrder[i]);
                }

                console.log(that._colData_Xls[0]);
                console.log(that._dataToExcel[0]);
                console.log(that._dimensions.length - 1);
                console.log(that._columnNames[0]);
                for(var j = 0; j < that._colData_Xls[0][that._dataToExcel[0][that._dimensions.length - 1]].size - 1; j++) {
                    rowArr.push("");
                }
            }

        }
        that._dataToExcel.unshift(rowArr);

        // ------------------ Check Points -----------------   
            // console.log("Data to be Exported...")
            // console.log(that._dataToExcel)
        // -------------------------------------------------
    }

    function setExtras(that) {

        if(Object.keys(that._custom_DimensionHeaders).length > 0) {
            if(Object.keys(that._custom_DimensionHeaders).length != that._columnValueOrder.length) {
                console.log("------- Error -------");
                console.log(`Length Mismatch for Custom Dimension Headers is ${Object.keys(that._custom_DimensionHeaders).length},  while length of Dimensions were ${that._columnValueOrder.length}`);
                console.log("---------------------");
                return;
            }
            console.log("Custom Dimension Headers");
            console.log( that._custom_DimensionHeaders);
            that._custom_DimensionHeader_Flag = true;
        } 

        if(Object.keys(that._custom_MeasureHeaders).length > 0) {
            if(Object.keys(that._custom_MeasureHeaders).length != that._orderOfMeasures.length) {
                console.log("------- Error -------");
                console.log(`Length Mismatch for Custom Measure Headers is ${Object.keys(that._custom_MeasureHeaders).length},  while length of Measures were ${that._orderOfMeasures.length}`);
                console.log("---------------------");
                return;
            }
            console.log("Custom Measure Headers");
            console.log( that._custom_MeasureHeaders);
            that._custom_MeasureHeaders_Flag = true;
        }

        console.log("Numeric Column Names")
        console.log(that._numericColumnNames);

        console.log("Exporting sheet filename is "+that._exportFileName);
    }

    async function exportToExcel(that) {

        prepareDataToBeExported(that);

        console.log("Export to Excel Called...")
        console.log("-------------------------")

        if(!isLibLoaded) {
            await getScriptPromisify("https://www.amcharts.com/lib/4/core.js");
            await getScriptPromisify("https://www.amcharts.com/lib/4/charts.js");
            isLibLoaded = true;
        }

        var chart = am4core.create(that._root, am4charts.XYChart);

        var exportColumnNames = {}
        for(var i = 0; i < that._dataToExcel[0].length; i++) {
            exportColumnNames[i] = that._dataToExcel[0][i];
        }

        // console.log(exportColumnNames);

        chart.exporting.dataFields = exportColumnNames;
        that._dataToExcel.shift();
        for(var i = 0; i < that._dimensions.length; i++) {
            that._dataToExcel[0][i] = that._dimensions[i];
        }
        that._dataToExcel.splice(1,1)

        // ------------------ Check Points -----------------   
            console.log("Data to be Exported...")
            console.log(that._dataToExcel)
        // -------------------------------------------------

        chart.data = that._dataToExcel;

        // chart.exporting.addColumnNames = false;
        // chart.exporting.dataFields = {
        //     "0": "Expenses",
        //     "1": "Category",
        //     "2":"",
        //     "3":""
        //   }

        if(that._exportFileName) {
            chart.exporting.filePrefix = that._exportFileName;
        }

        console.log(that.filters);

        const infoOnQuery = that.filters;

        chart.exporting.adapter.add("xlsxWorkbook", function (wb) 
        {
            // modify and add additional stuff to workbook object
            // ...
            wb.workbook.SheetNames.push("Information on Query");
            wb.workbook.Sheets["Information on Query"] = wb.xlsx.utils.aoa_to_sheet(infoOnQuery);
            return wb;
        });

        chart.exporting.export("xlsx");
    }


})();