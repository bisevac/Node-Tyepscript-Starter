CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(45) NOT NULL,
  `surname` varchar(45) DEFAULT '',
  `password` varchar(100) DEFAULT NULL,
  `age` int(8) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `atCreated` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `error-log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(100) NOT NULL DEFAULT '',
  `log` JSON NOT NULL,
  `body` JSON DEFAULT NULL,
  `atCreated` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));


CREATE PROCEDURE `addErrorLog` (IN `_type` TEXT,IN `_log` JSON,IN `_body` JSON)
BEGIN
	INSERT INTO `error-log` (type,log,body) VALUES(_type,_log,_body);
END;

