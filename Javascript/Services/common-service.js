(function( ng, app ) {

	"use strict";

	app.service(
		"commonService",
		function(  ) {
			
			
			var getHoursToday = function(hours) {
				var d = new Date().getDay();
				var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
				var day = days[ d ];
				if(hours) {
					var len = hours.length;
					for(var i = 0; (i <= d && i < len); i++) {
						var todayOpening = "";
						var todayClosing = "";
						if(hours[i].open.day == d) {
							todayOpening = getFormattedTime(hours[i].open.time);
							todayClosing = getFormattedTime(hours[i].close.time);
							return day + ': ' + todayOpening + ' - ' + todayClosing;
						}
					}
					return day + ': Closed';
				}
				return day + ': ';
			}
			

			// ---------------------------------------------- //
			// Common
			
			var getFormattedTime = function (fourDigitTime){
				if(!fourDigitTime) {
					return "";	
				}
				var hours24 = parseInt(fourDigitTime.substring(0,2), 10);
				var hours = ((hours24 + 11) % 12) + 1;
				var amPm = hours24 > 11 ? 'pm' : 'am';
				var minutes = fourDigitTime.substring(2);
			
				return hours + ':' + minutes + amPm;
			};
	
			// ---------------------------------------------- //


			// Return the public API.
			return({
				getHoursToday: getHoursToday
				
				
			});


		}
	);

})( angular, vend );