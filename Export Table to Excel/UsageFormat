var customDimensionHeaders = { 			// should have maintain the order of dimension headers to be kept.
	"JAN":"January",
	"FEB":"February",
	"MAR":"March",
	"APR":"April",
	"MAY":"May",
	"JUN":"June",
	"JUL":"July",
	"AUG":"August",
	"SEP":"September",
	"OCT":"October",
	"NOV":"November",
	"DEC":"December"
};

var customMeasureHeaders = {			// should have maintain the order of measure headers to be kept. 
	"Income":"I",
	"Orders":"O",
	"Target Income":"TI",
	"Operating Profit":"OP"
};

var filters = [
	["FileName","Multi Header Export"],
	["",""],
	["Technical Information",""],
	["Model ID",Table_3.getDataSource().getInfo().modelId],
	["Created By",Application.getUserInfo().displayName],
	["Created On",DateFormat.format(new Date(),"dd/MM/yyyy hh:mm")],
	["",""],
	["",""],
	["Widget Filters",""],
];

var properties = {
	"order_of_headers" : ["Month", "@MeasureDimension"], 		// order of headers.
	"ignore_column_headers" : ["36509986-4217-4333-3250-435358868656", "24334528-1728-4517-3032-332933541662"],				// ignore headers in result set may contain name of column (Child Level) or Calculated Measure/Dimension id.
	"not_number": ["Income"],								    // column(s) to be set as numeric.
};

var result_set = Table_3.getDataSource().getResultSet();
result_set.shift();

Export_1.exportResultSetToExcel(result_set, customDimensionHeaders, customMeasureHeaders, filters, properties);


//	var numericColumns = ["APR"];
//	var order_of_headers = ["@MeasureDimension", "Month"];
//	var order_of_measures_headerValues = ["Income", "Orders", "Target Income", "Operating Profit"];
//	var order_of_dimesions_headerValues = ["APR","AUG","DEC","FEB","JAN","JUL","JUN","MAR","MAY","NOV","OCT","SEP"];

//	Export_1.setResultSet(result_set, order_of_headers, order_of_measures_headerValues, order_of_dimesions_headerValues);
//	Export_1.setExtras(customDimensionHeaders, customMeasureHeaders, numericColumns, Info_on_Qry);
//	Export_1.exportToExcel();

