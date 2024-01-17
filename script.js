const firstTab = document.querySelector('.first_tab');
const secondTab = document.querySelector('.second_tab');
const searchContainer = document.querySelector('.searchweather_screen');
const locationContainer = document.querySelector('.location_container')
const weatherContainer = document.querySelector('.weather_detail_container')
const grantLocationBtn = document.querySelector('.grant_btn');
const loader = document.querySelector('.loader');
const ul = document.querySelector('ul');
const searchInput = document.querySelector('[data-search_city]');
const searchIcon = document.querySelector('.search_icon');
const errorContainer = document.querySelector('.error_container');
const guidContainer = document.querySelector('.guide_container');

let isSelected = false;
let cities = [];

const api_id = "706be48014809fa8556c0a920f2d6c14";


function checkPermission() {
    navigator.permissions.query({
        name: 'geolocation'
    }).then(permissions => permissions.state === 'granted' ? (locationContainer.classList.remove('active'), guidContainer.classList.remove('active'), getUserLocation()) : checkDeniedPermission());

}

function checkDeniedPermission() {
    navigator.permissions.query({
        name: 'geolocation'
    }).then(permissions => permissions.state === 'denied' ? (locationContainer.classList.remove('active'), guidContainer.classList.add('active')) : (locationContainer.classList.add('active'), weatherContainer.classList.remove('active')));
}


//Set local storage 

async function setLocalStorage(newPosition) {
    localStorage.setItem('manual-coordinates', JSON.stringify(newPosition));
}

//Search input element

function selectInput(list) {
    isSelected = true;
    if (isSelected) {
        searchInput.value = list.dataset.city;
    }

    let manualPosition = {
        lat: list.dataset.lat,
        lon: list.dataset.lon,
        city: list.dataset.city,
        state: list.dataset.state
    }
    ul.classList.remove('active');
    setLocalStorage(manualPosition);
}

//Fetch location by gps

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPostion);
    }
    else {
        checkDeniedPermission();
    }
}

// geolocation callback function

function showPostion(position) {
    let userPosition = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    locationContainer.classList.remove('active');
    getUserWeatherInfo(userPosition)

}

// Handle User weather
async function getUserWeatherInfo(userPosition) {
    const { lat, lon, city, state } = userPosition;
    loader.classList.add('active');
    errorContainer.classList.remove('active');
    try {

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_id}&units=metric`);
        const data = await response.json();

        renderInfo(data, city, state);
    }
    catch (err) {
        loader.classList.remove('active');
        weatherContainer.classList.remove('active');
        console.log(err)
    }

}

// Handle cities pop data

async function getAllCities() {
    try {

        const response = await fetch("https://raw.githubusercontent.com/manifestinteractive/openweathermap-cities/master/data/owm_city_list.json");
        const data = await response.json();
        const key = data['RECORDS'];

        cities = await key.filter((ele) => {
            return ele;
        })
    }

    catch (err) {
        console.log('getallcities error', err)
    }
}


async function getFromLocalStorage() {
    let localCoordinates = await localStorage.getItem('manual-coordinates');
    const manualcoordinates = await JSON.parse(localCoordinates);
    isSelected = false;
    if (localCoordinates) {
        getUserWeatherInfo(manualcoordinates);
    } else {
        weatherContainer.classList.remove('active');
    }

}


// render city while typing
async function renderCity() {

    let finalResult = [];
    if (searchInput.value !== '') {
        ul.classList.add('active');
        let currentInput = searchInput.value.trim().toLowerCase();
        let tempArr = await cities.filter((ele) => {
            return (ele['owm_city_name'].toLowerCase().startsWith(currentInput) || ele['country_long'].toLowerCase().startsWith(currentInput) || ele['admin_level_1_long'].toLowerCase().startsWith(currentInput));
        });

        for (let i = 0; i < 10; i++) {

            if (i < tempArr.length) {
                let lat = tempArr[i]['owm_latitude'];
                let lon = tempArr[i]['owm_longitude'];
                let city = tempArr[i]['owm_city_name'];
                let fullState = tempArr[i]['admin_level_1_long'];
                let shortState = tempArr[i]['admin_level_1_short'];
                let country = tempArr[i]['owm_country'];

                let li = `<li onclick=selectInput(this) data-lat = ${lat} data-lon=${lon} data-city = "${city}" data-state= "${shortState}">${city}, ${fullState},${country} </li>`;
                finalResult.push(li);
            }
        }

        if (finalResult.length > 0) {
            let tempAns = finalResult.filter((ele) => {
                if (ele.innerHTML !== '')
                    return ele;

            })

            ul.innerHTML = tempAns.join('');


        }
        else {
            ul.innerHTML = `<li>Not found</li>`
        }

    }

    if (searchInput.value === '') {
        ul.classList.remove('active');
    }

}


//Set weather icon 

function setWeatherSource(weatherImg, data) {

    const { id, icon, description } = data.weather[0];
    if (icon.includes('n') && description === 'thunderstorm') {
        weatherImg.src = `./icons/night-thunderstorm.png`;
    }
    else if (icon.includes('n' && description === 'few clouds')) {
        weatherImg.src = `./icons/moon-cloud.png`;

    }
    else if (icon.includes('n') && description === 'clear sky') {
        weatherImg.src = `./icons/color-moon.png`;
    }

    else {
        if (id < 250) {
            weatherImg.src = `./icons/storm.svg`;

        }
        else if (id < 350) {
            weatherImg.src = `./icons/drizzle.svg`;

        }
        else if (id < 550) {
            weatherImg.src = `./icons/rain.svg`;

        }
        else if (id < 650) {
            weatherImg.src = `./icons/snow.svg`;

        }
        else if (id < 800) {
            weatherImg.src = `./icons/atmosphere.svg`;

        }

        else if (id === 800) {
            weatherImg.src = "./icons/sun.svg";
        }
        else if (id == 801) {
            weatherImg.src = "./icons/clouds.svg";
        }
        else if (id == 802 && description === "scattered clouds") {
            weatherImg.src = "./icons/simple-cloud.png";
        }
        else if (id > 802) {
            weatherImg.src = "./icons/all-clouds.png";
        }
    }

}

//Display the weather info

function renderInfo(data, city, state) {
    const cityName = document.querySelector('[data_cityname]');
    const stateName = document.querySelector('[data-statename]');
    const countryImg = document.querySelector('[data_flag]');
    const weatherStatus = document.querySelector('[data-weather_status]');
    const weatherImg = document.querySelector('[data-weather_img]');

    const temperature = document.querySelector('[data-weather_temp]');

    const windData = document.querySelector('#wind_data');
    const humidityData = document.querySelector('#humidity_data');
    const cloudData = document.querySelector('#cloud_data');

    return new Promise((resolve, reject) => {
        try {
            cityName.textContent = firstTab.classList.contains('active') ? data['name'] : city;
            stateName.textContent = firstTab.classList.contains('active') ? data.sys['country'] : state;

            countryImg.src = `https://flagcdn.com/144x108/${data.sys['country'].toLowerCase()}.png`
            weatherStatus.innerText = data.weather[0].main;
            setWeatherSource(weatherImg, data);
            temperature.innerText = `${data.main.temp} °C`;
            windData.innerText = `${data.wind.speed}m/s`;
            humidityData.innerText = `${data.main.humidity}%`;
            cloudData.innerText = `${data.clouds.all}%`

            loader.classList.remove('active');
            weatherContainer.classList.add('active');
            resolve(200);
        }
        catch (err) {
            loader.classList.remove('active');
            reject(404);
        }
    })


}



