const webpack = require('webpack');

module.exports = function override(config, env) {
  // Override here
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    "stream": require.resolve("stream-browserify"),
  };

  // Plugin to provide browser versions of Node.js globals and modules
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};
