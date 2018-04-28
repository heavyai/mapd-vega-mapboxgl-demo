require("./styles.css")
require('mapbox-gl/dist/mapbox-gl.css')
require('mapbox-gl/dist/mapboxgl-overrides')

import {serverInfo} from './config'
import {initMap} from './map'
import updateVega from './updateVega'
import {getConnection, getConnectionStatus, saveConnectionObj} from "./mapd-connector"

// create the mapboxgl map
const map = initMap()

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
