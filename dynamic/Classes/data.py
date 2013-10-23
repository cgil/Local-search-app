from pycassa.types import *

class NodeEntry:
    key = LexicalUUIDType()
    timestamp = UTF8Type()
    waypoint = UTF8Type()
    waypoint_c = UTF8Type()
    user = UTF8Type()
    tag = UTF8Type()
    waypointid = UTF8Type()
    lat = UTF8Type()
    lng = UTF8Type()
    fbid = UTF8Type()
    bias = UTF8Type()
    seeder = UTF8Type()
    
    def __init__(self, nodeid, timestamp, waypoint, user, fbid, tag, waypointid, lat, lng, waypoint_c=None, bias=None, seeder=None, **other_kwargs):
        self.key = nodeid
        self.timestamp = timestamp
        self.waypoint = waypoint
        self.user = user
        self.tag = tag
        self.waypointid = str(waypointid)
        self.waypoint_c = waypoint_c or ''
        self.lat = lat
        self.lng = lng
        self.fbid = fbid
        self.bias = bias or 'p'
        self.seeder = seeder or 'n'

    def __repr__(self):
        return 'NodeEntry("%s", "%s", "%s", "%s")' % (self.key, self.waypoint, self.user, self.tag)
     
     
class User:
    key = LexicalUUIDType()
    timestamp = UTF8Type()
    username = UTF8Type()
    fbid = UTF8Type()
    fname = UTF8Type()
    lname = UTF8Type()

    def __init__(self, userid, timestamp, fbid, username, fname=None, lname=None, **other_kwargs):
        self.key = userid
        self.username = username
        self.fbid = fbid
        self.timestamp = timestamp
        self.fname = fname or ''
        self.lname = lname or ''

    def __repr__(self):
        return 'User("%s", "%s", "%s")' % (self.key, self.fbid, self.username)
    
    
    
    
class Waypoint:
    key = LexicalUUIDType()
    timestamp = UTF8Type()
    waypoint = UTF8Type()
    waypoint_c = UTF8Type()
    googleid = UTF8Type()
    location = UTF8Type()
    rating = UTF8Type()
    lat = UTF8Type()
    lng = UTF8Type()
    number = UTF8Type()
    googlereference = UTF8Type()
    
    def __init__(self, waypointid, timestamp, waypoint, googleid, googlereference, location, rating, lat, lng, number, waypoint_c=None, **other_kwargs):
        self.key = waypointid
        self.timestamp = timestamp
        self.waypoint = waypoint
        self.googleid = googleid
        self.googlereference = googlereference
        self.location = location
        self.rating = rating
        self.lat = lat
        self.lng = lng
        self.number = number
        self.waypoint_c = waypoint_c or ''

    def __repr__(self):
        return 'Waypoint("%s", "%s")' % (self.key, self.waypoint)
     
    
    
    
    