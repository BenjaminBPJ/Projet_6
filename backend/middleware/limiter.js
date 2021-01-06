const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5, // 5 requetes toutes les 3 minutes par IP
    message: "Vous avez crée trop de requêtes , vous devez attendre 3 minutes",
  });

module.exports = limiter;

