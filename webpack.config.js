var path = require('path')

// plugin for django-webpack-loader to read the output statistic file 
// of the webpack building result
var BundleTracker = require('webpack-bundle-tracker');
const webpack = require('webpack');


module.exports = (env,argv)=>{

return {
    entry: {
        index: path.resolve('./src/js/index'),
        legacy: path.resolve('./src/js/legacy-index')
    },
    // webpack4 
    // mode: 'development'
    // mode: 'production' will auto uglify the output file
    mode: 'development',
    // your bundle file dicectory and filename 
    output: {
        path: path.resolve('./src/bundles/'), 
        filename: '[name].js',
        publicPath: argv.mode==='development'? 'https://localhost:3000/assets/bundles/': ''
    },

    devServer:{
        host: '0.0.0.0',
        port: 3000,
        hot: true,
        https: true,
        headers: { "Access-Control-Allow-Origin": "*" }
    },

    optimization: {
        splitChunks: {
        // put everything in node_modules into a file called "vendors~main.bundle.js"
          chunks: 'all',
        },
    },

    resolve:{
        alias: {
            state: path.resolve(__dirname,'src/js/state'),
            component: path.resolve(__dirname, 'src/js/component'),
            panel: path.resolve(__dirname, 'src/js/component/panel'),
            api: path.resolve(__dirname, 'src/js/api'),
            constant: path.resolve(__dirname, 'src/js/constant'),
            styled: path.resolve(__dirname, 'src/js/styled')
        }
    },

    plugins:[
        new BundleTracker({filename: 'webpack-stats.json'}),
        new webpack.HotModuleReplacementPlugin()
    ],
    
    module: {
        rules: [
            //a regexp that tells webpack use the following loaders on all 
            //.js and .jsx files
            {test: /\.(js|jsx)$/,   
                //we definitely don't want babel to transpile all the files in 
                //node_modules. That would take a long time.
                exclude: /node_modules/, 
                //transpile es6 to es5 with babel loader
                use: {
                    loader: 'babel-loader',
                    //specify that we will be dealing with React code
                    options:{
                        presets: ['env','react'],
                        // plugin for decorator
                        // in the future babel >= 7.x use @babel/plugin-proposal-decorators
                        plugins: [  
                            "transform-decorators-legacy",
                            "transform-class-properties",
                            "transform-object-rest-spread",
                        ]
                    }
                }
            },

            {
                test: /\.(js|jsx)$/,
                include: /node_modules/,
                use: ['react-hot-loader/webpack'],
            },

            {
                test: /\.css$/,
                use: ['css-loader'],
            },
        ]
    }
}}
