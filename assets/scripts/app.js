'use strict'

class LightsOutApp {

	constructor(el, blocks = 5) {
		this.container = el
		this.blocks = blocks
		this.blockIdentity = 1;
		this.grid = this._renderGrid()

		// need to access these using bind
		this.turnLightOff = this._turnLightOff
		this.turnLightOn = this._turnLightOn
		this.toggleGridBlocks = this._toggleGridBlocks
		this.locateModule = this._locateModule
		this.toggleLightsOnBlock = this._toggleLightsOnBlock
		this.solve = this._solve
		this.reset = this._reset

		this.container.addEventListener('click', this._toggleEvt.bind(this))
	}

	_renderGrid() {
		const grid = new Array(this.blocks)

		for (const [blockIndex, block] of grid.entries()) {
			// set the initial state of each grid block
			grid[blockIndex] = [ false, false, false, false, false ]

			// render set the block address as their identity and location
			for (const [blockColumn, row] of grid.entries()) {
				let newBlock = document.createElement('div')

				this.container.appendChild(this._initBlock(
					newBlock,
					this.blockIdentity++,
					blockIndex,
					blockColumn
				))
			}
		}

		return grid
	}

	_setModuleAddress(block, row, column) {
		if (typeof block === 'undefined') {
			throw new DOMException('Invalid block element')
		}

		block.dataset.row = row
		block.dataset.col = column

		return block
	}

	_initBlock(block, identity, row, col) {
		this._setModuleAddress(block, row, col)
		block.innerHTML = identity
		block.classList.add('block', 'light-on')

		return block
	}
	
	_turnLightOff(block) {
		block.classList.remove('light-on')
		block.classList.add('light-off')
	}

	_turnLightOn(block) {
		block.classList.remove('light-off')
		block.classList.add('light-on')
	}

	_toggleGridBlocks(block) {
		let { row, col } = block.dataset

		if (typeof row === '' || typeof col === '') {
			throw new Exception('Invalid block address')
		}

		this.grid[row][col] = !this.grid[row][col]
		this._toggleLightsOnBlock(row, col)

		const directions = [
			// has top?
			[ 1, 0 ],
			// bottom?
			[ -1, 0 ],
			// right?
			[ 0, 1 ],
			// left?
			[ 0, -1 ]
		]

		for (const direction of directions) {
			const rowOffset = Number(row) + direction[0]
			const columnOffset = Number(col) + direction[1]

			if ( rowOffset >= 0 && rowOffset < this.blocks
				&& columnOffset >= 0 && columnOffset < this.blocks
			) {
				this.grid[rowOffset][columnOffset] = !this.grid[rowOffset][columnOffset]
				this._toggleLightsOnBlock(rowOffset, columnOffset)
			}

		}
	}
	
	_toggleLightsOnBlock(row, column) {
		const block = document.querySelector(`div[data-row="${row}"][data-col="${column}"]`)

		if (typeof block === 'undefined') {
			throw new DOMException('Grid block not found!')
		}

		if (block.classList.contains('light-on')) {
			this.turnLightOff(block)
		} else {
			this.turnLightOn(block)
		}
	}

	_toggleEvt(e) {
		this.toggleGridBlocks(e.target)
	}

	async _solve() {

		const solvingInterval = 1300
		// clean the grid
		this._reset()

		// used to have an AI hovering event
		const interval = ms => new Promise(res => setTimeout(res, ms))
		const regions = [
			[0, 0], [0, 1], [1, 0], [1, 1],
			[1, 4], [1, 3], [2, 4], [2, 3],
			[2, 2], [3, 1], [3, 2], [3, 3],
			[4, 1], [4, 2], [4, 4]
		]

		const solve = async (region) => {
			const block = document.querySelector(`div[data-row="${region[0]}"][data-col="${region[1]}"]`)
			block.classList.add('hovered')

			await interval(solvingInterval)

			block.click()
			block.classList.remove('hovered')
		}

		for (const region of regions) {
			await solve(region)
		}
	}

	_reset() {
		const blocks = document.querySelectorAll('.block')
		for (const block of blocks) {
			this._turnLightOn(block)
		}
	}
}


const app = new LightsOutApp(document.querySelector('#app'))

const reset = document.querySelector('#reset')
const solve = document.querySelector('#solve')

reset.addEventListener('click', () => app.reset())
solve.addEventListener('click', async () => {
	reset.disabled = true
	solve.disabled = true

	await app.solve()

	reset.disabled = false
	solve.disabled = false
})
