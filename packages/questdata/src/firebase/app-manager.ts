import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { EnvironmentConfig, FirebaseConfig, defaultEnvironmentConfig } from '../config';

/**
 * Firebase application instance manager
 */
export class FirebaseAppManager {
  private static instance: FirebaseAppManager;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private config: FirebaseConfig | null = null;
  private envConfig: EnvironmentConfig = defaultEnvironmentConfig;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): FirebaseAppManager {
    if (!FirebaseAppManager.instance) {
      FirebaseAppManager.instance = new FirebaseAppManager();
    }
    return FirebaseAppManager.instance;
  }

  /**
   * Initialize Firebase with configuration
   */
  public initialize(config: FirebaseConfig, envConfig?: EnvironmentConfig): void {
    if (this.app) {
      if (this.envConfig.enableDebugLogging) {
        console.warn('Firebase app already initialized, skipping...');
      }
      return;
    }

    this.config = config;
    this.envConfig = { ...defaultEnvironmentConfig, ...envConfig };

    // Log configuration (mask sensitive data)
    if (this.envConfig.enableDebugLogging) {
      console.log('🔥 Initializing Firebase with config:', {
        projectId: config.projectId,
        authDomain: config.authDomain,
        apiKey: config.apiKey ? '***' + config.apiKey.slice(-4) : 'missing',
        disableSSL: this.envConfig.disableSSL,
        useEmulator: this.envConfig.useEmulator
      });
    }

    // Initialize Firebase app
    this.app = initializeApp(config);

    // Initialize Firestore
    this.db = getFirestore(this.app);

    // Setup emulator if configured
    if (this.envConfig.useEmulator && this.envConfig.emulatorHost && this.envConfig.emulatorPort) {
      try {
        connectFirestoreEmulator(
          this.db, 
          this.envConfig.emulatorHost, 
          this.envConfig.emulatorPort
        );
        if (this.envConfig.enableDebugLogging) {
          console.log(`🔧 Connected to Firestore Emulator at ${this.envConfig.emulatorHost}:${this.envConfig.emulatorPort}`);
        }
      } catch (error) {
        if (this.envConfig.enableDebugLogging) {
          console.warn('Failed to connect to Firestore Emulator:', error);
        }
      }
    }

    if (this.envConfig.enableDebugLogging) {
      console.log('✅ Firebase initialized successfully');
    }
  }

  /**
   * Get Firebase app instance
   */
  public getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase app not initialized. Call initialize() first.');
    }
    return this.app;
  }

  /**
   * Get Firestore database instance
   */
  public getDb(): Firestore {
    if (!this.db) {
      throw new Error('Firestore not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Get current configuration
   */
  public getConfig(): { firebase: FirebaseConfig; environment: EnvironmentConfig } {
    if (!this.config) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return {
      firebase: this.config,
      environment: this.envConfig
    };
  }

  /**
   * Check if Firebase is initialized
   */
  public isInitialized(): boolean {
    return this.app !== null && this.db !== null;
  }

  /**
   * Reset the instance (useful for testing)
   */
  public reset(): void {
    this.app = null;
    this.db = null;
    this.config = null;
    this.envConfig = defaultEnvironmentConfig;
  }
}
