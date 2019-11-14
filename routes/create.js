const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));
const bcrypt = require('bcrypt-nodejs');
const CryptoJS = require('crypto-js');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('create');
});

router.post('/', function (req, res, next) {
    let { id, password, password2 } = req.body
    let newAccount = web3.eth.accounts.create()
    let {address, privateKey} = newAccount;

    if(password !== password2){
        return res.status(202).json({})
    }

    password = bcrypt.hashSync(password);
    privateKey = CryptoJS.AES.encrypt(privateKey, '123').toString()
  
    //console.log(newAccount)
    db.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, address, privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({})
            }
            return res.status(201).json({})
    })
})
module.exports = router;

