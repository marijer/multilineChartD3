var mainSettings = {
	maxValue: 					 0,
	minimumAmountBookings: 	 20,
	filter: 						 'default',
	file: 						'summary_months_partnersperchannel_booked_bookings_plain_2.csv',

	start: function(){
		return d3.time.month.floor(new Date(2012, 10, 1));
	}, 

	end: function(){
		return new Date(+d3.time.month.ceil(new Date(2013, 12, 1)) + 1);
	},

	range: function(){
		return d3.time.month.range(this.start, this.end, 1);
	}
}

var svg,
	mainBarChart;

var app = app || {};

$(function(){

	var rangeMe;

	var parser = new parseData( mainSettings.file , function( data, range ){
		onDataReady( data, range); 
	});

	parser.init()

	function onDataReady( data, range ){
		var d = parser.processDefault( data );
		var line = new LineChart( d, range );

		line.init();
		rangeMe = range;

		mainBarChart = new BarChart({ 
			width: 280, 
			height: 175,
			margin: {top: 5, right: 10, bottom: 30, left: 50},
			mainContainer: '.chart',
			tooltipContainer: '#chart-tooltip'
		});
	}

	app.update = function( option ){
		var myNode = document.querySelector('.multiline-container');
		var d;

		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}

		switch( option ){
			case 'default':
				d = parser.getDefaultData();
				console.log('hi');
				break;
			default:
				d = parser.filter();
				break
		}

		var line = new LineChart(d, rangeMe);
		line.init();
	}

	// key event up or down, navigate through line
	document.addEventListener('keydown', function( e ) {
		if ( e.keyCode === 38 || e.keyCode === 40 ){
			lineEvent.onKeyDown( e );
			e.preventDefault();
		}
	});

	// search events
	$( 'select#search-select' ).change(function() {
		search.setDimension( this ) ;
	});

	document.getElementById('search').onkeypress = function( e ) {
	  if ( e.keyCode == '13' ) {
	    search.onSearch(e.target.value);
	  }
	}

});