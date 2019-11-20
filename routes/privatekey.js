const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));
const bcrypt = require('bcrypt-nodejs');
const CryptoJS = require('crypto-js');



router.get('/', function (req, res, next) {
    
    return res.render('bringPrivatekey');
});

router.post('/signup', async function (req, res, next) {
    let { id, password, privateKey } = req.body;
    let idCheck = /^[A-za-z0-9]{5,15}/g;
    let passwordCheck = /^(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])(?=.*[0-9]).{8,16}$/;
    if (privateKey.length !== 64) {
        return res.status(200).json({message: "privateKey를 다시 확인해주세요." })
    }
    if (!idCheck.test(id)) {
        return res.status(200).json({ message: "아이디는 영문자, 숫자로 시작하는 5~15자 이어야합니다." })
    }
    if (password.length < 8 || password.length > 16 || !passwordCheck.test(password)) {
        return res.status(200).json({ message: '암호를 8자이상 16자 이하의 특수문자 조합으로 설정해주세요' })
    }
    let account = await web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    password = bcrypt.hashSync(password)
    privateKey = CryptoJS.AES.encrypt(privateKey, '123').toString()

    db.mysql.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, account.address, account.privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({ message:"계정생성에 실패하셨습니다." })
            }
            return res.status(202).json({})
        })
})

router.get('/export', function (req, res, next) {
    let { is_logined } = req.session;
    if (!is_logined) {
        return res.redirect('/')
    }
    return res.render('exportPrivatekey')
})

router.post('/export', function (req, res, next) {
    let { id, password } = req.body;
    let { userid, private_key } = req.session;
    let sessPassword = req.session.password;
    if (userid !== id) {
        res.status(200).json({})
    } else {
        bcrypt.compare(password, sessPassword, (err, value) => {
            if (value === true) {
                let decrypt = CryptoJS.AES.decrypt(private_key, '123')
                private_key = decrypt.toString(CryptoJS.enc.Utf8)
                res.status(202).json({ 'private_key': private_key.substring(2) })
            } else {
                res.status(200).json({})
            }
        })
    }
})



module.exports = router;
