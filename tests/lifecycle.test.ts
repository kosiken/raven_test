
import { MySqlContainer, GenericContainer, StartedMySqlContainer } from "testcontainers";
import { AppServer } from "../src/app-server";
import { IConfig } from "../src/config/interface";
import Logger from "../src/utils/Logger";
import logger from '../src/utils/Logger';
import setServer, {server} from "./appTest";
let dbServer: StartedMySqlContainer;
let appServer: AppServer | undefined = undefined;


before(function(done) {
  this.timeout(90000);

  async function setUpServers() {
    const mySqlContainerInit = new MySqlContainer("mysql:8.0")
    .withDatabase("raven_test")
    .withUsername("lion")
    .withUserPassword("password")
    .withExposedPorts(
      {
        container: 3306,
        host: 4000
      }
    );
    

  
    return mySqlContainerInit.start()
  }
  setUpServers().then(server => {
    dbServer = server;
    const config: Partial<IConfig> = {
      db: {
        dbHost: server.getHost(),
        dbName: 'raven_test',
        port: server.getPort() + '',
        password: 'password',
        user: 'lion'

      },
      serverPort: '8000',
      secrets: {
        jwtSecret: 'jwtSecret'
      }
    }
 
   setServer(config, appServer).then(() => {
    return done();

   }).catch(err => {
    console.log(err)
    done()
  }) 
   
  }).catch(err => {
    console.log(err)
    return done()
  }) 
  // return done();
}) 

// After all tests have finished...
after( async () => {
  // here you can clear fixtures, etc.
  // (e.g. you might want to destroy the records you created above)
  Logger.log('stopping servers');
    try {
   
    await server!.stop()
    await dbServer.stop();
    
    }
    catch(err){
      console.log(err)

    }
 


});
