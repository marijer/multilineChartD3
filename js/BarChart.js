function BarChart( container ){
	var margin = {top: 20, right: 30, bottom: 50, left: 50},
		 width = 250 - margin.left - margin.right,
		 height = 180 - margin.top - margin.bottom,
		 initBool = false,
		 headerInfo = '';

	var chart, gy, initBool;

	function getYAxis( y ) {
		var yAxis = d3.svg.axis()
		    .scale(y)
			 .tickPadding(10)
			 .tickSize(-width)
			 .tickSubdivide(true)	
		    .orient('left');

		return yAxis;
	}

	function customAxis( g ){
	  g.selectAll('text')
	   	.attr('x', -4)
	      .attr('dy', 2);
	}

	function getTotalBookings( arr ){
		var total = 0;
		for (var i in arr){ 
			total += Number(arr[i]); 
		}
		return total;
	}

	this.setMainTitle = function( d, position ){
		var infobox = d3.select('.title-container')
			.html( function ( ){
				var str = '<h1>'+ d.name +'</h1>';
				str += '<h2>' + d.manager + '</h2>';
				str += '<h2> PID:' + d.id + '</h2>';

				str += '<div class="number"> Last month Bookings: <span>' + d.values[d.values.length -1 ] + '</span></div>';
				str += '<div> Partner Position: ' + position + '</div>';
				return str;
		});
	}

	this.setTitle = function( d ){
		headerInfo = '<h2>'+ d.name +'</h2>';
		headerInfo += '<h3>'+ d.manager +'</h3>';
		headerInfo += '<h3>PID:'+ d.id +'</h3>'
		
		headerInfo += '<h3>Total Bookings: '+ d.totalCount +'</h3>'
	}

	this.update = function( d ){
		var data = d.values;
		var barWidth = width / data.length;
		var elContainer = container || '#results-container';
		
		if ( initBool ) {
			this.updateGraph(data)
		} else {

			var x = d3.time.scale()
			    .domain([new Date(2012, 10, 1), new Date(2013, 12, 1)])
			    .range([0, width]);

			var y = d3.scale.linear()
			      .range([height, 0])
			      .domain([0, d3.max(data, function(d) { return d; })]);

			var yAxis = getYAxis( y );

			var xAxis = d3.svg.axis()
			    .scale( x )
				.tickFormat(d3.time.format('%b'))
			    .orient( 'bottom' );	

			var header = d3.select( elContainer )
							.append('div')
							.attr('class', 'chart-result')
							.html( headerInfo );

			chart = header.append('svg')
			      .attr('width', width + margin.left + margin.right)
			      .attr('height', height + margin.top + margin.bottom)
			      .append('g')
			      .attr('class', 'chart')
	    			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			chart.append('g')
			      .attr('class', 'x axis')
			      .attr('transform', 'translate(0,' + height + ')')
			      .call(xAxis);

			chart.selectAll('text')
					.style('text-anchor', 'end')
					.attr('dx', '-.8em')
	            .attr('dy', '.15em')
	            .attr('transform', function(d) {
	               return 'rotate(-65)' 
	           	 });

			gy = chart.append('g')
			    .attr('class', 'y axis')
			    .call( yAxis )
			    .call(customAxis);

			var bar = chart.selectAll('.bar')
			      .data(data)
			    	.enter()
			    	.append('rect')
			      .attr('class', 'bar')
			      .attr('opacity', function() {
			      	return Math.random() *.2 + .7;
			      })
			      .attr('y', function(d) { return y( d ); })
			      .attr('height', function(d) { return height - y(d); })
			      .attr('width', barWidth - 1)
			      .attr('transform', function(d, i) { return 'translate(' + i * barWidth + ',0)'; });

			initBool = true;
		}
	}

	this.updateGraph = function( data ){
		var y = d3.scale.linear()
			   .range([height, 0])
			   .domain([0, d3.max(data, function(d) { return d; })]);

		var yAxis = getYAxis( y );

		var bar = chart.selectAll('rect')
			.data(data)
			.transition()
			.duration(1000)
			.attr('y', function( d ){ return y( d ); })
			.attr('height', function( d ){ return height - y( d ); })

			bar.selectAll('text')
		      .attr('y', function( d ) { return y( d ) + 3; })
		      .text(function( d ) { return d; });

		gy.transition()
		   .duration(1000)
		   .call(yAxis)
		   .selectAll('text') // cancel transition on customized attributes
		   .tween('attr.x', null)
		   .tween('attr.dy', null);

		gy.call( customAxis );
	}
}