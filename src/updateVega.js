import {updateMap} from "./mapboxMap"
import makeVegaSpec from "./vegaspec"
import {renderVega} from "./mapd-connector"
import {conv4326To900913} from "./utils"
import {serverInfo} from './config'

function updateVega(map, filterExpr) {
  const container = map.getContainer()
  const height = container.clientHeight
  const width = container.clientWidth

  const {_sw, _ne} = map.getBounds()
  const [xMin, yMin] = conv4326To900913([_sw.lng, _sw.lat])
  const [xMax, yMax] = conv4326To900913([_ne.lng, _ne.lat])
  const filter = filterExpr || ""

  const vegaSpec = makeVegaSpec({
    width,
    height,
    minXBounds: xMin,
    maxXBounds: xMax,
    minYBounds: yMin,
    maxYBounds: yMax,
    filter
  })
console.log('vegaSpec ', vegaSpec.data[0].sql)
  // render the vega and add it to the map
  renderVega(vegaSpec)
    .then(result => {
      updateMap(result)
    })
    .catch(error => throw error)
}

export default updateVega;
