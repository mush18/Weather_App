const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container")
const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector(".form-container")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")


let oldTab = userTab; //-->   "By Default Set kar diya"
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

//Ek Kaam Aur Pending Hai????
getfromSessionStorage(); //--> Because there is a Possibility that Latitude and Longitude pahle se hi available ho.


function switchTab(newTab) {
    if (newTab != oldTab) {
        //Sab se pahle "Current Tab" wali Properites hata denge
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");


        //We dont know on which tab.."CURRENTLY" we are so we have to know first about that....
        if (!searchForm.classList.contains("active")) {
            //Kyaa Search Form wala container Invisible hai??----> If Yes Then Make it VISIBLE....
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //Me pahle "search-wale" tab par tha,ab "Your-Weather" wala tab visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            //Ab Mai Your-Weather Tab me aa gaya hu to Weather bhi show karna padega--> So lets check--
            //--Local Storage First
            getfromSessionStorage();
        }
    }
}


userTab.addEventListener('click', () => {
    //Pass Clicked tab as the Input Parameter
    //Idhar "USER_TAB" Clicked hua hai to "parameter" me usko pass kar denge
    switchTab(userTab)
})

searchTab.addEventListener('click', () => {
    //Pass Clicked tab as the Input Parameter
    //Idhar "SEARCH_TAB" Clicked hua hai to "parameter" me usko pass kar denge
    switchTab(searchTab)
})


//check if the co-ordinates are alredy present in the session storage.
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates"); //same name se aage Show Position me user details stored hai

    if (!localCoordinates) {
        //Agar Local Co-ordinates nahi mile matlab--> location ka access nahi hai.
        grantAccessContainer.classList.add('active');
    }

    else {
        const coordinates = JSON.parse(localCoordinates);

        fetchuserWeatherInfo(coordinates);
    }
}

async function fetchuserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    //Make Grant-Location Container Invisible

    grantAccessContainer.classList.remove("active");

    //make loader visible
    loadingScreen.classList.add("active")

    //API CALL
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }

    catch (err) {
        loadingScreen.classList.remove("active")
    }
}


function renderWeatherInfo(weatherInfo) {
    //firstly we have to fetch the elements
    const cityName = document.querySelector("[data-cityName");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch weather values from WeatherInfor Object and put In UI ELEMENTS.
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;

}


const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    else {
        //HOMEWORK:: Show an alert for no geolocation Support available
        alert("gelocation support is not available on this device.")

    }
}

function showPosition(position) {
    //Ek Object bana diya hai "USER-COORDINATE" name ka
    const userCoordinate =
    {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinate));
    fetchuserWeatherInfo(userCoordinate);

}

const searchInput = document.querySelector("[data-searchInput]")

searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); //this will prevent the default action/Method
    let cityName = searchInput.value;

    if (cityName === "")
        return;
    else
        fetchSearchWeatherInfo(cityName);
})



async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        if (!response.ok) {
            throw new Error('City not found');
        }

        // Clear the error image container when a successful search is made
        clearErrorContainer();


        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }

    catch (err) {
        loadingScreen.classList.remove("active");
        // grantAccessContainer.classList.add("active");
        displayNotFoundErrorImage();
    }
}



function displayNotFoundErrorImage() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = `<img src="./assets/error.png" alt="Error 404 - City not found">`;
}

function clearErrorContainer() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = ""; // Clear any previous content
}
