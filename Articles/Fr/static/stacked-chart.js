margin_stacked = ({top: 20, right: 20, bottom: 130, left: 20})
height_stacked = 400
width_stacked=500
legendBoxSize_stacked = 20
legendPadding_stacked = 10
legend_stacked = svg => {
    const entry = svg
    .append("g")
    .selectAll(".entry")
    .data(subgroups_stacked)
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



d3.json("static/data_stacked.json", function(error, data) {
    source=data['data']
    subgroups_stacked=['Editeur','SSP','Mixte']
    color=data['color']
    groups_stacked= source.map(d => d["site"])
    data = d3.stack()
    .keys(subgroups_stacked)(source)
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i])) // add an extra array element for the subgroup index
    console.log(data)
    stackedMax_stacked = d3.max(data, y => d3.max(y, d => d[1]))
    console.log(stackedMax_stacked)
    groupedMax_stacked = d3.max(source, row => d3.max(subgroups_stacked.map(col => row[col])))
    console.log(groupedMax_stacked)


    y_stacked = d3.scaleLinear()
    .domain([0, stackedMax_stacked])
    .range([height_stacked - margin_stacked.bottom, margin_stacked.top])
    x_stacked = d3.scaleBand()
    .domain(d3.range(groups_stacked.length))
    .rangeRound([margin_stacked.left, width_stacked - margin_stacked.right])
    .padding(0.15)
    yAxis_stacked = d3.axisLeft(y_stacked).tickPadding(2)
    xAxis_stacked = d3.axisBottom(x_stacked)
    .tickSize(0)
    .tickPadding(8)
    .tickFormat((d, i) => groups_stacked[i])


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
    .attr("x", (d, i) => x_stacked(i))
    .attr("y", height_stacked - margin_stacked.bottom)
    .attr("width", x_stacked.bandwidth())
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
    .style("font-size", "12px")
    .call(xAxis_stacked) .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".25em")
    .attr("transform", "rotate(-65)");

    const yAxis_stackedContainer = svg
    .append("g")
    .attr("transform", "translate(" + (margin_stacked.left) + ",0)");



    svg
    .append("g")
    .attr("transform", `translate(${width_stacked + margin_stacked.left - 140},0)`)
    .call(legend_stacked);

    function transitionGrouped() {
        y_stacked.domain([0, groupedMax_stacked]);
        yAxis_stackedContainer
        .transition()
        .duration(500)
        .delay(500)
        .call(yAxis_stacked);

        rect
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("x", (d, i) => x_stacked(i) + (x_stacked.bandwidth() / subgroups_stacked.length) * d[2])
        .attr("width", x_stacked.bandwidth() / subgroups_stacked.length)
        .transition()
        .attr("y", d => y_stacked(d[1] - d[0]))
        .attr("height", d => y_stacked(0) - y_stacked(d[1] - d[0]));
    }

    function transitionStacked() {
        y_stacked.domain([0, stackedMax_stacked]);
        yAxis_stackedContainer
        .transition()
        .duration(500)
        .call(yAxis_stacked);

        rect
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y_stacked(d[1]))
        .attr("height", d => y_stacked(d[0]) - y_stacked(d[1]))
        .transition()
        .attr("x", (d, i) => x_stacked(i))
        .attr("width", x_stacked.bandwidth());
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