//Tab 1

function getFirstTab() {
    secondTab.classList.remove('active');
    firstTab.classList.add('active');
    searchContainer.classList.remove('active');
    loader.classList.remove('active');
    weatherContainer.classList.remove('active');
    errorContainer.classList.remove('active');
    checkPermission();

}

//Tab 2

function getSecondTab() {
    firstTab.classList.remove('active');
    secondTab.classList.add('active');
    loader.classList.remove('active');
    searchContainer.classList.add('active')
    locationContainer.classList.remove('active');
    errorContainer.classList.remove('active')
    weatherContainer.classList.remove('active');
    guidContainer.classList.remove('active');
    searchInput.focus();
    if (localStorage.getItem('manual-coordinates') !== null) {
        getFromLocalStorage();
    }
}


firstTab.addEventListener('click', () => {
    getFirstTab();
})

secondTab.addEventListener('click', () => {
    getSecondTab();
})

searchIcon.addEventListener('click', () => {

    let currentValue = searchInput.value.trim().toLowerCase();
    let localCoordinates = localStorage.getItem('manual-coordinates');
    const manualcoordinates = JSON.parse(localCoordinates);
    searchInput.value = '';

    if (currentValue !== '') {
        loader.classList.add('active');
        errorContainer.classList.remove('active');
        let ele = ul.childNodes[0];

        if (ele.textContent !== 'Not found' && currentValue === ele.dataset.city.trim().toLowerCase() && !isSelected) {
            ul.classList.remove('active');
            selectInput(ele);
            getFromLocalStorage();
            return;
        }

        if (currentValue === manualcoordinates['city'].toLowerCase()) {

            ul.classList.remove('active');
            getFromLocalStorage();
            return;
        }

        ul.classList.remove('active');
        errorContainer.classList.add('active');
        weatherContainer.classList.remove('active');
        loader.classList.remove('active');
    }

});

grantLocationBtn.addEventListener('click', () => {
    checkPermission();
    getUserLocation();
});

searchInput.addEventListener('keyup', (e) => {
    setTimeout(() => {
        renderCity();
    }, 500);
})

window.addEventListener('load', () => {
    firstTab.classList.add('active');
    getFirstTab();
    getAllCities();
})


