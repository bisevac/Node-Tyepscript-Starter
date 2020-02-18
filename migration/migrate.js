const fs = require( 'fs' );
const path = require( 'path' );
const consola = require( 'consola' );
const mysql  = require( 'mysql' );
const Promise = require( 'bluebird' );

let connection = null;
let lastfolder = 0;
let currentfolder = 0;
let lastVersion = 0;
let currentVersion = 0;

// Statics
const MIGRATION_ABSOLUTE_PATH = path.resolve( __dirname, './versions' );
const commandMap = new Map();

/**
 * Simply compares two string version values.
 *
 * Example:
 * versionCompare('1.1', '1.2') => -1
 * versionCompare('1.1', '1.1') =>  0
 * versionCompare('1.2', '1.1') =>  1
 * versionCompare('2.23.3', '2.22.3') => 1
 *
 * Returns:
 * -1 = left is LOWER than right
 *  0 = they are equal
 *  1 = left is GREATER = right is LOWER
 *  And FALSE if one of input versions are not valid
 *
 * @function
 * @param {String} left  Version #1
 * @param {String} right Version #2
 * @return {Integer|Boolean}
 * @author Alexey Bass (albass)
 * @since 2011-07-14
 */
const versionCompare = function versionCompare ( left, right ) {
  if ( typeof left + typeof right !== 'stringstring' ) { return false; }

  if ( parseInt( left, 10 ) > parseInt( right, 10 ) ) {
    return 1;
  } else if ( parseInt( left, 10 ) < parseInt( right, 10 ) ) {
    return -1;
  }
  return 0;
};

const connect = function connect () {
  let url = '';

  if ( commandMap.has( '-url' ) ) {
    url = commandMap.get( '-url' );
  } else {
    url = `mysql://${commandMap.get( '-u' )}:${commandMap.get( '-p' )}@` +
    `${commandMap.get( '-h' )}:3306/${commandMap.get( '-db' )}?charset=utf8`;
  }

  url += '&multipleStatements=true';

  connection = mysql.createConnection( url );

  return new Promise( ( approve, reject ) => {
    connection.connect( ( err ) => {
      if ( err ) reject( err );
      approve( url );
    } );
  } );
};

const terminate = function terminate () {
  connection.end( ( err ) => {
    if ( err ) {
      consola.error( err );
      process.exit( 1 );
    } else {
      process.exit( 0 );
    }
  } );
};

const updateVersion = function updateVersion () {
  return new Promise( ( approve, reject ) => {
    if ( versionCompare( currentfolder, lastfolder ) >= 0 && versionCompare( currentVersion, lastVersion ) >= 0 ) return approve();
    consola.info( `Previous folder: ${currentfolder}, Last folder: ${lastfolder}` );
    consola.info( `Previous version: ${currentVersion}, Last version: ${lastVersion}` );

    consola.success( `Updating Folder => ${lastfolder}  DBVersion => ${lastVersion}` );
    return connection.query( `UPDATE dbversion SET version = ${lastVersion} , folder=${lastfolder}`, ( err ) => {
      if ( err ) {
        consola.error( err );
        return reject( err );
      }

      return approve();
    } );
  } );
};

const upLastVersion = function upLastVersion ( folder, version ) {
  lastfolder = folder;
  lastVersion = version;
};

const changeLogInsert = function changeLogInsert ( versions, bool ) {
  const query = 'INSERT INTO dbversion_changelog (version, name) values (?,?);';
  consola.info( `${versions} ==> ${bool}` );
  connection.query( query, [versions, bool], ( err, result ) => {
    if ( err ) {
      console.log( err );
    }
  } );
};

const getGreaterThanVersionFiles = function getGreaterThanVersionFiles ( currentF, currentV ) {
  const folders = fs.readdirSync( MIGRATION_ABSOLUTE_PATH );
  let versions;
  let folder;
  let folderV;
  let version;
  let versionV;
  let control;
  const filtered = {};
  folders.forEach( ( fold ) => {
    folder = fold.match( /([^_]+)_([^__]+)/ );
    if ( folder ) {
      folderV = folder[ 2 ].toLowerCase();
      control = versionCompare( currentF, folderV );
      if ( control <= 0 ) {
        filtered[ fold ] = [];
        versions = fs.readdirSync( `${MIGRATION_ABSOLUTE_PATH}/${fold}` );
        versions.forEach( ( vers ) => {
          version = vers.match( /([^__]+)_([^__]+)/ );
          if ( version ) {
            versionV = version[ 1 ].toLocaleLowerCase();
            upLastVersion( folderV, versionV );
            if ( control < 0 ) {
              filtered[ fold ].push( vers );
            } else if ( versionCompare( currentV, versionV ) < 0 ) {
              filtered[ fold ].push( vers );
            }
          }
        } );
      }
    }
  } );
  return filtered;
};

const dbv = function dbv () {
  return new Promise( ( approve, reject ) => {
    connection.query( 'SELECT version,folder from dbversion', ( err, result ) => {
      if ( err ) {
        return reject( err );
      }
      return approve( result[ 0 ] );
    } );
  } );
};

