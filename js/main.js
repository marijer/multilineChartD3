// linechart created based on` from http://codepen.io/kiddman/pen/pxjmB

//************************************************************
// Data notice the structure
//************************************************************

var mainSettings = {
	maxValue: 0,
	start: new Date(2012, 10, 1),
	file:'summary_months_partnersperchannel_booked_bookings_plain_2.csv'
}

var svg,
	zoom;

var mainBarChart = new BarChart('.chart');

parseData( mainSettings.file , function( data, range ){
	LineChart(data, range);
});

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


var search = {

	selectedDimension: 'name',

	setDimension: function( el ){
		var value = $(el).val();
		var text = $(el).find('option:selected').text();

		this.selectedDimension = value;

		$('#search').attr('placeholder','Search ' + text);
	},

	search: function( input ){
		this.removeHighlights( );
		if (input === '') return;

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
	      .filter(function( d ) { 
	          var manager = d[dimension].toLowerCase(),
	              n = name.toLowerCase(); 
	          return manager.search( n ) > -1 
	      })
	      .style('display', 'inline')
	      .each(function( d, i ) {

	      	// check if the aid is not already
	      	if (arr.indexOf(d.id) !== -1) return;

	      	d3.select(this.parentNode)
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

document.getElementById('search').onkeypress = function( e ) {
  if ( e.keyCode == '13' ) {
    search.search(e.target.value);
  }
}