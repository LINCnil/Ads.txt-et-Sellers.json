var margin_grid = {top: 0, right: 0, bottom: 0, left: 0},
width_grid = 500 - margin_grid.left - margin_grid.right,
height_grid = 500 - margin_grid.top - margin_grid.bottom;
var svg1 = d3.select("#global_contrib_graph")
.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", "0 0 500 500")
.append("g")
.attr("transform",
"translate(" + margin_grid.left + "," + margin_grid.top + ")");
d3.json("static/data_grid.json", function(data) {
    data=data["list"]
    var myGroups = d3.map(data, function(d){return d.x;}).keys()
    var myVars = d3.map(data, function(d){return d.y;}).keys()
    var x = d3.scaleBand()
    .range([ 0, width_grid ])
    .domain(myGroups)
    .padding(0.0);
    svg1.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height_grid + ")")
    .select(".domain").remove()
    var y = d3.scaleBand()
    .range([ height_grid, 0 ])
    .domain(myVars)
    .padding(0.0);
    svg1.append("g")
    .style("font-size", 15)
    .select(".domain").remove()
    var Tooltip = d3.select("#global_contrib_graph")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("padding", "5px")
    var mouseover = function(d) {
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d) {
        if(d.numsite>1){
            Tooltip
            .html("Le site "+d.name+" utilise <br><span style='background-color:"+d.colour+"'>" + d.numsite+ " systèmes publicitaires différents</span>")
            .style("left", (d3.event.pageX+20) + "px")
            .style("top", (d3.event.pageY) + "px")
        }else{
            Tooltip
            .html("Le site "+d.name+" utilise <br><span style='background-color:"+d.colour+"'>" + d.numsite+ " système publicitaire</span>")
            .style("left", (d3.event.pageX+20) + "px")
            .style("top", (d3.event.pageY) + "px")
        }
    }
    var mouseleave = function(d) {
        Tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }
    svg1.selectAll()
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
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})
