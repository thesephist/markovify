#!/usr/bin/env node

const fs = require('fs')

// constants
const MAX_FILE_LENGTH = 6e4
const MAX_UNIQUE_WORDS = 1e4
const VALID_WORD_REGEX = /[A-Za-z\.\,\?\!\d\']+/g
const VALID_WORD_REGEX_WITHOUT_PUNC = /[A-Za-z\d]+/g
const SENTENCE_ENDING_CHARS = [
    '.',
    '!',
    '?',
]

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
 * @class
 *
 * Represents an instance of a Markov graph, from a given source text
 */
class MarkovGraph {

    constructor(path) {

        // define props
        this.words = []
        this.uniqueWords = []
        this.globalGraph = {}

        // read and parse the file into an array of words
        let text = ''
        try {
            text += fs.readFileSync(path, {encoding: 'utf8'})
        } catch (e) {
            console.error(`${path} could not be read`, e)
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
        this.words = clean_text.split(/\s+/)

        // parse out unique words
        this.uniqueWords = []
        for (const word of this.words) {
            if (!this.uniqueWords.includes(word) && word) this.uniqueWords.push(word)
        }
        if (this.uniqueWords.length > MAX_UNIQUE_WORDS) throw 'The number of unique words has exceeded the allowed artificial limit.'

        // construct a hashmap for each word
        const template = {}
        for (const word of this.uniqueWords) {
            template[word] = 0
        }
        const get_tpl = () => Object.assign({}, template)

        // construct a hashmap for all words
        this.globalGraph = {}
        for (const word of this.uniqueWords) {
            this.globalGraph[word] = get_tpl()
        }

        // fill out the global hashmap according to which words follow which other ones
        console.log('building global graph for', path)
        for (let i = 0, len = this.words.length - 1; i < len; i ++) {
            const prev = this.words[i]
            const next = this.words[i + 1]

            this.globalGraph[prev][next] ++
        }
    }

    /**
     * Get the next word that should occur, given a word. Return a random word if given word does not occur
     *
     * @param {string} word
     *
     * @return {string}
     */
    getNext(word) {
        const hash = this.globalGraph[word]
        if (hash) {
            return rchoose(hash)
        } else {
            return this.words[Math.floor(Math.random() * this.words.length)]
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
    generateGraph(seed, length) {
        let previous = seed.toLowerCase()
        let list = [seed]

        if (length) {
            for (let i = 0; i < length; i ++) {
                const nextWord = this.getNext(previous)
                list.push(nextWord)
                previous = nextWord
            }
        } else {
            while (true) {
                const nextWord = this.getNext(previous)
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
    generateSentences(seed, length = 1) {
        let a = ''
        for (let i = 0; i < length; i ++) {
            let chars = this.generateGraph(seed)
                .join(' ')
                .replace(/ \./g, '.')
                .replace(/ \,/g, ',')
                .replace(/ \?/g, '?')
                .replace(/ \!/g, '!')
            chars = chars[0].toUpperCase() + chars.substr(1)
            if (i !== 0) a += ' '
            a += chars
        }

        return a
    }

}

function makeValidWord(str) {
    const firstLine = str.split('\n')[0]
    const firstMatch = firstLine
        && firstLine.match(VALID_WORD_REGEX_WITHOUT_PUNC)
    return firstMatch && firstMatch[0]
}

module.exports = {
    MarkovGraph,
    makeValidWord,
}

