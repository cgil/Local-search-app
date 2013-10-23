(function( ng, app ){

	"use strict";

	app.controller(
		"login.LoginController",
		function( $scope, $rootScope, $location, apiService, requestContext, $http, facebookService, _ ) {
			
			// --- Define Controller Methods. ------------------- //
			
			$scope.initLogin = function() {
				$scope.login();	
				
			}
			
			$scope.initLoggedIn = function() {
				var token = localStorage.getItem('fb_access_token');
				if (token) {
					FB.api('/me/?access_token='+token, function(response) {
						var username = '';
						var fname = '';
						var lname = '';
						if (response.id) {
							localStorage.setItem('fbId', response.id);
						}
						if(response.username) {
							username = response.username;
						}
						if(response.first_name) {
							fname = response.first_name;
							if(response.last_name) {
								lname = response.last_name;
							}
						}
						//Need both fbId and a username for the user to proceed
						if (response.id && username) {
							//Store fb data
							$scope.authenticateViaFacebook(response);
							//Locally store the username for this user
							localStorage.setItem('username', username);
							if(fname)  {
								localStorage.setItem('fname', fname);
								if(lname)  {
									localStorage.setItem('lname', lname);	
								}	
							}
							//Hide login button
							$rootScope.showLogin = false;
							$rootScope.$apply();	
						}
						else {
							console.log('No user data provided! Redirecting!');
							$scope.doLoginFailed();	
						}
						
					});
				}
			}
			
			$scope.doHome = function() {
				$location.path("/home");
			}
			
			$scope.doLoginFailed = function() {
				$location.path("/loginFailed");
			}
	
			// ...


			// --- Define Scope Methods. ------------------------ //
			
			$scope.authenticateViaFacebook = function(params) {
				apiService.fbAuth(params)
				.success(function (response) {
					//$scope.updateSession(response);
				});
			}


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
						$scope.initLogin();
						return;

					}

					// Update the view that is being rendered.
					$scope.subview = renderContext.getNextSection();

				}
			);
			
			
			
			// --- Facebook action changes. -----------------------------//
			$scope.info = {};
		
			$rootScope.$on("fb_statusChange", function (event, args) {
				$rootScope.fb_status = args.status;
				$rootScope.$apply();
			});
			$rootScope.$on("fb_get_login_status", function () {
				facebookService.getLoginStatus();
			});
			$rootScope.$on("fb_login_failed", function () {
				console.log("fb_login_failed");
			});
			$rootScope.$on("fb_logout_succeded", function () {
				console.log("fb_logout_succeded");
				$rootScope.id = "";
				$rootScope.showLogin = true;
				$rootScope.$apply();
			});
			$rootScope.$on("fb_logout_failed", function () {
				console.log("fb_logout_failed!");
			});
		
			$rootScope.$on("fb_connected", function (event, args) {
				/*
				 If facebook is connected we can follow two paths:
				 The users has either authorized our app or not.
		
				 ---------------------------------------------------------------------------------
				 http://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus/
		
				 the user is logged into Facebook and has authenticated your application (connected)
				 the user is logged into Facebook but has not authenticated your application (not_authorized)
				 the user is not logged into Facebook at this time and so we don't know if they've authenticated
				 your application or not (unknown)
				 ---------------------------------------------------------------------------------
		
				 If the user is connected to facebook, his facebook_id will be enough to authenticate him in our app,
				 the only thing we will have to do is to post his facebook_id to 'php/auth.php' and get his info
				 from the database.
		
				 If the user has a status of unknown or not_authorized we will have to do a facebook api call to force him to
				 connect and to get some extra data we might need to unthenticated him.
				 */
		
				var params = {};
				
				
				function authenticateViaFacebook(params) {
					apiService.fbAuth(params)
					.success(function (response) {
						$scope.updateSession(response);
					});
				}
				
		
				if (args.userNotAuthorized === true) {
					//if the user has not authorized the app, we must write his credentials in our database
					console.log("user is connected to facebook but has not authorized our app");
					FB.api(
						{
							method:'fql.multiquery',
							queries:{
								'q1':'SELECT uid, first_name, last_name FROM user WHERE uid = ' + args.fbId
							}
						},
						function (data) {
							//let's built the data to send in order to create our new user
							params = {
								fbId:data[0]['fql_result_set'][0].uid,
								firstname:data[0]['fql_result_set'][0].first_name,
								lastname:data[0]['fql_result_set'][0].last_name,
								username:data[0]['fql_result_set'][0].first_name+'-'+data[0]['fql_result_set'][0].last_name
							}
			
							authenticateViaFacebook(params);
						});
				}
				else {
					console.log("user is connected to facebook and has authorized our app");
					//the parameter needed in that case is just the users facebook id
					params = {'fbId':args.fbId};
					authenticateViaFacebook(params);
				}
				
				$rootScope.showLogin = false;
				$rootScope.$apply();
				//$scope.doHome();
			});
		
		
			$rootScope.updateSession = function (response) {
				//Update session information
				if(response.users && response.users.length > 0) {
					localStorage['username'] = response.users[0].username;
					localStorage['fbId'] = response.users[0].fbId;
				}
			};
		
		
			// button functions
			$scope.getLoginStatus = function () {
				facebookService.getLoginStatus();
			};
		
			$scope.login = function () {
				
				var url = "//www.facebook.com/dialog/oauth?";
            	var queryParams = ["client_id=158876100946384",
                  "redirect_uri=http://vendalize.com/loggedIn.html", 
                  "response_type=token"];
            	var queryString = queryParams.join("&");
            	url += queryString;
            	window.top.location = url;
				
				
				
				/*
				FB.login(function (response) {
					if (response.authResponse) {
						$rootScope.$broadcast('fb_connected', {
							fbId:response.authResponse.userID,
							userNotAuthorized:true
						});
					} else {
						$rootScope.$broadcast('fb_login_failed');
					}
				}, {scope:'read_stream, publish_stream, email'});			
				
				$scope.getLoginStatus();
				*/
				
			};
		
			$scope.logout = function () {
				facebookService.logout();
				//clear session and storage
				localStorage.clear();
			};
		
			$scope.unsubscribe = function () {
				facebookService.unsubscribe();
			}
		
			
			//
			
			

			// --- Initialize. ---------------------------------- //


			$scope.setWindowTitle( "Vendalize Login" );

		}
	);

})( angular, vend );