import { scaleTime } from "d3-scale"
import { timeParse, timeFormat } from "d3-time-format"
import { timeMonth } from "d3-time"

let slider = null

const parseString = "%B %d %Y"
const formatString = "%Y-%m-%d %H:%M:%S"

const timeParser = timeParse(parseString)
const timeFormatter = timeFormat(formatString)

const startDate = timeParser("December 31 2011")
const endDate = timeParser("December 31 2017")

const numberMonths = timeMonth.count(startDate, endDate)

const timeScale = scaleTime()
  .range([0, numberMonths])
  .domain([startDate, endDate])

function initSlider() {
  slider = document.getElementById('slider')
  slider.setAttribute('max', numberMonths)
  slider.addEventListener('input', (e) => {
    // TODO: pipe this to the vegaSpec and call updateVega
    console.log(timeFormatter(timeScale.invert(e.target.value)))
  })
  return slider
}

export default initSlider
