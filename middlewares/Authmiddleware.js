//check if the user is logged in or not
//validate the token and check if the user is logged in or not
//if the user is logged in then next() will be called
//if the user is not logged in then res.json({error: "User not logged in!"}
const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "KimetsuNoYaiba");
    req.user = validToken;
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

module.exports = { validateToken };
