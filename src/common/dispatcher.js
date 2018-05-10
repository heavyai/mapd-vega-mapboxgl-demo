import { dispatch } from "d3-dispatch"
import updateVega from "./updateVega"
import { getMap } from "../components/map"

const dispatcher = dispatch("onChange")

dispatcher.on("onChange", (value) => {
  updateVega(getMap(), value)
})

export default dispatcher
