module.exports = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '',
    DB: 'quantumum',
    dialect: 'mysql',

    // Partie facultatif
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }

}