#!/usr/bin/env node

const express = require('express')
const server = express()

server.addRoute = function(route, handler) {
    this.get(route, (req, res) => {
        res.send(JSON.stringify(handler.apply(this, arguments)))
    })
}

server.addRoute('/', () => {
    return {}
})

server.addRoute('/sentence/', () => {
    return {
        result: {
            next: 'hi',
        }
    }
})

server.listen(8080)

