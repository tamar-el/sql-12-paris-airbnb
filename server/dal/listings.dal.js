// DAL for listings - runs the SQL through the pool and returns the rows. No req / res here.
// Always pass values with .input(...) and use @name in the query.
//
// Step 2: getListings({ neighbourhood, roomType, minPrice, maxPrice, orderBy, limit })
//   SELECT TOP (@limit) ... FROM dbo.Paris_Airbnb_listings WHERE price IS NOT NULL ... ORDER BY ...
//   Build the fields in SQL: CONCAT (title), UPPER (propertyType), CAST ... AS INT, ROUND (stars)
//
// Step 3: getListingById(id)
//   DATEADD (hostSince), YEAR (hostSinceYear), DATEDIFF + GETDATE (yearsHosting), LEN (aboutLength)

const { sql, poolPromise } = require("../config/db.js");

async function getListings(filters) {
    const pool = await poolPromise;

    const conditions = ["price IS NOT NULL"];

    const request = pool.request();

    if (filters.neighbourhood) {
        conditions.push("neighbourhood_cleansed = @neighbourhood");
        request.input("neighbourhood", sql.NVarChar, filters.neighbourhood);
    }

    if (filters.roomType) {
        conditions.push("room_type = @roomType");
        request.input("roomType", sql.NVarChar, filters.roomType);
    }

    if (filters.minPrice !== undefined) {
        conditions.push("price >= @minPrice");
        request.input("minPrice", sql.Float, filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
        conditions.push("price <= @maxPrice");
        request.input("maxPrice", sql.Float, filters.maxPrice);
    }

    request.input("limit", sql.Int, filters.limit);

    const query = `
        SELECT TOP (@limit)
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
            CAST(accommodates AS INT) AS accommodates
        FROM dbo.Paris_Airbnb_listings
        WHERE ${conditions.join(" AND ")}
        ORDER BY ${filters.orderBy}
    `;

    const result = await request.query(query);

    return result.recordset;
}


async function getListingById(id) {
    const pool = await poolPromise;
    const request = pool.request();

    // מעבירים את ה-ID כפרמטר מאובטח
    request.input("id", sql.Int, id);

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

            CAST(bathrooms AS INT) AS bathrooms,
            latitude AS latitude,
            longitude AS longitude,

            CAST(host_id AS INT) AS hostId,
            host_name AS hostName,
            host_is_superhost AS hostIsSuperhost,

            DATEADD(day, host_since - 2, '1900-01-01') AS hostSince,

            YEAR(
                DATEADD(day, host_since - 2, '1900-01-01')
            ) AS hostSinceYear,

            DATEDIFF(
                year,
                DATEADD(day, host_since - 2, '1900-01-01'),
                GETDATE()
            ) AS yearsHosting,

            host_about AS hostAbout,
            CAST(LEN(host_about) AS INT) AS aboutLength

        FROM dbo.Paris_Airbnb_listings
        WHERE id = @id
    `;

    const result = await request.query(query);

    return result.recordset[0] || null;
}


module.exports = {
    getListings,
    getListingById
};

