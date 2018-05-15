import { scaleTime } from "d3-scale"
import { timeParse, timeFormat } from "d3-time-format"
import { timeMonth, timeDay } from "d3-time"

// https://github.com/d3/d3-time-format#locale_format
const parseString = "%B %d %Y"
const formatString = "%Y-%m-%d"
const formatStringDR = "%B %d, %Y"//"%B %Y"

export const timeParser = timeParse(parseString)
export const timeFormatter = timeFormat(formatString)
export const timeFormatterDR = timeFormat(formatStringDR)

export const startDate = timeParser("January 01 2018")
export const endDate = timeParser("January 09 2018")

export const numberMonths = timeDay.count(startDate, endDate)

export const timeScale = scaleTime()
  .range([0, numberMonths])
  .domain([startDate, endDate])
