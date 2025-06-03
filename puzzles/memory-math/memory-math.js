document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart');
    const levelSelect = document.getElementById('level');
    const movesDisplay = document.getElementById('moves');
    const pairsDisplay = document.getElementById('pairs');
    const totalPairsDisplay = document.getElementById('total-pairs');
    const timerDisplay = document.getElementById('timer');
    const resultDisplay = document.getElementById('result');
    const levelDescription = document.getElementById('level-description');
    const gameContainer = document.getElementById('game-container');
    
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 8;
    let moves = 0;
    let gameStarted = false;
    let gameTimer;
    let secondsElapsed = 0;
    let isProcessing = false;
    
    const levelConfig = {
        1: {
            name: "Principiante",
            description: "Nivel para principiantes. Encuentra parejas de números iguales.",
            pairs: 6,
            grid: [3, 4],
            operations: false,
            range: [1, 9]
        },
        2: {
            name: "Fácil",
            description: "Un poco más desafiante. Encuentra parejas de números iguales.",
            pairs: 8,
            grid: [4, 4],
            operations: false,
            range: [1, 15]
        },
        3: {
            name: "Intermedio",
            description: "Ahora busca operaciones sencillas de suma y resta con su resultado.",
            pairs: 8,
            grid: [4, 4],
            operations: true,
            operationTypes: ['+', '-'],
            operandsRange: [1, 10],
            maxResult: 20
        },
        4: {
            name: "Difícil",
            description: "Operaciones más complejas incluyendo multiplicación.",
            pairs: 10,
            grid: [4, 5],
            operations: true,
            operationTypes: ['+', '-', '*'],
            operandsRange: [1, 9],
            maxResult: 50
        },
        5: {
            name: "Experto",
            description: "Operaciones avanzadas con suma, resta, multiplicación y división.",
            pairs: 12,
            grid: [4, 6],
            operations: true,
            operationTypes: ['+', '-', '*', '/'],
            operandsRange: [1, 12],
            maxOperands: 3,
            maxResult: 100
        },
        6: {
            name: "NIKOLA TESLA",
            description: "El nivel definitivo con operaciones complejas, potencias y raíces. ¡Pon a prueba tu mente!",
            pairs: 15,
            grid: [5, 6],
            operations: true,
            operationTypes: ['+', '-', '*', '/', '^', '√'],
            operandsRange: [1, 10],
            maxOperands: 3,
            maxResult: 100,
            teslaModeEnabled: true
        }
    };
    
    function generateOperation(level) {
        const config = levelConfig[level];
        let operation = '';
        let result = 0;
        
        const maxAttempts = 100;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            try {
                const maxOperands = config.maxOperands || 2;
                const numOperands = Math.floor(Math.random() * (maxOperands - 1)) + 2;
                
                let operand = getRandomNumber(config.operandsRange[0], config.operandsRange[1]);
                result = operand;
                operation = operand.toString();
                
                for (let i = 1; i < numOperands; i++) {
                    const operatorIndex = Math.floor(Math.random() * config.operationTypes.length);
                    const operator = config.operationTypes[operatorIndex];
                    
                    if (operator === '/') {

                        const possibleDivisors = [2, 3, 4, 5, 10].filter(d => result % d === 0);
                        if (possibleDivisors.length === 0) {
                            i--;
                            continue;
                        }
                        const divisor = possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)];
                        operand = divisor;
                        result = result / divisor;
                    } else if (operator === '^') {
                        operand = 2;
                        const newResult = Math.pow(result, operand);
                        if (newResult > config.maxResult) {
                            i--;
                            continue;
                        }
                        result = newResult;
                    } else if (operator === '√') {
                        const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
                        const sqIndex = Math.floor(Math.random() * perfectSquares.length);
                        result = Math.sqrt(perfectSquares[sqIndex]);
                        operation = `√(${perfectSquares[sqIndex]})`;
                        break;
                    } else {
                        operand = getRandomNumber(config.operandsRange[0], config.operandsRange[1]);
                        
                        switch (operator) {
                            case '+':
                                result += operand;
                                break;
                            case '-':
                                result -= operand;
                                break;
                            case '*':
                                result *= operand;
                                break;
                        }
                    }
                    
                    if (Math.abs(result) > config.maxResult || !Number.isInteger(result)) {
                        i = -1;
                        operand = getRandomNumber(config.operandsRange[0], config.operandsRange[1]);
                        result = operand;
                        operation = operand.toString();
                        continue;
                    }
                    
                    if (operator !== '√') {
                        operation += ' ' + operator + ' ' + operand;
                    }
                }
                
                return { operation, result };
            } catch (error) {
                console.error("Error generando operación:", error);
                continue;
            }
        }
        
        const a = getRandomNumber(1, 5);
        const b = getRandomNumber(1, 5);
        return { 
            operation: `${a} + ${b}`, 
            result: a + b 
        };
    }
    
    // Función para generar pares de cartas
    function generateCards(level) {
        const config = levelConfig[level];
        const pairs = [];
        
        if (config.operations) {
            const usedResults = new Set();
            
            for (let i = 0; i < config.pairs; i++) {
                let operationData;
                let attempts = 0;
                const maxAttempts = 50;
                
                do {
                    operationData = generateOperation(level);
                    attempts++;
                    if (attempts > maxAttempts) {
                        break;
                    }
                } while (usedResults.has(operationData.result));
                
                usedResults.add(operationData.result);
                pairs.push({
                    operation: operationData.operation,
                    result: operationData.result
                });
            }
        } else {
            const usedNumbers = new Set();
            
            for (let i = 0; i < config.pairs; i++) {
                let number;
                let attempts = 0;
                const maxAttempts = 50;
                
                do {
                    number = getRandomNumber(config.range[0], config.range[1]);
                    attempts++;
                    if (attempts > maxAttempts) {
                        number = getRandomNumber(config.range[0], config.range[1]);
                        break;
                    }
                } while (usedNumbers.has(number));
                
                usedNumbers.add(number);
                pairs.push({
                    operation: number,
                    result: number
                });
            }
        }
        
        return pairs;
    }
    
    function createAndShuffleCards(level) {
        const pairs = generateCards(level);
        const cards = [];
        
        pairs.forEach(pair => {
            cards.push({
                id: cards.length,
                content: pair.operation.toString(),
                value: pair.result,
                isOperation: true
            });
            
            cards.push({
                id: cards.length,
                content: pair.result.toString(),
                value: pair.result,
                isOperation: false
            });
        });
        
        return shuffleArray(cards);
    }
    
    function initializeBoard(level) {
        try {
            const config = levelConfig[level];
            
            gameBoard.textContent = '';
            
            const [rows, cols] = config.grid;
            gameBoard.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
            
            cards = createAndShuffleCards(level);
            totalPairs = config.pairs;
            totalPairsDisplay.textContent = totalPairs;
            
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.dataset.id = card.id;
                
                const cardBack = document.createElement('div');
                cardBack.className = 'card-face card-back';
                cardBack.textContent = '?';
                
                const cardFront = document.createElement('div');
                cardFront.className = 'card-face card-front';
                
                const cardContent = document.createElement('div');
                cardContent.className = card.isOperation ? 'card-content operation' : 'card-content';
                cardContent.textContent = card.content;
                
                cardFront.appendChild(cardContent);
                cardElement.appendChild(cardBack);
                cardElement.appendChild(cardFront);
                gameBoard.appendChild(cardElement);
                
                cardElement.addEventListener('click', () => flipCard(cardElement, card));
            });
            
            if (config.teslaModeEnabled) {
                gameContainer.classList.add('tesla-mode');
            } else {
                gameContainer.classList.remove('tesla-mode');
            }
        } catch (error) {
            console.error("Error inicializando tablero:", error);
            resultDisplay.textContent = "Error al inicializar el juego. Intenta con otro nivel.";
            gameStarted = false;
            startButton.disabled = false;
            levelSelect.disabled = false;
        }
    }
    
    function flipCard(cardElement, card) {
        if (
            !gameStarted ||
            isProcessing ||
            cardElement.classList.contains('flipped') ||
            cardElement.classList.contains('matched') ||
            flippedCards.length >= 2 
        ) {
            return;
        }
        
        cardElement.classList.add('flipped');
        flippedCards.push({ element: cardElement, card: card });
        
        if (flippedCards.length === 2) {
            isProcessing = true;
            moves++;
            movesDisplay.textContent = moves;
            
            const card1 = flippedCards[0].card;
            const card2 = flippedCards[1].card;
            
            if (card1.value === card2.value) {
                setTimeout(() => {
                    flippedCards.forEach(fc => {
                        fc.element.classList.add('matched');
                    });
                    
                    flippedCards = [];
                    isProcessing = false;
                    matchedPairs++;
                    pairsDisplay.textContent = matchedPairs;
                    
                    if (matchedPairs === totalPairs) {
                        endGame(true);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    flippedCards.forEach(fc => {
                        fc.element.classList.add('wrong');
                    });
                    
                    setTimeout(() => {
                        flippedCards.forEach(fc => {
                            fc.element.classList.remove('flipped');
                            fc.element.classList.remove('wrong');
                        });
                        
                        flippedCards = [];
                        isProcessing = false;
                    }, 800);
                }, 500);
            }
        }
    }
    
    function startGame() {
        try {
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            secondsElapsed = 0;
            isProcessing = false;
            
            movesDisplay.textContent = moves;
            pairsDisplay.textContent = matchedPairs;
            timerDisplay.textContent = formatTime(secondsElapsed);
            resultDisplay.textContent = '';
            
            const level = parseInt(levelSelect.value);
            console.log(`Iniciando juego en nivel ${level}: ${levelConfig[level].name}`);
            
            initializeBoard(level);
            
            if (gameTimer) {
                clearInterval(gameTimer);
            }
            
            gameTimer = setInterval(() => {
                secondsElapsed++;
                timerDisplay.textContent = formatTime(secondsElapsed);
            }, 1000);
            
            gameStarted = true;
            startButton.disabled = true;
            restartButton.disabled = false;
            levelSelect.disabled = true;
        } catch (error) {
            console.error("Error al iniciar el juego:", error);
            resultDisplay.textContent = "Error al iniciar el juego. Intenta con otro nivel.";
            gameStarted = false;
            startButton.disabled = false;
            levelSelect.disabled = false;
        }
    }
    
    function endGame(isWin) {
        clearInterval(gameTimer);
        gameStarted = false;
        
        if (isWin) {
            const level = parseInt(levelSelect.value);
            const levelName = levelConfig[level].name;
            resultDisplay.textContent = `¡Felicidades! Has completado el nivel ${levelName} en ${formatTime(secondsElapsed)} con ${moves} movimientos.`;
            resultDisplay.classList.add('celebrate');
            setTimeout(() => resultDisplay.classList.remove('celebrate'), 2000);
        }
        
        restartButton.disabled = false;
        levelSelect.disabled = false;
        startButton.disabled = false;
    }
    
    startButton.addEventListener('click', startGame);
    
    restartButton.addEventListener('click', startGame);
    
    levelSelect.addEventListener('change', () => {
        const level = parseInt(levelSelect.value);
        levelDescription.textContent = levelConfig[level].description;
    });
    
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    }
    

    levelDescription.textContent = levelConfig[1].description;
});