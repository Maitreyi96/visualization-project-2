(function(){
var width = 650;
var height = 200;
var vis = d3.select("#graph6").append("svg");
var svg = vis
    .attr("width", width+155)
    .attr("height", height+10); // adding some random padding
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "none");

d3.csv("data/africa-data.csv", function(error, data) {


             //setup the svg


         my2013 = [];
            data.forEach(function (d) {
              if (d.year === "2013") {
                my2013.push(d);
              }
            });

           console.log("2013", my2013);

           var column = d3.select("#menu select").property("value");
           var dataset = top20_by_column(my2013, column); // you need to finish this function below.
           console.log("column", dataset);
           redraw(dataset, column);
           //setup our ui -- requires access to data variable, so inside csv
           d3.select("#menu select")
               .on("change", function() {
                   column = d3.select("#menu select").property("value"); //TODO: How do you get the current value of the select menu?
                   dataset = top20_by_column(my2013, column); //TODO: How do you get the current filter/storted data?
                   //console.log(column, dataset);
                   redraw(dataset, column);
           });
       }) // end csv
       //make the bars for the first data set.  They will be red at first.
   function top20_by_column(my2013, column) {

     return my2013.sort(function(a, b) {
         return b[column] - a[column]; // descending order, biggest at the top
       }).slice(0, 10); // cut off the top 10!// TODO: fill in this function.  The answer direction is in the wiki page for week8.
       // You want to sort the data by the column, descending order, and then slice.
       }
   // This function is used to draw and update the data. It takes different data each time.
   function redraw(my2013, column) {
       var max = d3.max(my2013, function(d) {return +d[column];});
       xScale = d3.scale.linear()
           .domain([0, max])
           .range([0, width]);
       yScale = d3.scale.ordinal()
           .domain(d3.range(my2013.length))
           .rangeBands([0, height], .3);
       var bars = vis.selectAll("rect.bar")
           .data(my2013, function (d) { return d.country; });//TODO: what is your key value?}); // key function!
       //update -- existing bars get blue when we "redraw". We don't change labels.
       /*bars
            .attr("fill", "rgba(222,102,0,1)");*/
       //enter - new bars get set to darkorange when we "redraw."
       bars.enter()
           .append("rect")
           .attr("class", "bar")
           .attr("fill", "#BFBFBF");
       //exit -- remove ones that aren't in the index set
       bars.exit()
           .transition()
           .duration(300)
           .ease("exp")
           .attr("width", 0)
           .remove();
           //TODO: what goes here at the end of exit?
       // transition -- move the bars to proper widths and location
       bars
           .transition()
           .duration(300)
           .ease("quad")
           .attr("width", function(d) {
               return xScale(+d[column]);//TODO: what goes here?);
           })
           .attr("height", yScale.rangeBand())//TODO: In an ordinal scale bar chart, what goes here?)
           .attr("transform", function(d,i) {
               return "translate(" + [0, yScale(i)] + ")"
           });
       //  We are attaching the labels separately, not in a group with the bars...
       var labels = svg.selectAll("text.labels")
           .data(my2013, function (d) { return d.country });//TODO: what is your key here? same as above.}); // key function!
       // everything gets a class and a text field.  But we assign attributes in the transition.
       labels.enter()
           .append("text")
           .attr("class", "labels");
       labels.exit()
           .remove();
       labels.transition()
           .duration(1000) //TODO: How long do you want this to last?)
           .text(function(d) {
               return d.country + ": " +d[column]; //TODO: what goes here?);
           })
           .attr("transform", function(d,i) {
                   return "translate(" + xScale(+d[column]) + "," + yScale(i) + ")"
           })
           .attr("dy", "1em")
           .attr("dx", "6px")
           .attr("text-anchor", "start");
       } // end of draw function
})();
