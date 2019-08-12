function mod() {
    if (colorInterval) {
        clearInterval(colorInterval)
        colorInterval = null
    } else {
        colorInterval = setInterval(() => {
            colorNo = (colorNo + 2) % 360
            $.loop(lines, (i) => {
                colors[i] = "hsla(" + colorNo + ", 100%, " +
                    Math.pow((lines - i) * m, 0.3) * 100 + "%, 1)"
            })
        }, 100)
    }
}