// Create an application module 
var vend = angular.module( "vend", ['infinite-scroll', 'filters'] );

// Configure the routing. The $routeProvider will be automatically injected into 
// the configurator.
vend.config(
	function( $routeProvider){

		// Typically, when defining routes, you will map the route to a Template to be 
		// rendered; however, this only makes sense for simple web sites. When you are 
		// building more complex applications, with nested navigation, you probably need 
		// something more complex. In this case, we are mapping routes to render "Actions" 
		// rather than a template.
		$routeProvider
			.when(
				"/home",
				{
					action: "standard.home"
				}
			)
			.when(
				"/serp",
				{
					action: "standard.serp"
				}
			)
			.when(
				"/nearby",
				{
					action: "standard.nearby"
				}
			)
			.when(
				"/tag",
				{
					action: "standard.tag"
				}
			)
			.when(
				"/location",
				{
					action: "standard.location"
				}
			)
			.when(
				"/login",
				{
					action: "standard.login"	
				}
			)
			.when(
				"/loggedIn",
				{
					action: "standard.loggedIn"	
				}
			)
			.when(
				"/loginFailed",
				{
					action: "standard.loginFailed"	
				}
			)
			.otherwise(
				{
					redirectTo: "/home"
				}
			)
		;

	}
);

vend.config(function($compileProvider){
  $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|geo):/);
});


//Facebook auth
vend.run(function ($rootScope, facebookService) {
        FB.init({
            appId:'158876100946384',
			channelURL : '//www.vendalize.com/channel.html',
            status:true,
            cookie:true,
            xfbml:true
        });
		
		FB.Event.subscribe('auth.statusChange', function(response) {
        	$rootScope.$broadcast("fb_statusChange", {'status': response.status});
    	});

});
