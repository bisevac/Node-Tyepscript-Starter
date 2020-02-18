import { ServerLoader } from '@tsed/common';
import { ApplicationConfigManager } from './lib/ApplicationConfigManager';
import { $log } from './lib/Logger';
import { Server } from './lib/Server';

( async function init () {
  try {
    $log.debug( 'Start server...' );

    ApplicationConfigManager.loadConfig( process.env.NODE_ENV );

    const server = await ServerLoader.bootstrap( Server, ApplicationConfigManager.getServerConfig() );

    await server.listen();

    $log.debug( 'Server initialized' );
  } catch ( e ) {
    $log.error( e );
  }
} )();
