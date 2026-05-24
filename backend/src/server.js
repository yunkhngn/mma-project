import app from './app.js';
import config from './config/index.js';
import { testConnection } from './config/database.js';
import './config/firebase.js';

const start = async () => {
  try {
    // Test DB connection at startup
    await testConnection();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
