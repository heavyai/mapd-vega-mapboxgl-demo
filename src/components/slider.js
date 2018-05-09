let slider = null

function initSlider() {
  slider = document.getElementById('slider')

  slider.setAttribute('max', 12 * 7)

  slider.addEventListener('input', (e) => {
    console.log(e.target.value)
  })

  return slider
}

export default initSlider
