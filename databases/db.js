const mySql = require('mysql');

let info = {
  host     : 'localhost',
  user     : 'root',
  password : '1q2w3e4r%T',
  //password : '123456',
  database : 'ewallet'
};

let mysql = mySql.createConnection(info);

mysql.connect();

module.exports = {
  mysql,
  info
}
