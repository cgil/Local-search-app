(function( ng, app ){

	"use strict";

	app.controller(
		"serp.SerpController",
		function( $scope, $location, requestContext, apiService, _ ) {
			
			$scope.serpWaypoints = [];
			
			$scope.initSerp = function() {
				$scope.serpWaypoints = [];
				var tags = ($location.search()).tags;
				apiService.getWaypointsByTags(tags)
				.then (function (data) {
					if(data.waypoints && data.waypoints.length > 0) {
						var waypoints = data.waypoints;
						for (var i = 0; i < waypoints.length; i++) {
							$scope.serpWaypoints.push(waypoints[i]);
						}
					}
				});
			}
			
			$scope.doSearch = function(input) {
				if(input) {
					var safeInput = encodeURIComponent(input).replace(/[!'()*]/g, escape);
				}
				$location.search({"tags": safeInput}).path("/serp");
			
			}
			
			$scope.doTag = function(wp) {
				if(wp && wp.waypoint && wp.waypoint != undefined) {
					localStorage.setItem('tagWaypointData', JSON.stringify(wp));

					//var waypoint = wp.waypoint;
					//var safeWaypoint = encodeURIComponent(waypoint).replace(/[!'()*]/g, escape);
					//$location.search({"waypoint": safeWaypoint}).path("/tag");
					$location.path("/tag");
				}
			}
			
			$scope.doLocation = function(waypoint) {
				if(waypoint && waypoint != undefined) {
					localStorage.setItem('waypoint', JSON.stringify(waypoint));
					var safeWaypoint = encodeURIComponent(waypoint.waypoint).replace(/[!'()*]/g, escape);
					$location.search({"waypoint": safeWaypoint}).path("/location");
				}
			}

			// --- Define Controller Methods. ------------------- //
	

			// ...


			// --- Define Scope Methods. ------------------------ //


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard.serp" );


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
						$scope.initSerp();
						return;

					}
					
					// Update the view that is being rendered.
					$scope.subview = renderContext.getNextSection();

				}
				
			);


			// --- Initialize. ---------------------------------- //


			$scope.setWindowTitle( "Vendalize Search" );


		}
	);

})( angular, vend );