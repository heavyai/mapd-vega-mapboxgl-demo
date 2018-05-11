import { scaleTime } from "d3-scale"
import { timeParse, timeFormat } from "d3-time-format"
import { timeMonth, timeDay } from "d3-time"
import throttle from "lodash.throttle"

import dispatcher from "../common/dispatcher"

let slider = null

const WAIT_TIME_MS = 100

const parseString = "%B %d %Y"
const formatString = "%Y-%m-%d 00:00:00"

const timeParser = timeParse(parseString)
const timeFormatter = timeFormat(formatString)

const startDate = timeParser("January 01 2012")
const endDate = timeParser("December 31 2017")

const numberMonths = timeDay.count(startDate, endDate)

const timeScale = scaleTime()
  .range([0, numberMonths])
  .domain([startDate, endDate])

function handleInputChange(event) {
  //for debugging
  console.log(timeFormatter(timeScale.invert(event.target.value)))
  dispatcher.call("onChange", null, timeFormatter(timeScale.invert(event.target.value)))
}


function initSlider() {
  slider = document.getElementById('slider')
  slider.setAttribute('max', numberMonths)
  slider.addEventListener('input', throttle(handleInputChange, WAIT_TIME_MS))
  return slider
}

export default initSlider
