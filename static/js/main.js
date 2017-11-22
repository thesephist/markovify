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

        if (seedWord) {
            fetch(`/generate/?source=${sourceKey}&seed=${seedWord}&sentence_count=1`)
                .then(res => res.json())
                .then(json => {
                    RESULT_CONTAINER.textContent = json.result 
                })
        }
    }

    SUBMIT_BUTTON.addEventListener('click', submit)
    SEED_INPUT.addEventListener('keyup', evt => {
        if (evt.keyCode == 13) submit()
    })

})()
