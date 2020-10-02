d3.json("data_website.json", function(error, data) {
    var NameProvider =data['names']
    var matrix = data['matrix']
    var colors = data['color'];
    var fill = d3.scaleOrdinal()
    .domain(d3.range(NameProvider.length))
    .range(colors);
    var margin = {top: 30, right: 25, bottom: 20, left: 0},
    width = 650 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .29,
    outerRadius = innerRadius * 1.02;

    /*Initiate the SVG*/
    var svg = d3.select("#chorded-chart").append("svg:svg")
    .attr("viewBox", [0, 0, width, height])
    .append("svg:g")
    .attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");

    var chord = d3.chord()
    .padAngle(.1)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
    (matrix);

    var chords=    svg
    .datum(chord)
    .append("g")
    .selectAll("path")
    .data(function(d) { return d; })
    .enter()
    .append("path")
    .attr("d", d3.ribbon()
    .radius(160))
    .attr("class", "chord")
    .attr("source", function(d){ return( '#value' + d.source.index)})
    .attr("other", function(d){return( '#blop' + d.target.value)})
    .attr("target", function(d){ return( '#value' + d.target.index)})
    .attr('opacity', 0.6)
    .style("fill", function(d){ return(colors[d.source.index]) })
    .on("mouseover",highlight_node_links)
    .on("mouseout", unhiglight_all);

    var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

    var g = svg.selectAll("g.group")
    .data(chord.groups)
    .enter().append("svg:g")
    .attr("class", function(d) {return "group " + NameProvider[d.index];});

    g.append("svg:path")
    .attr("class", "arc")
    .style("stroke", function(d) { return fill(d.index); })
    .style("fill", function(d) { return fill(d.index); })
    .attr("included-group", function(d){ return([d.index])})
    .attr("d", arc)
    .style("opacity", 1);

    g.append("svg:text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".15em")
    .attr("class", "titles")
    .style("font-size", '14px')
    .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + (innerRadius + 20) + ")"
        + (d.angle > Math.PI ? "rotate(180)" : "");
    })
    .attr('opacity', 1)
    .attr("included-group", function(d){ return([d.index])})
    .text(function(d,i) { return NameProvider[i]; });

    function highlight_node_links(node,i){
        selected=d3.select(this).attr("source")
        d3.selectAll('.chord').transition().duration(200).style("opacity", 0.05);
        d3.selectAll('[source="'+selected+'"]').transition().duration(200).style("opacity", 1);
        d3.selectAll('[target="'+selected+'"][other="#blop1.5"]').transition().duration(200).style("opacity", 1);

    }
    function unhiglight_all(node,i){
        selected=d3.select(this).attr("source")
        d3.selectAll('.chord').transition().duration(200).style("opacity", 0.7);
        d3.selectAll('[target="'+selected+'"][other="#blop1.5"]').transition().duration(200).style("opacity", 0.7);
    }
});
