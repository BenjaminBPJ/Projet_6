module.exports = {
    goodPassword : function (input) {
    //Au moins un chiffre, une majuscule, une minuscule et au moins 8 caractères s'il l'un des critères n'est pas respecté mot de passe invalide
    const regex = new RegExp (`^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$`);
    return regex.test(input);
}
}
