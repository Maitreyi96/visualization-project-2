(function(){
var width = 650;
var height = 200;
var vis = d3.select("#graph6").append("svg");
var svg = vis
    .attr("width", width+155)
    .attr("height", height+10); 
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "none");

d3.csv("data/africa-data.csv", function(error, data) {


             


         my2013 = [];
            data.forEach(function (d) {
              if (d.year === "2013") {
                my2013.push(d);
              }
            });

           console.log("2013", my2013);

           var column = d3.select("#menu select").property("value");
           var dataset = top20_by_column(my2013, column); 
           console.log("column", dataset);
           redraw(dataset, column);
           d3.select("#menu select")
               .on("change", function() {
                   column = d3.select("#menu select").property("value");
                   dataset = top20_by_column(my2013, column); 
                   redraw(dataset, column);
           });
       }) 
       
   function top20_by_column(my2013, column) {

     return my2013.sort(function(a, b) {
         return b[column] - a[column]; 
       }).slice(0, 10); 
       }
  
   function redraw(my2013, column) {
       var max = d3.max(my2013, function(d) {return +d[column];});
       xScale = d3.scale.linear()
           .domain([0, max])
           .range([0, width]);
       yScale = d3.scale.ordinal()
           .domain(d3.range(my2013.length))
           .rangeBands([0, height], .3);
       var bars = vis.selectAll("rect.bar")
           .data(my2013, function (d) { return d.country; });
       bars.enter()
           .append("rect")
           .attr("class", "bar")
           .attr("fill", "#BFBFBF");
       
       bars.exit()
           .transition()
           .duration(300)
           .ease("exp")
           .attr("width", 0)
           .remove();
           
       bars
           .transition()
           .duration(300)
           .ease("quad")
           .attr("width", function(d) {
               return xScale(+d[column]);
           })
           .attr("height", yScale.rangeBand())
           .attr("transform", function(d,i) {
               return "translate(" + [0, yScale(i)] + ")"
           });
       
       var labels = svg.selectAll("text.labels")
           .data(my2013, function (d) { return d.country });
       labels.enter()
           .append("text")
           .attr("class", "labels");
       labels.exit()
           .remove();
       labels.transition()
           .duration(1000) 
           .text(function(d) {
               return d.country + ": " +d[column]; 
           })
           .attr("transform", function(d,i) {
                   return "translate(" + xScale(+d[column]) + "," + yScale(i) + ")"
           })
           .attr("dy", "1em")
           .attr("dx", "6px")
           .attr("text-anchor", "start");
       }
})();
