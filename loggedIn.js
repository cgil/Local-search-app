var processLogin = function() {
	var queryParts = $.deparam.querystring();
	var hashParts = $.deparam.fragment();
	//Success logging in
	if(hashParts && hashParts.access_token) {
		localStorage.setItem('fb_access_token', hashParts.access_token);
		redirectTo('loggedIn');
	}	//error logging in
	else if (queryParts && queryParts.error) {
		redirectTo('loginFailed');
	}
}


var redirectTo = function(location) {
	window.location = "http://vendalize.com/#/"+location;
}