(function(){

var margin = {
    top: 0,
    right: 10,
    bottom: 30,
    left: 70
};

var width = 450;
var height = 350;



var dateFormat = d3.time.format("%Y");


var xScale = d3.time.scale()
    .range([margin.left, width - margin.right - margin.left]);

var yScale = d3.scale.linear()
    .range([margin.top, height - margin.bottom]);


var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(6)
    .tickFormat(function (d) {
        return dateFormat(d);
    })
    .innerTickSize([6]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5)
    .innerTickSize([5]);


var line = d3.svg.line()
    .x(function (d) {
        return xScale(dateFormat.parse(d.year));
    })
    .y(function (d) {
        return yScale(+d.rate);
    });




var svg = d3.select("#graph2")
    .append("svg")
    .attr("width", width)
    .attr("height", height);



d3.csv("data/infantmort.csv", function (data) {


    var years = d3.keys(data[0]).slice(0, 16); 
    console.log(years);


    var dataset = [];

    
    data.forEach(function (d, i) {

        var infantMort = [];

        years.forEach(function (y) { 


            if (d[y]) { 
                infantMort.push({ 
                    year: y,
                    rate: d[y], 
                    Country: d.Country
                });
            }

        });

        dataset.push({ 
            country: d.country,
            rates: infantMort  
        });

    });

    
    console.log("dataset", dataset);


    
    xScale.domain(
        d3.extent(years, function (d) {
            return dateFormat.parse(d);
        }));

    
    yScale.domain([
    	d3.max(dataset, function (d) {
            return d3.max(d.rates, function (d) {
                return +d.rate;
            });
        }),
        0
    ]);


    
    var groups = svg.selectAll("g.lines")
        .data(dataset, function(d) {return d.country;}); 

    groups
        .enter()
        .append("g")
        .attr("class", "lines_graph2")
        .attr("id", function (d) {
            return d.country.replace(/\s/g, '_');
        });

    groups.exit().transition().duration(1000).attr("opacity", 0).remove();

    
    var lines = groups.selectAll("path")
        .data(function (d) { 
            return [d.rates]; 
        });

    lines
        .enter()
        .append("path")
        .attr("class", "line_graph2")
        .attr("d", line)
        .classed("normal", true)
        .classed("focused", false); 


    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
          .selectAll("text")
          .attr("y", 10);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis)
            .selectAll("text")
            .attr("x", -10)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top)
        .attr("y", -2*margin.left / 3)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .attr("class", "label")
        .text("Under 5 Mortality Rate");





});

})();
