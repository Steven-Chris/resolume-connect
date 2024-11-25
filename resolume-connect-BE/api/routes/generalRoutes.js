const express = require("express");
const router = express.Router();
const { connectCheck, getClips } = require("../controllers/generalController");

router.post("/connect", connectCheck);
router.get("/get-clips", getClips);

module.exports = router;
