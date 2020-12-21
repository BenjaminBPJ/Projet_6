const Sauce = require('../models/sauces');


module.exports = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            try {
                const sauceId = sauce.userId
                const userId = req.body.userId
                if (userId && userId !== sauceId) {
                    throw 'Invalid user ID';
                } else {
                    console.log(sauceId);
                    console.log(userId);
                    next();
                }
            } catch {
                res.status(401).json({ message: 'Token invalide' });
            }
        })
};