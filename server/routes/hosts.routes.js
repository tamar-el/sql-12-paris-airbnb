// Router for /api/hosts - only paths -> controller functions (no logic, no SQL).
//
// Step 4: GET /:hostId/listings -> all the places of one host
const express = require("express");
const router = express.Router();

const hostsController = require("../controllers/hosts.controller");

router.get("/:hostId/listings", hostsController.getHostListings);

module.exports = router;