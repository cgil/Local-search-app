(function( ng, app ){

	"use strict";

	app.controller(
		"home.HomeController",
		function( $scope, $location, requestContext, apiService, commonService, _ ) {

			$scope.tags = [];
			$scope.waypoint = {};
			$scope.visibility = 'none';
			
			$scope.initHome = function() {
				$scope.visibility = 'none';
				$scope.tags = [];
				$scope.waypoint = {};
				apiService.getOneWaypoint("Harris Grill")
				.then(function(data) {
					if(data) {
						$scope.waypoint = data;
						var hoursToday = commonService.getHoursToday($scope.waypoint.hours);						
						$scope.waypoint.hours = hoursToday;
					}
					else {
						console.log("No waypoint data found for waypoint: "+waypointName);	
					}
				});
				apiService.getMostRecentTags()
				.then (function (data) {
					if(data.tags) {
						$scope.visibility = 'table';
						var tags = data.tags;
						for (var i = 0; i < tags.length; i++) {
							tags[i].tag = '#'+tags[i].tag;
							if(tags[i].fname && tags[i].lname) {
								tags[i].user = tags[i].fname + ' ' + tags[i].lname;
							}
							$scope.tags.push(tags[i]);
						}
					}
				});	
			}
			
			$scope.doSearch = function(input) {
				if(input && input != undefined) {
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
			
			$scope.doSerp = function(tags) {
				if(tags && tags != undefined) {
					var safeTags = encodeURIComponent(tags.replace(/[#]/g, '')).replace(/[!'()*]/g, escape);
					$location.search({"tags": safeTags}).path("/serp");
				}
			}
			
			// --- Define Controller Methods. ------------------- //

			// ...


			// --- Define Scope Methods. ------------------------ //


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard.home" );


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
						$scope.initHome();
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