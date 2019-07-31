// import * as LatLonUtils from "../utils/utils-latlon"
import LassoButtonGroupController, {
  getLatLonCircleClass
} from "./lasso-tool-ui"
import earcut from "earcut"
import * as _ from "lodash"
import * as MapdDraw from "@mapd/mapd-draw/dist/mapd-draw"
import updateVega from "./updateVega";
// import { redrawAllAsync } from "../core/core-async"

/* istanbul ignore next */
function writePointInTriangleSqlTest(p0, p1, p2, px, py, cast = false) {
  function writeSign(p0, p1) {
    if (cast) {
      return (
        `((CAST(${px} AS FLOAT)-(${p1[0]}))*(${p0[1] - p1[1]}) - ` +
        `(${p0[0] - p1[0]})*(CAST(${py} AS FLOAT)-(${p1[1]})) < 0.0)`
      )
    } else {
      return (
        `((${px}-(${p1[0]}))*(${p0[1] - p1[1]}) - ` +
        `(${p0[0] - p1[0]})*(${py}-(${p1[1]})) < 0.0)`
      )
    }
  }

  const b1 = writeSign(p0, p1)
  const b2 = writeSign(p1, p2)
  const b3 = writeSign(p2, p0)
  return `(${b1} = ${b2}) AND (${b2} = ${b3})`
}

/* istanbul ignore next */
function createUnlikelyStmtFromShape(shape, xAttr, yAttr, useLonLat) {
  const aabox = shape.aabox
  let xmin = aabox[MapdDraw.AABox2d.MINX]
  let xmax = aabox[MapdDraw.AABox2d.MAXX]
  let ymin = aabox[MapdDraw.AABox2d.MINY]
  let ymax = aabox[MapdDraw.AABox2d.MAXY]
  let cast = true
  if (useLonLat) {
    xmin = LatLonUtils.conv900913To4326X(xmin)
    xmax = LatLonUtils.conv900913To4326X(xmax)
    ymin = LatLonUtils.conv900913To4326Y(ymin)
    ymax = LatLonUtils.conv900913To4326Y(ymax)
    cast = false
  }

  if (cast) {
    return `UNLIKELY(CAST(${xAttr} AS FLOAT) >= ${xmin} AND CAST(${xAttr} AS FLOAT) <= ${xmax} AND CAST(${yAttr} AS FLOAT) >= ${ymin} AND CAST(${yAttr} AS FLOAT) <= ${ymax})`
  } else {
    return `UNLIKELY(${xAttr} >= ${xmin} AND ${xAttr} <= ${xmax} AND ${yAttr} >= ${ymin} AND ${yAttr} <= ${ymax})`
  }
}

/* istanbul ignore next */
export function rasterDrawMixin(chart) {
  let drawEngine = null
  let buttonController = null
  let currXRange = null
  let currYRange = null
  const coordFilters = new Map()
  let origFilterFunc = null
  let origFilterAll = null

  const defaultStyle = {
    fillColor: "#22a7f0",
    fillOpacity: 0.1,
    strokeColor: "#22a7f0",
    strokeWidth: 1.5,
    dashPattern: []
  }

  const defaultSelectStyle = {
    fillColor: "#ef9b20",
    fillOpacity: 0.1,
    strokeColor: "#ef9b20",
    strokeWidth: 2,
    dashPattern: [8, 2]
  }

  function applyHardCodedFilter() {
    
  }
  function drawEventHandler() {
    applyHardCodedFilter()
    updateVega(map)
  }

  const debounceRedraw = chart.debounce(() => {
    drawEventHandler()
  }, 50)
  //
  function updateDrawFromGeom() {
    debounceRedraw()
  }

  chart.addFilterShape = shape => {
    debugger
    shape.on(
      ["changed:geom", "changed:xform", "changed:visibility"],
      updateDrawFromGeom
    )
    updateDrawFromGeom()
  }
  //
  chart.deleteFilterShape = shape => {
    shape.off(["changed"], updateDrawFromGeom)
    updateDrawFromGeom()
  }

  chart.addDrawControl = () => {

    const parent = chart


    // let xscale = chart.x()
    // let yscale = chart.y()
    // if (!xscale || !yscale) {
    //   chart._updateXAndYScales(chart.getDataRenderBounds())
    //   xscale = chart.x()
    //   yscale = chart.y()
    // }
    // currXRange = xscale.domain()
    currXRange =  [-13384429.399010848, 13384429.39901081]
    // currYRange = yscale.domain()
    currYRange = [-10213533.503092205, 17220633.18922549]

    const projDims = [
      Math.abs(currXRange[1] - currXRange[0]),
      Math.abs(currYRange[1] - currYRange[0])
    ]

    const engineOpts = {
      enableInteractions: true,
      projectionDimensions: projDims,
      cameraPosition: [
        currXRange[0] + 0.5 * projDims[0],
        Math.min(currYRange[0], currYRange[1]) + 0.5 * projDims[1]
      ],
      flipY: true,
      selectStyle: defaultSelectStyle,
      xformStyle: {
        fillColor: "white",
        strokeColor: "#555555",
        strokeWidth: 1
      }
    }

    let margins = null
    // if (typeof chart.margins === "function") {
    //   margins = chart.margins()
      engineOpts.margins = null
    // }

    drawEngine = new MapdDraw.ShapeBuilder(chart, engineOpts)
    buttonController = new LassoButtonGroupController(
      parent,
      chart,
      drawEngine,
      defaultStyle,
      defaultSelectStyle
    )

    function updateDraw() {

      const bounds = chart.getDataRenderBounds()
      currXRange = [bounds[0][0], bounds[1][0]]
      currYRange = [bounds[0][1], bounds[2][1]]
      if (typeof chart.useLonLat === "function" && chart.useLonLat()) {
        currXRange[0] = LatLonUtils.conv4326To900913X(currXRange[0])
        currXRange[1] = LatLonUtils.conv4326To900913X(currXRange[1])
        currYRange[0] = LatLonUtils.conv4326To900913Y(currYRange[0])
        currYRange[1] = LatLonUtils.conv4326To900913Y(currYRange[1])
      }

      const newProjDims = [
        Math.abs(currXRange[1] - currXRange[0]),
        Math.abs(currYRange[1] - currYRange[0])
      ]
      drawEngine.projectionDimensions = newProjDims
      drawEngine.cameraPosition = [
        currXRange[0] + 0.5 * newProjDims[0],
        Math.min(currYRange[0], currYRange[1]) + 0.5 * newProjDims[1]
      ]

      debounceRedraw()
    }

    return chart
  }


  return chart
}
