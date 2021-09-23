var api = "https://api.openweathermap.org/data/2.5";
// weather?q=${city name}&appid={API key}
var apiKey = "216867ac9ef656a473c84008667b8b05";

function requestWeather(cityName) {
    todaysWeather(cityName)
    fiveDayForecast(cityName)
}

var searchedCities = JSON.parse(localStorage.getItem("city")) || []
for (let i = 0; i < searchedCities.length; i++) {
    const currentCity = searchedCities[i];
    var savedCity = $("<button></button>").text(currentCity)
    savedCity.on("click", function() { 
        requestWeather(currentCity)
    })
    
    $("#history").append(savedCity)
}

$("#search").on("click", function() {
    var cityName = $("#cityName").val()
    if (cityName) { 
        requestWeather(cityName)

        searchedCities.push(cityName)
        localStorage.setItem("city", JSON.stringify(searchedCities))
    }
})

function apiCall(endpoint) {
    return fetch(`${api}${endpoint}`)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json()
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
}

function setWeatherIcon(idSelector, description, icon) {
    $(idSelector).attr("alt", description)
    $(idSelector).attr("src", `./Assets/icons/${icon}@2x.png`)
}

function setTemp(tempSelector, temp) {
    $(tempSelector).text(`Temp: ${temp}°F`)
}

function todaysWeather(cityName) {
    //  `${var}` instead of + for concat. string interpolation.
    apiCall(`/weather?q=${cityName}&appid=${apiKey}&units=imperial`)
    //anonymous function
    .then(function(data) {
        console.log(data)
        var cityDate = $("#cityDate")
        // adding date in javascript
        cityDate.text(`${data.name} ${new Date().toLocaleDateString()}`)

        var {description, icon} = data.weather[0]
        setWeatherIcon("#weatherIcon", description, icon)

        // math.round instead of .slice to avoid temps more than 2 characters long being cut off
        var temp = Math.round(data.main.temp)
        setTemp("#temp", temp)

        var wind = Math.round(data.wind.speed)
        $("#wind").text(`Wind Speed: ${wind} mph`)

        $("#humidity").text(`Humidity: ${data.main.humidity}%`)

        //lat and lon are already children of coord. object destructuring.
        var {lat, lon} = data.coord
        apiCall(`/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(function(uvData) {
            var uvIndex = Math.round(uvData.value)
            $("#uv").text(`UV index: ${uvIndex}`)
            if (uvIndex < 3) {
                $("#uv").css("background-color", "green")
            } else if (uvIndex < 8) {
                $("#uv").css("background-color", "orange")  
            } else {
                $("#uv").css("background-color", "red")  
            }
        })
    })
}

function fiveDayForecast(cityName) {
    apiCall(`/forecast?q=${cityName}&appid=${apiKey}&units=imperial`)
    .then (function(fiveDay) {
        console.log("--",fiveDay)
        var nextDay = [4, 12, 20, 28, 36]
        nextDay.forEach(function(currentValue, j) {
            console.log(fiveDay.list[currentValue].weather[0])

            var {description, icon} = fiveDay.list[currentValue].weather[0]
            setWeatherIcon(`#icon${j+1}`, description, icon)

            // dt_txt: "2021-03-30 15:00:00" datetime text
            let [_, month, day] = fiveDay.list[currentValue].dt_txt.split(" ")[0].split("-")
            $(`#date${j+1}`).text(`${month}/${day}`)

            // make a function
            var temp = Math.round(fiveDay.list[currentValue].main.temp)
            setTemp(`#temp${j+1}`, temp)

            // make a function
            $(`#humidity${j+1}`).text(`Humidity: ${fiveDay.list[currentValue].main.humidity}%`)
        })
    })
}
