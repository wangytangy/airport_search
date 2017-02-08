module.exports = {
    entry: "./lib/search.js",
    output: {
        path: "./lib",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
