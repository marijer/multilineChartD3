var mainSettings = {
	maxValue: 0,
	minimumAmountBookings: 10,
	file:'summary_months_partnersperchannel_booked_bookings_plain_2.csv',

	start: function(){
		return d3.time.month.floor(new Date(2012, 10, 1));
	}, 

	end: function(){
		return new Date(+d3.time.month.ceil(new Date(2013, 12, 1)) + 1);
	}
}

var svg,
	mainBarChart;

$(function(){ 

	parseData( mainSettings.file , function( data, range ){
		LineChart(data, range);
	});

	mainBarChart = new BarChart('.chart');

	document.addEventListener('keydown', lineEvent.onKeyDown, false);

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
