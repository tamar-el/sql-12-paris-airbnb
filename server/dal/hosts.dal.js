// DAL for hosts
//
// Step 4: getListingsByHost(hostId)
//   WHERE host_id = @hostId AND price IS NOT NULL, ORDER BY price ASC
//   UPPER(host_name) AS hostName + the same card fields as Step 2

const { sql, poolPromise } = require("../config/db.js");

// Get all listings that belong to a specific host
async function getHostListings(hostId) {
    const pool = await poolPromise;

    const request = pool.request();

    request.input("hostId", sql.Float, hostId);

    const query = `
        SELECT
            CAST(id AS INT) AS id,
            CONCAT(room_type, ' in ', neighbourhood_cleansed) AS title,
            UPPER(property_type) AS propertyType,
            room_type AS roomType,
            neighbourhood_cleansed AS neighbourhood,
            CAST(price AS INT) AS pricePerNight,
            ROUND(review_scores_rating / 20.0, 1) AS stars,
            CAST(number_of_reviews AS INT) AS reviewsCount,
            CAST(bedrooms AS INT) AS bedrooms,
            CAST(beds AS INT) AS beds,
            CAST(accommodates AS INT) AS accommodates,
            UPPER(host_name) AS hostName
        FROM dbo.Paris_Airbnb_listings
        WHERE host_id = @hostId
          AND price IS NOT NULL
        ORDER BY price ASC
    `;

    const result = await request.query(query);

    return result.recordset;
}

module.exports = { getHostListings };
