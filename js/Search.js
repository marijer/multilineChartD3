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

	      	// check if the aid is not already
	      	if (arr.indexOf(d.id) !== -1) return;

	      	d3.select(this.parentNode)
	      	.classed('active',true);

	      	arr.push(d.id);
	      	totalResults += 1;

	      	lineEventArr.push(this.parentNode);

	      	var bar1 = new BarChart();
	      	bar1.setTitle(d);
	      	bar1.update(d);
	      	combinedAccounts.update(d, d.values);
	      })

		if (totalResults > 0){
			var obj = combinedAccounts.getObject();
			obj.name = "Total '" + name + "'";

			mainBarChart.update( obj );
			mainBarChart.setMainTitle( obj );

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