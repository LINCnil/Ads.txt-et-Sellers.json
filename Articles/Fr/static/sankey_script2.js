function display_graph(path){
    d3.select("#my_dataviz").selectAll("*").remove()
    var height=900
    var width=1200
    var padding=8
    var nodewidth=30
    sankey = d3.sankey()
    .nodeAlign(d3.sankeyLeft)
    .nodeWidth(nodewidth)
    .nodePadding(padding)
    .extent([[20, 10], [width-100, height - 10]])
    d3.json(path, function(error, graph) {
        const svg = d3.select("#my_dataviz").append("svg")
        .attr("viewBox", [0, 0, width, height]);
        const {nodes, links} = sankey(graph);
        svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("id", function(d,i){
            d.id = i;
            return "link-"+i;
        })
        .attr("stroke", function(d) { return d.colour; })
        .attr("stroke-width", function(d) { return 2; });
        svg.append("g")
        .attr("fill", "grey")
        .attr("stroke", "white")
        .selectAll("rect")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("class", "rect")
        .attr("id", function(d,i){
            d.id = i;
            return "rect-"+i;
        })
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("fill", function(d) { return d.colour; })
        .attr("height", d => Math.max(10,d.y1 - d.y0))
        .attr("width", d => d.x1 - d.x0)
        .on("click",highlight_node_links)
        svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 15)
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "domain")
        .attr("id", function(d,i){
            d.id = i;
            return "domain-"+i;
        })
        .attr("x", d => d.x1 + 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor",  "start")
        .text(d => d.name);
        function highlight_node_links(node,i){
            var remainingNodes=[],
            nextNodes=[];
            var stroke_weight = 0.5;
            var node_weight = 1;
            if( d3.select(this).attr("data-clicked") == "1" ){
                d3.select(this).attr("data-clicked","0");
                d3.selectAll(".link").style("stroke-opacity", 0.5);
                d3.selectAll(".domain").style("opacity", 1);
                d3.selectAll(".rect").style("opacity", 1);
                var node_weight = 1;
                stroke_weight = 0.5;
            }else{
                d3.select(this).attr("data-clicked","1");
                d3.selectAll(".link").style("stroke-opacity", 0.1);
                d3.selectAll(".domain").style("opacity", 0);
                d3.selectAll(".rect").style("opacity", 0.1);
                var node_weight = 1;
                stroke_weight = 1;
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
                    highlight_node(link.source.index, node_weight);
                    highlight_node(link.target.index, node_weight);
                    highlight_rect(link.source.index, node_weight);
                    highlight_rect(link.target.index, node_weight);
                    highlight_link(link.id, stroke_weight);
                });
                while (remainingNodes.length) {
                    nextNodes = [];
                    remainingNodes.forEach(function(node) {
                        node[step.linkType].forEach(function(link) {
                            nextNodes.push(link[step.nodeType]);
                            highlight_node(link.source.index, node_weight);
                            highlight_node(link.target.index, node_weight);
                            highlight_rect(link.source.index, node_weight);
                            highlight_rect(link.target.index, node_weight);
                            highlight_link(link.id, stroke_weight);
                        });
                    });
                    remainingNodes = nextNodes;
                }
            });
        }
        function highlight_link(id,weight){
            d3.select("#link-"+id).style("stroke-opacity", weight);
        }
        function highlight_node(id,weight){
            d3.select("#domain-"+id).style("opacity", weight);
        }
        function highlight_rect(id,weight){
            d3.select("#rect-"+id).style("opacity", weight);
        }
    });
}
display_graph("")
var request = new XMLHttpRequest();
request.open('GET', 'static/top_alexa50fr_pruned.json', true);
request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        for (let [key, value] of Object.entries(data)) {
            var d1 = document.getElementById('website_choice');
            d1.insertAdjacentHTML('beforeend', '<option value="'+value+'">'+value+'</option>');
        }
    } else {
        console.log("error loading")
    }
};

request.onerror = function() {
    console.log("error of request")
};
request.send();
document.getElementById('sub').addEventListener('click', function () {
    value=document.getElementById('website_choice').value; //WORKS
    display_graph("static/sankey_data/"+value+".json")
});
