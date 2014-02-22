<<<<<<< HEAD
// linechart created based on` from http://codepen.io/kiddman/pen/pxjmB
=======
// important part from http://codepen.io/kiddman/pen/pxjmB
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f

//************************************************************
// Data notice the structure
//************************************************************

var mainSettings = {
<<<<<<< HEAD
	maxValue: 0,
	start: new Date(2012, 10, 1),
	file:'summary_months_partnersperchannel_booked_bookings_plain_2.csv'
=======

	maxValue: 0,
	start: new Date(2012, 10, 1),

>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
}

var svg,
	zoom;

<<<<<<< HEAD
var mainBarChart = new BarChart('.chart');

parseData( mainSettings.file , function( data, range ){
	LineChart(data, range);
=======
var dsv = d3.dsv(";", "text/plain");
dsv("data/summary_months_partners_small.csv", function( raw ) {

	var format = d3.time.format("%b %Y");

	start = d3.time.month.floor(mainSettings.start)
	end = new Date(+d3.time.month.ceil(new Date(2013, 12, 1)) + 1)

	var range = d3.time.month.range(start, end, 1)


	var data = 	[];
	var amArr = [];

   _(raw).each(function( series ) {
       var value = {},
           totalCount = 0;

       // if table total, return
       if (series["Partner ID"] === "table total"){ return; }


       var numbers = _(range).map(function( month ) {
         totalCount += parseFloat(series[format(month)]);
         return parseFloat(series[format(month)]) || 0;
       });

      // console.log(numbers);

       // if less then x bookings, do not push
       if ( totalCount < 10 ) return; 

       var hasAm = _.find(amArr, function(obj) { return obj.manager == series["Account manager"]; });
       var color;
       if( hasAm === undefined ){
         var random = Math.ceil(Math.random() * 100); 
         color = d3.hcl( 48 * random, 95, 45 ).toString();
         amArr.push({ manager: series["Account manager"], color: color });
       } else{
         color = hasAm.color;
      }
  
      data.push({
         manager: series["Account manager"],
         id: series["Partner ID"],
         name: series["Partner name"],
         color: color,
         values: numbers
      });
  });

  
var values = _(data).chain().pluck('values').flatten().value();
mainSettings.maxValue = d3.max(values);

// sorting data object on last number in values array
function compare( a, b ) {
  if (a.values[b.values.length -1 ] < b.values[b.values.length -1 ])
     return -1;
  if (a.values[b.values.length -1 ] > b.values[b.values.length -1 ])
    return 1;
  return 0;
}

data.sort(compare);
 
//************************************************************
// Create Margins and Axis and hook our zoom function
//************************************************************
var margin = {top: 20, right: 30, bottom: 30, left: 50},
    width = 760 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;
	
var x = d3.time.scale()
    .range([0,width])
    .domain([start,end]);

var y = d3.scale.linear()
    .range([height, 0])
    .domain([ 0, mainSettings.maxValue ]);	  
 
var xAxis = d3.svg.axis()
    .scale(x)
	 .tickSize(-height)
	 .tickPadding(10)	
	 .tickSubdivide(true)	
    .orient("bottom");	
	
var yAxis = d3.svg.axis()
    .scale(y)
	 .tickPadding(10)
	 .tickSize(-width)
	 .tickSubdivide(true)	
    .orient("left");
	
zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 30])
    .on("zoom", zoomed);	

 //************************************************************
// Generate our SVG object
//************************************************************	
svg = d3.select(".multiline-container").append("svg")
	.call(zoom)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	 .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
 
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
 
svg.append("g")
	.attr("class", "y axis")
	.append("text")
	.attr("class", "axis-label")
	.attr("transform", "rotate(-90)")
	.attr("y", 12)
	.attr("x", -90)
	.text('Booked Bookings');	
 
svg.append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);
	

	
//************************************************************
// Create D3 line object and draw data on our SVG object
//************************************************************
var line = d3.svg.line()
    .interpolate("linear")
    .defined(function(d) { return d != null; })	
    .x(function(d,i) { return x(range[i]); })
    .y(function(d) { return y( d ); });
	

var series = svg.selectAll(".series")
      .data(data)
      .enter()
      .append("g")
      .attr("d", function(d) { return d })
      .attr("class", function (d, i){
      	return 'series ' + i;
      })
      .attr("clip-path", "url(#clip)");


  series.append("path")
      .attr("class", "line main")
      .attr("d", function(d) { return line(d.values); })
      

  series.append("path")
      .attr("class", "invisible hover line")
      .attr("d", function( d ) { return line(d.values); });

//************************************************************
// User Events on Line
//************************************************************


svg.selectAll('.hover')
	 .on("mouseover", function( d, i ) {
        var el = this.parentNode;

        d3.select(el)
          .classed("onhover",true);

        lineEvent.onMouseOver( d );
      })
      .on("mouseout", function( d, i ) {
		var el = this.parentNode;

        d3.select(el)
       	.classed("onhover",false);
       
       	 lineEvent.onMouseOut(  );
      })
      .on("click", function( d, i ) {
        lineEvent.selectLine( this.parentNode , d );
     })
	
	
// ************************************************************
// Draw points on SVG object based on the data given
// ************************************************************
// var points = svg.selectAll('.dots')
// 	.data(data)
// 	.enter()
// 	.append("g")
//     .attr("class", "dots")
// 	.attr("clip-path", "url(#clip)");	
 
// points.selectAll('.dot')
// 	.data(function(d, index){ 		
// 		var a = [];
// 		d.forEach(function(point,i){
// 			a.push({'index': index, 'point': point});
// 		});		
// 		return a;
// 	})
// 	.enter()
// 	.append('circle')
// 	.attr('class','dot')
// 	.attr("r", 2.5)
// 	.attr('fill', function(d,i){ 	
// 		return colors[d.index%colors.length];
// 	})	
// 	.attr("transform", function(d) { 
// 		return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
// 	);
	
 
//************************************************************
// Zoom specific updates
//************************************************************
function zoomed() {

	// makes sure this one is not going out of bounds
	var t = zoom.translate(),
	s = zoom.scale();

	tx = Math.min(0, Math.max(width * (1 - s), t[0]));
	ty = Math.min(0, Math.max(height * (1 - s), t[1]));

	zoom.translate([tx, ty]);

	svg.select(".x.axis").call(xAxis);
	svg.select(".y.axis").call(yAxis);   
	svg.selectAll('path.line').attr('d', function(d){ return line(d.values)});  
 
	// points.selectAll('circle').attr("transform", function(d) { 
	// 	return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
	// );  
}


>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
});

