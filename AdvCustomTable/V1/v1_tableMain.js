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
            
          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.js"></script>
          <div id="root" style="width: 100%; height: 100%; padding:0.5%; padding-top:0%; overflow: scroll;">
		  	<table id="example" class="table-striped" style="width:100%">
              <thead></thead>
              <tbody></tbody>
            </table>
          </div>
        `

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

            onCustomWidgetAfterUpdate(changedProperties) {
            }

            setResultSet(rs, headers) {
                
                this._resultSet = [];

                var remove = "@MeasureDimension".split(",");
                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._measureOrder = headers["@MeasureDimension"]

                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)

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

                this.render();

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

                console.log('ResultSet Success')

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;

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
               
                console.log('Data Table Columns : ', table_cols)

                var tbl = undefined
                tbl = new DataTable(this._table, {
                    layout: {},
                    columns: table_cols,
                    bAutoWidth: true, 
                    columnDefs: [
                        {
                            defaultContent: '-',
                            targets: '_all', 
                        }
                    ],
                    bPaginate: false,
                    searching: false,
                    ordering: false,
                    info: false, 
                    bDestroy: true
                })

                var commonDataPoints = 2, row = "";

                for(var i = 0, tempInitials = ""; i < this._resultSet.length; i++) {

                    var initials = "";

                    for(var j = 0; j < commonDataPoints; j++) {
                        initials += this._resultSet[i][j]+"_#_";
                    }

                    if(i == 0) {
                        tempInitials = initials.substring(0,);
                    }

                    // if(i == 0) {
                        row = this._resultSet[i].slice();
                    // } else {
                        // row = this._resultSet[i - 1].slice();
                    // }

                    var selectElement =  `<select>`;

                    while(JSON.stringify(tempInitials) == JSON.stringify(initials)) {
                       
                        tempInitials = "";
                        for(var j = 0; j < commonDataPoints; j++) {
                            tempInitials += this._resultSet[i][j]+"_#_";
                        }

                        if(JSON.stringify(tempInitials) != JSON.stringify(initials)) {
                            i--;
                            // console.log(i, "---", this._resultSet[i], initials, tempInitials)
                            break;
                        }

                        selectElement += `<option>${this._resultSet[i][5]}</option>`
                        // console.log(initials, "---", tempInitials)
                        // console.log(this._resultSet[i][5])

                        i++;

                        if(i >= this._resultSet.length) {
                            break;
                        }

                    }

                    // row = this._resultSet[i];
                    selectElement += `</select>`;
                    row[5] = selectElement;
                    
                    // console.log(row)

                    tbl.row.add(row).draw(false)
                }

                console.log("Finished...");
            }
        }
        customElements.define('v1-custom-table', CustomTable)
    })()
