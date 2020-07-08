const express = require('express');
const cors = require('cors');

const app = express();

const whiteList = ['http://localhost:3000', 'http://localhost:3443', 'http://localhost:4000'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whiteList.indexOf(req.header('Origin')) !== -1) {
        // if (req.header('Origin') === "http://localhost:3000") {
        console.log("cross origin true")
        corsOptions = { origin: true }
    }
    else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions);
}

exports.cors = cors()
exports.corsWithOptions = cors(corsOptionsDelegate);