import dispatcher from "../common/dispatcher"
import { startDate, timeFormatter } from "./slider"

let dateReadOut = null

export function initDateReadOut() {
  dateReadOut = document.querySelector(".date-read-out")
  dateReadOut.innerHTML = timeFormatter(startDate)
}

export function updateDateReadOut(value) {
  dateReadOut.innerHTML = value
}

export default dateReadOut
