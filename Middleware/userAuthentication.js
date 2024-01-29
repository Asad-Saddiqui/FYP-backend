const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.send({
      status: "404",
      msg: "Authentication failed Token missing",
    });
  }

  jwt.verify(token, "asad1234", (err, user) => {
    if (err) {
      return res.send({
        status: "404",
        msg: "Authentication failed: Invalid token",
      });
    }
    // console.log("Working Middle Ware");
    req.user = user; // Attach the user to the request for future use
    next(); // Continue to the next middleware or route handler
  });
}

module.exports = authenticateJWT;
