var pool = require('./bd')

var md5 = require('md5')

async function getUserByUsernameAndPassword(user, password) {
    try {
        var query = 'select * from befit_db.users where user=? and password=? limit 1';
        //Variable que hace la consulta a la base de datos. Limit 1 es para asegurar que solo traiga 1 registro (porque puede haber varios usuarios iguales)
        var rows = await pool.query(query, [user, md5(password)]);
        return rows[0];
    } catch (error) {
        console.log(error)
    }
}

module.exports = { getUserByUsernameAndPassword }