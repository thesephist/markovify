#!/usr/bin/env node

const express = require('express')
const server = express()

const {MarkovGraph, makeValidWord} = require('./src/markov.js');
const Config = require('./src/config.js');

const graphs = {}
for (const {key, label} of Config.sources) {
    graphs[key] = new MarkovGraph(`./src/sources/${key}.txt`)
}

server.addRoute = function(route, handler) {
    this.get(route, function(req, res) {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(handler.apply(this, arguments)))
    })
}

server.addRoute('/generate/', (req, res) => {
    const {source, sentence_count, seed = ''} = req.query || {}
    let result = '';

    if (
        !isNaN(+sentence_count)
        && graphs[source]
    ) {

        if (makeValidWord(seed)) {
            result = graphs[source].generateSentences(
                seed,
                +sentence_count,
            )
        } else {
            result = 'Seed was invalid'
        }

    }

    return {
        result,
    }

})

server.addRoute('/options/', () => {
    return Config.sources
})

server.use('/', express.static('./static/'))

server.listen(Config.port, () => {
    console.log('Server started.')
})

