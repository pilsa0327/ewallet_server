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
    let idCheck = /^[A-za-z0-9]{5,15}/g;
    let passwordCheck = /^(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])(?=.*[0-9]).{8,16}$/;
    if (!idCheck.test(id)) {
        return res.status(202).json({ message: "아이디는 영문자, 숫자로 시작하는 5~15자 이어야합니다." })
    }
    if (password.length < 8 || password.length > 16 || !passwordCheck.test(password)) {
        return res.status(202).json({ message: '암호를 8자이상 16자 이하의 특수문자 조합으로 설정해주세요' })
    }
    if (password !== password2) {
        return res.status(202).json({ message: '비밀번호를 다시 확인해주세요' })
    }

  
    let newAccount = web3.eth.accounts.create()
    let { address, privateKey } = newAccount;

    password = bcrypt.hashSync(password);
    privateKey = CryptoJS.AES.encrypt(privateKey, password2).toString()

    db.mysql.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, address, privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({})
            }
            return res.status(201).json({})
        })
})
module.exports = router;

