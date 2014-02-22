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

document.addEventListener('keydown', lineEvent.onKeyDown, false);

$( 'select#search-select' ).change(function() {
	search.setDimension( this ) ;
});

document.getElementById('search').onkeypress = function( e ) {
  if ( e.keyCode == '13' ) {
    search.onSearch(e.target.value);
  }
}