const run = function run ( folder, filename ) {
  return new Promise( ( approve, reject ) => {
    const raw = fs.readFileSync( `${MIGRATION_ABSOLUTE_PATH}/${folder}/${filename}` ).toString();
    consola.info( `Running > ${folder}/${filename}` );
    consola.log( `\n${raw}` );

    connection.beginTransaction( ( TransationErr ) => {
      if ( TransationErr ) return reject( TransationErr );

      return connection.query( raw, ( err ) => {
        if ( err ) {
          consola.warn( 'Rollback started...' );
          changeLogInsert( ( `${folder} - ${filename}` ), 'ERROR' );
          return connection.rollback( () => reject( err ) );
        }

        return connection.commit( ( CommitErr ) => {
          if ( CommitErr ) {
            consola.warn( 'Rollback started...' );
            changeLogInsert( ( `${folder} - ${filename}` ), 'ERROR' );
            return connection.rollback( () => reject( CommitErr ) );
          }
          changeLogInsert( ( `${folder} - ${filename}` ), 'successful' );
          return approve();
        } );
      } );
    } );
  } );
};

const sqlFilesRunner = function sqlFilesRunner ( fileArr ) {
  const promiseArr = [];
  Object.keys( fileArr ).forEach( ( ( key ) => {
    if ( !fileArr[ key ].length ) {
      return;
    }
    fileArr[ key ].forEach( ( item ) => {
      promiseArr.push( run( key, item ) );
    } );
  } ) );

  if ( !promiseArr.length ) return Promise.resolve();

  return Promise.all( promiseArr );
};

const migrate = function migrate () {
  return new Promise( ( approve, reject ) => {
    dbv().then( ( result ) => {
      consola.info( `Current folder: ${result.folder}` );
      consola.info( `Current version: ${result.version}` );

      lastfolder = result.folder;
      currentfolder = result.folder;

      lastVersion = result.version;
      currentVersion = result.version;

      const files = getGreaterThanVersionFiles( result.folder, result.version );

      sqlFilesRunner( files ).then( () => {
        consola.info( 'Finish migrating.' );
        approve();
      } ).catch( reject );
    } ).catch( reject );
  } );
};

const changeLogTableIfNotExist = function changeLogTableIfNotExist () {
  return new Promise( ( approve, reject ) => {
    const queryChangeLog = 'CREATE TABLE IF NOT EXISTS dbversion_changelog (' +
    '`id` int(11) NOT NULL auto_increment, ' +
    '`version` text, ' +
    '`name` varchar(100), ' +
    'PRIMARY KEY (id)' +
    ')';

    connection.query( queryChangeLog, ( err, result ) => {
      if ( err ) {
        return reject( err );
      }

      return approve( result );
    } );
  } );
};

const dbVersionTableIfNotExist = function dbVersionTableIfNotExist () {
  return new Promise( ( approve, reject ) => {
    const queryChangeLog = 'CREATE TABLE IF NOT EXISTS `dbversion` ' +
'(`version` varchar(100) DEFAULT NULL, `folder` varchar(100) DEFAULT 0 ) ENGINE=InnoDB DEFAULT CHARSET=utf8';

    // First insert if table is empty
    // const insert = 'INSERT INTO dbversion (`version`) SELECT ("0")' +
    // ' WHERE NOT EXISTS (SELECT * FROM dbversion LIMIT 1);';

    const insert = 'INSERT INTO dbversion(`version`)' +
    ' SELECT * FROM (SELECT "0") AS tmp ' +
    ' WHERE NOT EXISTS (SELECT * FROM dbversion) LIMIT 1;';

    connection.query( queryChangeLog, ( err ) => {
      if ( err ) {
        return reject( err );
      }

      connection.query( insert, ( InsertResult ) => {
        if ( InsertResult ) {
          return reject( InsertResult );
        }

        return approve();
      } );

      return true;
    } );
  } );
};

const parser = function parser () {
  const commands = process.argv.slice( 2, process.argv.length );
  let lastParam = '';

  for ( let i = 1; i < commands.length + 1; i += 1 ) {
    if ( i % 2 === 1 ) {
      lastParam = commands[ i - 1 ];
      commandMap.set( commands[ i - 1 ], '' );
    }

    if ( i % 2 === 0 ) {
      commandMap.set( lastParam, commands[ i - 1 ] );
    }
  }

  if ( commandMap.has( '-h' ) ) {
    consola.log( 'MIGRATION' );
    consola.log(
      '   -dbv   \tdb version\n' +
    '   -u     \tdb username\n' +
    '   -p     \tdb password\n' +
    '   -h     \thost\n' +
    '   -url   \tconnection url\n',
    );
  }
};

const _process = function _process () {
  if ( commandMap.has( 'dbv' ) ) {
    return dbv().then( ( result ) => {
      consola.info( `Folder Version: ${result.folder}` );
      consola.info( `File Version: ${result.version}` );
    } );
  }

  if ( commandMap.has( 'migrate' ) ) {
    consola.info( 'Migration starting...' );
    return migrate();
  }

  return true;
};

const init = function init () {
  parser();
  connect()
    .then( changeLogTableIfNotExist )
    .then( dbVersionTableIfNotExist )
    .then( _process )
    .then( updateVersion )
    .catch( ( e ) => {
      consola.error( e );
    } )
    .finally( terminate );
};

init();

// do something when app is closing
// process.on( 'exit', terminate.bind( null, { cleanup : true } ) );

// catches ctrl+c event
process.on( 'SIGINT', terminate.bind( null, { exit : true } ) );

// catches uncaught exceptions
process.on( 'uncaughtException', terminate.bind( null, { exit : true } ) );
