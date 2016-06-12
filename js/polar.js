var app = (function (root) {
    "use strict";
    var x = {},
        canvas = null,
        context = null,
        center = {x: 0, y: 0},
        play = true,
        arcWidth = 30,
        arcSpacing = 10,
        colors = {
            seconds: [240, 38, 78], // red-ish
            hours: [180, 240, 14], // green-ish
            minutes: [38, 184, 240], // blue-ish
//            hours: [38, 101, 240], // darkblue-ish
            days: [240, 137, 62], // orange-ish
            months: [240, 112, 48] // darkorange-ish
        };

    x.ignite = function () {
        canvas = document.querySelector('#canvas');
        context = canvas.getContext('2d');
        this.updateSizes();
        x.animate();
        draw();
    };
    
    x.play = function () {
        play = true;
        x.animate();
    };
    
    x.stop = function () {
        play = false;
    };
    
    x.isPlaying = function () {
        return play;
    };
    
    x.updateSizes = function () {
        var minSize;
        var pixelRatios = root.tb.getPixelRatios(context);
        
        canvas.height = window.innerHeight;
        canvas.width  = window.innerWidth;

        if (pixelRatios.device !== pixelRatios.context) {
          canvas.height *= pixelRatios.ratio;
          canvas.width  *= pixelRatios.ratio;
        }

        center.x = canvas.width / 2;
        center.y = canvas.height / 2;
        
        minSize = canvas.width<canvas.height?canvas.width:canvas.height;
        
        arcSpacing = minSize * 0.01;
        arcWidth = ((minSize * 0.8) / 5 - 5 * arcSpacing) / 2; 
//        console.log(arcWidth);
        draw();
    };
    
    x.animate = function () {
        if (play) {
            root.requestAnimationFrame(x.animate);
            draw();
        }
    };
    
    function draw() {
        clearCanvas();
        var i,
            particle = null,
            pos = {},
            now = new Date(),
            nowStamp = now.getTime(),
            daysInMonth = root.tb.getDaysInMonth(now.getMonth(), now.getFullYear(), true),
            angles = {},
            seconds = (nowStamp / 1000) % 60,
            minutes = now.getMinutes() + seconds / 60,
            hours = now.getHours() + minutes / 60,
            days = now.getDate() - 1 + hours / 24,
            month = now.getMonth() + days / daysInMonth;
        
        angles.seconds = 360 * (seconds / 60);
        angles.minutes = 360 * (minutes / 60);
        angles.hours = 360 * (hours / 24);
        angles.days = 360 * (days / daysInMonth);
        angles.month = 360 * (month / 12);
        
        drawSeconds(nowStamp % 1000 / 1000, arcWidth);
        drawArc(arcWidth + arcSpacing, arcWidth, angles.seconds, colors.seconds, 1);
        drawArc(arcWidth * 2 + arcSpacing * 2, arcWidth, angles.minutes, colors.minutes, 1);
        drawArc(arcWidth * 3 + arcSpacing * 3, arcWidth, angles.hours, colors.hours, 1);
        drawArc(arcWidth * 4 + arcSpacing * 4, arcWidth, angles.days, colors.days, 1);
        drawArc(arcWidth * 5 + arcSpacing * 5, arcWidth, angles.month, colors.months, 1);
    }
    
    function drawSeconds(milliseconds, maxRadius) {
//        var c = (new root.RColor()).get(false, 0.8, 0.94);
        drawCircle(center, maxRadius * milliseconds, [240, 38, 78], 1 - milliseconds);

    }
    
    function drawArc(distanceFromCenter, width, angle, color, alpha) {
        var cir = distanceFromCenter,
            cor = distanceFromCenter + width,
            rootAngle = 270,
            targetAngle = angle === 360?rootAngle - 1:(rootAngle + angle) % 360,
            drawEndPoints = false,
            drawClockCenter = false;
        
        var ci_c1 = root.tb.getCoordsOnCircle(rootAngle, cir, center),
            co_c1 = root.tb.getCoordsOnCircle(rootAngle, cor, center),
            ci_c2 = root.tb.getCoordsOnCircle(targetAngle, cir, center),
            co_c2 = root.tb.getCoordsOnCircle(targetAngle, cor, center);
        

        var a1 = ((Math.PI * 2) * rootAngle) / 360,
            a2 = ((Math.PI * 2) * targetAngle) / 360;
        
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
        context.beginPath();
        context.arc(center.x, center.y, cir, a2, a1, true); // from green to red
        context.lineTo(co_c1.x, co_c1.y); // -> teal
        context.arc(center.x, center.y, cor, a1, a2, false); // from magenta to teal 
        context.moveTo(co_c2.x, co_c2.y); // -> magenta
        context.lineTo(ci_c2.x, ci_c2.y); // -> green
        context.closePath();
        context.stroke();
        context.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
        context.fill();
        if(drawClockCenter) {
            drawCircle(center, 5, [255, 255, 255], 1);
        }
        if(drawEndPoints) {
            drawCircle(ci_c1, 3, [255, 0, 0], 1); // red
            drawCircle(ci_c2, 3, [0, 255, 0], 1); // green
            drawCircle(co_c1, 3, [0, 255, 255], 1); // teal
            drawCircle(co_c2, 3, [255, 0, 255], 1); // magenta
        }
    }

    function clearCanvas() {
        context.fillStyle = 'rgba(55,47,36,0.3)';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function drawCircle(coords, radius, color, alpha) {
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
        context.beginPath();
        context.arc(coords.x, coords.y, radius, 0, Math.PI * 2, true);
        context.stroke();
        context.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
        context.fill();
        context.closePath();
    }
    return x;
}(window));

window.onload = function () {
    "use strict";
    app.ignite();
};

window.onresize = function () {
    "use strict";
    app.updateSizes();
};