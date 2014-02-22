function parseData(fileName, fn){

  var dsv = d3.dsv(';', 'text/plain');
  dsv('data/' + fileName, function( raw ) {

   var data =  [];
   var amArr = [];
   var totalPid = 0;
   var totalSmallAccounts = 0;
   var minimumAmountBookings = 10;

   var blueTeam = new CombinePartners();
   var greenTeam = new CombinePartners();
   var redTeam = new CombinePartners();

  	var format = d3.time.format('%b %Y');

  	start = d3.time.month.floor(mainSettings.start)
   end = new Date(+d3.time.month.ceil(new Date(2013, 12, 1)) + 1)

  	var range = d3.time.month.range(start, end, 1)

   _(raw).each(function( series ) {
         var value = {},
             totalCount = 0;

         // if table total, or certain partners > remove them
         if (series['Partner ID'] === 'table total' || 
         	 series['Account manager'] === 'Search Team' || 
         	 series['Account manager'] === 'Delete Accounts' ||
             series['Account manager'] === 'Abuse' ) return;

         var numbers = _(range).map(function( month ) {
           totalCount += parseFloat(series[format(month)]);
           return parseFloat(series[format(month)]) || 0;
         });

         totalPid += 1;

         // if less then x bookings, do not add
         if ( totalCount < minimumAmountBookings ) {
            totalSmallAccounts += 1;
            return;
        } 

         // do some longtail things - these accounts are added together
         if (series['Account manager'] === 'LT Team AMS Blue '){
           blueTeam.update(series, numbers);
           return;
         } else if(series['Account manager'] === 'LT Team BCN Green '){
            greenTeam.update(series, numbers);
            return;
         } else if(series['Account manager'] === 'LT Team APAC Red'){
            redTeam.update(series, numbers);
            return;
         }


         var hasAm = _.find(amArr, function( obj ) { return obj.manager == series['Account manager']; });
        
        //  var color;
        //  if( hasAm === undefined ){
        //    var random = Math.ceil(Math.random() * 100); 
        //    color = d3.hcl( 48 * random, 95, 45 ).toString();
        //    amArr.push({ manager: series['Account manager'], color: color });
        //  } else{
        //    color = hasAm.color;
        // }
    
        data.push({
           manager: series['Account manager'],
           id: series['Partner ID'],
           name: series['Partner name'],
          // color: color,
           values: numbers,
           totalCount: totalCount
        });
    });

   data.push(blueTeam.getObject());
   data.push(redTeam.getObject());
   data.push(greenTeam.getObject());

   processed( totalPid, totalSmallAccounts);

   var values = _(data).chain().pluck('values').flatten().value();
   mainSettings.maxValue = d3.max(values);

    // sorting data object on last number in values array
   function compare( a, b ) {
      if (a.values === undefined && b.values === undefined ) return;

      if (a.values[b.values.length -1 ] < b.values[b.values.length -1 ])
         return 1;
      if (a.values[b.values.length -1 ] > b.values[b.values.length -1 ])
        return -1;
      return 0;
    }

    data.sort( compare );

    // do callback which returns the data
    fn( data, range);
  });
}

function CombinePartners( team ){
   var first = true;
   var obj = {};

   return { 
      update: function( d, numbers ) {
         if( first ){
            obj.manager= d['Account manager'] || d.manager;
            obj.id= 'Not Applicable';
            obj.name= d['Account manager'] || d.manager;
            obj.values= numbers;

            first = false;
         }else{
            var total = 0;
            for (var i = 0; i < obj.values.length; i++){
               obj.values[i] += numbers[i];
               total += obj.values[i];
            }

            obj.totalCount= total;
         }
      },
      getObject: function(){
         return obj;
      }
   }

}

function processed( total, minimum ){
   var el = document.getElementById('proccessed');

   var showingNumber = total - minimum;
   el.innerHTML = "Showing <b>" + showingNumber + "</b> of in <b>" + total +"</b> PIDs" ;
}
