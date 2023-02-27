const searchInput = document.querySelector('.seo_field');
const dropList = document.querySelector('.search');
const savedList = document.querySelector('.spisok')

const debounce = (fn) => {
    let delay;
    return function() {
        const callFn = () => {fn.apply(this, arguments)};
        clearTimeout(delay);
        delay = setTimeout(callFn, 400)
    }
};

function createRepo (list, className, value) {
    let listElem = document.createElement('li');
    listElem.classList.add(className);
    listElem.textContent = value;
    list.append(listElem);
    return listElem;
}

function createDropRepo(value, repo) {
    let dropElem = createRepo(dropList, 'search__card', value);
    dropElem.addEventListener('click', () => {
        saveRepo(repo);
        searchInput.value = '';
        clearDropList();
    })
}

function createSavedRepo (repoName, username, stars) {
    let text = `Repo: ${repoName};\nUser: ${username};\nStars: ${stars}`

    let savedElem = createRepo(savedList, 'spisok__card', text);
    let closeButton = document.createElement('button');
    closeButton.classList.add('spisok__button');
    savedElem.appendChild(closeButton);

    closeButton.addEventListener('click', () => {
        savedElem.remove();
    })
}

async function requestGitHub (value) {
    if (searchInput.value !== '') {
        return await fetch(`https://api.github.com/search/repositories?q=${value}+in:name&sort=stars`)
            .then(response => response.json())
            .then(data => (data.items).slice(0, 5))
            .catch(e => {
                createRepo(dropList, 'search__card', 'Request is unlucky');
                console.warn('Request error: ' + e);
            })
    }
}

async function createDropList (value) {
    let list = await requestGitHub(value);
    if (searchInput.value !== '' && list && list.length === 0) {
        createRepo(dropList, 'search__card', 'No suitable name')
    } else if (list && list.length !== 0) {
        for (let item of list) {
            createDropRepo(item.name, item);
        }
    }
}

createDropList = debounce(createDropList);

function saveRepo (repo) {
    createSavedRepo(repo.name, repo.owner.login, repo.stargazers_count)
}

function clearDropList () {
    let listElements = document.querySelectorAll('.search__card');
    for (let item of listElements) {
        item.remove();
    }
}

searchInput.addEventListener('keyup', () => {
    clearDropList();
    createDropList(searchInput.value);
})

