(function() {

    const SOURCE_SELECTOR = document.querySelector('select')
    const SEED_INPUT = document.querySelector('input')
    const SUBMIT_BUTTON = document.querySelector('button')
    const RESULT_CONTAINER = document.querySelector('.resultContainer')

    function createOptionForSource(sourceObject) {
        const optionEl = document.createElement('option')
        optionEl.value = sourceObject.key
        optionEl.textContent = sourceObject.label

        return optionEl
    }

    fetch('/options/')
        .then(res => res.json())
        .then(json => {
            const frag = document.createDocumentFragment()
            for (const sourceObj of json) {
                frag.appendChild(createOptionForSource(sourceObj))
            }

            SOURCE_SELECTOR.appendChild(frag)
        })

    function submit() {
        const seedWord = SEED_INPUT.value.toString().trim()
        const sourceKey = SOURCE_SELECTOR.value

        if (!sourceKey) {
            RESULT_CONTAINER.textContent = 'Please choose a source :)'
            return
        }

        if (seedWord) {
            fetch(`/generate/?source=${sourceKey}&seed=${seedWord}&sentence_count=1`)
                .then(res => res.json())
                .then(json => {
                    RESULT_CONTAINER.textContent = json.result 
                })
        } else {
            RESULT_CONTAINER.textContent = 'Please pick a starting word. It can be as simple as "my" or "what".'
        }
    }

    SUBMIT_BUTTON.addEventListener('click', submit)
    SEED_INPUT.addEventListener('keyup', evt => {
        if (evt.keyCode == 13) submit()
    })

})()

