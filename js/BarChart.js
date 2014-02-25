function BarChart( obj ){
	var margin = {top: 20, right: 30, bottom: 50, left: 50},
		 width = 250 - margin.left - margin.right,
		 height = 180 - margin.top - margin.bottom,
		 mainContainer = 'body',
		 tooltipContainer = '.tooltip',
		 tweenDuration = 1000,
		 numberFormat = d3.format(',.0d'),

		 initBool = false,
		 headerInfo = '';

	var chart, chartContainer, gy, initBool, zoom;

	// function is called down below - could be a clean way to do this?
	var setConfig = function(){
		if (obj){
			margin = obj !== undefined && obj.margin !== undefined ? obj.margin : margin;
			width = obj.width - margin.left - margin.right || width;
			height = obj.height - margin.top - margin.bottom || height;
			mainContainer = obj.mainContainer || mainContainer;
			tooltipContainer = obj.tooltipContainer || tooltipContainer;

			tweenDuration = obj.tweenDuration || tweenDuration;
		}
	},

	getYAxis = function ( y ) {
		var yAxis = d3.svg.axis()
		    .scale(y)
			 .tickPadding(10)
			 .tickSize(-width)
			 .tickSubdivide(true)	
		    .orient('left');

		return yAxis;
	},

	customAxis = function( g ){
	  g.selectAll('text')
	   	.attr('x', -4)
	      .attr('dy', 2);
	},

	getTotalBookings = function( arr ){
		var total = 0;
		for (var i in arr){ 
			total += Number(arr[i]); 
		}
		return total;
	},

	setMainTitle = function( d, position ){
		var str = '<h1>'+ d.name +'</h1>';
		str += '<div class="manager">' + d.manager + '</div>';
		str += '<div class="pid"> PID: ' + d.id + '</div>';

		str += '<div class="number"> Last month Bookings: <span>' + numberFormat(Number(d.values[d.values.length -1 ])) + '</span></div>';
		str += '<div> Last month Position: ' + position + '</div>';
		headerInfo = str;
		return headerInfo;
	},

	setTitle = function( d ){
		headerInfo = '<h3>'+ d.name +'</h3>';
		headerInfo += '<div class="manager">'+ d.manager +'</div>';
		headerInfo += '<div class="pid">PID: '+ d.id +'</div>'
		
		headerInfo += '<div class="total">Total Bookings: '+ numberFormat(Number( d.totalCount )) +'</div>'
	},

	update = function( d ){
		var data = d.values;
		var barWidth = width / data.length;
		
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
			
			chartContainer = d3.select( mainContainer )
							.append('div')
							.attr('class', 'chart-result')

			var header = chartContainer
							.append('div')
							.attr('class', 'chart-title')
							.html( headerInfo );

			chart = chartContainer
					.append('svg')
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
			      .attr('class', 'bar chart')
			      .attr('opacity', function() {
			      	return Math.random() *.2 + .7;
			      })
			      .attr('y', function(d) { return y( d ); })
			      .attr('height', function(d) { return height - y(d); })
			      .attr('width', barWidth - 1)
			      .attr('transform', function(d, i) { return 'translate(' + i * barWidth + ',0)'; });

			chart.selectAll('.bar')
				.on('mouseover', function( d, i ) {
				 	var selectTooltip = d3.select(tooltipContainer);

				    selectTooltip
				      .style('left', (d3.event.pageX + 10) + 'px')
				      .style('top', (d3.event.pageY - 40) + 'px')
				      .classed('hidden', false);

				    selectTooltip
				    .select('.title').text(numberFormat(Number(d)) + ' bookings');

			   })
			   .on('mouseout', function( d, i ) {
					d3.select( tooltipContainer )
    				  .classed('hidden', true);
			   });

			initBool = true;
		}
	},

	updateGraph = function( data ){
		var y = d3.scale.linear()
			   .range([height, 0])
			   .domain([0, d3.max(data, function(d) { return d; })]);

		var yAxis = getYAxis( y );

		var bar = chart.selectAll('rect')
			.data(data)
			.transition()
			.duration( tweenDuration )
			.attr('y', function( d ){ return y( d ); })
			.attr('height', function( d ){ return height - y( d ); })

			bar.selectAll('text')
		      .attr('y', function( d ) { return y( d ) + 3; })
		      .text(function( d ) { return d; });

		chartContainer.selectAll('.chart-title')
			.html( headerInfo );

		gy.transition()
		   .duration( tweenDuration )
		   .call(yAxis)
		   .selectAll('text') // cancel transition on customized attributes
		   .tween('attr.x', null)
		   .tween('attr.dy', null);

		gy.call( customAxis );
	}

	setConfig();

	return {
		setMainTitle: setMainTitle,
		setTitle: setTitle,
		update: update,
		updateGraph: updateGraph
	}	
}

// a try at at revealing module pattern