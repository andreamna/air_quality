import json

# Load the existing JSON file
with open("updated_simplified_cities.json", "r") as file:
    cities = json.load(file)

# Prepare a new list to store simplified city data
simplified_cities = []

# Iterate through each city and extract only required fields
for city in cities:
    try:
        # Extract necessary data
        simplified_city = {
            "id": city.get("id"),
            "name": city.get("name"),
            "country": city.get("country"),
            "lat": city.get("lat") or city.get("coord", {}).get("lat"),
            "lon": city.get("lon") or city.get("coord", {}).get("lon")
        }
        
        # Ensure lat and lon exist before adding
        if simplified_city["lat"] is not None and simplified_city["lon"] is not None:
            simplified_cities.append(simplified_city)
        else:
            print(f"Skipping city {city.get('name')} due to missing coordinates.")

    except Exception as e:
        print(f"Error processing city {city.get('name')}: {e}")

# Save the simplified JSON file
with open("simplified_cities.json", "w") as file:
    json.dump(simplified_cities, file, indent=4)

print("Simplified JSON saved to simplified_cities.json.")
