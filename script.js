const PATH = 'http://www.omdbapi.com/';
const API_KEY = '527e4977';

const STORE = {}
addDefaultData()//загрузка предыдущего состояния

//вешаю событие на поиск
document.querySelector('.search__input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && e.target.value) {
    const text = e.target.value;
    if (STORE[text.toLowerCase()]){
      addMovieCards(STORE[text.toLowerCase()]);
    }
    else{
      loadMovies(text)
      addHistoryTag(text)
    }
  }
});

//функция для загрузки предыдущего состояния
function addDefaultData() {
  try {
    if (localStorage.getItem('results')){
      addMovieCards(JSON.parse(localStorage.getItem('results')));
    }
    if(localStorage.getItem('history')) {
      localStorage.getItem('history').split('\n').reverse().forEach(i => addHistoryTag(i));
    }
  } catch (e) {
    console.log(e);
  }
}

function saveTags(){
  localStorage.setItem('history', document.querySelector('.history').innerText);
}

//для добавления тега
function addHistoryTag(bodyTag) {
  const tag = document.createElement('div');
  tag.className = 'history__item';
  tag.textContent = bodyTag;
  const history = document.querySelector('.history');
  history.prepend(tag);
  saveTags();
  tag.addEventListener('click', event => {
    if (event.detail === 1) {
      timer = setTimeout(() => {
        removeTag(event.target);
        history.prepend(tag);
        saveTags();

        if (STORE[event.target.textContent.toLowerCase()]){
          addMovieCards(STORE[event.target.textContent.toLowerCase()])
          return;
        }
        loadMovies(event.target.textContent);
      }, 200)
    }
  })
  tag.addEventListener('dblclick', event => {
    clearTimeout(timer);
    console.log(event);
    removeTag(event.target);
  })
}

// удаление тега
function removeTag(tag){
  document.querySelector('.history').removeChild(tag);
}

//функция для добавления верстки
function htmlCard(movie) {
    return `<div class="poster"> <img class="poster__film" src="${movie.Poster}" alt="Постер фильма">
                <div class="about-film">
                    <div class="poster__raiting_onload">Оценка ${movie.imdbRating}</div>
                    <div class="poster__name_onload">${movie.Title} </div>
                    <div>
                      <div class="poster__genre_onload">${movie.Genre}</div>
                      <div class="poster__year_onload">${movie.Year}</div>  
                    </div>
                </div>
            </div>`
}

function htmlCardWithoutPoster(movie) {
  return `<div class="poster">
                    <div class="about-film">
                        <div class="poster__name">${movie.Title}</div>
                        <div>
                        <div class="poster__genre">${movie.Genre}</div>
                        <div class="poster__year">${movie.Year}</div>
                        </div>
                    </div>
                </div>`
}

//обработка ответа сервера
function addMovieCards(moviesData) {
  localStorage.setItem('results', JSON.stringify(moviesData));
  const cardElement = document.querySelector('.result__cards');

  if(moviesData.Response === 'False'){
    cardElement.style.display = 'none';
    if (moviesData.Error === 'Too many results.') {
      document.querySelector('.result__label').textContent = 'Слишком много результатов';
      return;
    }
    document.querySelector('.result__label').textContent = 'Ничего не найдено';
    return;
  }

  cardElement.style.display = 'flex';
  document.querySelector('.result__label').textContent = `Нашли ${moviesData.totalResults} фильмов`;
  cardElement.innerHTML = moviesData.Search.map(movie => movie.Poster === 'N/A'? htmlCardWithoutPoster(movie): htmlCard(movie)).join('');
}


//запрос на сервер сервера
function loadMovies(nameMovie) {
  document.querySelector('.wrapper__result').style.display = 'none';
  document.querySelector('.loading').style.display = 'block';

  fetch(`${PATH}?type=movie&apikey=${API_KEY}&s=${nameMovie}`, {method: 'GET'})
    .then(response => response.json())
    .then(movies =>{
      if(movies.Response === 'True'){
        const req = movies.Search.map(i => createRequst(i.imdbID));
        Promise.all(req).then(res =>{
          movies.Search = res;
          STORE[nameMovie.toLowerCase()] = movies;
          document.querySelector('.wrapper__result').style.display = 'block';
          document.querySelector('.loading').style.display = 'none';
          addMovieCards(movies);
        });
        return
      }

      STORE[nameMovie.toLowerCase()] = movies;
      document.querySelector('.wrapper__result').style.display = 'block';
      document.querySelector('.loading').style.display = 'none';
      addMovieCards(movies);
    })
    .catch(error => document.querySelector('.result__label').textContent = error)
    .finally(() => {
      document.querySelector('.wrapper__result').style.display = 'block';
      document.querySelector('.loading').style.display = 'none';
    });
}

async function createRequst(id){
  return fetch(`${PATH}?type=movie&apikey=${API_KEY}&i=${id}`, {method: 'GET'}).then(response => response.ok? response.json(): response)
}


