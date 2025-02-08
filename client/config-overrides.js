const webpack = require('webpack');

module.exports = function override(config, env) {
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

    // Safely modify the CSS rules
    if (config.module && config.module.rules) {
        const rules = config.module.rules.find(
            rule => rule.oneOf
        )?.oneOf;

        if (rules) {
            rules.forEach(rule => {
                if (rule.test && rule.test.toString().includes('css') && 
                    rule.use && Array.isArray(rule.use)) {
                    rule.use.splice(rule.use.length - 1, 0, {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('tailwindcss'),
                                    require('autoprefixer'),
                                ],
                            },
                        },
                    });
                }
            });
        }
    }

    return config;
}; 