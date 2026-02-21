const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'static/js/[name].[contenthash:8].js',
            publicPath: '/',
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', { targets: "defaults" }],
                                ['@babel/preset-react', { runtime: "automatic" }]
                            ],
                            plugins: [
                                isDevelopment && require.resolve('react-refresh/babel')
                            ].filter(Boolean),
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        'tailwindcss',
                                        'autoprefixer',
                                    ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(mp4|webm|ogg)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'static/media/[name].[hash:8][ext]'
                    }
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'static/media/[name].[hash:8][ext]'
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html',
                favicon: './favicon.ico'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'sw.js', to: '.' },
                    { from: 'manifest.json', to: '.' },
                ],
            }),
            isDevelopment && new ReactRefreshWebpackPlugin(),
        ].filter(Boolean),
        devServer: {
            historyApiFallback: true,
            hot: true,
            open: true,
            port: 3000,
            static: {
                directory: path.join(__dirname, 'static'),
                publicPath: '/static',
            },
        },
        devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
    };
};
