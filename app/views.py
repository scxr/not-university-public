from app import app, db
from flask import Flask, render_template, url_for, request, jsonify
import os, requests, json, re
from bson import json_util
import math


states = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "District of Columbia": "DC",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota":	"SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY",
    "Puerto Rico": "PR"
}

@app.route('/', methods=["POST", "GET"])
def home():
    if request.method == "POST":
        water_col = db["rainfall"]
        plant_col = db["plants"]
        content = request.json

        city = content["city"]
        state = content["state"]
        plant = content["plant"]

        print(city, state, plant)

        waterdata = water_col.find_one({'city' : city.title(), 'state': states[state.title()]})
        if waterdata is None:
            return json.dumps({"error": "city or state not found"})

        plantdata = plant_col.find_one({'common_name': plant}) or plant_col.find_one({'scientific_name': plant})
        if plantdata is None:
            return json.dumps({"error": "plant not found"})

        # ceil precipitation values
        precipitation = ["min_precip", "max_precip"]
        units = ["cm", "inches"]
        for x in precipitation:
            for y in units:
                plantdata[x][y] = math.ceil(plantdata[x][y])

        data = {
            "waterdata": waterdata,
            "plantdata": plantdata
        }
        return json.dumps(data, sort_keys=True, indent=4, default=json_util.default)
    else:
        return "hello world"

@app.route('/weather/<city>',methods=['GET'])
def location(city):
    rainfall_col = db['rainfall']
    data = rainfall_col.find({'city': {'$regex': re.compile(city, re.IGNORECASE)}})

    return json.dumps(data, sort_keys=True, indent=4, default=json_util.dumps)


@app.route('/plants', methods=['GET'])
def plant_search():
    search = request.args.get('search')
    plants_col = db['plants']
    data = plants_col.find({'$or': [
        {'common_name': {'$regex': re.compile(search, re.IGNORECASE)}},
        {'scientific_name': {'$regex': re.compile(search, re.IGNORECASE)}}
    ]}).limit(10)
    return json.dumps(data, sort_keys=True, indent=4, default=json_util.dumps)

@app.route('/plants/<float:rainfall>', methods=['GET'])
def plants_by_rainfall(rainfall):
    plants_col = db['plants']
    data = plants_col.find({'$and': [
        {'max_precip.inches': {'$gt': rainfall}},
        {'min_precip.inches': {'$lt': rainfall}}
    ]}).limit(10)
    return json.dumps(data, sort_keys=True, indent=4, default=json_util.dumps)
    data = {'ip':request.remote_addr,'city':json_resp["city"]}
    return json.dumps(data, sort_keys=True, indent=4, default=json_util.default)

@app.route('/plant_info', methods=['POST'])
def search_plant():
    plant_name = request.form['plant_name']
    base_url = 'https://trefle.io/api/plants?'
    base_url_full_info = 'https://trefle.io/api/plants/'
    api_key = 'redacted' # remember to redact on sharing
    r = requests.get(f'{base_url}token={api_key}&q={plant_name}')
    json_resp = json.loads(r.text)
    plant_id = json_resp[0]["id"]
    full_info = requests.get(f'{base_url_full_info}{plant_id}?token={api_key}')
    data = json.loads(full_info.text)
    family_name = data['family']['name']
    scientific_name = data['scientific_name']
    image_urls= (data['images'][0]['url'],data['images'][1]['url']) # tuple
    division_order = data['order']['name']
    life_span = data['main_species']['specifications']['lifespan']
    common_name = data['common_name']
    life_duration = data['duration']
    data = {"family_name":family_name,
            "scientific_name":scientific_name,
            "image_urls":image_urls,
            "division_order":division_order,
            "lifespan":life_span,
            "common_name":common_name,
            "duration":life_duration}
    return json.dumps(data, sort_keys=True, indent=4, default=json_util.default)
