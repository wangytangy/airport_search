require 'byebug'
require 'csv'
require 'json'

AIRPORTS_ARRAY = []

CSV.foreach("../airports_us.csv") do |row|
  temp_hash = {
    id: row[0],
    name: row[1],
    city: row[2],
    country: row[3],
    IATA: row[4],
    ICAO: row[5],
    lat: row[6],
    lng: row[7]
  }
  AIRPORTS_ARRAY.push(temp_hash)
end

File.open("../airports_us.json", "w") do |f|
  f.write(AIRPORTS_ARRAY.to_json)
end


# [
#   {
#     id: 3411,
#     name:
#     city:
#     country:
#     IATA:
#     ICAO:
#     lat:
#     lng:
#   }
# ]
