//settings
var MA_depth = 8
var lines = 9
var powerLaw = 0.6

//setup
var cnv = document.querySelector('#canvas'),
    ctx = cnv.getContext("2d")

var interval
var interval_rotate

var points = []
var colors = []
var m = 1 / lines
var resizeInfo
var maxCalls
var colorInterval
var colorNo = 0
var flag = true
init()

function init() {
    $.loop(lines, (i) => {
        points[i] = new $Collection(MA_depth * Math.pow(i + 2, powerLaw))
    })
    $.loop(lines, (i) => {
        colors[i] = "hsla(0, 100%, " +
            Math.pow((lines - i) * m, 0.3) * 100 + "%, 1)"
    })
    maxCalls = lines * (MA_depth * Math.pow(lines, powerLaw)) / 2
}

// === resize stuff

resizeInfo = getResizeInfo()
cnv.width = resizeInfo.window.width + 100
cnv.height = resizeInfo.window.height + 100

$(window).addEvent('resize', () => {

    resizeInfo = getResizeInfo()
    var temp = resizeInfo.window
    if (temp.width > temp.recentMaxWidth) {
        var w = resizeInfo.window.width + 100
    } else {
        var w = resizeInfo.window.recentMaxWidth + 100
    }
    if (temp.height > temp.recentMaxHeight) {
        var h = resizeInfo.window.height + 100
    } else {
        var h = resizeInfo.window.recentMaxHeight + 100
    }
    var temp_cnv = document.createElement('canvas');
    var temp_ctx = temp_cnv.getContext('2d');

    // set it to the new width & height and draw the current canvas data into it 
    temp_cnv.width = w;
    temp_cnv.height = h;
    temp_ctx.fillRect(0, 0, w, h);
    temp_ctx.drawImage(cnv, 0, 0);

    // resize & clear the original canvas and copy back in the cached pixel data
    cnv.width = w;
    cnv.height = h;
    ctx.drawImage(temp_cnv, 0, 0);
})

function getResizeInfo() {
    var recentMaxWidth = resizeInfo ? maxWidth() : window.innerWidth
    var recentMaxHeight = resizeInfo ? maxHeight() : window.innerHeight

    function maxWidth() {
        return Math.max(window.innerWidth, resizeInfo.window.recentMaxWidth)
    }

    function maxHeight() {
        return Math.max(window.innerHeight, resizeInfo.window.recentMaxHeight)
    }

    return {
        window: {
            recentMaxWidth: recentMaxWidth,
            recentMaxHeight: recentMaxHeight,
            width: window.innerWidth,
            height: window.innerHeight
        }
    }
}

// === keypress stuff

var rotate = false
var x_mod = 0
var y_mod = 0

var link = $('a#button')._

$(document).addEvent('keypress', (e) => {

    //save
    if (e.key.toLowerCase() === 's') {

        link.href = cnv.toDataURL()
        link.download = "groundJokes.png"
        link.click()
    }

    //randomize preset
    if (e.key.toLowerCase() === 'r') {
        i = 0

        if(rotate) {
            rotate = false

            x_mod = 0
            y_mod = 0

            clearInterval(interval_rotate)

        } else {
            rotate = true

            interval_rotate = setInterval(() => {
                i++
                console.log(Math.sin(i))

                x_mod += Math.sin(i)*20
                y_mod += Math.cos(i)*20

            }, 50)
        }

    }

});

//declare listeners
$(document)
    .addEvent('mouseenter', mouseenter)
    .addEvent('mouseleave', mouseleave)
    .addEvent('mousemove', mousemove)
    .addEvent('click', click)
    .mousemoveConstant(mousemove)

//go
var i

addPoints({
    pageX: resizeInfo.window.width / 2,
    pageY: resizeInfo.window.height / 2
}, points)

function click(e) {
    if (flag) { flag = false } else { flag = true }
}

function mouseenter(e) {
    //complete last mouseleave
    if (interval) { clearInterval(interval) }
    //initiate mousemove handler
    return true
}

function mousemove(e) {

    var n = mousemovePrep(e)

    //add points and draw!
    $.loop(3, () => {

        addPoints(n, points)
        drawLines()
    })

}

function mouseleave(e) {

    var n = mouseleavePrep(e)

    i = 0
    interval = setInterval(() => {
        i++
        //add points and draw!
        addPoints(n, points)
        drawLines()
        if (i > maxCalls) { clearInterval(interval) }

    }, 0)

    return true
}

// === Helpers

function addPoints(e, arr) {

    if (flag) {

        if (rotate) {
            e.pageX += x_mod
            e.pageY += y_mod
        }

        arr[0].new({
            X: e.pageX - cnv.offsetLeft,
            Y: e.pageY - cnv.offsetTop
        })

        $.loop(arr.length - 1, (i) => {
            calculateAveragesWorker(arr[i + 1], arr[i])
        })
    }

    function calculateAveragesWorker(a, b) {
        a.new({
            X: mean(b.array.map(el => el.X)),
            Y: mean(b.array.map(el => el.Y))
        })
    }

    function mean(arr) {
        return arr.reduce((a, b) => a + b) / arr.length
    }
}

function drawLines() {

    $.loop(points.length - 2, (i) => {
        i = i + 2

        ctx.strokeStyle = "rgba(0,0,0,1)"
        ctx.lineWidth = 9.2
        ctx.lineCap = 'butt'
        drawLine(points[i].array)

        ctx.strokeStyle = colors[i]
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        drawLine(points[i].array)
    })

    function drawLine(arr) {
        var i = arr.length - 1
        ctx.beginPath()
        ctx.lineTo(arr[i - 1].X, arr[i - 1].Y)
        ctx.lineTo(arr[i].X, arr[i].Y)
        ctx.stroke()
    }
}

function mousemovePrep(e) {
    var n = {}
    if (e.pageX < 5) {
        n.pageX = e.pageX - 100
    } else if (e.pageX > resizeInfo.window.width - 5) {
        n.pageX = e.pageX + 100
    } else {
        n.pageX = e.pageX
    }
    if (e.pageY < 5) {
        n.pageY = e.pageY - 100
    } else if (e.pageY > resizeInfo.window.height - 5) {
        n.pageY = e.pageY + 100
    } else {
        n.pageY = e.pageY
    }

    return n
}

function mouseleavePrep(e) {
    var n= {}
    if (e.pageX <= 0) {
        n.pageX = e.pageX - 200
    } else if (e.pageX >= resizeInfo.window.width) {
        n.pageX = e.pageX + 200
    } else {
        n.pageX = e.pageX
    }
    if (e.pageY <= 0) {
        n.pageY = e.pageY - 200
    } else if (e.pageY >= resizeInfo.window.height) {
        n.pageY = e.pageY + 200
    } else {
        n.pageY = e.pageY
    }

    return n
}