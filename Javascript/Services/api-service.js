(function( ng, app ) {

	"use strict";

	app.service(
		"apiService",
		function( restService ) {
	
			
			var getOneWaypoint = function(waypoint, reference) {
				var safeWaypoint = urlEncode(waypoint);
				var type = 'waypoints';
				var subject = safeWaypoint;
				var params = {};
				params['q'] = 'name,location,distance,hours,rating,phoneNumber';
				if(reference && reference != undefined) {
					params['reference'] = reference;
				}
				return restService.get(type, subject, params)
						.then (function(data) {
							if(data.waypoints && data.waypoints.length > 0) {
								return (data.waypoints)[0];
							}
							else {
								return {};	
							}
						});
			}
			
			var getNearbyWaypoints = function(lat, long) {
				var type = '';
				var subject = 'waypoints';
				var params = {};
				params['location'] = lat+","+long;
				
				return restService.get(type, subject, params);
			}
			
			var getWaypointsByTags = function(tags) {
				var type = '';
				var subject = 'waypoints';
				var params = {};
				params['q'] = 'name,location,distance,hours,rating,phoneNumber';
				params['tags'] = tags;
				
				return restService.get(type, subject, params);
			}
			
			var getTagsByWaypoint = function(waypoint) {
				if(!waypoint) {
					return;
				}
				var safeWaypoint = urlEncode(waypoint);
				
				var type = '';
				var subject = 'tags';
				var params = {};
				params['q'] = 'tag,user,waypoint';
				params['waypoint'] = safeWaypoint;
				params['limit'] = 5;
				
				return restService.get(type, subject, params);
		
			}
			
			var getMostRecentTags = function() {
				var type = '';
				var subject = 'tags';
				var params = {};
				params['q'] = 'tag,user,waypoint';
				params['sortBy'] = 'timestamp';
				params['orderBy'] = 'descending';
				params['limit'] = 5;
				
				return restService.get(type, subject, params);
			}
			
			
			var postTags = function(tags, wpData, bias) {
				if (!bias) {
					bias = 'p';	
				}
				if(wpData && wpData.waypoint && tags && tags.length > 0) {
					var safeWaypoint = urlEncode(wpData.waypoint);
					var type = 'waypoints';
					var subject = safeWaypoint;
					var params = {};
					params['bias'] = bias;
					params['tags'] = tags;
					if(localStorage.getItem("fbId")) {	//user logged in
						params['fbId'] = localStorage.getItem("fbId");
						if(localStorage.getItem("username")) {
							params['user'] = localStorage.getItem("username")
						}
						if(localStorage.getItem("fname")) {
							params['fname'] = localStorage.getItem("fname")
						}
						if(localStorage.getItem("lname")) {
							params['lname'] = localStorage.getItem("lname")
						}
					}
					else {	//No one logged in
						params['user'] = 'VendalizeNinja';	
					}
					
					if(wpData.waypoint)
						params['waypoint'] = wpData.waypoint; 
					if(wpData.location)
						params['location'] = wpData.location;
					if(wpData.number)
						params['number'] = wpData.number;
					if(wpData.rating)
						params['rating'] = wpData.rating;
					if(wpData.lat_lng && wpData.lat_lng.lat)
						params['lat'] = wpData.lat_lng.lat;
					if(wpData.lat_lng && wpData.lat_lng.lng)
						params['lng'] = wpData.lat_lng.lng;
					if(wpData.googleReference)
						params['googlereference'] = wpData.googleReference;
					if(wpData.googleid)
						params['googleid'] = wpData.googleid;
					
					return restService.post(type, subject, params);
				}
				else {
					return {'Response':'Failure', 'Status':'Invalid waypoint or tags'};	
				}
			}
			
			var fbAuth = function(data) {
				var fbAuthURL = "http://vendalize.com/dynamic/api/v1/users.json";
				var type = '';
				var subject = 'users';
				var params = {};
				if (data.id)
					params['fbId'] = data.id;
				if (data.username)
					params['username'] = data.username;
				if (data.first_name)
					params['fname'] = data.first_name;
				if (data.last_name)
					params['lname'] = data.last_name;
					
				return restService.post(type, subject, params);
			}
			


			// ---------------------------------------------- //
			// Common methods
			
			var urlEncode = function(data) {
				return encodeURIComponent(data.replace(/ /g, '-'));
			}
			
			
			// ---------------------------------------------- //


			// Return the public API.
			return({
				getOneWaypoint: getOneWaypoint,
				getTagsByWaypoint: getTagsByWaypoint,
				getNearbyWaypoints: getNearbyWaypoints,
				getWaypointsByTags: getWaypointsByTags,
				postTags: postTags,
				getMostRecentTags: getMostRecentTags,
				fbAuth: fbAuth
				
			});


		}
	);

})( angular, vend );