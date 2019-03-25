const express = require("express");
const router = express();

/**
 * @route GET api/users/test
 * @description Tests the users route
 * @access Public
 */
router.get("/test", (req, res) => {
  res.json({
    message: "Users module works!"
  });
});

module.exports = router;
