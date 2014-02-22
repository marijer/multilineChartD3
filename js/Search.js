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