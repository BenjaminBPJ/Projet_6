const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ message: `Impossible de créer cette sauce` }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => { res.status(200).json(sauce); })
        .catch((error) => { res.status(404).json({ message: `Cette sauce n'existe pas` }); });
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ message: `Impossible de modifier cette sauce` }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ message: `Impossible de supprimer cette sauce` }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => {
            if (sauces == 0) {
                res.status(200).json({ message: `Aucune sauce pour le moment` });
            } else {
                res.status(200).json(sauces);
            }
        })
        .catch(() => { res.status(400).json({ message: `Les sauces sont indisponibles` }); });
}

exports.likeOrDislike = (req, res, next) => {
    const sauce = Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const like = req.body.like;
            const user = req.body.userId;
            const usersLiked = sauce.usersLiked;
            const usersDisliked = sauce.usersDisliked;
            const sauceId = req.params.id;
            const userId = req.body.userId;


            if (like == 1) { // Si like
                if (usersLiked.includes(userId)) { // Si deja liké on envoie une erreur json
                    res.status(403).json({ error: 'Impossible de liker deux fois la même sauce' });
                } else { // Sinon, on ajoute un like
                    Sauce.findOne({ _id: sauceId })
                        .then((sauce) => {
                            Sauce.updateOne({ _id: sauceId },
                                {
                                    $push: { usersLiked: user }, // ajoute l'userId au tableau usersLiked
                                    $inc: { likes: 1 }, 
                                })
                                .then(() => res.status(200).json({ message: 'Like' }))
                                .catch((error) => res.status(400).json({ error }));
                        })
                        .catch((error) => res.status(404).json({ error }));
                }


            } else if (like == -1) { // si dislike
                if (usersDisliked.includes(userId)) { // Si déjà dislike, renvoie une erreur json
                    res.status(403).json({ error: 'Impossible de disliker deux fois la même sauce' })
                } else { // sinon on ajoute un dislike
                    Sauce.findOne({ _id: sauceId })
                        .then((sauce) => {
                            Sauce.updateOne({ _id: sauceId },
                                {
                                    $push: { usersDisliked: user }, // ajoute l'utilisateur au tableau des usersDisliked
                                    $inc: { dislikes: 1 }, 
                                })
                                .then(() => res.status(200).json({ message: 'Dislike' }))
                                .catch((error) => res.status(400).json({ error }));
                        })
                        .catch((error) => res.status(404).json({ error }));
                }

            } else Sauce.findOne({ _id: sauceId }) // si l'utilisateur reclique sur j'aime ou j'aime pas
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) { // Si l'utilisateur avait un like, on va le retirer
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { likes: -1 }, // retire le like
                                $pull: { usersLiked: req.body.userId }, // retire l'utilisateur du tableau des likes
                                _id: sauceId
                            })
                            .then(() => { res.status(201).json({ message: 'Like retiré' }); })
                            .catch((error) => { res.status(400).json({ error: 'Like non retiré' }); });

                    } else {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: -1 }, // retire le dislike
                                $pull: { usersDisliked: req.body.userId }, //  retire l'utilisateur du tableau des dislikes
                                _id: sauceId
                            })
                            .then(() => { res.status(201).json({ message: 'Dislike retiré' }); })
                            .catch((error) => { res.status(400).json({ error: 'dislike non retiré' }); });
                    }
                })
                .catch((error) => { res.status(500).json({ error }); });
        })
        .catch(error => res.status(500).json({ error: 'Problème, impossible de liker' }));
}

