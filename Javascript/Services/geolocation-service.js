(function( ng, app ) {

	"use strict";

	app.service(
		"geolocationService",
		function( $q, $window ) {
			
			//Get user geolocation
			var getGeoLocation = function(scope) {
				var deferred = $q.defer();
				
				navigator.geolocation.getCurrentPosition(function(position) {
					scope.$apply(function() {
						deferred.resolve(position);
					});
				}, function(error) {
					console.log(error.message);
					scope.$apply(function() {
						deferred.resolve([]);
					});
				},
					{ maximumAge: 600000, timeout: 10000 }
				);
				return deferred.promise;
			}
					

			// ---------------------------------------------- //
			// ---------------------------------------------- //


			// Return the public API.
			return({
				getGeoLocation: getGeoLocation
				
			});


		}
	);

})( angular, vend );