var lineEvent = {
	currentElement: undefined,

	selectLine: function( el, d ){
<<<<<<< HEAD
		lineEvent.currentElement = el;

      svg.selectAll('.active')
       	.classed('active',false);

      d3.select(el)
        	.classed('active', true);

     	var position = Number(el.getAttribute('data-position')) + 1;

		mainBarChart.update( d );
		mainBarChart.setMainTitle( d, position )
=======

      svg.selectAll('.active')
       	.classed("active",false);

      d3.select(el)
        	.classed("active", true);

        lineEvent.currentElement = el;

		var infobox = d3.select(".title-container")
			.html( function ( ){
				var str = '<h2>'+ d.name +'</h2>';
				str += '<h3>' + d.manager + '</h3>';
				str += '<h3>' + d.id + '</h3>';

				str += '<div class="number"> Last month Bookings: <span>' + d.values[d.values.length -1 ] + '</span></div>';
				return str;
		});

		barChart.update( d.values );
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
	},

	onMouseOver: function( d ){
		var el = d3.select(this);
<<<<<<< HEAD
		var selectTooltip = d3.select('#tooltip');


		selectTooltip
		  .style('left', (d3.event.pageX + 10) + 'px')
	     .style('top', (d3.event.pageY - 40) + 'px')
	     .classed('hidden', false);

		selectTooltip
		.select('.title').text(d.name);

		selectTooltip
		.select('.pid').text(d.id);
	},

	onMouseOut: function( d ){
		d3.select('#tooltip')
		.classed('hidden', true);
	},

	restrictSelection: function( arr ) {

	},

=======
		var selectTooltip = d3.select("#tooltip");


		selectTooltip
		  .style("left", (d3.event.pageX + 10) + "px")
	     .style("top", (d3.event.pageY - 40) + "px")
	     .classed('hidden', false);


		selectTooltip
		.select(".title").text(d.name);

		selectTooltip
		.select(".pid").text(d.id);
	},

	onMouseOut: function( d ){
		d3.select("#tooltip")
		.classed('hidden', true);
	},

