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

    var data = {"OkPercent": 12.492474413004214, "KoPercent": 87.50752558699578};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09469338608411457, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4784876140808344, 500, 1500, "View Cart - GET /cart"], "isController": false}, {"data": [0.0, 500, 1500, "Checkout - POST /checkout"], "isController": false}, {"data": [0.0, 500, 1500, "View Product Detail - GET /product/{product_id}"], "isController": false}, {"data": [0.0, 500, 1500, "Add To Cart - POST /cart"], "isController": false}, {"data": [0.0, 500, 1500, "Browse Products - GET /products"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 69762, 61047, 87.50752558699578, 2381.790071958917, 3, 42375, 82.0, 2301.9000000000015, 17956.800000000003, 33984.98, 77.17351263270731, 246.77657878074103, 7.877919401844987], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Cart - GET /cart", 13806, 5091, 36.87527162103433, 2521.5685933651935, 27, 42375, 1093.0, 2314.2000000000044, 16091.499999999996, 32227.880000000005, 15.279239557360231, 83.56101407742158, 1.469352188629882], "isController": false}, {"data": ["Checkout - POST /checkout", 13650, 13650, 100.0, 2279.110915750901, 3, 41618, 89.5, 2116.8999999999996, 15573.899999999998, 32524.35, 15.125575519837774, 19.25867993513455, 1.6529314113325464], "isController": false}, {"data": ["View Product Detail - GET /product/{product_id}", 14094, 14094, 100.0, 2268.159926209734, 5, 41953, 152.0, 2124.0, 15526.25, 31549.549999999977, 15.611033391927322, 67.33289312557666, 1.550042547099487], "isController": false}, {"data": ["Add To Cart - POST /cart", 13961, 13961, 100.0, 2236.414153713919, 3, 41438, 88.0, 2113.0, 15505.599999999999, 31513.0, 15.466869922527167, 56.84008787358512, 1.6784984085553583], "isController": false}, {"data": ["Browse Products - GET /products", 14251, 14251, 100.0, 2599.5210862395656, 3, 41087, 103.0, 2157.800000000001, 17501.8, 33270.399999999994, 15.783324011673303, 20.043143466231594, 1.5366895001190588], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 26016, 42.616344783527445, 37.292508815687626], "isController": false}, {"data": ["500/Internal Server Error", 8850, 14.497026880927809, 12.68598950718156], "isController": false}, {"data": ["422/Unprocessable Entity", 8815, 14.439694006257474, 12.635818927209655], "isController": false}, {"data": ["404/Not Found", 17366, 28.44693432928727, 24.893208336916945], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 69762, 61047, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 26016, "404/Not Found", 17366, "500/Internal Server Error", 8850, "422/Unprocessable Entity", 8815, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["View Cart - GET /cart", 13806, 5091, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 5091, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Checkout - POST /checkout", 13650, 13650, "404/Not Found", 8486, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 5164, "", "", "", "", "", ""], "isController": false}, {"data": ["View Product Detail - GET /product/{product_id}", 14094, 14094, "500/Internal Server Error", 8850, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 5244, "", "", "", "", "", ""], "isController": false}, {"data": ["Add To Cart - POST /cart", 13961, 13961, "422/Unprocessable Entity", 8815, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 5146, "", "", "", "", "", ""], "isController": false}, {"data": ["Browse Products - GET /products", 14251, 14251, "404/Not Found", 8880, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:13815 [/127.0.0.1] failed: Connection refused: connect", 5371, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
