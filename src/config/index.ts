import { defaultConfig } from './default';
import { IConfig } from './interface';


export const appConfig = {
  default: defaultConfig,
  withOverride: (config: Partial<IConfig>) => {
    return {
      ...defaultConfig, 
      ...config,
    } as IConfig;
  }

};

