document.addEventListener('DOMContentLoaded', function() {
    const puzzleSequence = document.getElementById('puzzle-sequence');
    const answerInput = document.getElementById('answer');
    const checkButton = document.getElementById('check');
    const nextButton = document.getElementById('next');
    const resultDiv = document.getElementById('result');
    const scoreDiv = document.getElementById('score');
    const levelSelect = document.getElementById('level');
    const timerDiv = document.getElementById('timer');
    
    let puzzleSolved = false;
    let currentPuzzle = [];
    let correctAnswer = 0;
    let score = 0;
    let timerInterval;
    let timeLeft = 30;
    
    // Configuración de dificultad por nivel
    const levelConfig = {
        1: { // Fácil
            operations: ['+', '-'],
            maxNumber: 10,
            length: 3,
            timeLimit: 30
        },
        2: { // Medio
            operations: ['+', '-', '*'],
            maxNumber: 15,
            length: 4,
            timeLimit: 25
        },
        3: { // Difícil
            operations: ['+', '-', '*', '/'],
            maxNumber: 20,
            length: 5,
            timeLimit: 20
        },
        4: { // Experto
            operations: ['+', '-', '*', '/', '^'],
            maxNumber: 25,
            length: 6,
            timeLimit: 15
        }
    };
    

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    function getRandomOperator(level) {
        const operations = levelConfig[level].operations;
        return operations[Math.floor(Math.random() * operations.length)];
    }
    
    // Función para calcular el resultado de la secuencia de operaciones
    function calculateResult(sequence) {
        let result = sequence[0];
        
        for (let i = 1; i < sequence.length; i += 2) {
            const operator = sequence[i];
            const operand = sequence[i + 1];
            
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
                case '/':
                    result = parseFloat((result / operand).toFixed(2));
                    break;
                case '^':
                    result = Math.pow(result, operand);
                    break;
            }
        }
        
        return result;
    }
    
    // Función para generar un nuevo puzzle
    function generatePuzzle() {
        stopTimer();
        puzzleSolved = false;
        enableCheckButton();
        stopTimer();
        const level = parseInt(levelSelect.value);
        const config = levelConfig[level];
        
        let sequence = [];
        sequence.push(getRandomNumber(1, config.maxNumber));
        
       
        for (let i = 0; i < config.length - 1; i++) {
            const operator = getRandomOperator(level);
            sequence.push(operator);
            
          
            if (operator === '/') {
               
                const currentResult = calculateResult(sequence.slice(0, -1));
                
                const possibleDivisors = [2, 3, 4, 5];
                sequence.push(possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)]);
            } else if (operator === '^') {
                
                sequence.push(getRandomNumber(2, 3));
            } else {
                sequence.push(getRandomNumber(1, config.maxNumber));
            }
        }
        
        currentPuzzle = sequence;
        correctAnswer = calculateResult(sequence);
        
        displayPuzzle();
        
        timeLeft = config.timeLimit;
        timerDiv.textContent = `Tiempo: ${timeLeft}s`;
        startTimer();
    }

    function displayPuzzle() {
        puzzleSequence.innerHTML = '';
        
        currentPuzzle.forEach(item => {
            const puzzleItem = document.createElement('div');
            puzzleItem.className = 'puzzle-item';
            puzzleItem.textContent = item;
            puzzleSequence.appendChild(puzzleItem);
        });
        
        answerInput.value = '';
        resultDiv.textContent = '';
        resultDiv.className = 'result';
    }
    
    function checkAnswer() {
        if (puzzleSolved) return;
        
        const userAnswer = parseFloat(answerInput.value);
        
        if (isNaN(userAnswer)) {
            resultDiv.textContent = 'Por favor, introduce un número.';
            resultDiv.className = 'result incorrect';
            return;
        }
        
        if (Math.abs(userAnswer - correctAnswer) < 0.01) {
            resultDiv.textContent = '¡Correcto!';
            resultDiv.className = 'result correct';
            score += parseInt(levelSelect.value) * 10;
            scoreDiv.textContent = `Puntuación: ${score}`;
            stopTimer();
            disableCheckButton();
            puzzleSolved = true;
        } else {
            resultDiv.textContent = `Incorrecto. La respuesta correcta es ${correctAnswer}.`;
            resultDiv.className = 'result incorrect';
            disableCheckButton();
            puzzleSolved = true;
        }
    }
    
    function startTimer() {
        puzzleSolved = false;
        enableCheckButton();
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDiv.textContent = `Tiempo: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                stopTimer();
                resultDiv.textContent = `¡Tiempo agotado! La respuesta correcta es ${correctAnswer}.`;
                resultDiv.className = 'result incorrect';
                disableCheckButton();
                puzzleSolved = true;
            }
        }, 1000);
    }

    function disableCheckButton() {
        checkButton.disabled = true;
        checkButton.classList.add('disabled');
    }
    
    function enableCheckButton() {
        checkButton.disabled = false;
        checkButton.classList.remove('disabled');
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    checkButton.addEventListener('click', checkAnswer);
    
    nextButton.addEventListener('click', generatePuzzle);
    
    levelSelect.addEventListener('change', generatePuzzle);

    generatePuzzle();
});