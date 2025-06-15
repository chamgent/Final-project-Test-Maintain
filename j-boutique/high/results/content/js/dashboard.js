/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 14.717166181094413, "KoPercent": 85.28283381890559};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.11725848789915481, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5911007706848916, 500, 1500, "View Cart - GET /cart"], "isController": false}, {"data": [0.0, 500, 1500, "Checkout - POST /checkout"], "isController": false}, {"data": [0.0, 500, 1500, "View Product Detail - GET /product/{product_id}"], "isController": false}, {"data": [0.0, 500, 1500, "Add To Cart - POST /cart"], "isController": false}, {"data": [0.0, 500, 1500, "Browse Products - GET /products"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 69334, 59130, 85.28283381890559, 2149.0118700781463, 2, 60020, 79.0, 2388.600000000006, 12540.0, 40653.35000000011, 76.6531493085805, 252.3053128776191, 9.582839917978234], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Cart - GET /cart", 13754, 3550, 25.810673258688382, 2718.443652755556, 5, 60020, 430.0, 2162.0, 18263.25, 40369.50000000004, 15.208175306452363, 91.7851536411743, 1.7838925503824712], "isController": false}, {"data": ["Checkout - POST /checkout", 13661, 13661, 100.0, 2058.4688529390214, 2, 54421, 51.0, 2079.800000000001, 11960.399999999994, 37020.39999999989, 15.125077225249722, 14.259762809496104, 2.026773565049679], "isController": false}, {"data": ["View Product Detail - GET /product/{product_id}", 13976, 13976, 100.0, 1944.3647681740174, 5, 54901, 68.0, 2066.0, 9348.749999999984, 39888.07999999996, 15.461511059582573, 72.24874003059722, 1.8850535845460117], "isController": false}, {"data": ["Add To Cart - POST /cart", 13880, 13880, 100.0, 1923.026224783859, 3, 55422, 48.0, 2063.0, 9548.14999999996, 37191.07000000003, 15.358994362098251, 59.61773878955245, 2.0329331750958555], "isController": false}, {"data": ["Browse Products - GET /products", 14063, 14063, 100.0, 2106.472729858494, 2, 55428, 51.0, 2069.0, 12506.799999999996, 40380.04000000004, 15.561872913399942, 14.54252326832252, 1.862171248103594], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 16095, 27.21968543886352, 23.213719098854817], "isController": false}, {"data": ["500/Internal Server Error", 11162, 18.877050566548284, 16.09888366458015], "isController": false}, {"data": ["422/Unprocessable Entity", 10689, 18.077118214104516, 15.416678685781868], "isController": false}, {"data": ["404/Not Found", 21184, 35.82614578048368, 30.553552369688752], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 69334, 59130, "404/Not Found", 21184, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 16095, "500/Internal Server Error", 11162, "422/Unprocessable Entity", 10689, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["View Cart - GET /cart", 13754, 3550, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 3164, "500/Internal Server Error", 386, "", "", "", "", "", ""], "isController": false}, {"data": ["Checkout - POST /checkout", 13661, 13661, "404/Not Found", 10414, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 3247, "", "", "", "", "", ""], "isController": false}, {"data": ["View Product Detail - GET /product/{product_id}", 13976, 13976, "500/Internal Server Error", 10776, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 3200, "", "", "", "", "", ""], "isController": false}, {"data": ["Add To Cart - POST /cart", 13880, 13880, "422/Unprocessable Entity", 10689, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 3191, "", "", "", "", "", ""], "isController": false}, {"data": ["Browse Products - GET /products", 14063, 14063, "404/Not Found", 10770, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 3293, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
