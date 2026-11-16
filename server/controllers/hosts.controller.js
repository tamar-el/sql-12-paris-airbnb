// Controller for /api/hosts
//
// Step 4: getHostListings(req, res)
//   - hostId is not a number -> 400, no places found -> 404
//   - try/catch -> 500 { error }

const hostsDal = require("../dal/hosts.dal");

async function getHostListings(req, res) {
    try {
        const hostId = Number(req.params.hostId);

        if (!Number.isInteger(hostId) || hostId <= 0) {
            return res.status(400).json({
                error: "Invalid host ID"
            });
        }

        const listings = await hostsDal.getHostListings(hostId);

        if (listings.length === 0) {
            return res.status(404).json({
                error: "No listings found for this host"
            });
        }

        return res.status(200).json(listings);

    } catch (error) {
        console.error("Error getting host listings:", error);

        return res.status(500).json({
            error: "Failed to retrieve host listings"
        });
    }
}
module.exports = { getHostListings };