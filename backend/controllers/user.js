const bcrypt = require('bcrypt');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const passwordIsValide = require('../middleware/goodpassword')
const emailIsValide = require('../middleware/goodemail')

exports.signup = (req, res, next) => {
  if (emailIsValide.goodEmail(req.body.email) && passwordIsValide.goodPassword(req.body.password)) {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(() => res.status(400).json({ message: `Cet utilisateur existe déjà` }));
      })
      .catch(error => res.status(500).json({ error }));      
  } else {
    return res.status(404).json({ message: 'Votre adresse mail doit être correcte et votre mot de passe doit contenir au moins un chiffre, une minuscule, une majuscule et être composé de 8 caractères minimum !' });
  };
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' },
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};