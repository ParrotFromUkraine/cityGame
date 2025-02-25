import readline from 'readline'
import fetch from 'node-fetch'

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const usedCities = new Set()
let lastLetter = null
let allCities = []

// Функция для выбора типа игры
function chooseGameMode() {
	console.log('Выберите режим игры:')
	console.log('1. Игрок против игрока')
	console.log('2. Игрок против бота')
	console.log('3. Бот против бота')

	rl.question('Введите номер режима (1, 2 или 3): ', answer => {
		if (answer === '1') {
			loadCities().then(() => startGamePlayerVsPlayer())
		} else if (answer === '2') {
			loadCities().then(() => startGameBot())
		} else if (answer === '3') {
			loadCities().then(() => startBotVsBot())
		} else {
			console.log('Неверный выбор. Попробуйте еще раз.')
			chooseGameMode()
		}
	})
}

// Загрузка списка городов
async function loadCities() {
	console.log('Загружаю список городов...')

	const spinner = ['|', '/', '-', '\\'] // Символы для анимации загрузки
	let i = 0
	const spinnerInterval = setInterval(() => {
		readline.clearLine(process.stdout, 0) // Очищаем строку
		readline.cursorTo(process.stdout, 0) // Перемещаем курсор в начало
		process.stdout.write(`Загружаю города ${spinner[i]}`) // Пишем символ анимации
		i = (i + 1) % spinner.length // Меняем символы по кругу
	}, 100) // 100 миллисекунд для смены анимации

	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json'
		)
		const cities = await response.json()
		allCities = cities.map(city => city.name.toLowerCase())
		clearInterval(spinnerInterval) // Останавливаем анимацию
		console.log('\nСписок городов загружен!')
	} catch (error) {
		clearInterval(spinnerInterval) // Останавливаем анимацию в случае ошибки
		console.error('Ошибка загрузки городов:', error)
		rl.close()
	}
}

// Игра с игроком против игрока
function startGamePlayerVsPlayer() {
	console.log('Игра 2 игрока начинается!')

	// Выбираем первый город случайным образом
	const randomCity = allCities[Math.floor(Math.random() * allCities.length)]
	console.log(`Первый город: ${randomCity}`)

	usedCities.add(randomCity)
	lastLetter = randomCity.slice(-1)

	let currentPlayer = 1

	console.log('Игрок 1, твой ход!')

	rl.on('line', input => {
		let city = input.trim().toLowerCase()

		if (usedCities.has(city)) {
			console.log(`Этот город уже называли! Игрок ${currentPlayer} проиграл.`)
			return rl.close()
		}

		if (!allCities.includes(city)) {
			console.log(
				`Такого города нет в списке! Игрок ${currentPlayer} проиграл.`
			)
			return rl.close()
		}

		if (lastLetter && city[0] !== lastLetter) {
			console.log(
				`Город должен начинаться с буквы '${lastLetter.toUpperCase()}'! Игрок ${currentPlayer} проиграл.`
			)
			return rl.close()
		}

		usedCities.add(city)
		lastLetter = city.slice(-1)

		// Переключаем игрока
		currentPlayer = currentPlayer === 1 ? 2 : 1

		console.log(
			`Игрок ${currentPlayer}, твой ход! Город на букву '${lastLetter.toUpperCase()}'.`
		)
	})
}

// Игра с игроком и ботом
function startGameBot() {
	console.log('Игра с ботом начинается!')

	// Выбираем первый город случайным образом
	const randomCity = allCities[Math.floor(Math.random() * allCities.length)]
	console.log(`Первый город: ${randomCity}`)

	usedCities.add(randomCity)
	lastLetter = randomCity.slice(-1)

	console.log('Твой ход! Введи следующий город:')

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

		// Ход бота
		let nextCity = findNextCityForBot()

		if (!nextCity) {
			console.log('Бот не знает больше городов! Ты победил.')
			return rl.close()
		}

		console.log(`Бот находит город: ${nextCity}`)
		usedCities.add(nextCity)
		lastLetter = nextCity.slice(-1)
		console.log(`Твой ход! Город на букву '${lastLetter.toUpperCase()}'.`)
	})
}

// Поиск следующего города для бота
function findNextCityForBot() {
	const possibleCities = allCities.filter(
		c => c[0] === lastLetter && !usedCities.has(c)
	)
	return possibleCities[Math.floor(Math.random() * possibleCities.length)]
}

// Игра два бота против друг друга
function startBotVsBot() {
	console.log('Игра два бота против друг друга начинается!')

	// Выбираем первый город случайным образом
	const randomCity = allCities[Math.floor(Math.random() * allCities.length)]
	console.log(`Первый город: ${randomCity}`)

	usedCities.add(randomCity)
	lastLetter = randomCity.slice(-1)

	const bot1Play = setInterval(() => {
		let nextCity = findNextCityForBot()

		if (!nextCity) {
			console.log('Оба бота не знают больше городов! Игра окончена.')
			clearInterval(bot1Play)
			rl.close()
			return
		}

		console.log(`Бот 1 находит город: ${nextCity}`)
		usedCities.add(nextCity)
		lastLetter = nextCity.slice(-1)

		// Ход второго бота
		let nextCityBot2 = findNextCityForBot()

		if (!nextCityBot2) {
			console.log('Бот 2 не знает больше городов! Игра окончена.')
			clearInterval(bot1Play)
			rl.close()
			return
		}

		console.log(`Бот 2 находит город: ${nextCityBot2}`)
		usedCities.add(nextCityBot2)
		lastLetter = nextCityBot2.slice(-1)
	}, 1000) // Интервал ходов ботов
}

chooseGameMode() // Запуск выбора режима игры
