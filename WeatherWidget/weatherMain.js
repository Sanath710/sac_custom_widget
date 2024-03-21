var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}
;(function () {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
  <style>
  @import url(https://fonts.googleapis.com/css?family=Roboto:400,500,700,900,300);

  body {
      width: 100%;
      height: 100%;
      background-color: #263238;
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Helvetica, Arial, sans-serif;
      color: white!important;
  }

  .widget-container {
      width: 600px;
      height: 412px;
      color: white;
      display: block;
      background-color: #313e45;
      border-radius: 25px;
      /*   border: 5px solid #eceff1; */
      margin: 0 auto;
  }


  /* Widget 4 Quarter Division here */

  .top-left {
      height: 60%;
      width: 50%;
        /* background-color:red; */
      padding: 35px 0 0 45px;
      display: inline-block;
      color: white;
  }

  .top-right {
      height: 40%;
      width: 40%;
        /* background-color: blue; */
      float: right;
      margin-top: 4.5%;
      margin-right: 2%;
      padding: 15px 0 0 0;
      color: white;
  }

  .bottom-left {
      height: 40%;
      width: 45%;
        /* background-color:orange; */
      float: left;
      margin: 0;
      padding: 50px 0 0 45px;
  }

  .bottom-right {
      height: 30%;
      width: 40%;
        /* background-color: brown; */
      float: right;
      margin-top: 3.7%;
      padding: 15px 0 0 0px;
  }

  h1,
  h2,
  h3,
  p {
      margin: 0;
      padding: 0;
  }


  /* Top-left Div CSS */

  #city {
      font-weight: 900;
      font-size: 25px;
  }

  #day {
      font-weight: 700;
      font-size: 25px;
      margin-top: 18px;
  }

  #date {
      font-weight: 500;
      font-size: 20px;
      margin-top: 4px;
  }

  #time {
      font-weight: 400;
      font-size: 18px;
      margin-top: 8px;
  }

  .top-left>a {
      text-decoration: none;
      color: white;
  }

  .top-left>a:hover {
      color: #b0bec5;
  }


  /* Top-Right Div CSS */

  #weather-status {
      font-size: 18px;
      font-weight: 300;
      text-align: center;
      margin: 0 auto;
  }

  .top-right>img {
      width: 120px;
      height: 120px;
      display: block;
      margin: 15px auto 0 auto;
  }


  /* Horizontal-Half-divider */

  .horizontal-half-divider {
      width: 100%;
      height: 3px;
      margin-top: -55px;
      background-color: #263238;
  }

  .vertical-half-divider {
      width: 3px;
      position: absolute;
      height: 167px;
      background-color: #263238;
      float: right;
      display: inline-block;
      padding: 0;
  }


  /* Bottom-left CSS */

  #temperature,
  #celsius,
  #temp-divider,
  #fahrenheit {
      display: inline;
      vertical-align: middle;
  }

  #temperature {
      font-size: 60px;
      font-weight: 800;
      margin-right: 5px;
  }

  #celsius {
      margin-right: 10px;
  }

  #fahrenheit {
      margin-right: 5px;
      color: #b0bec5!important;
  }

  #celsius,
  #temp-divider,
  #fahrenheit {
      font-size: 30px;
      font-weight: 800;
  }

  #celsius:hover,
  #fahrenheit:hover {
      cursor: pointer;
  }




  /* Bottom-Right CSS */

  .other-details-key {
      float: left;
      font-size: 16px;
      font-weight: 300;
  }

  .other-details-values {
      float: left;
      font-size: 16px;
      font-weight: 400;
      margin-left: 40px;
  }
