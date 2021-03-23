module.exports = {
    goodPassword : function (input) {
        //Au moins un chiffre, une majuscule, une minuscule et au moins 8 caractères s'il l'un des critères n'est pas respecté mot de passe invalide
        const regex = new RegExp(`^(?=.{8,})(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*$`,`g`);
        return regex.test(input);
    }
};
