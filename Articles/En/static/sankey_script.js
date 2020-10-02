var margin_sankey = {top: 10, right: 0, bottom: 10, left: 0},
width_sankey = 1200 - margin_sankey.left - margin_sankey.right,
height_sankey = 2800 - margin_sankey.top - margin_sankey.bottom;
var svg = d3.select("#my_dataviz").append("svg")
.attr("width", '100%')
.attr("height", '100%')
.attr('viewBox','0 0 '+Math.min(width_sankey,height_sankey)+' '+2.35*Math.min(width_sankey,height_sankey))
.attr('preserveAspectRatio','xMinYMin')
.append("g")
.attr("transform",
"translate(" +120 + "," + 0+ ")");
var sankey = d3.sankey()
.nodeWidth(10)
.nodePadding(15)
.size([width_sankey-250, height_sankey]);

d3.json("static/data_sankey.json", function(error, graph) {
    sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(0);
    var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links.slice().reverse())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link() )
    .attr("id", function(d,i){
        d.id = i;
        return "link-"+i;
    })
    .style("stroke", function(d) {return d.colour; })
    .style("fill", "none")
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });
    var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on("click",highlight_node_links)
    node
    .append("rect")
    .attr("class", "clickablerect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { return d.colour;})
    .append("title")
    .text(function(d) { return d.name + "\n" + "Il y a " + d.value + " liens à cet élèment."; });
    node
    .append("text")
    .attr("class", "clickabletext")
    .attr("x", 20)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("transform", null)
    .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width_sankey / 2; })
    .attr("x", -100 + sankey.nodeWidth())
    .attr("text-anchor", "start");
    function highlight_node_links(node,i){
        var remainingNodes=[],
        nextNodes=[];
        var stroke_weight = 1;
        if( d3.select(this).attr("data-clicked") == "1" ){
            d3.select(this).attr("data-clicked","0");
            d3.selectAll(".link").style("stroke-width", 1);
            stroke_weight = 1;
        }else{
            d3.select(this).attr("data-clicked","1");
            d3.selectAll(".link").style("stroke-width", 0.1);
            stroke_weight = 2;
        }
        var traverse = [{
            linkType : "sourceLinks",
            nodeType : "target"
        },{
            linkType : "targetLinks",
            nodeType : "source"
        }];
        traverse.forEach(function(step){
            node[step.linkType].forEach(function(link) {
                remainingNodes.push(link[step.nodeType]);
                highlight_link(link.id, stroke_weight);
            });
            while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach(function(node) {
                    node[step.linkType].forEach(function(link) {
                        nextNodes.push(link[step.nodeType]);
                        highlight_link(link.id, stroke_weight);
                    });
                });
                remainingNodes = nextNodes;
            }
        });
    }
    function highlight_link(id,weight){
        d3.select("#link-"+id).style("stroke-width", weight);
    }
});
