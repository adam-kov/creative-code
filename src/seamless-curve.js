const canvasSketch = require('canvas-sketch');
const { Point, getActualMousePos } = require('./utils');

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

/** @type {Point[]} */
const points = []
/** @type {HTMLCanvasElement} */
let canv

/** @type {(obj: {
 * 		canvas: HTMLCanvasElement,
 * 		context: CanvasRenderingContext2D,
 * 		width: number,
 * 		height: number
 * }) => (obj: {
 * 		context: CanvasRenderingContext2D,
 * 		width: number,
 * 		height: number
 * }) => void} */
const sketch = ({ canvas }) => {
	canv = canvas

	points.push(
		new Point({ x: 200, y: 540 }),
		new Point({ x: 500, y: 700 }),
		new Point({ x: 880, y: 540 }),
		new Point({ x: 600, y: 700 }),
		new Point({ x: 640, y: 900 }),
	)

	canvas.addEventListener('mousedown', onMouseDown)

  return ({ context: c, width, height }) => {
    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);

		c.beginPath()
		c.moveTo(points[0].x, points[0].y)

		// Original straight lines
		for(let i = 1; i < points.length; i++) {
			c.lineTo(points[i].x, points[i].y)
		}
		c.stroke()

		// Seamless
		c.beginPath()
		// First point
		c.moveTo(points[0].x, points[0].y)
		for(let i = 0; i < points.length - 2; i++) {
			const curr = points[i]
			const next = points[i + 1]

			// Halfway through current and next point
			const mx = curr.x + (next.x - curr.x) * 0.5
			const my = curr.y + (next.y - curr.y) * 0.5

			// Middle points
			c.quadraticCurveTo(curr.x, curr.y, mx, my)
		}
		// Last point
		const i = points.length - 2
		c.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)

		// Curves
		// for(let i = 1; i < points.length; i += 2) {
		// 	c.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
		// }
		
		c.lineWidth = 4
		c.strokeStyle = 'blue'
		c.stroke()

		points.forEach(p => {
			p.draw(c)
		})
  };
};

/** @type {(e: MouseEvent) => void} */
const onMouseDown = (e) => {
	window.addEventListener('mousemove', onMouseMove)
	window.addEventListener('mouseup', onMouseUp)
	
	const { offsetX, offsetY } = e
	const { x, y, } = getActualMousePos(canv, offsetX, offsetY)

	let hit = false
	points.forEach(p => {
		p.isDragging = p.hitTest(x, y)
		if(!hit && p.isDragging) hit = true
	})
	if(!hit) points.push(new Point({x, y}))
}

/** @type {(e: MouseEvent) => void} */
const onMouseMove = ({offsetX, offsetY}) => {
	const { x, y, } = getActualMousePos(canv, offsetX, offsetY)

	points.forEach(p => {
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
