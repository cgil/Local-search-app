import web
import json
import sunburnt
import uuid
import pycassa
from pycassa.pool import ConnectionPool
from pycassa.columnfamilymap import ColumnFamilyMap
import datetime
from Classes import data
from Classes import config
from googleplaces import GooglePlaces, types, lang
from math import modf
import re
 
urls = (
  "/dynamic/api/v1/users\.(json|xml)", 'UserSearch',
  "/dynamic/api/v1/tags\.(json|xml)", 'TagSearch',
  "/dynamic/api/v1/tags/([a-zA-Z'!\.,_-]{2,30})\.(json|xml)", 'SearchByOneTag',
  "/dynamic/api/v1/waypoints\.(json|xml)", 'WaypointSearch',
  "/dynamic/api/v1/waypoints/(.+)\.(json|xml)", 'OneWaypoint'
  
)
app = web.application(urls, globals())

class UserSearch:
    def GET(self, format):
        params = web.input(username='')
        params = web.input(fbId='')
        
        web.header('Content-Type', 'application/json')
        responseDict = {'users': [], 'response':""}
        user = getUser(params)
        if user:
            responseDict['users'].append(user)
            
            response = {}
            response['status'] = 'Success'
            response['answer'] = 'Success finding user'
            responseDict['response'] = response
        else:
            response = {}
            response['status'] = 'Failure'
            response['answer'] = 'Failed to find user'
            responseDict['response'] = response
            
        return json.dumps(responseDict)
    
    def POST(self, format): 
        params = web.input(username='')
        params = web.input(fbId='')
        params = web.input(fname='')
        params = web.input(lname='')
        
        web.header('Content-Type', 'application/json')
        responseDict = {'users': [], 'response':''}
        user = getUser(params)
        if user:
            responseDict['users'].append(user)
            response = {}
            response['status'] = 'Success'
            response['answer'] = 'Success finding user'
            responseDict['response'] = response
            
            return json.dumps(responseDict)
        else:
            responseDict['response'] = setUser(params)
            return json.dumps(responseDict)
            

class TagSearch:
    def GET(self, format):
        params = web.input(sortBy = '')
        params = web.input(orderBy = '')    # ascending/descending
        params = web.input(limit = '')
        params = web.input(offset = '')
        params = web.input(q = '')
        params = web.input(waypoint = '')
        
        if getAttribute(params, 'waypoint'):
            wp = params.waypoint
            wp = wp.lower()
            wp = wp.replace("-", " ")
            wp = re.sub('[^\w\s]+','', wp)
        else:
            wp = '*'
        
        responseDict = {'tags':[]}
        web.header('Content-Type', 'application/json')
        
        si = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.node_entries/")
        si_user = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.users/")
        
        response = si.query(waypoint_c=wp)
        if getAttribute(params, 'sortBy') and params.sortBy:
            sortBy = params.sortBy
            if getAttribute(params, 'orderBy') and params.orderBy:
                if params.orderBy == 'descending':
                    sortBy = '-' + sortBy
                    
            response = response.sort_by(sortBy)
            
        response = response.execute(constructor=data.NodeEntry)
        for result in response:
            unique = True   #Only return unique tags
            for obj in responseDict['tags']:
                if result.tag == obj['tag']:
                    unique = False
                    break
            if unique:
                node = {}
                node['tag'] = result.tag
                node['user'] = result.user
                node['waypoint'] = result.waypoint
                user_data = si_user.query(fbid=result.fbid).execute(constructor=data.User)
                if len(user_data) > 0:
                    node['fname'] = user_data[0].fname or ''
                    node['lname'] = user_data[0].lname or ''
                else:
                    node['fname'] = ''
                    node['lname'] = ''
            
                responseDict['tags'].append(node)          
        return json.dumps(responseDict)
            
class SearchByOneTag:
    def GET(self, tag, format):
        params = web.input(waypoint = '')
        return 'tag: ' + web.websafe(tag) + ' format: ' +web.websafe(format) + ' waypoint: ' + web.websafe(params.waypoint)
               

    def DELETE(self, tag, format):
        params = web.input(waypoint = '')
        return 'tag: ' + web.websafe(tag) + ' format: ' +web.websafe(format) + ' waypoint: ' + web.websafe(params.waypoint)


