require 'byebug'
require 'csv'
require 'json'

AIRPORTS_ARRAY = {}

CSV.foreach("../data/airports_us.csv") do |row|
  # debugger
  airport_id = row[0]
  AIRPORTS_ARRAY[airport_id] = {
    id: row[0],
    name: row[1],
    city: row[2],
    country: row[3],
    IATA: row[4],
    ICAO: row[5],
    lat: row[6],
    lng: row[7]
  }
end

File.open("../data/airports_us.json", "w") do |f|
  f.write(AIRPORTS_ARRAY.to_json)
end


# {
#   3411: {
#     id: 3411,
#     name:
#     city:
#     country:
#     IATA:
#     ICAO:
#     lat:
#     lng:
#   }
# }
