

export interface IConfig {
    raveSecret: string;
    serverPort: string;
    testBalance: string;
    env: string;
    version: string;
    db: {
        user: string;
        port: string;
        dbName: string;
        dbHost: string;
        password: string;
    },

    secrets: {
        jwtSecret: string;
    }
}