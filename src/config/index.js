const config = {
  /**
   * Your env
   */
  env: process.env.NODE_ENV,

  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  mongodb: {
    connectionString: process.env.MONGODB_URI,
  },

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },

  /**
   * API configs
   */
  api: {
    prefix: '/api',
  },
};

module.exports = config;
