(function(){


  var margin = {top: 15, right: 20, bottom: 40, left: 40};
  var width = 300 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;

  /*var margin = {top: 15, right: 20, bottom: 40, left: 40};
  var width = 150 - margin.left - margin.right;
  var height = 150 - margin.top - margin.bottom;*/

  var data = [];
  var circle = null;
  var caption = null;
  var curYear = null;
  var button = d3.select("#graph1").selectAll("button");


  var bisect = d3.bisector(function(d) {
    return d.date;
  }).left;

  var format = d3.time.format("%Y");
  var xScale = d3.time.scale().range([0, width]).clamp(true);
  var yScale = d3.scale.linear().range([height, 0]).clamp(true);
  var xValue = function(d) {
    return d.date;
  };

 var yValue = function(d) {
   return d.count;
 };

 var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(3)
    .outerTickSize(0)
    .innerTickSize(0);

  var area = d3.svg.area().x(function(d) {
    return xScale(xValue(d));
  }).y0(height).y1(function(d) {
    return yScale(yValue(d));
  });
  var line = d3.svg.line().x(function(d) {
    return xScale(xValue(d));
  }).y(function(d) {
    return yScale(yValue(d));
  });

  function setupScales(data)  {
    var extentX, maxY;
    maxY = d3.max(data, function(c) {
      return d3.max(c.values, function(d) {
        return yValue(d);
      });
    });

    maxY = maxY + (maxY * 1 / 4);
    yScale.domain([0, maxY]);
    extentX = d3.extent(data[0].values, function(d) {
      return xValue(d);
    });
    return xScale.domain(extentX);
  }

function setupIsotope() {
 $("#graph1").isotope({
   itemSelector: '.chart',
   layaoutMode: 'fitRows',
   getSortData: {
     count: function(e) {
       var d, sum;
       d = d3.select(e).datum();
       sum = d3.sum(d.values, function(d) {
         return d.count;
       });
       return sum * -1;
     },
     count2: function(e) {
       var d, sum;
       d = d3.select(e).datum();
       sum = d3.sum(d.values, function(d) {
         return d.count;
       });
       return sum * -1;
     }
   }
 });
}

function transformData(rawData, illness) {
    var format, nest;
    format = d3.time.format("%Y");
    rawData.forEach(function(d) {
        d.date = format.parse(d.year);
        d.count = +d[illness];
    });
    nest = d3.nest().key(function(d) {
         return d.country;
       }).sortValues(function(a, b) {
         return d3.ascending(a.date, b.date);
       }).entries(rawData);
       nest = nest.filter(function(d) {
         return d.values.length == 14;
       });
    return nest;
}

d3.csv("data/africa-data.csv", function(error, rawData) {
  if (error) {
    console.log(error);
  };

  console.log("count", rawData);


  draw_mults(rawData, "diarrhoeal_diseases");
  /*setupIsotope();*/
  $("#graph1").isotope({
    sortBy: 'count'
  });

  d3.select("#respiratory").on("click", function() {

     /* draw_mults(rawData, "respiratory_infections");
      $("#graph1").isotope({
        sortBy: 'count'
     });*/

     button
     			var thisButton = d3.select(this);
     					d3.selectAll("button").classed("selected", false);
     					thisButton.classed("selected", true);

    });

  d3.select("#diarrhoea").on("click", function() {

      draw_mults(rawData, "diarrhoeal_diseases");
      //$("#graph1").isotope({
     //   sortBy: 'count'
      //});
    button
      	var thisButton = d3.select(this);
      		  d3.selectAll("button").classed("selected", false);
      			thisButton.classed("selected", true);


  }); // end onclick



});

function draw_mults(rawData, illness) {

  d3.selectAll(".chart").remove();

  // d3.select("#graph1").selectAll("path.area").remove();
  // d3.select("#graph1").selectAll("path.line_small").remove();
  // d3.select("#graph1").selectAll(".yaxis").remove();

  var data = transformData(rawData, illness);

  var length = data[0].values.length;
  data.sort(function(a,b) { return b.values[length-1].count - a.values[length-1].count;});
  data = data.slice(0,10);

  d3.select("#graph1").datum(data).each(function(myData) {
    data = myData;
    setupScales(data);
    var div = d3.select(this).selectAll(".chart").data(data);
    div.enter()
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .append("g");
    var svg = div.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    var g = svg.select("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      g.append("rect")
        .attr("class", "background")
        .style("pointer-events", "all")
        .attr("width", width + margin.right)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);
    var lines = g.append("g");
    lines.append("path")
        .attr("class", "area")
        .style("pointer-events", "none")
        .attr("d", function(c) {
          return area(c.values);
        });
    lines.append("path")
        .attr("class", "line_small")
        .style("pointer-events", "none")
        .attr("d", function(c) {
          return line(c.values);
        });
    lines.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 10)
        .attr("x", width / 2).text(function(c) {
          return c.key;
        });
      lines.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "start")
        .style("pointer-events", "none")
        .attr("dy", 13).attr("y", height)
        .attr("x", 0).text(function(c) {
          return xValue(c.values[1]).getFullYear();
        });
      lines.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "end")
        .style("pointer-events", "none").attr("dy", 13)
        .attr("y", height).attr("x", width).text(function(c) {
          return xValue(c.values[c.values.length - 1]).getFullYear();
        });
      circle = lines.append("circle")
        .attr("r", 2.5)
        .attr("opacity", 0)
        .attr("fill", "rgb(153, 211, 212)")
        .style("pointer-events", "none");
      caption = lines.append("text")
        .attr("class", "caption")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("fill", "rgb(153, 211, 212)")
        .attr("dy", -10);
      curYear = lines.append("text")
        .attr("class", "caption")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", 13)
        .attr("y", height);
      g.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
        .selectAll("text")
          .attr("dy", ".1em")
          .attr("x", -11)
          .style("text-anchor", "end");


    function mouseover() {
     circle.attr("opacity", 1.0);
     d3.selectAll(".static_year").classed("hidden", true);
     return mousemove.call(this);
   };

   function mousemove() {
     var date, index, year;
     year = xScale.invert(d3.mouse(this)[0]).getFullYear();
     date = format.parse('' + year);
     index = 0;
     //circle.attr("cx", xScale(date)).attr("cy", function(c) {
     //index = bisect(c.values, date, 0, c.values.length - 0);
     // return yScale(yValue(c.values[index]));
     //});
    // caption.attr("x", xScale(date)).attr("y", function(c) {
      // return yScale(yValue(c.values[index]));
     //}).text(function(c) {
      // return yValue(c.values[index]);
    // });
     return curYear.attr("x", xScale(date)).text(year);
   };

   function mouseout() {
     d3.selectAll(".static_year").classed("hidden", false);
     circle.attr("opacity", 0);
     caption.text("");
     return curYear.text("");
   };

d3.select("button#diarrhoea").classed("selected", true);
   });
} // end draw mults



})();