>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
	onKeyDown: function( e ){
		var keyCode = e.keyCode,
			el;

		if (!lineEvent.currentElement) return;

		switch (keyCode){
			case 38: // down
<<<<<<< HEAD
				el = lineEvent.currentElement.previousSibling || false; 
				break;
			case 40: // up
				el = lineEvent.currentElement.nextSibling || false;
=======
				el = lineEvent.currentElement.nextSibling || false; 
				break;
			case 40: // up
				el = lineEvent.currentElement.previousSibling || false; 
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
				break;
		}

		if( el ) lineEvent.traverse( el );
	},

	traverse: function( el ){
		var data = el.__data__;
       	lineEvent.selectLine(el, data);	
	}
}


<<<<<<< HEAD
var search = {

	selectedDimension: 'name',
=======
function barChartTest( d ){
	margin = {top: 20, right: 30, bottom: 70, left: 50};
	width = 250 - margin.left - margin.right;
	height = 150 - margin.top - margin.bottom;

	function getYAxis( y ) {
		var yAxis = d3.svg.axis()
		    .scale(y)
			 .tickPadding(10)
			 .tickSize(-barChart.width)
			 .tickSubdivide(true)	
		    .orient("left");

		return yAxis;
	}

	function customAxis( g ) {
	  g.selectAll("text")
	   	.attr("x", -4)
	      .attr("dy", 2);
	}

	this.init = function(){
		var data = d.values;
		var margin = barChart.margin;
		var barWidth = barChart.width / data.length;

		var x = d3.time.scale()
		    .domain([new Date(2012, 10, 1), new Date(2013, 12, 1)])
		    .range([0, barChart.width]);

		var y = d3.scale.linear()
		      .range([barChart.height, 0])
		      .domain([0, d3.max(data, function(d) { return d; })]);

		var yAxis = barChart.getYAxis( y );

		var xAxis = d3.svg.axis()
		    .scale(x)
			.tickFormat(d3.time.format("%b"))
		    .orient("bottom");	

		var bodySelection = d3.select("#results-container");

		var chart = bodySelection.append("svg")
		      .attr("width", barChart.width + margin.left + margin.right)
		      .attr("height", barChart.height + margin.top + margin.bottom)
		      .append("g")
		      .attr('class', 'chart')
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		chart.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + barChart.height + ")")
		      .call(xAxis);

		chart.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
               return "rotate(-65)" 
           	 });

		var gy = chart.append("g")
		    .attr("class", "y axis")
		    .call( yAxis )
		    .call(barChart.customAxis);

		var bar = chart.selectAll(".bar")
		      .data(data)
		    	.enter()
		    	.append("rect")
		      .attr("class", "bar")
		      .attr('opacity', function() {
		      	return Math.random() *.2 + .7;
		      })
		      .attr("y", function(d) { return y( d ); })
		      .attr("height", function(d) { return barChart.height - y(d); })
		      .attr("width", barWidth - 1)
		      .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

		barChart.gy = gy
		barChart.chart = chart;
		barChart.initBool = true;
	}

}


var barChart = {
	initBool: 	false,
	margin: 		{top: 20, right: 30, bottom: 70, left: 50},	
	width: 		    250 - 50 - 10,
	height: 		150 - 10 - 30,

	y: 			undefined,
	gykey:  	undefined, 	
	chart: 		undefined,

	update: function( data ){

		if ( !barChart.initBool ) {
			barChart.create( data )
		} else {

			var y = d3.scale.linear()
			   .range([barChart.height, 0])
			   .domain([0, d3.max(data, function(d) { return d; })]);

			var yAxis = barChart.getYAxis( y );

			var bar = barChart.chart.selectAll("rect")
				.data(data)
				.transition()
				.duration(1000)
				.attr("y", function( d ){ return y( d ); })
				.attr("height", function( d ){ return barChart.height - y( d ); })

				bar.selectAll("text")
			      .attr("y", function( d ) { return y( d ) + 3; })
			      .text(function( d ) { return d; });

				barChart.gy.transition()
				   .duration(1000)
				   .call(yAxis)
				   .selectAll("text") // cancel transition on customized attributes
				   .tween("attr.x", null)
				   .tween("attr.dy", null);

				barChart.gy.call( barChart.customAxis );

        }
	},

	create: function( data ){
		var margin = barChart.margin;
		var barWidth = barChart.width / data.length;

		var x = d3.time.scale()
		    .domain([new Date(2012, 10, 1), new Date(2013, 12, 1)])
		    .range([0, barChart.width]);

		var y = d3.scale.linear()
		      .range([barChart.height, 0])
		      .domain([0, d3.max(data, function(d) { return d; })]);

		var yAxis = barChart.getYAxis( y );

		var xAxis = d3.svg.axis()
		    .scale(x)
			 .tickFormat(d3.time.format("%b"))
		    .orient("bottom");	

		var chart =  d3.select(".chart")
		      .attr("width", barChart.width + margin.left + margin.right)
		      .attr("height", barChart.height + margin.top + margin.bottom)
		      .append("g")
    		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		chart.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + barChart.height + ")")
		      .call(xAxis);

		chart.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
               return "rotate(-65)" 
           	 });

		var gy = chart.append("g")
		    .attr("class", "y axis")
		    .call( yAxis )
		    .call(barChart.customAxis);

		var bar = chart.selectAll(".bar")
		      .data(data)
		    	.enter()
		    	.append("rect")
		      .attr("class", "bar")
		      .attr('opacity', function() {
		      	return Math.random() *.2 + .7;
		      })
		      .attr("y", function(d) { return y( d ); })
		      .attr("height", function(d) { return barChart.height - y(d); })
		      .attr("width", barWidth - 1)
		      .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

		barChart.gy = gy
		barChart.chart = chart;
		barChart.initBool = true;
	},

	getYAxis: function( y ) {
		var yAxis = d3.svg.axis()
		    .scale(y)
			 .tickPadding(10)
			 .tickSize(-barChart.width)
			 .tickSubdivide(true)	
		    .orient("left");

		return yAxis;
	},

	customAxis: function( g ) {
	  g.selectAll("text")
	   	.attr("x", -4)
	      .attr("dy", 2);
	}
}

