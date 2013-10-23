(function( ng, app ){

	"use strict";

	app.controller(
		"layouts.StandardController",
		function( $scope, $rootScope, $location, requestContext, facebookService, _ ) {
			
			$scope.initStandard = function() {
				if (localStorage.getItem("fbId")) {
					$rootScope.showLogin = false;

				}
				else {
					$rootScope.showLogin = true;
				}		
			}
			
			$scope.initStandard();

			// --- Define Controller Methods. ------------------- //
			$scope.doLogin = function() {
				$location.path("/login");
				
			}
			
			$scope.doHome = function() {
				$location.path("/home");
			}
			
			$scope.logout = function () {
				facebookService.logout();
				//clear session and storage
				localStorage.clear();
				$scope.doHome();
			};
			

			// ...


			// --- Define Scope Methods. ------------------------ //


			// ...


			// --- Define Controller Variables. ----------------- //


			// Get the render context local to this controller (and relevant params).
			var renderContext = requestContext.getRenderContext( "standard" );


			// --- Define Scope Variables. ---------------------- //


			// The subview indicates which view is going to be rendered on the page.
			$scope.subview = renderContext.getNextSection();

			// Get the current year for copyright output.
			$scope.copyrightYear = ( new Date() ).getFullYear();


			// --- Bind To Scope Events. ------------------------ //


			// I handle changes to the request context.
			$scope.$on(
				"requestContextChanged",
				function() {

					// Make sure this change is relevant to this controller.
					if ( ! renderContext.isChangeRelevant() ) {
						$scope.initStandard();
						return;

					}

					// Update the view that is being rendered.
					$scope.subview = renderContext.getNextSection();

				}
			);


			// --- Initialize. ---------------------------------- //


			// ...


		}
	);

})( angular, vend );