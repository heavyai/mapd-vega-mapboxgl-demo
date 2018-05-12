import { dispatch } from "d3-dispatch"
import updateVega from "./updateVega"
import { getMap } from "../components/map"
import { updateDateReadOut } from "../components/dateReadOut"

// use d3's dispatch module to handle updating the map on user events
const dispatcher = dispatch("sliderInput", "mapMove")

dispatcher.on("sliderInput", (value) => {
  updateVega(getMap(), value)
  updateDateReadOut(value)
})

dispatcher.on("mapMove", () => {
  updateVega(getMap())
})

export default dispatcher
