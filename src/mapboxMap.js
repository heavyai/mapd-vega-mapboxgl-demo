import {debounce, conv4326To900913} from "./utils"
import updateVega from "./updateVega"
import {rasterDrawMixin, addDrawControl} from "./draw-mixin";
import {saveConnectionObj, getSavedConnection} from "./mapd-connector"
// set the access token for MapboxGLJS
var accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiIzOTJmMjBiZmI2NGQ2ZjAzODhiMzhiOGI2MTI1YTk4YSJ9.sIOXXU3TPp5dLg_L3cUxhQ';
mapboxgl.accessToken = accessToken;
function valuesOb(obj) {
  return Object.keys(obj).map(key => obj[key])
}
let map = null

export const initMap = () => {
  // create a div element for mapboxgl to hook into
  var chart = document.createElement("div");
  chart.id = "map"
  let _interactionsEnabled = true
  let _mapInitted = false
  let hasAppliedInitialBounds = false
  let _clientClickX = null
  let _clientClickY = null

  document.querySelector("body").append(chart)

  // instantiate the map object
  map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-97.5,39.8],
    zoom: 2,
    minZoom: 2,
    maxZoom: 16,
    maxBounds: [[-129, 22], [-66, 54]]
  });

  // add map navigation controls
  map.addControl(new mapboxgl.NavigationControl());
  chart.enableInteractions = function(enableInteractions, opts = {}) {
    if (!arguments.length) {
      return _interactionsEnabled
    }

    const mapboxInteractionProps = [
      "scrollZoom",
      "boxZoom",
      "dragPan",
      "keyboard",
      "doubleClickZoom",
    ]
    _interactionsEnabled = Boolean(enableInteractions)

    if (_mapInitted) {
      mapboxInteractionProps.forEach(prop => {
        if (map[prop]) {
          const enable =
            typeof opts[prop] !== "undefined"
              ? Boolean(opts[prop])
              : _interactionsEnabled
          if (enable) {
            map[prop].enable()
          } else {
            map[prop].disable()

            if (prop === "dragPan") {
              // force a clear of the current event state on the map
              // to fully disable pans
              map[prop]._onMouseUp({
                button: 0
              })
            }
          }
        }
      })
    }
    return chart
  }

  chart.debounce = function(func, wait, immediate) {
    let timeout

    return function() {
      let context = this,
        args = arguments
      const later = function() {
        timeout = null
        if (!immediate) {
          func.apply(context, args)
        }
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) {
        func.apply(context, args)
      }
    }
  }

  chart.getDataRenderBounds = function() {
    const bounds = map.getBounds()

    let renderBounds = [
      valuesOb(bounds.getNorthWest()),
      valuesOb(bounds.getNorthEast()),
      valuesOb(bounds.getSouthEast()),
      valuesOb(bounds.getSouthWest())
    ]

    renderBounds = [
      conv4326To900913(renderBounds[0]),
      conv4326To900913(renderBounds[1]),
      conv4326To900913(renderBounds[2]),
      conv4326To900913(renderBounds[3])
    ]

    hasAppliedInitialBounds = true
    return renderBounds
  }

  rasterDrawMixin(chart, map)
  chart.addDrawControl()
  function update() {
    updateVega(map)
  }
  map.on("mousedown", event => {
    _clientClickX = event.point.x
    _clientClickY = event.point.y
  })

  map.on("mouseup", event => {
    // Make sure that the user is clicking to filter, and not dragging or panning the map
    if (
      _clientClickX === event.point.x &&
      _clientClickY === event.point.y
    ) {
      console.log('clientX and clientY', _clientClickX, _clientClickY)
      getClosestResult(event.point, result => {
        const data = result.row_set[0]
        console.log('result data', data)
      })
    }
  })
  map.on('move', debounce(update, 100))

  return map
}

export const getMap = () => map

export const setMap = createdMap => {
  if (map) map.remove()
  map = createdMap
}

export const resizeMap = () => {
  if (map) {
    map.resize()
  }
}

export const clearMap = () => {
  if (map) map.remove()
  map = null
}

export const setBounds = bounds => {
  map.fitBounds([bounds._sw, bounds._ne],
    {
      linear: true
    }
  )
}

export const getBounds = () => map.getBounds()

export const updateMap = (vegaImage) => {
  const mapBounds = map.getBounds()
  const imageBounds = [
    [mapBounds.getNorthWest().lng, mapBounds.getNorthWest().lat],
    [mapBounds.getNorthEast().lng, mapBounds.getNorthEast().lat],
    [mapBounds.getSouthEast().lng, mapBounds.getSouthEast().lat],
    [mapBounds.getSouthWest().lng, mapBounds.getSouthWest().lat]
  ];

  if (typeof map.getLayer('overlay') === 'undefined') {
    var toBeAddedOverlay = 'overlay';
    map.addSource(toBeAddedOverlay, {
      type: 'image',
      url: vegaImage,
      coordinates: imageBounds
    });
    map.addLayer({
      id: toBeAddedOverlay,
      source: toBeAddedOverlay,
      type: 'raster',
      paint: {'raster-opacity': 0.85, 'raster-fade-duration': 0}
    });
  }
  else {
    var overlayName = 'overlay';
    var imageSrc = map.getSource(overlayName);
    imageSrc.updateImage({
      url: vegaImage,
      coordinates: imageBounds
    });
  }
}

function getClosestResult(point, callback) {
  const height = 700
  const pixelRatio = 1
  const pixel = new TPixel({
    x: Math.round(point.x * pixelRatio),
    y: Math.round((height - point.y) * pixelRatio)
  })

  if (!point) {
    return
  }

  const layerObj = {}
  layerObj['pointmap'] = ["amount", "conv_4326_900913_x(lon) AS x", "conv_4326_900913_y(lat) AS y"]

  getSavedConnection()
    .getResultRowForPixelAsync(
      1,
      pixel,
      layerObj,
      Math.ceil(2 * pixelRatio)
    )
    .then(results => callback(results[0]))
    .catch(error => {
      throw new Error(
        `getResultRowForPixel failed with message: ${error.message}`
      )
    })
}
