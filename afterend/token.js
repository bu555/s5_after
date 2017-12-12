const tokenObj = {};

class Token{
    constructor(){

    }
    static create(user){
        let token = Math.random().toString().substr(2);
        tokenObj[token] = user;
        return token;
    }
    static get(token){
        return tokenObj[token]
    }
}
module.exports = Token;