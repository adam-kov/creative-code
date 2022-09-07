const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');
const { drawPolygon, drawSkewedRect } = require('./utils')

const seed = Date.now()

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true,
	name: 'seed-' + seed
};

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
const sketch = ({ width, height }) => {
	random.setSeed(seed)

	let x, y, w, h, fill, stroke, blend

	const num = 30
	const degrees = -30
	
	const rects = []
	const colors = [
		random.pick(risoColors).hex,
		random.pick(risoColors).hex,
		random.pick(risoColors).hex,
	]
	const bgColor = random.pick(risoColors).hex

	const mask = {
		radius: width * 0.4,
		sides: 3,
		x: width * 0.5,
		y: height * 0.58,
	}

	
	for(let i = 0; i < num; i++) {
		x = random.range(0, width)
		y = random.range(0, height)
		w = random.range(600, width)
		h = random.range(50, 150)

		fill = random.pick(colors)
		stroke = random.pick(colors)
		blend = random.value() > 0.8 ? 'overlay' : 'source-over'

		rects.push({ x, y, w, h, fill, stroke, blend })
	}

  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

		// Creating the clipping triangle
		context.save()
		context.translate(mask.x, mask.y)
		
		drawPolygon({ context, radius: mask.radius, sides: mask.sides })
		context.clip()

		// Drawing the random rectangles
		rects.forEach(({ x, y, w, h, fill, stroke, blend }) => {
			let shadowColor

			context.save()
			context.translate(-mask.x, -mask.y)
			context.translate(x, y)
			context.strokeStyle = stroke
			context.fillStyle = fill
			context.lineWidth = 15
			context.globalCompositeOperation = blend
	
			drawSkewedRect({ context, w, h, degrees })

			// Setting the shadow to be a darker shade of the fill color
			shadowColor = Color.offsetHSL(fill, 0, 0, -20)
			shadowColor.rgba[3] = 0.5
			context.shadowColor = Color.style(shadowColor.rgba)
			context.shadowOffsetX = -10
			context.shadowOffsetY = 25
			context.fill()

			// Drawing the thick stroke
			context.shadowColor = null
			context.stroke()

			// Drawing the thin stroke above
			context.lineWidth = 3
			context.strokeStyle = 'rgba(0, 0, 0, 0.4)'
			context.stroke()
	
			context.restore()

			// Drawing the triangle
			context.save()

			context.lineWidth = 25
			context.globalCompositeOperation = 'color-burn'
			context.strokeStyle = bgColor
			drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides })
			context.stroke()
			
			context.restore()
		})
  };
};


canvasSketch(sketch, settings);
