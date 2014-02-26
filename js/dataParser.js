function parseData(fileName, fn){

   var completeDataSet = [],
       defaultData = [],
       totalPid = 0,
       totalSmallAccounts = 0,
       totalLargeAccounts = 0,
       minimumAmountBookings = mainSettings.minimumAmountBookings;

   var format = d3.time.format('%b %Y');

   var blueTeam = new CombinePartners({name: 'LT Team AMS Blue', lt: true }),
       greenTeam = new CombinePartners({name: 'LT Team BCN Green', lt: true }),
       redTeam = new CombinePartners({name: 'LT Team APAC Red', lt: true });

   var start = mainSettings.start(),
       end = mainSettings.end();

   var range = d3.time.month.range(start, end, 1)

   var dsv = d3.dsv(';', 'text/plain');

   // sorting data object on last number in values array
   var compare = function ( a, b ) {
            if (a.values === undefined || b.values === undefined ) return;

            if (a.values[b.values.length -1 ] < b.values[b.values.length -1 ])
               return 1;
            if (a.values[b.values.length -1 ] > b.values[b.values.length -1 ])
             return -1;
         return 0;
   },

   process = function( raw ){
      var newDataSet = [];

      _(raw).each(function( series, i ) {
         if ( series['Partner ID'] === 'table total' ) return; 
         totalPid += 1;
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

         //do some longtail things - these accounts are added together
         if (series['Account manager'] === 'LT Team AMS Blue '){
            blueTeam.update(obj);
            obj.longtail = true;
          } else if(series['Account manager'] === 'LT Team BCN Green '){
            greenTeam.update(obj);
            obj.longtail = true;
         } else if(series['Account manager'] === 'LT Team APAC Red'){
            redTeam.update(obj);
            obj.longtail = true;
         }
          
   });

      completeDataSet = newDataSet;
      fn( newDataSet, range);
   },

   processDefault = function( raw ){
      defaultData = [];
 
      _( raw ).each(function( series ) {

         // if table total, or certain partners > remove them
         if ( series.manager === 'Search Team' || 
              series.manager === 'Delete Accounts' ||
              series.manager === 'Abuse' ||
              series.longtail ) return;

         // if less then x bookings, do not add
         if ( series.totalCount < minimumAmountBookings ) {
            totalSmallAccounts += 1;
            return;
         }

         totalLargeAccounts += 1;

         defaultData.push(series);
      });

      defaultData.push(blueTeam.getObject());
      defaultData.push(redTeam.getObject());
      defaultData.push(greenTeam.getObject());
      totalLargeAccounts += 3;

      processed( totalPid, totalLargeAccounts );

      var values = _(defaultData).chain().pluck('values').flatten().value();
      mainSettings.maxValue = d3.max(values);

      defaultData.sort( compare );

      // do callback which returns the data
      return defaultData;
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
           data.push(series);
         }
      });

      var values = _(data).chain().pluck('values').flatten().value();
      mainSettings.maxValue = d3.max(values);

      return data;
   },

   getDefaultData = function(){
      var values = _(defaultData).chain().pluck('values').flatten().value();
      mainSettings.maxValue = d3.max(values);

      return defaultData;
   }

   return {
      init: init,
      filter: filter,
      processDefault: processDefault,
      getDefaultData: getDefaultData
   }
}

function CombinePartners( el ){
   var first = true,
       obj = {},
       totalPids = 1;

       obj.name = el.name || 'test name';
       obj.manager = '-';
       obj.id = '';
       obj.lt = el.longtail || false;

   var update = function( obj2 ){
      var arr = obj2.values.slice(0);
      if( first ){
         obj.values = arr;
         
         first = false;
      } else {
         var total = 0;

         for (var i = 0; i < arr.length; i++){
            obj.values[i] += arr[i];
            total += obj.values[i];
         }

         totalPids+= 1;
         obj.id = totalPids +' PIDs found';
         obj.totalCount = total;
      }
   },

   getObject = function(){
         return obj;
   };

   return { 
      update: update,
      getObject: getObject
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