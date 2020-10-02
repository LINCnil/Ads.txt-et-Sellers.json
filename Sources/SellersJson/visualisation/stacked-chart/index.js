margin_stacked = ({top: 20, right: 20, bottom: 100, left: 20})
height_stacked = 300
width_stacked=500
legendBoxSize_stacked = 20
legendPadding_stacked = 10
legend_stacked = svg => {
    const entry = svg
    .append("g")
    .selectAll(".entry")
    .data(subgroups)
    .enter().append("g")
    .attr(
        "transform",
        (d, i) => `translate(0,${(legendBoxSize_stacked + legendPadding_stacked) * i})`
    )
    .attr("class", "entry");

    entry
    .append("rect")
    .attr("width", legendBoxSize_stacked)
    .attr("height", legendBoxSize_stacked)
    .attr("stroke","white")
    .attr("fill", (d, i) => color[i]);

    entry
    .append("text")
    .text(d => d)
    .attr("x", legendBoxSize_stacked + legendPadding_stacked)
    .attr("y", legendBoxSize_stacked / 2)
    .attr("dy", "0.35em")
    .style("font", "13px sans-serif");
}



d3.json("data_stacked.json", function(error, data) {
    source=data['data']
    subgroups=['Editeur','SSP','Mixte']
    color=data['color']
    groups= source.map(d => d["site"])
    data = d3.stack()
    .keys(subgroups)(source)
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]))
    stackedMax = d3.max(data, y => d3.max(y, d => d[1]))
    groupedMax = d3.max(source, row => d3.max(subgroups.map(col => row[col])))
    y = d3.scaleLinear()
    .domain([0, stackedMax])
    .range([height_stacked - margin_stacked.bottom, margin_stacked.top])
    x = d3.scaleBand()
    .domain(d3.range(groups.length))
    .rangeRound([margin_stacked.left, width_stacked - margin_stacked.right])
    .padding(0.15)
    yAxis = d3.axisLeft(y).tickPadding(2)
    xAxis = d3.axisBottom(x)
    .tickSize(0)
    .tickPadding(8)
    .tickFormat((d, i) => groups[i])
    var svg = d3.select("#stacked-chart").append("svg")
    .attr("viewBox", [0, 0, width_stacked, height_stacked])
    .append("g")
    .attr("transform", "translate(" + (margin_stacked.left) + "," + (margin_stacked.top ) + ")");
    const subgroup = svg
    .selectAll(".subgroup")
    .data(data)
    .enter().append("g")
    .attr("class", "subgroup")
    .attr("fill", (d, i) => color[i]);
    const rect = subgroup
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", height_stacked - margin_stacked.bottom)
    .attr("width", x.bandwidth())
    .attr("height", 0);
    subgroup.on("mouseenter", function() {
        svg
        .selectAll(".subgroup")
        .transition()
        .style("fill-opacity", 0.15);
        d3.select(this)
        .transition()
        .style("fill-opacity", 1);
    });
    subgroup.on("mouseleave", function() {
        svg
        .selectAll(".subgroup")
        .transition()
        .style("fill-opacity", 1);
    });
    svg
    .append("g")
    .attr("transform", `translate(0,${height_stacked - margin_stacked.bottom})`)
    .style("font-size", "10px")
    .call(xAxis) .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".25em")
    .attr("transform", "rotate(-65)");
    const yAxisContainer = svg
    .append("g")
    .attr("transform", "translate(" + (margin_stacked.left) + ",0)");
    svg
    .append("g")
    .attr("transform", `translate(${width_stacked + margin_stacked.left - 175},0)`)
    .call(legend_stacked);
    function transitionGrouped() {
        y.domain([0, groupedMax]);
        yAxisContainer
        .transition()
        .duration(500)
        .delay(500)
        .call(yAxis);
        rect
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("x", (d, i) => x(i) + (x.bandwidth() / subgroups.length) * d[2])
        .attr("width", x.bandwidth() / subgroups.length)
        .transition()
        .attr("y", d => y(d[1] - d[0]))
        .attr("height", d => y(0) - y(d[1] - d[0]));
    }
    function transitionStacked() {
        y.domain([0, stackedMax]);
        yAxisContainer
        .transition()
        .duration(500)
        .call(yAxis);
        rect
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth());
    }
    function update(layout) {
        if (layout === "stacked") transitionStacked();
        else transitionGrouped();
    }
    d3.select("#stacked-chart-checkbox").on("change", change);
    function change() {
        if(!this.checked){
            update('grouped')
        }else{
            update('stacked')
        }
    }
    update('grouped')

});
