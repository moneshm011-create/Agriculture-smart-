// Smart Crop Price Forecasting & Best-Market Advisor
// MongoDB Collection Schema Reference

db.createCollection("crop_prices", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["crop", "market", "date", "pricePerQuintal"],
      properties: {
        crop: { bsonType: "string" },
        market: { bsonType: "string" },
        district: { bsonType: "string" },
        date: { bsonType: "date" },
        pricePerQuintal: { bsonType: "number" },
        arrivalQuintals: { bsonType: "number" },
        isSampleData: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("farmer_inputs");
db.createCollection("forecast_history");
db.createCollection("price_alerts");
