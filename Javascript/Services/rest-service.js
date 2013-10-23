(function( ng, app ) {

	"use strict";

	app.service(
		"restService",
		function( $http ) {
					
			var formUrl = function(type, subject, params) {
				var vBaseUrl = '//vendalize.com/dynamic/api/v1';
				var typeRequest = '';
				var subjectRequest = '';
				if (type) {
					typeRequest = '/'+type;
				}
				if(subject) {
					subjectRequest = '/'+subject+'.json';
				}
				var url = vBaseUrl+typeRequest+subjectRequest;
				if(params) {
					url += '?';	
					var fields = encodeData(params);
					url += fields;
				}
				return url;
			}
	
			var encodeData = function(params) {
				return Object.keys(params).map(function(key) {
					return [key, params[key]].map(encodeURIComponent).join("=");
				}).join("&");
			}
	
	
			var get = function(type, subject, params) {
				var requestUrl = formUrl(type, subject, params);
				console.log(requestUrl);
				return $http.get(requestUrl)
				.then(function (response) {
					var data = response.data;
					return data;
				}, function(response) {
					var error = 'Can\'t get data';
					var data = 'Error: ' + response.data;
					return data;
				});
			};
			
			var post = function(type, subject, params) {
				$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
				var requestUrl = formUrl(type, subject, null);
				console.log(requestUrl);
				var postData = $.param(params, true);
				return $http.post(requestUrl, postData);
			}
			


			// ---------------------------------------------- //
			// ---------------------------------------------- //


			// Return the public API.
			return({
				get: get,
				post: post
				
			});


		}
	);

})( angular, vend );