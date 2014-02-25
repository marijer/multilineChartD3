var search = {
	selectedDimension: 'name',

	setDimension: function( el ){
		var value = $(el).val();
		var text = $(el).find('option:selected').text();

		this.selectedDimension = value;

		$('#search').attr('placeholder','Search ' + text);
	},

	onSearch: function( input ){
		this.removeHighlights( );
		if (input === '') return;

		this.update( input );
	},

	update: function( name ) {
		var dimension = this.selectedDimension || 'name';
		var arr = [];
		var allArr = [];
		var totalResults = 0;
		var lineEventArr = [];
		var combinedAccounts = new CombinePartners();

		svg.selectAll('.line')
		.filter(function( d ) { 
			var manager = d[dimension].toLowerCase(),
			n = name.toLowerCase(); 
			return manager.search( n ) > -1 
		})
		.style('display', 'inline')
		.each(function( d, i ) {

	      	// check if the aid is not already in the array
	      	if (arr.indexOf(d.id) !== -1) return;

	      	d3.select(this.parentNode)
	      	.classed('active',true);

	      	arr.push(d.id);
	      	totalResults += 1;

	      	lineEventArr.push(this.parentNode);
	      	allArr.push(d);
	      })

	   function compare( a, b ) {
         if (a.values === undefined && b.values === undefined ) return;

         if (a.totalCount < b.totalCount )
            return 1;
         if (a.totalCount > b.totalCount )
            return -1;
      	   return 0;
   	 }

   	 allArr.sort(compare);

   	 for (var i = 0; i < allArr.length; i++){
   	 		var bar1 = new BarChart({
   	 						  width: 				240, 
								  height: 				160,
								  margin: 				{top: 10, right: 10, bottom: 30, left: 50},
								  mainContainer: 		'#results-container',
								  tooltipContainer:  '#chart-tooltip' 
					});

	      	bar1.setTitle(allArr[i]);
	      	bar1.update(allArr[i]);
	      	combinedAccounts.update(allArr[i], allArr[i].values);
   	 }

		if (totalResults > 0){
			var obj = combinedAccounts.getObject();
			obj.name = "Total BB's '" + name + "'";

			mainBarChart.setMainTitle( obj );
			mainBarChart.update( obj );

			lineEvent.restrictSelection( lineEventArr );
		}
		search.updateSearchStats(name, totalResults);
	},

	updateSearchStats: function(name, totalResults){
		var el = document.getElementById('search-stats');
		el.innerHTML = "Searched on <span>" + name + "</span> with <span>" + totalResults + "</span> results";
	},

	removeHighlights: function(){
		svg.selectAll('.active')
		.classed('active', false);

		var myNode = document.getElementById('results-container');
		while (myNode.firstChild) {
			myNode.removeChild(myNode.firstChild);
		}

		var el = document.getElementById('search-stats');
		el.innerHTML = '';
	}
}