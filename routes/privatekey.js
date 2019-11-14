const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Web3 = require('web3');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));
const bcrypt = require('bcrypt-nodejs');
const CryptoJS = require('crypto-js');

router.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        user: 'root',
        password: '1q2w3e4r%T',
        database: 'ewallet'
    })
}))


router.get('/', function (req, res, next) {
    
    return res.render('bringPrivatekey');
});

router.post('/signup', async function (req, res, next) {
    let { id, password, privateKey } = req.body;
    if (privateKey.length !== 64) {
        return res.status(200).json({})
    }
    let account = await web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    password = bcrypt.hashSync(password)
    privateKey = CryptoJS.AES.encrypt(privateKey, '123').toString()

    db.query('INSERT INTO wallet_info(userid, password, public_key, private_key) VALUES(?, ?, ?, ?)',
        [id, password, account.address, account.privateKey], function (err, result) {
            if (err) {
                return res.status(200).json({})
            }
            return res.status(201).json({})
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
