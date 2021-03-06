const express = require('express');
const router = express.Router();
const db = require('../databases/db')
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/25c7c08910c04b0c9be79c09f559652e'));
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt-nodejs');



router.get('/', function (req, res, next) {
  let { is_logined } = req.session;
    if (!is_logined) {
        return res.redirect('/')
    }
  res.render('send');
});

router.post('/' , async function (req, res, next) {
  let { toAddress, gasPrice, value, password} = req.body;
  let { public_key, userid, private_key, is_logined} = req.session;
   
 
  bcrypt.compare(password, req.session.password, (err, value) => {
    if( value !== true) {
      return res.status(200).json({})
    }
  })

  if(req.session.web3) {
    web3 = new Web3(new Web3.providers.HttpProvider(req.session.web3))
  }

  if (!is_logined) {
    return res.redirect('/')
  }
  if(toAddress.length !== 42){
    return res.status(200).json({})
  }
  let ckAddr = web3.utils.isAddress(toAddress);
 
  if(ckAddr === false){
    return res.status(200).json({})
  }

  let gwei = 9
  let decrypt = CryptoJS.AES.decrypt(private_key, password)
  let decryptPrkey = decrypt.toString(CryptoJS.enc.Utf8)
  let privateKey = new Buffer.from(decryptPrkey.substring(2,), 'hex');

  let nonce = await web3.eth.getTransactionCount(public_key, "pending")
  let rawTx = {
    nonce: nonce,
    gasPrice: web3.utils.toHex(gasPrice * (10 ** gwei)),
    gasLimit: web3.utils.toHex(21000),
    from: public_key,
    to : toAddress,
    value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
    data: ''
  }

  let tx = new Tx(rawTx, { 'chain': 'ropsten' });
  tx.sign(privateKey)
  let serializedTx = tx.serialize();
  

  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash){
    if(err){
      return res.status(200).json({})
    }
    db.mysql.query('INSERT INTO tx_hash(userid, txhash) VALUES(?, ?)', [userid, hash], function (err, result){
      if(err){
        return res.status(200).json({})
      } else{
      return res.status(201).json({})
      }
    })
  })
})

module.exports = router;
