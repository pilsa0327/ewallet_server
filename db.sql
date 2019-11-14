CREATE TABLE `wallet_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `public_key` varchar(255) NOT NULL,
  `private_key` varchar(255) NOT NULL UNIQUE, 
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_hash`(
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(100) NOT NULL,
  `txhash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

select * from wallet_info where 