class WaypointSearch:
    def GET(self, format):
        params = web.input(location = '')
        params = web.input(tags = '')
        inTag = web.websafe(params.tags)
        responseDict = {'waypoints':[]}
        web.header('Content-Type', 'application/json')
        if getAttribute(params, 'location') is not None:
            location = params.location
            location = location.strip().split(',')
            if len(location) == 2:
                i = 0
                results = getNearbyWaypoints(location[0], location[1])
                for place in results.places:
                    if i > 9:
                        break
                    node = {}
                    
                    node['waypoint'] = place.name
                    node['location'] = place.vicinity
                    node['rating'] = formatRating(place.rating)
                    node['lat_lng'] = place.geo_location
                    node['googleid'] = place.id
                    node['googleReference'] = place.reference
                    responseDict['waypoints'].append(node) 
                    i+=1
            return json.dumps(responseDict) 
        else:     
            si = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.node_entries/")
            si_wp = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.waypoints/")
            response = si.query( si.Q(tag=inTag) | si.Q(waypoint=inTag) ).execute(constructor=data.NodeEntry)
            for result in response:
                unique = True   #Only return unique tags
                for obj in responseDict['waypoints']:
                    if result.waypoint == obj['waypoint']:
                        unique = False
                        break
                if unique:
                    wp_data = si_wp.query(waypoint_c=result.waypoint_c).execute(constructor=data.Waypoint)
                    node = {}
                    node['tag'] = result.tag
                    node['user'] = result.user
                    node['waypoint'] = result.waypoint
                    #node['location'] = result.neighborhood
                    #fake data
                    #node['distance'] = '(0.4 mi)'
                    #node['hours'] = 'Mon: 10:00am-5:00pm'
                    if len(wp_data) > 0:
                        wp = wp_data[0]
                        node['location'] = wp.location
                        node['rating'] = wp.rating
                        node['number'] = wp.number
                    responseDict['waypoints'].append(node)          
            return json.dumps(responseDict)


