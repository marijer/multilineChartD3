function parseData(fileName, fn){

   var completeDataSet = [],
       amArr = [],
       totalPid = 0,
       totalSmallAccounts = 0,
       totalLargeAccounts = 0,
       minimumAmountBookings = mainSettings.minimumAmountBookings;

   var format = d3.time.format('%b %Y');

   var start = mainSettings.start(),
       end = mainSettings.end();

   var range = d3.time.month.range(start, end, 1)

   var dsv = d3.dsv(';', 'text/plain');

   // sorting data object on last number in values array
   var compare = function ( a, b ) {
            if (a.values === undefined && b.values === undefined ) return;

            if (a.values[b.values.length -1 ] < b.values[b.values.length -1 ])
               return 1;
            if (a.values[b.values.length -1 ] > b.values[b.values.length -1 ])
             return -1;
         return 0;
   },

   process = function( raw ){
      var newDataSet = [];

      _(raw).each(function( series ) {
         if ( series['Partner ID'] === 'table total' ) return; 

         var totalCount = 0;

         var numbers = _(range).map(function( month ) {
            totalCount += parseFloat(series[format(month)]);
            return parseFloat(series[format(month)]) || 0;
         });

         var obj = {
            manager: series['Account manager'],
            id: series['Partner ID'],
            name: series['Partner name'],
            values: numbers,
            totalCount: totalCount           
         };

         newDataSet.push (obj);
   });

      completeDataSet = newDataSet;
      fn( newDataSet, range);
   },

   processDefault = function( raw ){
      var myData = [];
 
      var blueTeam = new CombinePartners(),
          greenTeam = new CombinePartners(),
          redTeam = new CombinePartners();

      _( raw ).each(function( series ) {

         // if table total, or certain partners > remove them
         if ( series.manager === 'Search Team' || 
              series.manager === 'Delete Accounts' ||
              series.manager === 'Abuse' ) return;

        totalPid += 1;

         // do some longtail things - these accounts are added together
         if (series.manager === 'LT Team AMS Blue '){
             blueTeam.update(series);
             return;
          } else if(series.manager === 'LT Team BCN Green '){
            greenTeam.update(series);
            return;
         } else if(series.manager === 'LT Team APAC Red'){
            redTeam.update(series);
            return;
         }
     
         // if less then x bookings, do not add
         if ( series.totalCount < minimumAmountBookings ) {
            totalSmallAccounts += 1;
            return;
         }

         totalLargeAccounts += 1;

         myData.push(series);
      });

      myData.push(blueTeam.getObject());
      myData.push(redTeam.getObject());
      myData.push(greenTeam.getObject());
      totalLargeAccounts += 3;

      processed( totalPid, totalLargeAccounts );

      var values = _(myData).chain().pluck('values').flatten().value();
      mainSettings.maxValue = d3.max(values);

      myData.sort( compare );

      // do callback which returns the data
      return myData;
   },

   init = function( ){
      dsv('data/' + fileName, function( data ) {
         process( data );
      });  
   },

   filter = function( name ){
      var data = [];

      _( completeDataSet ).each(function( series ) {
         if (series.manager === 'LT Team APAC Red' && series.totalCount !== 0 ){
           // console.log(series.name, series.values);
           data.push(series);
         }
      });

      var values = _(data).chain().pluck('values').flatten().value();
      mainSettings.maxValue = d3.max(values);

      return data;
   };

   return {
      init: init,
      filter: filter,
      processDefault: processDefault
   }
}

function CombinePartners(){
   var first = true,
       obj = {},
       totalPids = 1; 

   return { 
      update: function( d ) {
         if( first ){
            obj.name =  d.manager;
            obj.manager = d.manager;
            obj.id = '';
            obj.values = d.values;

            first = false;
         } else {
             var total = 0;
             var arr = d.values;


            for (var i = 0; i < arr.length; i++){
               obj.values[i] += arr[i];
               total += obj.values[i];
            }

            totalPids+= 1;
            obj.id = totalPids +'s PIDs processed';
            obj.totalCount = total;
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