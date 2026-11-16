// Controller for /api/listings - reads req.query / req.params, validates, calls the DAL,
// sets the status code and sends JSON. No SQL here.
//
// Step 2: getListings(req, res)
//   - read neighbourhood, roomType, minPrice, maxPrice, sort, limit from req.query
//   - validate: limit (default 20, max 50), minPrice/maxPrice are numbers, sort is "price" or "rating"
//     (anything else -> 400 { error })
//   - map sort to a column name here: ORDER BY can't be a parameter
//
// Step 3: getListingById(req, res)
//   - id is not a number -> 400, no such id -> 404
//   - convert hostIsSuperhost 't' / 'f' to true / false
//
// Every controller: try/catch -> 500 { error } when the DAL throws.


const listingsDal = require("../dal/listings.dal");

async function getListings(req, res) {
    try {
        const {
            neighbourhood,
            roomType,
            minPrice,
            maxPrice,
            sort,
            limit
        } = req.query;

        let parsedLimit = 20;

        if (limit !== undefined) {
            parsedLimit = Number(limit);

            if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
                return res.status(400).json({
                    error: "Limit must be a positive integer"
                });
            }

            if (parsedLimit > 50) {
                parsedLimit = 50;
            }
        }

        let parsedMinPrice;

        if (minPrice !== undefined) {
            parsedMinPrice = Number(minPrice);

            if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
                return res.status(400).json({
                    error: "minPrice must be a non-negative number"
                });
            }
        }

        let parsedMaxPrice;

        if (maxPrice !== undefined) {
            parsedMaxPrice = Number(maxPrice);

            if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
                return res.status(400).json({
                    error: "maxPrice must be a non-negative number"
                });
            }
        }

        const selectedSort = sort === undefined ? "price" : sort;

        let orderBy;

        if (selectedSort === "price") {
            orderBy = "price ASC";
        } else if (selectedSort === "rating") {
            orderBy = "review_scores_rating DESC";
        } else {
            return res.status(400).json({
                error: "sort must be price or rating"
            });
        }

        // 6. שליחת הפילטרים ל-DAL
        const listings = await listingsDal.getListings({
            neighbourhood,
            roomType,
            minPrice: parsedMinPrice,
            maxPrice: parsedMaxPrice,
            orderBy,
            limit: parsedLimit
        });

        // 7. החזרת התוצאות ללקוח
        return res.status(200).json(listings);

    } catch (error) {
        console.error("Error getting listings:", error);

        return res.status(500).json({
            error: "Failed to retrieve listings"
        });
    }
}
async function getListingById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid listing id"
            });
        }

        const listing = await listingsDal.getListingById(id);

        if (!listing) {
            return res.status(404).json({
                error: "Listing not found"
            });
        }

        listing.hostIsSuperhost = listing.hostIsSuperhost === "t";

        return res.status(200).json(listing);

    } catch (error) {
        console.error("Error getting listing:", error);

        return res.status(500).json({
            error: "Failed to retrieve listing"
        });
    }
}

module.exports = {
    getListings,
    getListingById
};
