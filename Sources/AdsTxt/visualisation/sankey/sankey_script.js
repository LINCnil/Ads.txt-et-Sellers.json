var margin = {top: 10, right: 0, bottom: 10, left: 0},
width_sankey = 1200 - margin.left - margin.right,
height_sankey = 2500 - margin.top - margin.bottom;
var svg = d3.select("#my_dataviz").append("svg")
.attr("width", '100%')
.attr("height", '100%')
.attr('viewBox','0 0 '+Math.min(width_sankey,height_sankey)+' '+2.1*Math.min(width_sankey,height_sankey))
.attr('preserveAspectRatio','xMinYMin')
.append("g")
.attr("transform",
"translate(" +150 + "," + 0+ ")");

var sankey = d3.sankey()
.nodeWidth(10)
.nodePadding(10)
.size([width_sankey-250, height_sankey]);

d3.json("static/data_sankey.json", function(error, graph) {
    sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(0);
    var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link() )
    .style("stroke", function(d) {return d.colour; })
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });
    var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    node
    .append("rect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { return d.colour})
    .style("stroke", function(d) {return d.colour})
    .append("title")
    .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });
    node
    .append("text")
    .attr("x", 20)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("transform", null)
    .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width_sankey / 2; })
    .attr("x", -156 + sankey.nodeWidth())
    .attr("text-anchor", "start");
});
