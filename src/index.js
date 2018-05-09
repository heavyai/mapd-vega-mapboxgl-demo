require("./styles.css")
require('mapbox-gl/dist/mapbox-gl.css')
require('mapbox-gl/dist/mapboxgl-overrides')

import {serverInfo} from './common/config'
import updateVega from './common/updateVega'
import {getConnection, getConnectionStatus, saveConnectionObj} from "./common/mapd-connector"
import {initMap} from './components/map'
import initSlider from './components/slider'

// render markup for our UI
document.querySelector("#app").innerHTML = `
  <div id="map"></div>
  <div class='map-overlay top'>
  <div class='map-overlay-inner'>
      <h2>Parking Violations in Philadelphia</h2>
      <label id='month'></label>
      <input id='slider' type='range' min='0' max='11' step='1' value='0' />
  </div>
  <div class='map-overlay-inner'>
      <div id='legend' class='legend'>
          <div class='bar'></div>
          <div>Density  </div>
      </div>
  </div>
  </div>
`

// create the mapboxgl map
const map = initMap()

// set up the slider
const slider = initSlider()

// connect to the mapd backend
getConnection(serverInfo)
  .then(con => {
    // save the connection object so we can use it later
    saveConnectionObj(con)
    // check the connection status
    return getConnectionStatus(con)
  })
  .then(status => {
    if (status && status[0] && status[0].rendering_enabled) {
      // render the vega and add it to the map
      updateVega(map)
    } else {
      // no BE rendering :(
      throw Error("backend rendering is not enabled")
    }
  })
  .catch(error => throw error)
