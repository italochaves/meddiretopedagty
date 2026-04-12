import urllib.request
import json

url = "https://raw.githubusercontent.com/supliu/cid10-json/master/cid10.json"
output_file = "public/cid10.json"

try:
    print(f"Downloading CID-10 from {url}...")
    with urllib.request.urlopen(url) as response:
        data = response.read()
    
    # Optional: We could parse and minify it, or just save it directly
    json_data = json.loads(data)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False)
        
    print(f"Successfully saved {len(json_data)} CID records to {output_file}")
except Exception as e:
    print(f"Error downloading: {e}")
