import io
import requests

from flask import Flask, request, send_file
from flask_cors import CORS

# Load cookie from file.
with open("cookie") as f:
    cookie_str = f.readline()
COOKIE = {}
for pair in cookie_str.split('; '):
    key, value = pair.split("=", 1)
    if key.isascii() and value.isascii():
        # Had an issue with encodings. Just skip over non-ascii things.
        COOKIE[key] = value

app = Flask(__name__)
CORS(app) # Set the app to allow cross origin requests

@app.route("/")
def catalog():
    print("Retrieving humble vault catalog...")
    data = []
    num_pages = 4 # Guilty knowledge, probably shouldn't hard code it but whatevs
    for ind in range(num_pages):
        response = requests.get(f"https://www.humblebundle.com/client/catalog?property=start&direction=desc&index={ind}")
        data += response.json()
    print(f"{len(data)} items found...")
    return data

@app.route("/download")
def get_game():
    machine_name = request.args.get("machine_name")
    filename = request.args.get("filename")
    print(f"Got a request for {filename}")
    
    HB_url = "https://www.humblebundle.com/api/v1/user/download/sign"
    response = requests.post(HB_url, data=f"machine_name={machine_name}&filename={filename}", cookies=COOKIE)
    download_url = response.json()["signed_url"]

    print("Downloading content...")
    download_bytes = requests.get(download_url).content
    print(f"Downloaded {len(download_bytes)} bytes")
    download_file = io.BytesIO(requests.get(download_url).content)
    print("Serving content to client...")
    return send_file(download_file, download_name=filename, as_attachment=True)
