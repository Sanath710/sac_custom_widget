var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

(function () {

    let template = document.createElement("template");
    template.innerHTML = `<div id="chart_div" style="width: 100%; height: 100%"></div>`;

    class customWidgetExport extends HTMLElement {

        constructor() {
            console.clear()
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._root = this._shadowRoot.getElementById("chart_div");
            this._props = {};
        }


        async setResultSet(rs, cols, order_of_measures, order_of_dimensions) {

            var rset = await rs;
            this._resultSet = [];
            this._orderOfMeasures = order_of_measures;
            this._columnNames = cols;
            this._measureDimensionAtIndex = this._columnNames.indexOf("@MeasureDimension");
            this._columnValues = new Set();
            this._columnValueOrder = [];
            this._dimensions = new Set();
            this._measures = new Set();
            this._custom_DimensionHeader_Flag = false;
            this._custom_MeasureHeaders_Flag = false;
            var temp_key = [], cntr = 0;

            // Xls
            this._colData_Xls = []

        // ------------------ Check Points -----------------   
            // console.log(rset)
            // console.log("Column Names")
            // console.log(this._columnNames)

            // console.log("Measure Dimension At Index")
            // console.log(this._measureDimensionAtIndex)
        // --------------------------------------------------

            // Xls
            var o = Object.fromEntries(this._columnNames.map(key => [key, new Set()]))

            for (var s in rset) {    

                for (var k of this._columnNames) {
                    if (k != "@MeasureDimension") {
                        if(rset[s][k]) {
                            this._columnValues.add(rset[s][k].description);
                            // Xls
                            o[k].add(rset[s][k].description)
                        }
                    } else {
                        o[k].add(rset[s][k].description)
                    }
                }

                for (var l in rset[s]) {
                    if (!(this._columnNames.includes(l)) && l != "@MeasureDimension") {
                        this._dimensions.add(l);
                        if (cntr == 0) {
                            temp_key.push(rset[0][l].description)
                        }
                    }
                    if (l == "@MeasureDimension") {
                        this._measures.add(rset[s][l].description);
                    }
                }

                cntr += 1;
            }

            // Xls
            this._colData_Xls.push(o);

            this._dimensions = Array.from(this._dimensions);
            console.log("Dimensions");
            console.log(this._dimensions);
            // Xls
            console.log(this._colData_Xls)

            this._measures = Array.from(this._measures);
            console.log("Measures");
            console.log(this._measures);

            console.log("Order of Measures");
            console.log(this._orderOfMeasures);

            // console.log("Sorted Measures based on Received Measure Orders")
            // const sorter = (a, b) => {
            //     if(this._orderOfMeasures.includes(a)){
            //        return -1;
            //     };
            //     if(this._orderOfMeasures.includes(b)){
            //        return 1;
            //     };
            //     return 0;
            // };
            // this._measures.sort(sorter)
            this._measures = this._orderOfMeasures;

            this._columnValues = Array.from(this._columnValues)
            this._columnValues = order_of_dimensions;

            // ------------------ Check Points -----------------   
                // console.log(this._measures)
                // console.log("Column Values");
                // console.log(this._columnValues);
            // -------------------------------------------------

            var temp_key_1 = temp_key.slice();
            var flag = false;

            for (var i = 0; i < rset.length;) {

                var obj = {};

                if (this._measureDimensionAtIndex != 1) {
                    obj = Object.fromEntries(this._measures.map(key => [key, Object.fromEntries(this._columnValues.map(key => [key, "-"]))]));
                } else {
                    obj = Object.fromEntries(this._columnValues.map(key => [key, Object.fromEntries(this._measures.map(key => [key, "-"]))]));
                }

                if(!flag) { 
                    this._columnValueOrder = Object.keys(Object.fromEntries(this._columnValues.map(key => [key, "-"]))).slice() 
                }

                while (JSON.stringify(temp_key.join("_#_")) == JSON.stringify(temp_key_1.join("_#_"))) {

                    for (var k = 0; k < this._columnValues.length; k++) {
                        for (var l = 0; l < this._columnNames.length; l++) {
                            if (rset[i][this._columnNames[l]].description == this._columnValues[k]) {
                                for (var m = 0; m < this._measures.length; m++) {
                                    if (rset[i]["@MeasureDimension"].description == this._measures[m]) {
                                        if (this._measureDimensionAtIndex != 1) {
                                            obj[this._measures[m]][this._columnValues[k]] = rset[i]["@MeasureDimension"].rawValue;
                                        } else {
                                            obj[this._columnValues[k]][this._measures[m]] = rset[i]["@MeasureDimension"].rawValue;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    flag = true;
                    this._resultSet[temp_key_1.join("_#_")] = obj

                    i++;

                    if (i >= rset.length) {
                        break;
                    }

                    temp_key_1 = [];
                    for (var j = 0; j < this._dimensions.length; j++) {
                        temp_key_1.push(rset[i][this._dimensions[j]].description);
                    }

                }

                if (i >= rset.length) {
                    break;
                }

                temp_key = [];
                for (var j = 0; j < this._dimensions.length; j++) {
                    temp_key.push(rset[i][this._dimensions[j]].description);
                }
            }

            console.log("Transformed Resultset")
            console.log(this._resultSet);

            // ------------------ Check Points -----------------   
                // console.log("Column Values Sorted...")
                // this._columnValueOrder = order_of_dimensions;
                // console.log(this._columnValueOrder);
            // -------------------------------------------------

        }

        setCustomHeader(dimensionHeaders, measureHeaders) {

            this._custom_DimensionHeaders = dimensionHeaders;
            this._custom_MeasureHeaders = measureHeaders;

            if(Object.keys(this._custom_DimensionHeaders).length > 0) {
                if(Object.keys(this._custom_DimensionHeaders).length != this._columnValueOrder.length) {
                    console.log("------- Error -------");
                    console.log(`Length Mismatch for Custom Dimension Headers is ${Object.keys(this._custom_DimensionHeaders).length},  while length of Dimensions were ${this._columnValueOrder.length}`);
                    console.log("---------------------");
                    return;
                }
                console.log("Custom Dimension Headers");
                console.log( this._custom_DimensionHeaders);
                this._custom_DimensionHeader_Flag = true;
            } 

            if(Object.keys(this._custom_MeasureHeaders).length > 0) {
                if(Object.keys(this._custom_MeasureHeaders).length != this._orderOfMeasures.length) {
                    console.log("------- Error -------");
                    console.log(`Length Mismatch for Custom Measure Headers is ${Object.keys(this._custom_MeasureHeaders).length},  while length of Measures were ${this._orderOfMeasures.length}`);
                    console.log("---------------------");
                    return;
                }
                console.log("Custom Measure Headers");
                console.log( this._custom_MeasureHeaders);
                this._custom_MeasureHeaders_Flag = true;
            }
        }

        prepareDataToBeExported() {

            this._dataToExcel = [];
            var rowArr = []

            // Actual Data Preparation
            for(var i = 0; i < this._dimensions.length - 1; i++) {
                rowArr.push("")
            }

            rowArr = []
            for(var k = 0; k < this._dimensions.length; k++) {
                rowArr.push(this._dimensions[k])
            }
            this._dataToExcel.push(rowArr);

            rowArr = []
            for(var i in this._resultSet) {
                rowArr = []
                var names = i.split("_#_")
                for(var j = 0; j < names.length; j++) {
                    rowArr.push(names[j])
                }
                for(var k in this._resultSet[i]) {
                    for(var v in this._resultSet[i][k]) {
                        if(this._numericColumnNames && this._numericColumnNames.includes(v)) {
                            if(this._resultSet[i][k][v] != "-") {
                                rowArr.push(parseInt(this._resultSet[i][k][v]))
                            } else {
                                rowArr.push(this._resultSet[i][k][v])
                            }
                        } else {
                            rowArr.push(this._resultSet[i][k][v])
                        }
                    }
                }
                this._dataToExcel.push(rowArr);
            }

            // Last Row Column (Header)
            for(var i = 0, j = 0; i < this._dataToExcel[this._dataToExcel.length - 1].length - this._dimensions.length; i++) {
                if(i == 0) {
                    rowArr = [""];  
                    rowArr.push(this._columnNames[this._columnNames.length - 1])
                }
                if(this._columnNames[this._columnNames.length - 1] == "@MeasureDimension") {
                    if(this._custom_MeasureHeaders_Flag) {
                        rowArr.push(this._custom_MeasureHeaders[this._orderOfMeasures[j]]);
                    } else {
                        rowArr.push(this._orderOfMeasures[j]);
                    }
                    j+=1;
                    if(j >= this._orderOfMeasures.length) {
                        j = 0;
                    }
                } else {
                    if(this._custom_DimensionHeader_Flag) {
                        rowArr.push(this._custom_DimensionHeaders[this._columnValueOrder[j]]);
                    } else {
                        rowArr.push(this._columnValueOrder[j]);
                    }
                    j+=1;
                    if(j >= this._columnValueOrder.length) {
                        j = 0;
                    }
                }
            }
            this._dataToExcel.unshift(rowArr);

            // First Row Column (Header)
            for(var i = 0; i < this._columnValueOrder.length; i++) {

                if(i == 0) {
                    rowArr = [""]; 
                    rowArr.push(this._columnNames[0])
                }

                if(this._columnNames[0] == "@MeasureDimension") {
                    if(this._orderOfMeasures[i] == undefined) {
                        break;
                    }
                    if(this._custom_MeasureHeaders_Flag) {
                        rowArr.push(this._custom_MeasureHeaders[this._orderOfMeasures[i]]);
                    } else {
                        rowArr.push(this._orderOfMeasures[i]);
                    }
                    for(var j = 0; j < this._columnValueOrder.length - 1; j++) {
                        rowArr.push("");
                    }
                } else {
                    if(this._custom_DimensionHeader_Flag) {
                        rowArr.push(this._custom_DimensionHeaders[this._columnValueOrder[i]]);
                    } else {
                        rowArr.push(this._columnValueOrder[i]);
                    }
                    for(var j = 0; j < this._colData_Xls[0][this._dataToExcel[0][this._dimensions.length - 1]].size - 1; j++) {
                        rowArr.push("");
                    }
                }

            }
            this._dataToExcel.unshift(rowArr);

            // ------------------ Check Points -----------------   
                // console.log("Data to be Exported...")
                // console.log(this._dataToExcel)
            // -------------------------------------------------
        }

        setAsNumericColumns(numericColumnNames) {
            this._numericColumnNames = numericColumnNames;
            console.log("Numeric Column Names")
            console.log(this._numericColumnNames);
        }

        async exportToExcel() {

            this.prepareDataToBeExported();

            console.log("Export to Excel Called...")
            console.log("-------------------------")

            await getScriptPromisify("https://www.amcharts.com/lib/4/core.js");
            await getScriptPromisify("https://www.amcharts.com/lib/4/charts.js");

            var chart = am4core.create(this._root, am4charts.XYChart);

            var exportColumnNames = {}
            for(var i = 0; i < this._dataToExcel[0].length; i++) {
                exportColumnNames[i] = this._dataToExcel[0][i];
            }

            // console.log(exportColumnNames);

            chart.exporting.dataFields = exportColumnNames;
            this._dataToExcel.shift();
            for(var i = 0; i < this._dimensions.length; i++) {
                this._dataToExcel[0][i] = this._dimensions[i];
            }
            this._dataToExcel.splice(1,1)

            // ------------------ Check Points -----------------   
                console.log("Data to be Exported...")
                console.log(this._dataToExcel)
            // -------------------------------------------------

            chart.data = this._dataToExcel;

            // chart.exporting.addColumnNames = false;
            // chart.exporting.dataFields = {
            //     "0": "Expenses",
            //     "1": "Category",
            //     "2":"",
            //     "3":""
            //   }

            chart.exporting.export("xlsx");
        }
    }
    customElements.define("sample-export", customWidgetExport);

})();