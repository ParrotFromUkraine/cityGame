import readline from 'readline'
import fetch from 'node-fetch'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const usedCities = new Set()
let lastLetter = null
let allCities = []

async function loadCities() {
	console.log('Загружаю список городов...')

	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json'
		)
		const cities = await response.json()
		allCities = cities.map(city => city.name.toLowerCase())
		console.log('Список городов загружен! Давай играть.')
		startGame()
	} catch (error) {
		console.error('Ошибка загрузки городов:', error)
		rl.close()
	}
}

function startGame() {
	console.log('Игра в города! Введи первый город:')
	rl.on('line', input => {
		let city = input.trim().toLowerCase()

		if (usedCities.has(city)) {
			console.log('Этот город уже называли! Ты проиграл.')
			return rl.close()
		}

		if (!allCities.includes(city)) {
			console.log('Такого города нет в списке! Ты проиграл.')
			return rl.close()
		}

		if (lastLetter && city[0] !== lastLetter) {
			console.log(
				`Город должен начинаться с буквы '${lastLetter.toUpperCase()}'! Ты проиграл.`
			)
			return rl.close()
		}

		usedCities.add(city)
		lastLetter = city.slice(-1)

		let nextCity = findNextCity()

		if (!nextCity) {
			console.log('Я не знаю больше городов! Ты победил.')
			return rl.close()
		}

		console.log(`Мой город: ${nextCity}`)
		usedCities.add(nextCity)
		lastLetter = nextCity.slice(-1)
		console.log(`Твой ход! Город на букву '${lastLetter.toUpperCase()}'.`)
	})
}

function findNextCity() {
	return allCities.find(c => c[0] === lastLetter && !usedCities.has(c))
}

loadCities()
