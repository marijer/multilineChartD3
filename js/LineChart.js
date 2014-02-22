// linechart created based on` from http://codepen.io/kiddman/pen/pxjmB


function LineChart(data, range) {
//************************************************************
// Create Margins and Axis and hook our zoom function
//************************************************************
  var margin = {top: 10, right: 30, bottom: 30, left: 70},
      width = 760 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;
  	
  var x = d3.time.scale()
      .range([0,width])
      .domain([mainSettings.start(), mainSettings.end()]);

  var y = d3.scale.linear()
      .range([height, 0])
      .domain([ 0, mainSettings.maxValue ]);	  
   
  var xAxis = d3.svg.axis()
      .scale(x)
  	 .tickSize(-height)
  	 .tickPadding(10)	
  	 .tickSubdivide(true)	
      .orient('bottom');	
  	
  var yAxis = d3.svg.axis()
      .scale(y)
  	 .tickPadding(10)
  	 .tickSize(-width)
  	 .tickSubdivide(true)	
      .orient('left');
  	
  zoom = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([1, 30])
      .on('zoom', zoomed);	

 //************************************************************
// Generate our SVG object
//************************************************************	
  svg = d3.select('.multiline-container').append('svg')
  	.call(zoom)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
  	 .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
   
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
   
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
   
  svg.append('g')
  	.attr('class', 'y axis')
  	.append('text')
  	.attr('class', 'axis-label')
  	.attr('transform', 'rotate(-90)')
  	.attr('y', 12)
  	.attr('x', -90)
  	.text('Booked Bookings');	
   
  svg.append('clipPath')
  	.attr('id', 'clip')
  	.append('rect')
  	.attr('width', width)
	.attr('height', height);
	

//************************************************************
// Create D3 line object and draw data on our SVG object
//************************************************************
var line = d3.svg.line()
    .interpolate('linear')
    .defined(function(d) { return d != null; })	
    .x(function(d,i) { return x(range[i]); })
    .y(function(d) { return y( d ); });

var series = svg.selectAll('.series')
      .data(data)
      .enter()
      .append('g')
      .attr('d', function(d) { return d })
      .attr('class', 'series')
      .attr('data-position', function(d, i){
      	return i;
      })
      .attr('clip-path', 'url(#clip)');


  series.append('path')
      .attr('class', 'line main')
      .attr('d', function(d) { return line(d.values); })
      

  series.append('path')
      .attr('class', 'invisible hover line')
      .attr('d', function( d ) { return line(d.values); });

//************************************************************
// User Events on Line
//************************************************************


svg.selectAll('.hover')
	 .on('mouseover', function( d, i ) {
        var el = this.parentNode;

        d3.select(el)
          .classed('onhover',true);

        lineEvent.onMouseOver( d );
      })
      .on('mouseout', function( d, i ) {
		var el = this.parentNode;

        d3.select(el)
       	.classed('onhover',false);
       
       	 lineEvent.onMouseOut(  );
      })
      .on('click', function( d, i ) {
        lineEvent.selectLine( this.parentNode , d );
     })
	
	
// ************************************************************
// Draw points on SVG object based on the data given
// ************************************************************
// var points = svg.selectAll('.dots')
// 	.data(data)
// 	.enter()
// 	.append('g')
//     .attr('class', 'dots')
// 	.attr('clip-path', 'url(#clip)');	
 
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
// 	.attr('r', 2.5)
// 	.attr('fill', function(d,i){ 	
// 		return colors[d.index%colors.length];
// 	})	
// 	.attr('transform', function(d) { 
// 		return 'translate(' + x(d.point.x) + ',' + y(d.point.y) + ')'; }
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

	svg.select('.x.axis').call(xAxis);
	svg.select('.y.axis').call(yAxis);   
	svg.selectAll('path.line').attr('d', function(d){ return line(d.values)});  
 
	// points.selectAll('circle').attr('transform', function(d) { 
	// 	return 'translate(' + x(d.point.x) + ',' + y(d.point.y) + ')'; }
	// );  
	}
}

var lineEvent = {
  currentElement: undefined,

  selectLine: function( el, d ){
    lineEvent.currentElement = el;

      svg.selectAll('.active')
        .classed('active',false);

      d3.select(el)
          .classed('active', true);

      var position = Number(el.getAttribute('data-position')) + 1;

    mainBarChart.update( d );
    mainBarChart.setMainTitle( d, position )
  },

  onMouseOver: function( d ){
    var el = d3.select(this);
    var selectTooltip = d3.select('#line-tooltip');


    selectTooltip
      .style('left', (d3.event.pageX + 10) + 'px')
       .style('top', (d3.event.pageY - 40) + 'px')
       .classed('hidden', false);

    selectTooltip
    .select('.title').text(d.name);

    selectTooltip
    .select('.pid').text(d.manager);
  },

  onMouseOut: function( d ){
    d3.select('#line-tooltip')
    .classed('hidden', true);
  },

  restrictSelection: function( arr ) {

  },

  onKeyDown: function( e ){
    var keyCode = e.keyCode,
      el;

    if (!lineEvent.currentElement) return;

    switch (keyCode){
      case 38: // down
        el = lineEvent.currentElement.previousSibling || false; 
        break;
      case 40: // up
        el = lineEvent.currentElement.nextSibling || false;
        break;
    }

    if( el ) lineEvent.traverse( el );
  },

  traverse: function( el ){
    var data = el.__data__;
        lineEvent.selectLine(el, data); 
  }
}