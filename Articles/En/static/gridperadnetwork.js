var margin = {top: 10, right: 10, bottom: 10, left: 10},
width_gridnetwork = 100 - margin.left - margin.right,
height_gridnetwork = 100 - margin.top - margin.bottom;
var Tooltip = d3.select("#gridperadnetwork_comment")
.append("div")
.style("opacity", 0)
defaultcolor={}
defaultStat={}
function fillcube(network,data){
    defaultcolor[network]=data[network]["color"]
    defaultStat[network]=data[network]["percent"]
    var svg = d3.select("#gridperadnetwork")
    .append("svg")
    .attr("class", "blocad"+network.replace(/[^a-zA-Z0-9]/g,''))
    .attr("width", width_gridnetwork + margin.left + margin.right)
    .attr("height", height_gridnetwork + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")
    data=data[network]["value"]
    var myGroups = d3.map(data, function(d){return d.x;}).keys()
    var myVars = d3.map(data, function(d){return d.y;}).keys()
    var x = d3.scaleBand()
    .range([ 0, width_gridnetwork ])
    .domain(myGroups)
    .padding(0.0);
    svg.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height_gridnetwork + ")")
    .select(".domain").remove()
    var y = d3.scaleBand()
    .range([ height_gridnetwork, 0 ])
    .domain(myVars)
    .padding(0.0);
    svg.append("g")
    .style("font-size", 15)
    .select(".domain").remove()
    var mouseover = function(d) {
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("opacity", 1)
    }
    var mousemove = function(d) {
        Tooltip
        .html("<br><br> <span style='background-color:"+defaultcolor[network]+"'> "+ network+" is present on "+defaultStat[network]+"% of the 400 most popular websites with an Ads.txt file")
    }
    var mouseleave = function(d) {
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("opacity", 1)
    }
    svg.selectAll()
    .data(data, function(d) {return d.x+':'+d.y;})
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.x) })
    .attr("y", function(d) { return y(d.y) })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return d.colour} )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 1)
    d3.selectAll(".blocad"+network.replace(/[^a-zA-Z0-9]/g,''))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    svg.append("text")
    .attr("x", (width_gridnetwork / 2))
    .attr("y", height_gridnetwork + (margin.bottom))
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("text-decoration", "none")
    .text(network);
}
fetch("static/data_gridperadnetwork.json")
.then(response => response.json())
.then(json =>creategraph(json));
function creategraph(obj){
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            fillcube(key,obj)
        }
    }
}
