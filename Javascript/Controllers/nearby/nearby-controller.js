(function( ng, app ){

	"use strict";

	app.controller(
		"nearby.NearbyController",
		function( $scope, $location, requestContext, geolocationService, apiService, _ ) {

			$scope.waypoints = [];
			$scope.errorMessage = ""
			// --- Define Controller Methods. ------------------- //
			//Initiate the nearby controller
			$scope.initNearby = function() {
				$scope.waypoints = [];
				$scope.getByGeoLocation();
			}
			
			//Get the users geolocation
			$scope.getByGeoLocation = function() {
				geolocationService.getGeoLocation($scope)
				.then (function (position) {
					if(position.coords) {
						$scope.position = position;
						apiService.getNearbyWaypoints(position.coords.latitude, position.coords.longitude )
						.then (function (data) {
							if(data.waypoints) {
								var waypoints = data.waypoints;
								for (var i = 0; i < waypoints.length; i++) {					
									$scope.waypoints.push(waypoints[i]);
								}
							}
							else {
						$scope.errorMessage = "Could not find any waypoints nearby.";	
					}
						});
					}
					else {
						$scope.errorMessage = "Could not load your geolocation: make sure your device has " +
							"location sharing turned on and you are allowing Vendalize to track your location.";	
					}
				});
			}
			
			
			$scope.doLocation = function(waypoint) {
				if(waypoint && waypoint != undefined) {
					localStorage.setItem('waypoint', JSON.stringify(waypoint));
					var safeWaypoint = encodeURIComponent(waypoint.waypoint).replace(/[!'()*]/g, escape);
					$location.search({"waypoint": safeWaypoint}).path("/location");
				}
			}

			// ...


			// --- Define Scope Methods. ------------------------ //


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard.nearby" );


			// --- Define Scope Variables. ---------------------- //


			// The subview indicates which view is going to be rendered on the page.
			$scope.subview = renderContext.getNextSection();


			// --- Bind To Scope Events. ------------------------ //


			// I handle changes to the request context.
			$scope.$on(
				"requestContextChanged",
				function() {

					// Make sure this change is relevant to this controller.
					if ( ! renderContext.isChangeRelevant() ) {
						$scope.initNearby();
						return;

					}

					// Update the view that is being rendered.
					$scope.subview = renderContext.getNextSection();

				}
			);


			// --- Initialize. ---------------------------------- //


			$scope.setWindowTitle( "Vendalize" );


		}
	);

})( angular, vend );