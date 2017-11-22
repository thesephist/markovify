#!/usr/local/env node

// Simple, naive sentence generator based on a naive Markov chain

// imports
const fs = require('fs')

// declare some constants
const FILE_PATHS = [
    './swift.txt'
]
const MAX_FILE_LENGTH = 1e5
const MAX_UNIQUE_WORDS = 1e4
const VALID_WORD_REGEX = /[A-Za-z\.\,\?\!\d\']+/g
const VALID_WORD_REGEX_WITHOUT_PUNC = /[A-Za-z\d]+/g
const SENTENCE_ENDING_CHARS = [
    '.',
    '!',
    '?',
]

// read and parse the file into an array of words
let text = ''
for (const path of FILE_PATHS) {
    try {
        text += fs.readFileSync(path, {encoding: 'utf8'})
    } catch (e) {
        console.error(`${path} could not be read`, e)
    }
}
text = text.slice(0, MAX_FILE_LENGTH)

// the unicode marks are for smart quotes
// TODO: this is a performance bottleneck in v8, because it is a
//  regex-based search that seems to consume too much memory.
// Fix with a simpler algorithm
const clean_text = text
    .match(VALID_WORD_REGEX)
    .join(' ')
    .replace(/\./g, ' .')
    .replace(/\,/g, ' ,')
    .replace(/\?/g, ' ?')
    .replace(/\!/g, ' !')
    .toLowerCase()
const words = clean_text.split(/\s+/)

// parse out unique words
const uniqueWords = []
for (const word of words) {
    if (!uniqueWords.includes(word) && word) uniqueWords.push(word)
}
if (uniqueWords.length > MAX_UNIQUE_WORDS) throw 'The number of unique words has exceeded the allowed artificial limit.'

// construct a hashmap for each word
const template = {}
for (const word of uniqueWords) {
    template[word] = 0
}
const get_tpl = () => Object.assign({}, template)

// construct a hashmap for all words
const globalGraph = {}
for (const word of uniqueWords) {
    globalGraph[word] = get_tpl()
}

// fill out the global hashmap according to which words follow which other ones
console.log('building global graph...')
for (let i = 0, len = words.length - 1; i < len; i ++) {
    const prev = words[i]
    const next = words[i + 1]

    globalGraph[prev][next] ++
}

/**
 * Choose from a hash of weighted possibilities
 *
 * @param {Object} hash
 *
 * @return {string}
 */
const rchoose = hash => {
    let sum = 0
    for (const key in hash) {
        sum += hash[key]
    }

    const n = Math.random() * sum
    let runningSum = 0
    for (const key in hash) {
        runningSum += hash[key]
        if (runningSum >= n) return key
    }
    return Object.keys(hash).pop()
}

/**
 * Get the next word that should occur, given a word. Return a random word if given word does not occur
 *
 * @param {string} word
 *
 * @return {string}
 */
const getNext = word => {
    const hash = globalGraph[word]
    if (hash) {
        return rchoose(hash)
    } else {
        return words[Math.floor(Math.random() * words.length)]
    }
}

/**
 * Follow the frequency graph semi-randomly `length` times, return a list of words that were hit
 *
 * @param {string} seed
 * @param {int} length - if undefined, will go until a period is found
 *
 * @return {Array}
 */
const generateGraph = (seed, length) => {
    let previous = seed.toLowerCase()
    let list = [seed]

    if (length) {
        for (let i = 0; i < length; i ++) {
            const nextWord = getNext(previous)
            list.push(nextWord)
            previous = nextWord
        }
    } else {
        while (true) {
            const nextWord = getNext(previous)
            list.push(nextWord)
            previous = nextWord

            if (SENTENCE_ENDING_CHARS.includes(nextWord)) break;
        }
    }

    return list
}

/**
 * Follow the frequency graph and return a full sentence of generated words
 *
 * @param {string} seed
 * @param {int} length - length of the result, in number of sentences. Default 1.
 *
 * @return {string}
 */
const generateSentences = (seed, length = 1) => {

    let a = ''
    for (let i = 0; i < length; i ++) {
        const chars = generateGraph(seed)
            .join(' ')
            .replace(/ \./g, '.')
            .replace(/ \,/g, ',')
            .replace(/ \?/g, '?')
            .replace(/ \!/g, '!')
        chars[0].toUpperCase() + chars.substr(1) + '.'
        if (i !== 0) a += ' '
        a += chars
    }

    return a
}

// CLI
process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', chunk => {
    const firstWord = chunk
        .split('\n')[0]
        .match(VALID_WORD_REGEX_WITHOUT_PUNC)[0]

    if (firstWord) console.log(generateSentences(firstWord))
    // process.stdin.pause()
})

// UI response
console.log('Ready! ^C to quit.')

