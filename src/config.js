#!/usr/bin/env node

module.exports = {
    sources: [
        {
            // key doubles as filename, minus '.txt'
            key: 'swift',
            label: 'Taylor Swift Songs',
        },
        {
            key: 'alice',
            label: 'Alice in Wonderland',
        },
        {
            key: 'les-miserables',
            label: 'Les Miserables',
        },
        // {
        //     key: 'scarlet-letter',
        //     label: 'The Scarlet Letter',
        // },
        // {
        //     key: 'tom-sawyer',
        //     label: 'The Adventures of Tom Sawyer',
        // },
        {
            key: 'wdd-apps',
            label: 'WDD Applications',
        },
    ],
    port: 8080,
    CORS_ALLOWED_ORIGINS: [
        'https://markovify.com',
        'http://markovify.com',
        'http://localhost:8080',
        'http://localhost',
    ],
}

