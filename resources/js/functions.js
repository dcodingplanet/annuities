$(document).ready(function () {
    
    /*
     * Used keycodes
     */
    const KEYCODE = {
        x: 88,
        y: 89,
        z: 90,
        s: 83,
        enter: 13,
        esc: 27
    };
    
    const MAX_LOAN_TIME = 100;
    
    /**
     * It calculates and draws the info respective the graph.
     * This function is called on click of the calculate button
     * @returns {void}
     */
    function calculateAndDraw(){
        var calculationInfo = getCalculationInfo();
        var calculationListObjectContainer = createCalculationList(calculationInfo);
        var sumZinsAndTilgung = calculateAllZinsAndTilgung(calculationListObjectContainer);
        var resultObject = {
            annuitaetMonatlich: calculationInfo.annuitaetMonatlich,
            zinsGesamt: sumZinsAndTilgung.zinsGesamt
        };
        outputResults(resultObject);
        createGraph(calculationListObjectContainer);
    }

    /**
     * This function calculate some basic alues e.g. the annuities and returns a
     * calculationInfo object
     * @returns {void}
     */
    function getCalculationInfo() {
        var darlehen = $("#darlehen").val();
        var zinssatz = $("#zinssatz").val();
        var laufzeit = $("#laufzeit").val();

        if (laufzeit > MAX_LOAN_TIME) {
            return;
        }

        var i = zinssatz / 100;
        var mi = i / 12;
        var q = 1 + i;
        var mq = 1 + mi;
        var coeff = Math.pow(q, laufzeit);
        var coeffMonat = Math.pow(mq, laufzeit * 12);
        var annuitaet = darlehen * ((coeff * i) / (coeff - 1));
        var annuitaetMonatlich = darlehen * ((coeffMonat * mi) / (coeffMonat - 1));
        var calculationInfo = {
            "darlehen": darlehen,
            "zinssatz": zinssatz,
            "laufzeit": laufzeit,
            "q": q,
            "i": i,
            "annuitaet": annuitaet,
            "annuitaetMonatlich": annuitaetMonatlich
        };
        
        return calculationInfo;
    }

    /**
     * Creates the calculation List for output and returns the List as an 
     * Objectcontainer for further manipulation.
     * 
     * @param {object} calculationInfo The calculation info as an object
     * @returns {Array} The calculation list as an object container.
     */
    function createCalculationList(calculationInfo) {

        createListHeader();
        var calculationListObjectContainer = [];

        var restschuld = calculationInfo.darlehen;
        for (var runner = 1; runner <= calculationInfo.laufzeit; runner++) {
            var $tr = $("<tr>");
            var tilgung = calculateTilgung(calculationInfo, runner);
            var restschuld = restschuld - tilgung;
            var zins = calculationInfo.annuitaet - tilgung;

            $("<td>").text(runner).appendTo($tr);
            $("<td>").text(restschuld.toFixed(2)).appendTo($tr);
            $("<td>").text(zins.toFixed(2)).appendTo($tr);
            $("<td>").text(tilgung.toFixed(2)).appendTo($tr);
            $("<td>").text(calculationInfo.annuitaet.toFixed(2)).appendTo($tr);
            $("#annuitaetenTable").append($tr);
            /*
             * create the listObject
             */
            var calculationListObject = {
                "jahr": Number.parseInt(runner),
                "restschuld": restschuld.toFixed(2),
                "zins": zins.toFixed(2),
                "tilgung": tilgung.toFixed(2),
                "annuitaet": (calculationInfo.annuitaet).toFixed(2)
            };

            calculationListObjectContainer.push(calculationListObject);
        }
        return calculationListObjectContainer;
    }

    /**
     * Calculate the sum of the Zins and the Tilgung.
     * 
     * @param {array} objectContainer The array with the calculationListObjects
     * @returns {Object} 
     */
    function calculateAllZinsAndTilgung(objectContainer) {
        var tilgungGesamt = 0;
        var zinsGesamt = 0;
        var darlehen = Number.parseFloat($("#darlehen").val()).toFixed(2);
        /*
         * Iterate over the objectContainer and sum up the tilgung and zins
         */
        objectContainer.forEach(function (el) {
            tilgungGesamt += Number.parseFloat(el.tilgung);
            zinsGesamt += Number.parseFloat(el.zins);
        });

        return {
            tilgungGesamt: tilgungGesamt,
            zinsGesamt: zinsGesamt
        };
    }
    
    function calculateTilgung(calculationInfo, year_t) {

        var tilgung_t = calculationInfo.darlehen *
            ((calculationInfo.q - 1) / (Math.pow(calculationInfo.q, calculationInfo.laufzeit) - 1)) *
            Math.pow(calculationInfo.q, year_t - 1);
        return tilgung_t;
    }

    function createListHeader() {
        $("<tr>")
            .append($("<th>").text("Jahr"))
            .append($("<th>").text("Restschuld"))
            .append($("<th>").text("Zins"))
            .append($("<th>").text("Tilgung"))
            .append($("<th>").text("Annuität"))
            .appendTo($("thead"))
            .appendTo($("#annuitaetenTable"));
    }


    function increaseOrDecreaseInputField(nodeId, valueType, delta) {
        var value = $("#" + nodeId).val();
        if (valueType == "int") {
            value = Number.parseInt(value, 10) + delta;
        } else if (valueType == "float") {
            value = Number.parseFloat(value);
            value = (value + delta).toFixed(2);
        } else {
            return;
        }
        $("#" + nodeId).val(value);
    }

    function setEventHandler() {
        $("#darlehen").focus();

        $("body").keyup(function (event) {
            
            if(event.which == KEYCODE.esc){
                $("#toggleList").focus();
                $("#toggleList").click();
            }
            
            if (event.which == KEYCODE.enter) {
                $('#calculate').click();
            }

            /*
             * set the x, y, z handlers for:
             * x => darlehen (88)
             * y => zinssatz (89)
             * z => laufzeit (90)
             * Only if focus is not on th input fields.
             */
            if (!$(".form-control").is(":focus")) {
                if (event.which == KEYCODE.x) {

                    var delta = (event.shiftKey) ? -10000 : +10000;
                    increaseOrDecreaseInputField("darlehen", "int", delta);
                    $("#calculate").click();
                }
                if (event.which == KEYCODE.y) {
                    var delta = (event.shiftKey) ? -0.1 : 0.1;
                    increaseOrDecreaseInputField("zinssatz", "float", delta);
                    $("#calculate").click();
                }
                if (event.which == KEYCODE.z) {
                    var delta = (event.shiftKey) ? -1 : 1;
                    increaseOrDecreaseInputField("laufzeit", "int", delta);
                    $("#calculate").click();
                }
            }
        });

        $("#calculate").click(function () {
            $("#annuitaetenTable tr").remove();
            $("svg").remove();
            calculateAndDraw();
        });

        $("#empty").click(function () {
            $(".form-control").val("");
            $("#annuitaetenTable tr").remove();
        });

        $("#toggleList").click(function () {
            $("#annuitaetenTable").toggle(0);
            $("#map").toggle(0);
        });
    }
    
    function outputResults(resultObject){
        $("#zinsSum").text("Bank verdient insgesamt: " + resultObject.zinsGesamt.toFixed(2) + "€");
        $("#dcpresultMonth").text("Die monatliche Annuität beträgt: " + resultObject.annuitaetMonatlich.toFixed(2) + "€");
        $(".result").show(500);
    }

    function createGraph(objectContainer) {
        /*
         * Set some dimensions. The width and the height in function of
         */
        var margin = {top: 20, right: 20, bottom: 20, left: 70};
        var width = $(".dcplist").width();
        var height = $(window).height() - 2 * margin.top - 4 * margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);
        var y = d3.scale.linear()
            .range([height, 0]);

        /*
         * Set the domains, here the year and the constant annuitaet.
         */
        x.domain(d3.extent(objectContainer, function (d) {
            return d.jahr;
        }));

        y.domain([0, d3.max(objectContainer, function (d) {
                return d.annuitaet;
            })]);

        /*
         * Create the svg root node.
         */
        var svg = d3.select("#map").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        /*
         * Definition of the areaZins
         */
        var areaZins = d3.svg.area()
            .x(function (d) {
                return x(d.jahr);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.zins);
            });

        /*
         * Definition of the areaTilgung
         */
        var areaTilgung = d3.svg.area()
            .x(function (d) {
                return x(d.jahr);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.tilgung);
            });


        /*
         * Create the axis, x and y
         */

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        /*
         * Create the text anchors
         */
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("€");

        /*
         * Create the two paths, one for Zins and one for Tilgung.
         */
        svg.append("path")
            .attr("class", "areaZins");
        svg.append("path")
            .attr("class", "areaTilgung");

        /*
         * Set the area defined earlier for each path, selected by its class
         */
        for (var k = 0; k < objectContainer.length; k++) {
            svg.select(".areaZins")
                .datum(objectContainer)
                .attr("d", areaZins);
            svg.select(".areaTilgung")
                .datum(objectContainer)
                .attr("d", areaTilgung);
        }

    }

    /*
     * Start The Application with setting the eventHandlers
     */
    setEventHandler();
});