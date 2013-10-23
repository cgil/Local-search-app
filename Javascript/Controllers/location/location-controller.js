(function( ng, app ){

	"use strict";

	app.controller(
		"location.LocationController",
		function( $scope, $location, requestContext, apiService, _ ) {
			
			$scope.tags = [];
			$scope.waypoint;

			// --- Define Controller Methods. ------------------- //
			
			$scope.initLocation = function() {
				$scope.tags = [];
				var waypointName = ($location.search()).waypoint;
				if(!waypointName) {
					return;	
				}
				
				waypointName = decodeURIComponent(waypointName);
				
				var storedWaypoint = "";
				
				if(localStorage["waypoint"]) {
					storedWaypoint = JSON.parse(localStorage["waypoint"]);
				}
				if(storedWaypoint.waypoint === waypointName) {
					$scope.waypoint = storedWaypoint;
					if($scope.waypoint.waypoint) {
						$scope.waypoint.waypoint = ($scope.waypoint.waypoint).replace(/[!'()*]/g, '');	
					}
					apiService.getOneWaypoint($scope.waypoint.waypoint, $scope.waypoint.googleReference)
					.then(function(data) {
						if(data) {
							$scope.waypoint = data;
							var hoursToday = $scope.getHoursToday($scope.waypoint.hours);						
							$scope.waypoint.hours = hoursToday;
						}
						else {
							console.log("No waypoint data found for waypoint: "+waypointName);	
						}
					});
					apiService.getTagsByWaypoint($scope.waypoint.waypoint)
					.then (function (data) {
						if(data.tags) {
							var tags = data.tags;
							for (var i = 0; i < tags.length; i++) {
								$scope.tags.push(tags[i]);
							}
						}
					});
				}
				else {		
					waypointName = (waypointName).replace(/[!'()*]/g, '');
					apiService.getOneWaypoint(waypointName)
					.then(function(data) {
						if(data) {
							$scope.waypoint = data;
							var hoursToday = $scope.getHoursToday($scope.waypoint.hours);						
							$scope.waypoint.hours = hoursToday;
							apiService.getTagsByWaypoint(decodeURIComponent($scope.waypoint.waypoint))
							.then (function (data) {
								  if(data.tags) {
									  var tags = data.tags;
									  for (var i = 0; i < tags.length; i++) {
										  $scope.tags.push(tags[i]);
									  }
								  }
							  });
						}
						else {
							console.log("No waypoint data found for waypoint: "+waypointName);	
						}
					});
				}
					  			
			}
			
			$scope.vote = function(tag, bias) {
				if(!$scope.waypoint || !tag ) {
					return;	
				}
				apiService.postTags(tag.tag, $scope.waypoint, bias)
				.then (function(response) {
					//post returns success	
				});
				
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
			
			$scope.doSerp = function(tags) {
				if(tags && tags != undefined) {
					var safeTags = encodeURIComponent(tags).replace(/[!'()*]/g, escape);
					$location.search({"tags": safeTags}).path("/serp");
				}
			}

			// ...


			// --- Define Scope Methods. ------------------------ //
				$scope.getHoursToday = function(hours) {
				var d = new Date().getDay();
				var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
				var day = days[ d ];
				if(hours) {
					var len = hours.length;
					for(var i = 0; (i <= d && i < len); i++) {
						var todayOpening = "";
						var todayClosing = "";
						if(hours[i].open.day == d) {
							todayOpening = $scope.getFormattedTime(hours[i].open.time);
							todayClosing = $scope.getFormattedTime(hours[i].close.time);
							return day + ': ' + todayOpening + ' - ' + todayClosing;
						}
					}
					return day + ': Closed';
				}
				return '';
			}
			
			$scope.getFormattedTime = function (fourDigitTime){
				if(!fourDigitTime) {
					return "";	
				}
				var hours24 = parseInt(fourDigitTime.substring(0,2), 10);
				var hours = ((hours24 + 11) % 12) + 1;
				var amPm = hours24 > 11 ? 'pm' : 'am';
				var minutes = fourDigitTime.substring(2);
			
				return hours + ':' + minutes + amPm;
			};


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard.location" );


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
						$scope.initLocation();
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