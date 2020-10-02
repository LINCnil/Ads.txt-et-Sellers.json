var margin = {top: 20, right: 20, bottom: 100, left: 40},
width = 400 - margin.left - margin.right,
height = 300 - margin.top - margin.bottom;


var x = d3.scaleBand()
.range([0, width])
.round([.1, 1]);

var y = d3.scaleLinear()
.range([height, 0]);

var xAxis = d3.axisBottom()
.scale(x);

var yAxis = d3.axisLeft()
.scale(y);

var svg2 = d3.select("#sortable_graph").append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", "0 0 400 300")
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("static/data_sortable.json", function(error, data) {
    console.log(data)
    data["list"].forEach(function(d) {
        d.numsite = +d.numsite;
    });

    x.domain(data["list"].map(function(d) { return d.name; }));
    y.domain([0, d3.max(data["list"], function(d) { return d.numsite; })]);

    svg2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".25em")
    .attr("transform", "rotate(-65)");

    svg2.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-180)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of tracers");

    svg2.selectAll(".bar")
    .data(data["list"])
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.name); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.numsite); })
    .attr("height", function(d) { return height - y(d.numsite); })
    .style("fill", function(d) { return d.colour});

    d3.select("input").on("change", change);

    var sortTimeout = setTimeout(function() {
        d3.select("input").each(change);
    }, 1000);

    function change() {
        clearTimeout(sortTimeout);
        var x0 = x.domain(data["list"].sort(this.checked
            ? function(a, b) { return b.numsite - a.numsite; }
            : function(a, b) { return d3.ascending(a.rank, b.rank); })
            .map(function(d) { return d.name; }))
            .copy();

            svg2.selectAll(".bar")
            .sort(function(a, b) { return x0(a.rank) - x0(b.rank); });

            var transition = svg2.transition().duration(750),
            delay = function(d, i) { return i * 50; };

            transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.name); });

            transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);
        }
    });
