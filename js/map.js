(function(){
var illness = "total"; // illness to map / plot
var country = "TZA";  // starter country

// Map global variables
var map_margin = {top: 20, right: 130, bottom: 40, left: 70};

var map_width = 600 - map_margin.left - map_margin.right;
var map_height = 450 - map_margin.top - map_margin.bottom;


var map = d3.select('#graph3').append('svg')
	    .attr('width', map_width)
	    .attr('height', map_height);

/*map.append("svg:image")
    .attr("xlink:href", "progress-anim.gif")
    .attr("id", "progress-image")
    .attr("width", 43)
    .attr("height", 11)
    .attr("x", map_width / 2)
    .attr("y", map_height / 2);*/

var projection = d3.geo.mercator()
    .scale(260) // mess with this if you want
    .translate([map_width / 2.4, map_height / 2.1]);

var mapPath = d3.geo.path()
    .projection(projection);

var mapColorScale = d3.scale.linear().range(["#d7e8e8", "#83bebf"]).interpolate(d3.interpolateLab);

var countryById = d3.map();

// Line Chart globals

var width = 500;
var height = 380;
var margin = {top: 20, right: 60, bottom: 40, left: 70};

//Set up date formatting and years
var dateFormat = d3.time.format("Year %Y");
var outputFormat = d3.time.format("%Y");


// My shortcut for the scale is to list the first and last only - will set the extents.
// Also, I set the earlier year to 1999 to get a little spacing on the X axis.
var years = ["Year 1999", "Year 2015"];

//Set up scales - I already know the start and end years, not using data for it.
var xScale = d3.time.scale()
					.range([ margin.left, width - margin.right - margin.left ])
					.domain(
						d3.extent(years, function(d) {
						return dateFormat.parse(d);
						}));

// don't know the yScale domain yet. Will set it with the data.
var yScale = d3.scale.linear()
					.range([ margin.top, height - margin.bottom ]);

//Configure axis generators
var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(12)
				.tickFormat(function(d) {
					return outputFormat(d);
				});

var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.ticks(8);


//Configure line generator
// each line dataset must have an x and y for this to work.
var line = d3.svg.line()
	/*.interpolate("cardinal")*/
	.x(function(d) {
		return xScale(d.year);
	})
	.y(function(d) {
		return yScale(+d[illness]);
	});

//Create the empty SVG image
var linechart = d3.select("#vis")
			.append("svg")
			.attr("width", width)
			.attr("height", height);


	// we use queue because we have 2 data files to load.
queue()
  .defer(d3.json, "data/africa.topojson")
  .defer(d3.csv, "data/totalinfant.csv", typeAndSet) // process
  .await(loaded);  // call loaded after loading, to render the charts with data

function typeAndSet(d) {
    d.total = +d.total;
    countryById.set(d.ISO3, d);
		d.originalyear = d.year;   // lookup key is d.ISO3, value returned is all of row d
    d.year = dateFormat.parse(d.year);
    return d;
}

var data2015 = [];

function loaded(error, africa, data) {

		if (error) {
			console.log("error loading files", error);
		}

		data2015 = data.filter(function(d) { return d.originalyear === "Year 2015";});

						// Notice what happens if you don't sort by year :)
		var dataset =  d3.nest()
				.key(function(d) {
					return d.ISO3;
				})
				.sortValues(function (a, b) { return a.year - b.year;})
				.entries(data);

		if (africa) {
			draw_map(africa, dataset);
		}

		if (data) {
			draw_lines(country, dataset); // draws the initial country line.
		}


	// set up the first country shown using global country variable:
	d3.select("path.countries#" + country).style("stroke", "gray");
	d3.select("path.country#" + country).moveToFront();
	d3.select(".subhead").html("Rate from 2000 to 2015 for " + "<span>" + countryById.get(country).country + "</span>");

	/*map.select("#progress-image").remove();*/ // remove animation for loading
}


function draw_map(africa, data) {

  // they are nested, so the scale has to get into the values of the objects
  mapColorScale.domain([0,
  	d3.max(data2015, function(d) {
  				return d.total;
  		})
  	]);


  var countries = topojson.feature(africa, africa.objects.collection).features;

  map.selectAll("path.countries")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "countries")
      .attr("id", function(d) {return d.properties.adm0_a3;})
      .attr("d", mapPath)
      .attr("fill", function(d,i) {
          return getColor(d);
      })
      .on("click", showCountryLine);

  // The d3-legend component is called here:

	var linear = mapColorScale;

  map.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(5,5)");

  var legendLinear = d3.legend.color()
    .shapeWidth(20)
    .labelFormat(d3.format("f"))
    .orient("vertical")
    .scale(linear);

  map.select(".legendLinear")
    .call(legendLinear);

  // inside so we can use data from the parent function
  function showCountryLine(d) {
  	var id = d.properties.adm0_a3;
  	var linedata = get_values_for_country(id, data);
  	update_lines(id, linedata);
  	d3.selectAll("path.countries").style("stroke", "white");
  	d3.select(this).style("stroke", "gray");
		d3.select(this).moveToFront();
  }

	var tooltip_map = d3.select("body")
	.append("div")
	.attr("class", "tooltip_map");

	map.selectAll("path.countries")
	    	.on("mouseover", mouseoverFunc)
	        .on("mousemove", mousemoveFunc)
	        .on("mouseout", mouseoutFunc);


		function mouseoverFunc(d){
			//console.log("moused over",getText(d));
			tooltip_map
				.style("display",null)
				.html("<p>" + getText(d) + "</p>");
		}

		function mousemoveFunc(d) {
	        tooltip_map
	            .style("top", (d3.event.pageY - 5) + "px")
	            .style("left", (d3.event.pageX + 10) + "px");
	    }

	    function mouseoutFunc(d) {
	        return tooltip_map.style("display", "none");
	    }




} // end draw_map


function draw_lines(country, data) {

	// Default on first load is set in country var.
	var linedata = get_values_for_country(country, data);

	yScale.domain([
			d3.max(linedata, function (c) {
				return c[illness];
			}),
		0]);

	console.log("linedata", linedata);

	linechart.selectAll("path")
		.data(linedata)
		.enter()
		.append("path")
		.attr("class", "line_graph2")
		.attr("d", line);

	//Axes
	linechart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(xAxis);

	linechart.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(yAxis);

	update_lines(country, linedata); // this is for the transitions if any, and headings

} // end draw_lines

function update_lines(country, data) {

		// doing the max on the unnested data - easier to get the full set of Malaria that way!
	yScale.domain([
		d3.max(data, function (c) {
				return c[illness];
			}),
		0
	]);

  // bind the new data
	var lines = linechart.select("path.line_graph2").data([data]);

  // transition.  there is no need for enter and exit in this case. we entered when we drew the first one in draw_lines.
	lines
		.transition()
		.attr("d", line);

	d3.select(".y.axis").transition().call(yAxis);

	console.log(data);

	if (data.length && data[0][illness] > 0) {
		d3.select(".subhead").html("Rate from 2000 to 2015 for <span>" + countryById.get(country).country) + "</span>";
	} else if (!data.length || data[0][illness] == 0) {
		d3.select(".subhead").html("No data for this country");
	}

}

function getColor(d) {
    var dataRow = countryById.get(d.properties.adm0_a3);
    if (dataRow) {
        return mapColorScale(+dataRow[illness]);
    } else {
        console.log("no dataRow",d, d.properties.adm0_a3, d.properties.name);
        return "#ccc";
    }
}

function getText(d) {
 var dataRow = countryById.get(d.properties.iso_a3);
    if (dataRow) {
        console.log(dataRow);
        return "<span>" + dataRow.country + "</span><br>In 2015, the infant mortality rate is: <span>" + dataRow[illness] + "</span>";
    } else {
        console.log("no dataRow", d);
        return "<span>" + d.properties.name + "</span><br> No data";
    }
}

function get_values_for_country(countrycode, data) {
	// Helper function to get the values from the data object that has the country key
	// special case for id's with too many words in them, sadly:
	console.log(countrycode);
	var values = data.filter(function (d) {
						return d.key == countrycode;
					});
	if (values.length) {
		return values[0].values;
	} else {
		return [];
	}
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

})();
