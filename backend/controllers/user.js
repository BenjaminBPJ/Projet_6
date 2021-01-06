const bcrypt = require('bcrypt');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const passwordIsValide = require('../middleware/goodpassword')
const emailIsValide = require('../middleware/goodemail')
const maskData = require('maskdata');

const maskEmailOptions = {
  maskWith: "*", 
  unmaskedStartCharactersBeforeAt: 2,
  unmaskedEndCharactersAfterAt: 2,
  maskAtTheRate: false
};

exports.signup = (req, res, next) => {
  if(!emailIsValide.goodEmail(req.body.email) && !passwordIsValide.goodPassword(req.body.password)){
    return res.status(401).json({ message: 'Votre adresse mail doit être correcte et votre mot de passe doit contenir au moins un chiffre, une minuscule, une majuscule et être composé de 8 caractères minimum !  ' });
  }
  if (!emailIsValide.goodEmail(req.body.email)){
    return res.status(401).json({ message: 'Votre adresse mail doit être correcte ' });
  }
  if(!passwordIsValide.goodPassword(req.body.password)){
    return res.status(401).json({ message: 'Votre mot de passe doit contenir au moins un chiffre, une minuscule, une majuscule et être composé de 8 caractères minimum !' });
  } 
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: maskData.maskEmail(req.body.email, maskEmailOptions),
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(() => res.status(400).json({ message: `Cet utilisateur existe déjà` }));
      })
      .catch(error => res.status(500).json({ error }));       
}

exports.login = (req, res, next) => {
  User.findOne({ email: maskData.maskEmail(req.body.email, maskEmailOptions) })
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
        .catch(error => res.status(500).json({ message : `Entrez votre Email et votre mot de passe` }));
    })
    .catch(error => res.status(500).json({ error }));
};