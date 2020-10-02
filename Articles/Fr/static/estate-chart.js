margin_stacked = ({top: 10, right: 20, bottom: 130, left: 25})
height_stacked = 400
width_stacked=500
legendBoxSize = 12
legendPadding = 5
legend = svg => {
    const entry = svg
    .append("g")
    .selectAll(".entry")
    .data(subgroups)
    .enter().append("g")
    .attr(
        "transform",
        (d, i) => `translate(0,${(legendBoxSize + legendPadding) * i})`
    )
    .attr("class", "entry");

    entry
    .append("rect")
    .attr("width", legendBoxSize)
    .attr("height", legendBoxSize)
    .attr("stroke","white")
    .attr("fill", (d, i) => color[i]);

    entry
    .append("text")
    .text(d => d)
    .attr("x", legendBoxSize + legendPadding)
    .attr("y", legendBoxSize / 2)
    .attr("dy", "0.35em")
    .style("font", "13px sans-serif");
}

function postprocessdata(data,max_site,max_interm){
    data['color']=data['color'].slice(0,max_interm)
    data['subgroups']=data['subgroups'].slice(0,max_interm)
    data['data']=data['data'].slice(0,max_site)
    data['data']=data['data'].slice(0,max_site)

    var truncate = function(element,index,array){
        result={}
        result['site']=element['site']
        for  (var i = 0; i < max_interm; i++){
            result[(i)]=element[(i)]
        }
        return result
    };
    data['data']=data['data'].map(truncate)
    return data

}

d3.json("static/estate_data.json", function(error, data) {
    postprocessdata(data,20,4)
    source=data['data']
    subgroups=data['subgroups']
    color=data['color']
    groups= source.map(d => d["site"])
    data = d3.stack()
    .keys(subgroups)(source)
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i])) // add an extra array element for the subgroup index
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
    var svg = d3.select("#estate-chart").append("svg")
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
    .style("font-size", "12px")
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
    .attr("transform", `translate(${width_stacked + margin_stacked.left - 100},0)`)
    .call(legend);

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
    d3.select("#estate-chart-checkbox").on("change", change);
    function change() {
        if(!this.checked){
            update('grouped')
        }else{
            update('stacked')
        }
    }

    update('grouped')
});
