// Базовые константы
const API_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 9;
let currentPage = 1;

// Функция 1: Запрос списка покемонов
function fetchPokemons(page) {
    const offset = (page -1) * LIMIT;

    console.log(`=== PAGINATION: ЗАПРОС СТРАНИЦЫ ${page} ===`);
    console.log("URL:", `${API_URL}?limit=${LIMIT}&offset=${offset}`);

    return fetch(`${API_URL}?limit=${LIMIT}&offset=${offset}`)
    .then((response ) => {
        console.log("Статус:", response.status);
        if(!response.ok) {
            throw new Error (
                `Ошибка HTTP: ${response.status} ${response.statusText}`
            );
        }
        return response.json()
    })
    .then((data) => {
        console.log("=== СПИСОК ПОКЕМОНОВ ===");
        console.table(data.results);
        console.log("Общее количество:", data.count);
        return data;
    })
    .catch((error) => {
        console.error("PAGINATION Ошибка:", error.message);
        throw error;
    })
}
fetchPokemons(1)

// Функция 2: Запрос деталей покемона
function fetchPokemonDetails(url, name) {
    console.log(`=== ПОКЕМОН ${name}: ЗАПРОС ДЕТАЛЕЙ ===`);
    console.log("URL:", url);

    return fetch(url)
    .then((response) => {
        console.log("Статус:", response.status);
        if(!response.ok) {
           throw new Error (
            `Ошибка HTTP: ${response.status} ${response.statusText}`
            ); 
        }
        return response.json()
    })
    .then((detalise) => {
        console.log(`=== ДАННЫЕ ПОКЕМОНА ${name} ===`);
        console.table({
        id: detalise.id,
        name: detalise.name,
        type: detalise.types[0] ? detalise.types[0].type.name : "Неизвестно",
        ability: detalise.abilities[0]
        ? detalise.abilities[0].ability.name
        : "Неизвестно",
      });
      return detalise
    })
    .catch((error) => {
        console.error(`ПОКЕМОН ${name} Ошибка:`, error.message);
        throw error;
    })
}
fetchPokemonDetails(`${API_URL} /1`, "bulbasaur");

// Функция 3: Создание карточки из шаблона
function createPokemonCard(details) {
    const template = document.getElementById("pokemon-card-template");
    const clone = template.content.cloneNode(true);

    const nameEl = clone.querySelector(".pokemon-name");
    const imageEl = clone.querySelector(".pokemon-image");
    const typeEl = clone.querySelector(".pokemon-type");

    nameEl.textContent = details.name;
    imageEl.src =
    details.sprites.front_default || "https://via.placeholder.com/100";
    imageEl.alt = details.name;
    typeEl.textContent = `Тип: ${
    details.types[0] ? details.types[0].type.name : "Неизвестно"
  }`;

  return clone;
}

// Функция 4: Рендеринг карточек
function renderPokemonCards(pokemons) {
    const list = document.querySelector(".pokemon-list");
    clearPokemonList();

    let index = 0;
    function processNextPokemon() {
    if (index >= pokemons.length) return;

    const pokemon = pokemons[index];
    fetchPokemonDetails(pokemon.url, pokemon.name)
    .then((details) => {
        const card = createPokemonCard(details);
        list.appendChild(card);
        index++;
        processNextPokemon();
    })
    .catch((error) => {
    showError(error.message);
    });
  }
  processNextPokemon();
}

// Функция 5: Обновление пагинации
function updatePagination(page, hasPrevious, hasNext) {
    document.querySelector(".page-info").textContent = `Страница ${page}`;
    document.querySelector(".btn-prev").disabled = !hasPrevious;
    document.querySelector(".btn-next").disabled = !hasNext;
    console.log("=== PAGINATION UPDATE ===");
    console.log("Текущая страница:", page);
    console.log("Есть предыдущая:", hasPrevious);
    console.log("Есть следующая:", hasNext);
}

// Функция 6: Обработка поиска
function handleSearch(query) {
    console.log("=== SEARCH: ЗАПРОС ===");
    console.log("Поиск:", query);

    fetch(`${API_URL}?limit=100`)
    .then((response) => {
        console.log("Статус:", response.status);
        if(!response.ok) {
            throw new Error (
            `Ошибка HTTP: ${response.status} ${response.statusText}`
            );           
        }
        return response.json()
    })
    .then((data) => {
        console.log("=== РЕЗУЛЬТАТЫ ПОИСКА ===");
        const filtered = data.results.filter((p) => p.name.includes(query))

        console.table(filtered);
        console.log("Найдено:", filtered.length);

        const list = document.querySelector(".pokemon-list");
        clearPokemonList();

        if(!filtered.length) {
            list.innerHTML = "<p>Ничего не найдено!</p>";
            console.log("Результат: Пусто");
            return;
        }
        renderPokemonCards(filtered.slice(0, 3));
    })
    .catch((error) => {
        console.error("SEARCH Ошибка:", error.message);
        showError(error.message);
    })
}

// Функция 7: Очистка списка
function clearPokemonList() {
    const list = document.querySelector(".pokemon-list");
    list.innerHTML = "";
    console.log("=== LIST CLEARED ===");
}

// Функция 8: Показ ошибок
function showError(message) {
    const list = document.querySelector(".pokemon-list");
    list.innerHTML = `<p style="color: red;">Ошибка: ${message}</p>`;
    console.log("=== ERROR DISPLAYED ===");
    console.log("Сообщение:", message);
}

// Функция 9: Загрузка страницы
function loadPage(page) {
    fetchPokemons(page)
    .then((data) => {
      renderPokemonCards(data.results);
      updatePagination(page, !!data.previous, !!data.next);
    })
    .catch((error) => {
      howError(error.message);
    });
}
loadPage(currentPage);

// Функция 10: Настройка событий
function setupEventListeners() {
    document.querySelector(".btn-prev").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            console.log("=== NAVIGATION: PREV ===")
            loadPage(currentPage);
        }
     });
    document.querySelector(".btn-next").addEventListener("click", () => {
        currentPage++
        console.log("=== NAVIGATION: NEXT ===");
        loadPage(currentPage);
    });
    document.querySelector(".search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const query = document.querySelector("#pokemon-search").value.trim().toLowerCase();
        console.log("=== SEARCH INITIATED ===");

        if(!query) {
            loadPage(currentPage);
            return
        }
        handleSearch(query)
    });
    document.querySelector(".btn-reset").addEventListener("click", () => {
        document.querySelector("#pokemon-search").value = "";
        console.log("=== SEARCH RESET ===");
        loadPage(currentPage);
    })
}

// Старт приложения
console.log("=== APP START ===");
setupEventListeners();
loadPage(currentPage);