var search = {

	selectedDimension: undefined,
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f

	setDimension: function( el ){
		var value = $(el).val();
		var text = $(el).find('option:selected').text();

		this.selectedDimension = value;

		$('#search').attr('placeholder','Search ' + text);
	},

	search: function( input ){
		this.removeHighlights( );
		if (input === '') return;

<<<<<<< HEAD
		this.update( input );
	},

	update: function( name ) {
		var dimension = this.selectedDimension || 'name';
		var arr = [];
		var lineEventArr = [];
		var totalResults = 0;

		var combinedAccounts = new CombinePartners();

      svg.selectAll('.line')
      	//.style('display', 'none')
=======
		this.partnerName( input );
	},

	partnerName: function( name) {
		var dimension = this.selectedDimension || 'name';
		var arr = [];

	var myNode = document.getElementById("results-container");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}

      svg.selectAll(".line")
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
	      .filter(function( d ) { 
	          var manager = d[dimension].toLowerCase(),
	              n = name.toLowerCase(); 
	          return manager.search( n ) > -1 
	      })
<<<<<<< HEAD
	      .style('display', 'inline')
	      .each(function( d, i ) {

=======
	      .each(function(d, i) {
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f
	      	// check if the aid is not already
	      	if (arr.indexOf(d.id) !== -1) return;

	      	d3.select(this.parentNode)
<<<<<<< HEAD
	          .classed('active',true);

	         arr.push(d.id);

	         lineEventArr.push(this.parentNode);

	         var bar1 = new BarChart();
	         bar1.setTitle(d);
	         bar1.update(d);
	         totalResults += 1;

	         combinedAccounts.update(d, d.values);
	      })

	   var obj = combinedAccounts.getObject();
	   	 obj.name = 'Total ' + name;
	   	 obj.manager =  totalResults + ' PIDs found'

	   mainBarChart.update( obj );
	   mainBarChart.setMainTitle( obj );

	   lineEvent.restrictSelection( lineEventArr );
   },

   removeHighlights: function(){
		svg.selectAll('.active')
			.classed('active', false);

		// svg.selectAll('.line')
  //     	.style('display', 'inline')

      var myNode = document.getElementById('results-container');
      while (myNode.firstChild) {
		    myNode.removeChild(myNode.firstChild);
		}

	}
}

$( 'select#search-select' ).change(function() {
	search.setDimension( this ) ;
});

document.addEventListener('keydown', lineEvent.onKeyDown, false);
=======
	          .classed("active",true);

	         arr.push(d.id);

	         var bar1 = new barChartTest(d);
	         bar1.init();
	      })
   },

   removeHighlights: function(){
		svg.selectAll(".active")
			.classed('active', false);
	}
}

$( "select#search-select" ).change(function() {
	search.setDimension( this ) ;
});

document.addEventListener("keydown", lineEvent.onKeyDown, false);
>>>>>>> a589735c829b34d7a7dfe8b5f1978fe1dee9cf5f

document.getElementById('search').onkeypress = function( e ) {
  if ( e.keyCode == '13' ) {
    search.search(e.target.value);
  }
}