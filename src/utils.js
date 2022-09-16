const math = require('canvas-sketch-util/math');

exports.drawSkewedRect = ({ context, w = 600, h = 200, degrees = -45 }) => {
	const angle = math.degToRad(degrees)
	const rx = Math.cos(angle) * w
	const ry = Math.sin(angle) * w

	context.save()
	context.translate(rx * -0.5, (ry + h) * -0.5)

	context.beginPath()
	context.moveTo(0, 0)
	context.lineTo(rx, ry)
	context.lineTo(rx, ry + h)
	context.lineTo(0, h)
	context.closePath()
	context.stroke()

	context.restore()
}

exports.drawPolygon = ({ context, radius = 100, sides = 3 }) => {
	const slice = Math.PI * 2 / sides

	context.beginPath()
	context.moveTo(0, -radius)

	for (let i = 1; i < sides; i++) {
		const theta = i * slice - Math.PI * 0.5
		context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius)
	}

	context.closePath()
}

class Point {
	constructor({x, y, lineWidth = 1, color = undefined,  control = false}) {
		this.x = x
		this.y = y
		this.lineWidth = lineWidth
		this.color = color
		this.control = control
		
		this.ix = x
		this.iy = y
	}

/** @type {(c: CanvasRenderingContext2D) => void} */
	draw(c, fill, size = 10) {
		c.save()
		c.translate(this.x, this.y)
		c.fillStyle = fill || (this.control ? 'red' : 'black')
		
		c.beginPath()
		c.arc(0, 0, size, 0, Math.PI * 2)
		c.fill()

		c.restore()
	}

	hitTest(x, y) {
		const dx = this.x - x
		const dy = this.y - y
		const dd = Math.sqrt(dx * dx + dy * dy)

		return dd < 20
	}
}
exports.Point = Point

/** @type {(c: HTMLCanvasElement, offsetX: number, offsetY: number) => {x: number, y: number}} */
exports.getActualMousePos = (c, offsetX, offsetY) => {
	const x = (offsetX / c.offsetWidth) * c.width
	const y = (offsetY / c.offsetHeight) * c.height

	return { x, y }
}

/** @type {(c: CanvasRenderingContext2D, points: Point[]) => void} */
exports.drawCurveThroughPoints = (c, points) => {
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
	c.stroke()
}