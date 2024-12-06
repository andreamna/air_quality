import json

with open("updated_simplified_cities.json", "r") as file:
    cities = json.load(file)

simplified_cities = []

for city in cities:
    try:
        simplified_city = {
            "id": city.get("id"),
            "name": city.get("name"),
            "country": city.get("country"),
            "lat": city.get("lat") or city.get("coord", {}).get("lat"),
            "lon": city.get("lon") or city.get("coord", {}).get("lon")
        }
        
        if simplified_city["lat"] is not None and simplified_city["lon"] is not None:
            simplified_cities.append(simplified_city)
        else:
            print(f"Skipping city {city.get('name')} due to missing coordinates.")

    except Exception as e:
        print(f"Error processing city {city.get('name')}: {e}")

with open("simplified_cities.json", "w") as file:
    json.dump(simplified_cities, file, indent=4)

print("Simplified JSON saved to simplified_cities.json.")
