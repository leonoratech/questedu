/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  /**
   * Disable SSL verification (useful for corporate proxies like Zscaler)
   */
  disableSSL?: boolean;
  
  /**
   * Use Firebase emulator for development
   */
  useEmulator?: boolean;
  
  /**
   * Emulator host (default: localhost)
   */
  emulatorHost?: string;
  
  /**
   * Emulator port (default: 8080)
   */
  emulatorPort?: number;
  
  /**
   * Enable debug logging
   */
  enableDebugLogging?: boolean;
}

/**
 * Complete configuration for the data package
 */
export interface DataConfig {
  firebase: FirebaseConfig;
  environment?: EnvironmentConfig;
}

/**
 * Default environment configuration
 */
export const defaultEnvironmentConfig: EnvironmentConfig = {
  disableSSL: false,
  useEmulator: false,
  emulatorHost: 'localhost',
  emulatorPort: 8080,
  enableDebugLogging: false
};

/**
 * Validates Firebase configuration
 */
export function validateFirebaseConfig(config: FirebaseConfig): void {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of required) {
    if (!config[field as keyof FirebaseConfig]) {
      throw new Error(`Firebase configuration missing required field: ${field}`);
    }
  }
}

/**
 * Creates a complete data configuration with defaults
 */
export function createDataConfig(
  firebase: FirebaseConfig, 
  environment?: EnvironmentConfig
): DataConfig {
  validateFirebaseConfig(firebase);
  
  return {
    firebase,
    environment: { ...defaultEnvironmentConfig, ...environment }
  };
}