</style>
                  <div id="wrapper">
                  <div class="widget-container">
                    <div class="top-left">
                      <h1 class="city" id="city">Weather Widget App</h1>
                      <h2 id="day">Day</h2>
                      <h3 id="date">Month, Day Year</h3>
                      <h3 id="time">Time</h3>
                <!--       <a target="_blank" href="https://codepen.io/myleschuahiock/"><p id="codepen-link">codepen.io/myleschuahiock</p></a> -->
                      <p class="geo"></p>
                    </div>
                    <div class="top-right">
                      <h1 id="weather-status">Weather / Weather Status</h1>
                      <img id="weather-icon" src="https://myleschuahiock.files.wordpress.com/2016/02/sunny2.png">
                    </div>
                    <div class="horizontal-half-divider"></div>
                    <div class="bottom-left">
                      <h1 id="temperature">0</h1>
                      <h2 id="celsius">&degC</h2>
                      <h2 id="temp-divider">/</h2>
                      <h2 id="fahrenheit">&degF</h2>
                    </div>
                    <div class="vertical-half-divider"></div>
                    <div class="bottom-right">
                      <div class="other-details-key">
                        <p>Wind Speed</p>
                        <p>Humidity</p>
                        <p>Pressure</p>
                        <p>Sunrise Time</p>
                        <p>Sunset Time</p>
                      </div>
                      <div class="other-details-values">
                        <p id="windspeed">0 Km/h</p>
                        <p id="humidity">0 %</p>
                        <p id="pressure">0 hPa</p>
                        <p id="sunrise-time">0:00 am</p>
                        <p id="sunset-time">0:00 pm</p>
                      </div>
                    </div>
                  </div>
                </div>
                `

  class WeatherWidget extends HTMLElement {
    constructor () {
      //   console.clear()
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')

      this._wrapper = this._shadowRoot.getElementById('wrapper')
      this._day = this._shadowRoot.getElementById('day')
      this._date = this._shadowRoot.getElementById('date')
      this._time = this._shadowRoot.getElementById('time')

      this._celsius = this._shadowRoot.getElementById('celsius')
      this._fahrenheit = this._shadowRoot.getElementById('fahrenheit')

      this._props = {}
    }

    onCustomWidgetBeforeUpdate (changedProperties) {
      this._props = { ...this._props, ...changedProperties }
    }

    onCustomWidgetAfterUpdate (changedProperties) {
      this.render()
    }

    setLatLon (lat, lon) {
      this._lat = lat
      this._lon = lon
      console.log(lat + ' - ' + lon)
    }

    async render () {
      await getScriptPromisify('https://www.gstatic.com/charts/loader.js')
      $(this._wrapper).css('margin-top', $(window).height() / 5)
      //DATE AND TIME//
      //Converted into days, months, hours, day-name, AM/PM
      var dt = new Date()
      var days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
      $(this._day).html(days[dt.getDay()])
      var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      $(this._date).html(
        months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear()
      )
      $(this._time).html(
        (dt.getHours() > 12 ? dt.getHours() - 12 : dt.getHours()).toString() +
          ':' +
          ((dt.getMinutes() < 10 ? '0' : '').toString() +
            dt.getMinutes().toString()) +
          (dt.getHours() < 12 ? ' AM' : ' PM').toString()
      )

      //CELSIUS TO FAHRENHEIT CONVERTER on Click
      var temp = 0
      $(this._fahrenheit).click(function () {
        $(this).css('color', 'white')
        $(this._celsius).css('color', '#b0bec5')
        $(this._temperature).html(Math.round(temp * 1.8 + 32))
      })

      $(this._celsius).click(function () {
        $(this).css('color', 'white')
        $(this._fahrenheit).css('color', '#b0bec5')
        $(this._temperature).html(Math.round(temp))
      })

      //GEOLOCATION and WEATHER API//
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var myLatitude = parseFloat(
            Math.round(position.coords.latitude * 100) / 100
          ).toFixed(2)
          var myLongitude = parseFloat(
            Math.round(position.coords.longitude * 100) / 100
          ).toFixed(2)
          //var utcTime = Math.round(new Date().getTime()/1000.0);

          // $('.geo').html(position.coords.latitude + " " + position.coords.longitude);
          $.getJSON(
            'https://api.openweathermap.org/data/2.5/weather?lat=' +
              myLatitude +
              '&lon=' +
              myLongitude +
              '&id=524901&appid=ca8c2c7970a09dc296d9b3cfc4d06940',
            function (json) {
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#city').innerHTML =
                json.name + ', ' + json.sys.country
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#weather-status').innerHTML =
                json.weather[0].main + ' / ' + json.weather[0].description

              this._weatherIcon = document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#weather-icon')

              //WEATHER CONDITIONS FOUND HERE: http://openweathermap.org/weather-conditions
              switch (json.weather[0].main) {
                case 'Clouds':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/cloudy.png'
                  )
                  break
                case 'Clear':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/sunny2.png'
                  )
                  break
                case 'Thunderstorm':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/thunderstorm.png'
                  )
                  break
                case 'Drizzle':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/drizzle.png'
                  )
                  break
                case 'Rain':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/rain.png'
                  )
                  break
                case 'Snow':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/snow.png'
                  )
                  break
                case 'Extreme':
                  $(this._weatherIcon).attr(
                    'src',
                    'https://myleschuahiock.files.wordpress.com/2016/02/warning.png'
                  )
                  break
              }
              temp = json.main.temp - 273
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#temperature').innerHTML =
                Math.round(temp)
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#windspeed').innerHTML =
                json.wind.speed + ' Km/h'
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#humidity').innerHTML =
                json.main.humidity + ' %'
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#pressure').innerHTML =
                json.main.pressure + ' hPa'
              var sunriseUTC = json.sys.sunrise * 1000
              var sunsetUTC = json.sys.sunset * 1000
              var sunriseDt = new Date(sunriseUTC)
              var sunsetDt = new Date(sunsetUTC)
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#sunrise-time').innerHTML =
                (sunriseDt.getHours() > 12
                  ? sunriseDt.getHours() - 12
                  : sunriseDt.getHours()
                ).toString() +
                ':' +
                ((sunriseDt.getMinutes() < 10 ? '0' : '').toString() +
                  sunriseDt.getMinutes().toString()) +
                (sunriseDt.getHours() < 12 ? ' AM' : ' PM').toString()
              document
                .querySelector('cw-weather-widget')
                .shadowRoot.querySelector('#sunset-time').innerHTML =
                (sunsetDt.getHours() > 12
                  ? sunsetDt.getHours() - 12
                  : sunsetDt.getHours()
                ).toString() +
                ':' +
                ((sunsetDt.getMinutes() < 10 ? '0' : '').toString() +
                  sunsetDt.getMinutes().toString()) +
                (sunsetDt.getHours() < 12 ? ' AM' : ' PM').toString()
              // $('.sunrise-time').html(json.sys.sunrise);
              // $('.sunset-time').html(json.sys.sunset);
            }
          )
        })
      } else {
        $(this._city).html('Please turn on Geolocator on Browser.')
      }
    }
  }
  customElements.define('cw-weather-widget', WeatherWidget)
})()