class OneWaypoint:
    def GET(self, waypoint, format):
        params = web.input(q = '')
        params = web.input(reference = '');
        waypoint = web.websafe(waypoint)
        
        responseDict = {'waypoints':[]}
        web.header('Content-Type', 'application/json')
        if waypoint is not None:
            waypoint = waypoint.replace("-", " ")
                
            place = getOneWaypoint(waypoint, params.reference)
            if place:
                details = place.details
                node = {}
                
                node['waypoint'] = getAttribute(details, 'name')
                node['number'] = getAttribute(details, 'formatted_phone_number')
                node['location'] = place.vicinity
                node['hours'] = getAttribute(details, 'opening_hours.periods')
                node['rating'] = formatRating(getAttribute(details, 'rating'))
                node['lat_lng'] = getAttribute(details, 'geometry.location')
                node['googleid'] = place.id
                node['googleReference'] = place.reference
                responseDict['waypoints'].append(node) 
        return json.dumps(responseDict) 
    
    def POST(self, waypoint, format): 
        params = web.input(user='')
        params = web.input(googleid='')
        params = web.input(location='')
        params = web.input(rating='')
        params = web.input(lat='')
        params = web.input(lng='')
        params = web.input(number='')
        params = web.input(fbid='')
        params = web.input(fname='')
        params = web.input(lname='')
        params = web.input(bias='')
        
        params = web.input(tags=[])
        tags = params.tags                    #Get a reference to array as it can get overridden 

        waypoint = waypoint.replace("-", " ")
        
        if getAttribute(params, 'location') is None:
            params.location = ''
        if getAttribute(params, 'rating') is None:
            params.rating = ''
        if getAttribute(params, 'lat') is None:
            params.lat = ''
        if getAttribute(params, 'lng') is None:
            params.lng = ''
        if getAttribute(params, 'number') is None:
            params.number = ''
        if getAttribute(params, 'fbId') is None:
            params.fbId = ''
        if getAttribute(params, 'fname') is None:
            params.fname = ''
        if getAttribute(params, 'lname') is None:
            params.lname = ''
        if getAttribute(params, 'bias') is None:
            params.bias = 'p'
        seeder = 'n'
        
        #Use pycassa to insert tags
        pool = ConnectionPool('vendalize')
        cfmap = pycassa.ColumnFamilyMap(data.NodeEntry, pool, 'node_entries')    #map node_entries to NodeEntry Class
        cfmapWaypoint = pycassa.ColumnFamilyMap(data.Waypoint, pool, 'waypoints')    #map waypoints to Waypoint Class

        #use sunburnt to get existing waypoint to insert or update
        si = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.waypoints/")
        si_node = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.node_entries/")

        for i in range(len(tags)):      
            timestamp = str((datetime.datetime.utcnow()).strftime("%Y-%m-%dT%H:%M:%S.%fZ")) #timestamp UTC
            
            if params.googleid:
                response = si.query(googleid=params.googleid).execute(constructor=data.Waypoint)
                if len(response) > 0:   #waypoint already exists so update it
                    result = response[0]
                    key = result.key
                    waypoint_c = waypoint.lower()
                    waypoint_c = re.sub('[^\w\s]+','', waypoint_c)
                    
                    waypointNode = data.Waypoint(key, timestamp, waypoint, params.googleid, params.googlereference, params.location, params.rating, params.lat, params.lng, params.number, waypoint_c=waypoint_c)
                    cfmapWaypoint.insert(waypointNode)
                    #insert a node with a reference to the waypoint if unique to user
                    node_data = si_node.query(fbid=params.fbId).query(user=params.user).query(waypoint_c=waypoint_c).query(tag=tags[i]).execute(constructor=data.NodeEntry)
                    if len(node_data) == 0:
                        seeder_node_data = si_node.query(waypoint_c=waypoint_c).query(tag=tags[i]).execute(constructor=data.NodeEntry)
                        if len(seeder_node_data) == 0:
                            seeder = 'y'
                        else:
                            seeder = node_data[0].seeder
                        node = data.NodeEntry(uuid.uuid4(), timestamp, waypoint, params.user, params.fbId, tags[i], key, params.lat, params.lng, waypoint_c=waypoint_c, bias=params.bias, seeder=seeder)
                        cfmap.insert(node)
                    elif node_data[0].bias != params.bias:  #different bias, update existing record
                        seeder = node_data[0].seeder
                        node = data.NodeEntry(node_data[0].key, timestamp, waypoint, params.user, params.fbId, tags[i], key, params.lat, params.lng, waypoint_c=waypoint_c, bias=params.bias, seeder=seeder)
                        cfmap.insert(node)
                else:   #make a new waypoint entry
                    key = uuid.uuid4()
                    waypoint_c = waypoint.lower()
                    waypoint_c = re.sub('[^\w\s]+','', waypoint_c)
                    
                    waypointNode = data.Waypoint(key, timestamp, waypoint, params.googleid, params.googlereference, params.location, params.rating, params.lat, params.lng, params.number, waypoint_c=waypoint_c)
                    cfmapWaypoint.insert(waypointNode)
                    #insert a new node with a reference to the waypoint if unique to user
                    node_data = si_node.query(fbid=params.fbId).query(user=params.user).query(waypoint_c=waypoint_c).query(tag=tags[i]).execute(constructor=data.NodeEntry)
                    if len(node_data) == 0:
                        seeder_node_data = si_node.query(waypoint_c=waypoint_c).query(tag=tags[i]).execute(constructor=data.NodeEntry)
                        if len(seeder_node_data) == 0:
                            seeder = 'y'
                        else:
                            seeder = node_data[0].seeder
                        node = data.NodeEntry(uuid.uuid4(), timestamp, waypoint, params.user, params.fbId, tags[i], key, params.lat, params.lng, waypoint_c=waypoint_c, bias=params.bias, seeder=seeder)
                        cfmap.insert(node)
                    elif node_data[0].bias != params.bias: #different bias, update existing record
                        seeder = node_data[0].seeder
                        node = data.NodeEntry(node_data[0].key, timestamp, waypoint, params.user, params.fbId, tags[i], key, params.lat, params.lng, waypoint_c=waypoint_c, bias=params.bias, seeder=seeder)
                        cfmap.insert(node)

        responseDict = {'data': params}
        web.header('Content-Type', 'application/json')
        return json.dumps(responseDict)
    

