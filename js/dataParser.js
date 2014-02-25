function parseData(fileName, fn){

    var dsv = d3.dsv(';', 'text/plain');
    dsv('data/' + fileName, function( raw ) {

      var data =  [];
      var amArr = [];
      var totalPid = 0;
      var totalSmallAccounts = 0;
      var totalLargeAccounts = 0;
      var minimumAmountBookings = mainSettings.minimumAmountBookings;

      var blueTeam = new CombinePartners(),
          greenTeam = new CombinePartners(),
          redTeam = new CombinePartners();

      var format = d3.time.format('%b %Y');

      var start = mainSettings.start(),
          end = mainSettings.end();

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
     
              // if less then x bookings, do not add
         if ( totalCount < minimumAmountBookings ) {
            totalSmallAccounts += 1;
            return;
         }

         totalLargeAccounts += 1;

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
   totalLargeAccounts += 3;

   processed(totalPid, totalLargeAccounts);

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
   var totalPids = 1; 

   return { 
      update: function( d, numbers ) {
         if( first ){
            obj.manager = d['Account manager'] || d.manager;
            obj.id = '';
            obj.name = d['Account manager'] || d.manager;
            obj.values = numbers;

            first = false;
         } else {
            var total = 0;
            for (var i = 0; i < obj.values.length; i++){
               obj.values[i] += numbers[i];
               total += obj.values[i];
            }
            totalPids+= 1;
            obj.id = totalPids +'s PIDs processed';
            obj.totalCount= total;
         }
      },
      getObject: function(){
         return obj;
      }
   }
}

function processed( total, largeAccounts ){
   var el = document.getElementById('data-stats');
       numberFormat = d3.format(',.0d'),
       minimum = total - largeAccounts;

   var s = "<p>Showing <span>" + numberFormat(Number(largeAccounts)) + "</span> of in total <span>" + numberFormat(Number(total)) +"</span> PIDs,";
   s += " <span>" + numberFormat(Number(minimum)) + "</span> were below " + mainSettings.minimumAmountBookings  + " bookings or belonged to long tail and were excluded from the graphs.*";
   el.innerHTML = s;
}