var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            
            input[type="search"]  {
              border:1px solid #dee2e6;
            }

            table.table.dataTable.table-striped > tbody > tr {
              border:0.1px solid #dee2e6;
              padding:1.2%;
            }

			table.table.dataTable.table-striped > tbody > tr > td {
				padding-top:1%;
			}

            table.table.dataTable.table-striped > tbody > tr:nth-of-type(2n+1) > * {
              background-color:#f2f2f2;
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
          <div id="root" style="width: 100%; height: 100%; padding:1.5%;display:grid;">
          <table id="example" class="table table-striped" style="width:100%">
              <thead>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `;

  class CustomTable extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));
      this._root = this._shadowRoot.getElementById("root");
      this._table = this._shadowRoot.getElementById("example");
      this._props = {};
      this.render();
    }

    // onCustomWidgetBeforeUpdate(changedProperties) {
    //   this._props = { ...this._props, ...changedProperties };
    // }

    // onCustomWidgetAfterUpdate(changedProperties) {
    //   if ("myDataBinding" in changedProperties) {
    //     this.myDataBinding = changedProperties["myDataBinding"];
    //   }
    // }

    // onCustomWidgetResize (width, height) {
    //   this.render()
    // }

	async setResultSet(cnt, rs) {

		var rs = await rs;
		// console.log(rs);
		
		this._resultSet = {};
		this._selectionColumnsCount = cnt;
		this._dimensions = new Set();
		this._measures = new Set();

		for(var i = 0; i < rs.length; i++) {

			var k = "";
			var rs_keys = Object.keys(rs[i]);

			for(var j = 0; j < rs_keys.length; j++) {
				if(rs_keys[j] != "@MeasureDimension") {
					k += rs[i][rs_keys[j]].id+"_#_";
				}

				if(!(rs_keys[j] in this._dimensions) && rs_keys[j] != "@MeasureDimension") {
					this._dimensions.add(rs_keys[j])
				}
			}

			if(!this._resultSet.hasOwnProperty(k)) {
				this._resultSet[k] = []
			} 

			var mObj = {}
			mObj[rs[i]["@MeasureDimension"].id] = rs[i]["@MeasureDimension"].rawValue;
			this._measures.add(rs[i]["@MeasureDimension"].id);

			this._resultSet[k].push(mObj)
		}

		this._dimensions = Array.from(this._dimensions);
		this._measures = Array.from(this._measures);

		console.log(this._resultSet);
		// console.log(this._dimensions);
		// console.log(this._measures);
	}

    async render() {
      // await getScriptPromisify('https://code.jquery.com/jquery-3.7.1.js');

      await getScriptPromisify(
        "https://cdn.datatables.net/2.0.1/js/dataTables.js"
      );
      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js"
      );
      await getScriptPromisify(
        "https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js"
      );
      await getScriptPromisify(
        "https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js"
      );
      await getScriptPromisify(
        "https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js"
      );
      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
      );
      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"
      );
      await getScriptPromisify(
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"
      );
      await getScriptPromisify(
        "https://cdn.datatables.net/buttons/3.0.0/js/buttons.html5.min.js"
      );
      await getScriptPromisify(
        "https://cdn.datatables.net/buttons/3.0.0/js/buttons.print.min.js"
      );
      // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

      if (!this._resultSet) {
        return;
      }

      console.log("ResultSet Success");

      var table_cols = [];

      var col_dimension = this._dimensions;
      var col_measure = this._measures;

      for (var i = 0; i < col_dimension.length; i++) {
        table_cols.push({
          title: col_dimension[i],
        });
      }

	  for (var i = 0; i < col_measure.length; i++) {
        table_cols.push({
          title: col_measure[i],
        });
      }

    //   console.log(table_cols);

      const tbl = new DataTable(this._table, {
        // initComplete: function () {
        //   this.api()
        //     .columns()
        //     .every(function () {
        //       let column = this

        //       // Create select element
        //       let select = document.createElement('select')
        //       select.add(new Option('Select'))
        //       column.header().replaceChildren(select)

        //       // Apply listener for user change in value
        //       select.addEventListener('change', function () {
        //         column.search(select.value, { exact: true }).draw()
        //       })

        //       // Add list of options
        //       column
        //         .data()
        //         .unique()
        //         .sort()
        //         .each(function (d, j) {
        //           select.add(new Option(d))
        //         })
        //     })
        // },
        layout: {
          topStart: {
            buttons: ["copy", "excel", "pdf", "colvis"],
          },
        },
        columns: table_cols,
        columnDefs: [
          {
            defaultContent: "-",
            targets: "_all",
            // className: 'dt-body-left'
          },
        ],
        bDestroy: true,
      });

      tbl.on("click", "tbody tr", (e) => {
        let classList = e.currentTarget.classList;
        tbl
          .rows(".selected")
          .nodes()
          .each((row) => row.classList.remove("selected"));
        classList.add("selected");
      });

    //   var transformed_data = [];

    //   var cnt_dimensions = this.myDataBinding.metadata.feeds.dimensions.values;
    //   var cnt_measures = this.myDataBinding.metadata.feeds.measures.values;

    //   for (var i = 0; i < this.myDataBinding.data.length; i++) {
    //     // var tbl_row_data = []

    //     // Dynamic 'N' keys
    //     var key = "";

    //     for (var j = 0; j < cnt_dimensions.length; j++) {
    //       var dim_key = cnt_dimensions[j];
    //       key += this.myDataBinding.data[i][dim_key].label + "_#_";
    //     }

    //     //  Dynamic 'N' values
    //     var measure_objs = {};

    //     for (var j = 0; j < cnt_measures.length; j++) {
    //       var measure_key = cnt_measures[j];
    //       measure_objs[measure_key] = this.myDataBinding.data[i][measure_key];
    //     }

    //     var temp_obj = {};
    //     temp_obj[key] = measure_objs;

    //     transformed_data.push(temp_obj);
    //   }

    //   console.log("Formatted Data");
    //   console.log(transformed_data);

      function updateData(val, state, cnt) {
        var selectData = tbl.row(".selected").data();
        var parsedData = JSON.parse(val);

        var row_updated_arr = [];

        for (
          var i = 0;
          i < selectData.length - Object.keys(parsedData).length;
          i++
        ) {
          row_updated_arr.push(selectData[i]);
        }

        for (var s = 0; s < parsedData.length; s++) {
			var k = Object.keys(parsedData[s])[0];
         	row_updated_arr.push(parsedData[s][k]);
        }

        state
          .getElementsByTagName("option")
          [state.options.selectedIndex].setAttribute("selected", "selected");
        row_updated_arr[selectData.length - Object.keys(parsedData).length - 1] = state;

        tbl.row(".selected").data(row_updated_arr);
      }

      window.updateData = updateData;

      var dim = Object.keys(this._resultSet)[0].split("_#_");
	  dim.pop()

      for (var i = 0, init_index = 0; i < Object.keys(this._resultSet).length; ) {

		var dim_year =
          "<select id='" +
          Object.keys(this._resultSet)[i] +
          "' onChange='updateData(this.value, this);'>";

        var temp_dim = Object.keys(this._resultSet)[i].split("_#_");
		temp_dim.pop()

		var compare_a = dim.slice(), compare_b = temp_dim.slice()

		for(var k = 0; k < this._selectionColumnsCount; k++) {
			compare_a.pop()
			compare_b.pop()
		}
	
        while (JSON.stringify(compare_a) == JSON.stringify(compare_b)) {

			var opt_key = Object.keys(this._resultSet)[i];

			dim_year +=
				"<option id='" +
				init_index +
				"' value='" +
				JSON.stringify(this._resultSet[opt_key]) +
				"'>" +
				temp_dim[temp_dim.length - 1] +
				"</option>";

			i += 1;
			init_index += 1;

			if (i >= Object.keys(this._resultSet).length) {
				break;
			}

			temp_dim = Object.keys(this._resultSet)[i].split("_#_");
			temp_dim.pop()
			compare_b = temp_dim.slice()

			for(var k = 0; k < this._selectionColumnsCount; k++) {
				compare_b.pop()
			}
        }

        dim_year += "</select>";

		var row_arr = [];

		for(var k = 0; k < dim.length - this._selectionColumnsCount; k++) {
			row_arr.push(dim[k]);
		}

        row_arr.push(dim_year);

        var k = Object.keys(this._resultSet)[i - init_index];

        for (var s in this._resultSet[k]) {
			var sk = Object.keys(this._resultSet[k][s]);
			row_arr.push(this._resultSet[k][s][sk]);
        }

        init_index = 0;

        tbl.row.add(row_arr).draw(false);

        if (i >= Object.keys(this._resultSet).length) { break; }

        dim = Object.keys(this._resultSet)[i].split("_#_");
		dim.pop()

        dim_year = "";
      }
    }
  }

  customElements.define("custom-table", CustomTable);
})();