def getOneWaypoint(waypoint, reference = None):
    pool = ConnectionPool('vendalize')
    cfmapWaypoint = pycassa.ColumnFamilyMap(data.Waypoint, pool, 'waypoints')    #map waypoints to Waypoint Class
    si = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.waypoints/")
    wp = waypoint.lower()
    wp = re.sub('[^\w\s]+','', wp)
    response = si.query(waypoint_c=wp).execute(constructor=data.Waypoint)
    if len(response) > 0:   #found waypoint in database so use the googleid as reference for data
        result = response[0]
        key = result.key
        reference = result.googlereference
    
    google_places = GooglePlaces(config.Config.googlePlacesAPIKey)
    place = {}
    if reference:
        place = google_places.get_place(reference)
        if not place:
            return getOneWaypoint(waypoint, None)   #reference lookup failed, try text search
    else:
        query_result = google_places.text_search(
            query = waypoint)
        if len(query_result.places) > 0:
            place = (query_result.places)[0]
            place.get_details()
        
    return place

def getNearbyWaypoints(latitude, longitude):
    google_places = GooglePlaces(config.Config.googlePlacesAPIKey)
    query_result = google_places.nearby_search(
        lat_lng={'lat': latitude, 'lng': longitude},  
        rankby='distance',
        types = [types.TYPE_FOOD, types.TYPE_BAR, 
                 types.TYPE_RESTAURANT])
    return query_result

def formatRating(rating):
    if rating is not None:
        b,a = modf(rating)
        mod = ''
        if a:
            grade = {
                     0 : '',
                     1 : 'F',
                     2 : 'D',
                     3 : 'C',
                     4 : 'B',
                     5 : 'A'
                     }.get(a, '')
            if b:
                if b <= 0.3:
                    mod = '-'
                elif b >= 0.7:
                    mod = '+'    
            return grade+mod
        else:
            return ''
    else:
        return ''

def getAttribute(dict, k):
    restOfKey = None
    if '.' in k:
        key, restOfKey = k.split('.', 1)
    else:
        key = k
    if dict.has_key(key):
        if restOfKey is not None:
            return getAttribute(dict[key], restOfKey)
        else:
            return dict[key]
    else:
        return None
    
    
def getUser(params):
    si = sunburnt.SolrInterface("http://54.225.230.44:8983/solr/vendalize.users/")
    if getAttribute(params, 'fbId') and params.fbId:
        fbId = params.fbId
        response = si.query(fbid=fbId).execute(constructor=data.User)
        if len(response) > 0:
            result = response[0]
            user = {}
            user['fbId'] = result.fbid 
            user['username'] = result.username
            user['fname'] = result.fname
            user['lname'] = result.lname
            return user
        
    elif getAttribute(params, 'username') and params.username:
        userName = params.username
        response = si.query(username=userName).execute(constructor=data.User)
        if len(response) > 0:
            result = response[0]
            user = {}
            user['fbId'] = result.fbid 
            user['username'] = result.username
            user['fname'] = result.fname
            user['lname'] = result.lname
            return user
    return {}

def setUser(params):
            
    if getAttribute(params, 'fbId') and getAttribute(params, 'username'):
        pool = ConnectionPool('vendalize')
        cfmap = pycassa.ColumnFamilyMap(data.User, pool, 'users')    #map users to User Class     
        timestamp = str((datetime.datetime.utcnow()).strftime("%Y-%m-%dT%H:%M:%S.%fZ")) #timestamp UTC
        if getAttribute(params, 'fname') is None:
            params.fname = ''
        if getAttribute(params, 'lname') is None:
            params.lname = ''
        user = data.User(uuid.uuid4(), timestamp, params.fbId, params.username, fname=params.fname, lname=params.lname)
        cfmap.insert(user)
        
        response = {}
        response['status'] = 'Success'
        response['answer'] = 'Success inserting user'
        return response
    else:
        response = {}
        response['status'] = 'Failure'
        response['answer'] = 'Failed to insert user'
        return response
    
    
if __name__ == "__main__": 
    app.run()
application = app.wsgifunc()

