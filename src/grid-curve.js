const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap')
const { Point } = require('./utils');

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

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
const sketch = ({ width, height }) => {
	// const cols = 16
	// const rows = 12
	const cols = 100
	const rows = 100
	const numCells = cols * rows

	// Grid
	const gw = width * 0.8
	const gh = height * 0.8

	// Cell
	const cw = gw / cols
	const ch = gh / rows

	// Margin
	const mx = (width - gw) * 0.5
	const my = (height - gh) * 0.5

	/** @type {Point[]} */
	const points = []

	let x, y, n, lineWidth
	let freq = 0.0015
	let amplitude = 90
	const colors = colormap({
		colormap: 'YIGnBu',
		nshades: amplitude
	})

	for (let i = 0; i < numCells; i++) {
		x = (i % cols) * cw
		y = Math.floor(i / cols) * ch
		n = random.noise2D(x, y, freq, amplitude)

		lineWidth = math.mapRange(n, -amplitude, amplitude, 2, 20)
		color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))]

		points.push(new Point({ x, y, lineWidth, color }))
	}

	return ({ context: c, width, height, frame }) => {
    c.fillStyle = 'black';
    c.fillRect(0, 0, width, height);

		c.save()
		c.translate(mx, my)
		c.translate(cw * 0.5, ch * 0.5)

		c.strokeStyle = 'red'
		c.lineWidth = 4

		// Update positions
		points.forEach(p => {
			const multiplier = frame * 4;
			n = random.noise2D(p.ix + multiplier, p.iy + multiplier, freq, amplitude)
			// n = random.noise2D(n * frame, n * frame * 2, 0.0001, 50);

			p.lineWidth = math.mapRange(n, -amplitude, amplitude, 2, 20)
			p.color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))]
		})

		let lastX, lastY
		// Lines
		for(let row = 0; row < rows; row++) {
			for(let col = 0; col < cols - 1; col++) {
				const curr = points[row * cols + col + 0]
				const next = points[row * cols + col + 1]

				const mx = curr.x + (next.x - curr.x) * 0.5
				const my = curr.y + (next.y - curr.y) * 0.5

				if(!col) {
					lastX = curr.x
					lastY = curr.y
				}

				c.beginPath()
				c.lineWidth = curr.lineWidth
				c.strokeStyle = curr.color
				c.moveTo(lastX, lastY)
				c.quadraticCurveTo(curr.x, curr.y, mx, my)
				c.stroke()

				lastX = mx
				lastY = my
			}
		}

		// points.forEach(p => p.draw(c))

		c.restore()
  };
};

canvasSketch(sketch, settings);
