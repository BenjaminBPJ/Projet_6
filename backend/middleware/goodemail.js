module.exports = {
    goodEmail : function (input) {
    const regex = new RegExp(`^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,3})$`);
    return regex.test(input);
}
}

