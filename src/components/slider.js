import throttle from "lodash.throttle"

import dispatcher from "../common/dispatcher"
import {
  timeParser,
  timeFormatter,
  startDate,
  endDate,
  numberMonths,
  timeScale
} from "../common/date-time-utils"

let slider = null
const WAIT_TIME_MS = 100

function handleInputChange(event) {
  //for debugging
  console.log(timeFormatter(timeScale.invert(event.target.value)))
  dispatcher.call(
    "sliderInput",
    null,
    timeScale.invert(event.target.value)
  )
}

function initSlider() {
  slider = document.querySelector("input.slider")
  slider.setAttribute("max", numberMonths)
  slider.addEventListener("input", throttle(handleInputChange, WAIT_TIME_MS))
  return slider
}

export default initSlider
