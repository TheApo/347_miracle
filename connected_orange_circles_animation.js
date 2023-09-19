const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const bigCircleRadius = (canvas.width - 100) / 2;
let smallCircleRadius = bigCircleRadius * 3 / 7;
//const lineLength = smallCircleRadius * 0.8;
let lineLength = smallCircleRadius * document.getElementById("orangeCircleDistance").value / 100;
const orangeCircleRadius = 5;
let path = [];
let angle = 0;
let animationId = null;
let spinFactor = 4 / 3 - 1;
let countOrange = document.getElementById("star_density").value;
let grayCircleOffsets = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
let orangeCircleOffsets = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
let count = document.getElementById("star_density").value - document.getElementById("star_vertices").value;

function getGrayCircleCenter(offset) {
    return {
        x: centerX + (bigCircleRadius - smallCircleRadius) * Math.cos(-angle + offset),
        y: centerY + (bigCircleRadius - smallCircleRadius) * Math.sin(-angle + offset)
    };
}

function getOrangeCircleCenter(grayCircleCenter, offsetAngle) {
    const relativeAngle = angle + spinFactor * angle + offsetAngle;
    return {
        x: grayCircleCenter.x + lineLength * Math.cos(relativeAngle),
        y: grayCircleCenter.y + lineLength * Math.sin(relativeAngle)
    };
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the big circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, bigCircleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "red";
    ctx.stroke();

	if (path.length <= 0) {
		for (let j = 0; j < countOrange; j++) {
			path.push([]);
		}
	}
	if (document.getElementById("blueLineCheckbox").checked && path.length > 0 && path[0].length > 0) {
		// Draw the blue path
		for (let j = 0; j < countOrange; j++) {
			ctx.beginPath();
			ctx.moveTo(path[j][0].x, path[j][0].y);
			for (let i = 1; i < path[j].length; i++) {
				ctx.lineTo(path[j][i].x, path[j][i].y);
			}
			ctx.strokeStyle = "blue";
			ctx.stroke();
		}
	}

    const allOrangeCircles = [];

    grayCircleOffsets.forEach(offset => {
        const grayCircleCenter = getGrayCircleCenter(offset);

        // Check if gray circles should be drawn
        if (document.getElementById("grayCircleCheckbox").checked) {
            ctx.beginPath();
            ctx.arc(grayCircleCenter.x, grayCircleCenter.y, smallCircleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = "lightgray";
            ctx.stroke();
        }

        const orangeCircleCenters = orangeCircleOffsets.map(oOffset => getOrangeCircleCenter(grayCircleCenter, oOffset));
        allOrangeCircles.push(...orangeCircleCenters);



		if (offset === 0) {
			// Prüfen, ob der Pfad bereits aufgezeichnet wurde (3 Umläufe abgeschlossen)
			if (angle <= 2 * Math.PI * 3) {
				for (let i = 0; i < countOrange; i++) {
					path[i].push(orangeCircleCenters[i]);
				}
			}
		}

        // Check if orange circles should be drawn
        if (document.getElementById("orangeCircleCheckbox").checked) {
            orangeCircleCenters.forEach(ocCenter => {
                ctx.beginPath();
                ctx.arc(ocCenter.x, ocCenter.y, orangeCircleRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "orange";
                ctx.fill();
            });
        }

        // Check if red triangle lines should be drawn
        if (document.getElementById("redTriangleCheckbox").checked) {
            ctx.beginPath();
            ctx.moveTo(orangeCircleCenters[0].x, orangeCircleCenters[0].y);
			for (let i = 1; i < orangeCircleCenters.length; i++) {
				ctx.lineTo(orangeCircleCenters[i].x, orangeCircleCenters[i].y);
			}
            ctx.closePath();
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
    });

    // Check if green lines should be drawn
    if (document.getElementById("greenLinesCheckbox").checked) {
        ctx.strokeStyle = "green";
        for (let i = 0; i < countOrange; i++) {
            ctx.beginPath();
            ctx.moveTo(allOrangeCircles[i].x, allOrangeCircles[i].y);
			for (let j = 1; j < grayCircleOffsets.length; j++) {
				ctx.lineTo(allOrangeCircles[i + j * (countOrange)].x, allOrangeCircles[i + j * (countOrange)].y);
			}
            ctx.closePath();
            ctx.stroke();
        }
    }

    angle += document.getElementById("speed").value / 10000;
    animationId = requestAnimationFrame(drawScene);
}

function restart() {
	cancelAnimationFrame(animationId);
	path = [];
	angle = 0;
	if (parseInt(document.getElementById("star_vertices").value) <= parseInt(document.getElementById("star_density").value)) {
		let value = 
		document.getElementById("star_vertices").value = parseInt(document.getElementById("star_density").value) + 1;
	}
	smallCircleRadius = bigCircleRadius * parseInt(document.getElementById("star_density").value) / parseInt(document.getElementById("star_vertices").value);
	lineLength = smallCircleRadius * parseInt(document.getElementById("orangeCircleDistance").value) / 100;
	count = parseInt(document.getElementById("star_vertices").value) - parseInt(document.getElementById("star_density").value);
	grayCircleOffsets = [];
	for (let i = 0; i < count; i++) {
		grayCircleOffsets.push(2 * Math.PI * (i / count));
	}
	countOrange = parseInt(document.getElementById("star_density").value);
	orangeCircleOffsets = [];
	for (let i = 0; i < countOrange; i++) {
		orangeCircleOffsets.push(2 * Math.PI * (i / countOrange));
	}
	spinFactor = count / countOrange - 1;
    drawScene();
}

document.getElementById("orangeCircleDistance").addEventListener("input", function() {
    document.getElementById("distanceValue").textContent = this.value;
	restart();
});

document.getElementById("speed").addEventListener("input", function() {
    document.getElementById("speedValue").textContent = this.value;
});

document.getElementById("star_vertices").addEventListener("input", function() {
    restart();
});

document.getElementById("star_density").addEventListener("input", function() {
    restart();
});

drawScene();