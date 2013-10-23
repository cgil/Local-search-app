(function( ng, app ){

	"use strict";

	app.controller(
		"tag.TagController",
		function( $scope, $location, requestContext, apiService, _ ) {

			$scope.newTags = [];
			$scope.wpData = {};
			$scope.waypoint;
			$scope.message = "";
			// --- Define Controller Methods. ------------------- //

			$scope.initTag = function() {
				$scope.serpWaypoints = [];
				//var waypoint = ($location.search()).waypoint;
				//$scope.waypoint = decodeURIComponent(waypoint);
				var wpDataString = localStorage.getItem('tagWaypointData');
				if(wpDataString) { 
					$scope.wpData = JSON.parse(wpDataString);
					if($scope.wpData.waypoint) {
						$scope.waypoint = $scope.wpData.waypoint;
						$scope.message = "Tagging: " + $scope.wpData.waypoint;
					}
					else {
						$scope.message = "You have not selected a waypoint to tag!" +
						 "Click # on a waypoint to tag it. <br/> " +
						 "And make sure you have cookies enabled!";	
					}
				}
				else {
					$scope.message = "You have not selected a waypoint to tag! <br/>" +
						 "Click # on a waypoint to tag it. <br/> " +
						 "And make sure you have cookies enabled!";		
				}
				
			}
			
			$scope.addTag = function(tag) {
				if(!tag || $.inArray(tag, $scope.newTags) > -1 ) {	//Tag is empty or duplicate tag
					return;	
				}
				var safeTag = tag.replace(/[^a-zA-Z0-9 ]+/g,"");
				if(safeTag) {
					$scope.newTags.push(safeTag);
				}
				$scope.text = '';	//Reset tag text input
			}
			
			
			$scope.postTags = function(tags) {
				if(!$scope.wpData || !$scope.wpData.waypoint || !tags || !(tags.length > 0) ) {
					return;	
				}
				apiService.postTags(tags, $scope.wpData, 'p')
				.then (function(response) {
					//post returns success	
				});
				$scope.newTags = [];
				$scope.doLocation($scope.wpData.waypoint);
				
			}
			
			$scope.doLocation = function(waypoint) {
				if(waypoint && waypoint != undefined) {
					var safeWaypoint = encodeURIComponent(waypoint).replace(/[!'()*]/g, escape);
					$location.search({"waypoint": safeWaypoint}).path("/location");
				}
			}
			// ...


			// --- Define Scope Methods. ------------------------ //


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard.tag" );


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
						$scope.initTag();
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