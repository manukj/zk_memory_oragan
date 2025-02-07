const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer"),
        "zlib": require.resolve("browserify-zlib"),
        "path": require.resolve("path-browserify"),
        "process": false
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process'
        })
    ]);
    config.resolve.extensions = [...(config.resolve.extensions || []), '.js', '.jsx'];
    return config;
}; 