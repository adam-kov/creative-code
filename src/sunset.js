const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap')
const { Point, drawCurveThroughPoints, getActualMousePos } = require('./utils');

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true,
	fps: 1
};
/** @type {HTMLCanvasElement} */
let canv

/** @type {Point[]} */
const gravityPoints = []
const gpNumber = 1
const gravityArea = 200

/** @type {(obj: {
 * 		canvas: HTMLCanvasElement,
 * 		context: CanvasRenderingContext2D,
 * 		width: number,
 * 		height: number
 * }) => (obj: {
 * 		context: CanvasRenderingContext2D,
 * 		width: number,
 * 		height: number,
 * 		frame: number
 * }) => void} */
const sketch = ({ canvas, context: c, width, height }) => {
	canv = canvas
	canvas.addEventListener('mousedown', onMouseDown)

	const cols = 6
	const rows = 300
	const numCells = cols * rows

	// Grid
	const gw = width * 0.9
	const gh = height * 0.8

	// Cell
	const cw = gw / cols
	const ch = gh / rows

	// Margin
	const mx = (width - gw) * 0.5
	const my = (height - gh) * 0.5

	for(let i = 0; i < gpNumber; i++) {
		gravityPoints.push(new Point({
			x: random.rangeFloor(0, width),
			y: random.rangeFloor(0, height),
		}))
	}

	let x, y, n
	let freq = 0.01
	let amplitude = 50
	const colors = colormap({
		colormap: 'inferno',
		nshades: rows
	})

	/** @type {Point[][]} */
	const pointMatrix = []
	let rowIndex = 0
	for (let i = 0; i < numCells; i++) {
		x = (i % cols) * cw
		y = Math.floor(i / cols) * ch
		n = random.noise2D(x, y, freq, amplitude)
		y += n
		gravityPoints.forEach(gp => {
			const dx = x - gp.x
			const dy = y - gp.y
			if(Math.sqrt(dx ** 2) < gravityArea && Math.sqrt(dy ** 2) < gravityArea) {
				if(x < gp.x) x -= Math.sqrt(gravityArea + dx) * 1.5
				else x += Math.sqrt(gravityArea - dx) * 1.5

				if(y < gp.y) y -= Math.sqrt(gravityArea + dy) * 1.5
				else y += Math.sqrt(gravityArea - dy) * 1.5
			}
		})

		if(i % cols === 0) {
			pointMatrix[rowIndex] = []
			rowIndex++
		}
		pointMatrix[rowIndex - 1].push(new Point({ x, y }))
	}

	return ({ context: c, width, height }) => {
    c.fillStyle = 'black';
    c.fillRect(0, 0, width, height);

		c.save()
		c.translate(mx, my)
		c.translate(cw * 0.5, ch * 0.5)
		
		c.strokeStyle = 'red'
		c.lineWidth = 3

		pointMatrix.forEach(r => r.forEach(p => {
			let moved = false
			gravityPoints.forEach(gp => {
				const dx = p.x - gp.x
				const dy = p.y - gp.y
				if(Math.sqrt(dx ** 2) < gravityArea && Math.sqrt(dy ** 2) < gravityArea) {
					if(p.x < gp.x) p.x -= Math.sqrt(gravityArea + dx) * 1.5
					else p.x += Math.sqrt(gravityArea - dx) * 1.5

					if(p.y < gp.y) p.y -= Math.sqrt(gravityArea + dy) * 1.5
					else p.y += Math.sqrt(gravityArea - dy) * 1.5

					moved = true
				}
				// else if(!modified) {
					// p.x = p.ix
					// p.y = p.iy
					// const dix = p.x - p.ix
					// const diy = p.y - p.iy
					// if(p.x < p.ix) p.x -= Math.sqrt(dix) * 1.5
					// else p.x += Math.sqrt(dix) * 1.5

					// if(p.y < gp.y) p.y -= Math.sqrt(diy) * 1.5
					// else p.y += Math.sqrt(diy) * 1.5
				// }
			})
			p.moved = moved
		}))
		pointMatrix.forEach(r => r.forEach(p => {
			if(!p.moved) {
				p.x = p.ix
				p.y = p.iy
			}
		}))

		pointMatrix.forEach((row, i) => {
			c.strokeStyle = colors[i]
			drawCurveThroughPoints(c, row)
		})

		c.restore()
		

		c.save()
		c.translate(mx, my)
		c.translate(cw * 0.5, ch * 0.5)
		pointMatrix.forEach(r => r.forEach(p => p.draw(c, 'green')))
		gravityPoints.forEach(p => p.draw(c, '#ffffff40', gravityArea))
		c.restore()
		gravityPoints.forEach(p => p.draw(c, '#ffffff40', gravityArea))
  };
};

/** @type {(e: MouseEvent) => void} */
const onMouseDown = (e) => {
	window.addEventListener('mousemove', onMouseMove)
	window.addEventListener('mouseup', onMouseUp)
	
	const { offsetX, offsetY } = e
	const { x, y, } = getActualMousePos(canv, offsetX, offsetY)

	let hit = false
	gravityPoints.forEach(p => {
		p.isDragging = p.hitTest(x, y)
		if(!hit && p.isDragging) hit = true
	})
	// if(!hit) points.push(new Point({x, y}))
}

/** @type {(e: MouseEvent) => void} */
const onMouseMove = ({offsetX, offsetY}) => {
	const { x, y, } = getActualMousePos(canv, offsetX, offsetY)

	gravityPoints.forEach(p => {
		if(p.isDragging) {
			p.x = x
			p.y = y
		}
	})
}

const onMouseUp = () => {
	window.removeEventListener('mousemove', onMouseMove)
	window.removeEventListener('mouseup', onMouseUp)
}

canvasSketch(sketch, settings);
