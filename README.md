# Markovify

Using Markov chains to naively generate autocomple text from classical literature (and some country songs).

---

## What is this?

Inspired by [this nonchalant tweet](https://twitter.com/backlon/status/927915839457656832), I thought it would be fun to try to auto-generate / autocomplete sentences based on different works of literature and different writing styles. This is a lightweight web app that autocompletes a full sentence, given a piece of text from which to source the writing style.

## Why?

>Because in your eyes and rolled their eyes and said i know you're beautiful, he's finally got home you think that the steering wheel the way.

- Autocomplete Taylor Swift.

## How does it work?

At first, I considered using an [LSTM](https://en.wikipedia.org/wiki/Long_short-term_memory) neural network, but that seemed like too much of a hassle for something so insignificant. Since I didn't really care if the generated text didn't make any grammatical sense, Markovify, as the name implies, is based on [Markov chains](https://en.wikipedia.org/wiki/Markov_chain) with the next word following the previous word.

This means that the word that follows a given word is guessed, based on how frequently the two words appear next to each other in the source text.

While this isn't how more sophisticated autocomplete / type ahead schemes work, it seemed alright for this dumb use case.

## Fork / Setup instructions

Just `git clone` the repository, run `yarn install` or `npm install` to install all Node dependencies, and run `npm start` to start the server.

By default, it will run on port `8080`. To change it, just modify the `port` setting in `/src/config.js`.

## Adding sources

All sources used here, except for `swift.txt`, is taken from the wonderful [Project Gutenberg](https://www.gutenberg.org/) archive. The Taylor Swift lyrics is taken from [this Github repository](https://github.com/irenetrampoline/taylor-swift-lyrics). (Coincidentally, it looks like that project also does some basic Markov chain generation, though I didn't spot it until just now.)

To add a new source, first add an entry to `/src/config.js` with the label and valid JS identifier as a `key`, then name the file `$key.txt` for whatever key you've chosen, and drop it into `/src/sources/`.

The next time you spin up the server, it should just work.

### A note on Project Gutenberg imports

I had to strip out the initial few hundred lines of Project Gutenberg texts (table of contents, copyright information) for the Markov model to be most effective, and you may have to strip out any prefixed metadata from your text files if you're sourcing the file from a third party.

## License

MIT. See `LICENSE`.

