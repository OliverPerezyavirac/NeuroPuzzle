document.addEventListener('DOMContentLoaded', function() {
    const puzzleDisplay = document.getElementById('symbol');
    const answerInput = document.getElementById('answer');
    const checkButton = document.getElementById('check');
    const startButton = document.getElementById('start');
    const resultDiv = document.getElementById('result');
    const scoreDiv = document.getElementById('score');
    const levelSelect = document.getElementById('level');
    const progressBar = document.getElementById('progress');
    const statusIndicator = document.getElementById('status-indicator');
    const sequenceInfo = document.getElementById('sequence-info');
    
    let puzzleSolved = false;
    let currentSequence = [];
    let correctAnswer = 0;
    let score = 0;
    let isPlaying = false;
    let currentIndex = 0;
    

    const levelConfig = {
        1: { // Fácil
            operations: ['+', '-'],
            maxNumber: 10,
            length: 5,
            displayTime: 1200,
            pauseTime: 300
        },
        2: { // Medio
            operations: ['+', '-', '*'],
            maxNumber: 15,
            length: 7,
            displayTime: 1000,
            pauseTime: 250
        },
        3: { // Difícil
            operations: ['+', '-', '*', '/'],
            maxNumber: 20,
            length: 9,
            displayTime: 800,
            pauseTime: 200
        },
        4: { // Experto
            operations: ['+', '-', '*', '/', '^'],
            maxNumber: 25,
            length: 11,
            displayTime: 600,
            pauseTime: 150
        }
    };
    

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    function getRandomOperator(level) {
        const operations = levelConfig[level].operations;
        return operations[Math.floor(Math.random() * operations.length)];
    }
    

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
    
    function generateSequence() {
        const level = parseInt(levelSelect.value);
        const config = levelConfig[level];
        
        let sequence = [];
        sequence.push(getRandomNumber(1, config.maxNumber));
        
        for (let i = 0; i < (config.length - 1) / 2; i++) {
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
        
        currentSequence = sequence;
        correctAnswer = calculateResult(sequence);
        
        updateStatusIndicator(sequence.length);
        
        sequenceInfo.textContent = `Secuencia: ${sequence.length} elementos`;
        
        return sequence;
    }
    
    function updateStatusIndicator(length) {
        statusIndicator.textContent = '';
        for (let i = 0; i < length; i++) {
            const dot = document.createElement('div');
            dot.className = 'status-dot';
            statusIndicator.appendChild(dot);
        }
    }
    
    function updateActiveDot(index) {
        const dots = statusIndicator.querySelectorAll('.status-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
    }
    
    function playSequence() {
        if (!isPlaying) return;
        
        const level = parseInt(levelSelect.value);
        const config = levelConfig[level];
        
        if (currentIndex < currentSequence.length) {
            // Actualizar el dot activo
            updateActiveDot(currentIndex);
            
            // Mostrar el símbolo actual
            puzzleDisplay.textContent = currentSequence[currentIndex];
            puzzleDisplay.classList.add('visible');
            
            // Actualizar la barra de progreso
            const progressPercentage = ((currentIndex + 1) / currentSequence.length) * 100;
            progressBar.style.width = progressPercentage + '%';
            
            // Ocultar el símbolo después del tiempo de visualización
            setTimeout(() => {
                puzzleDisplay.classList.remove('visible');
                
                setTimeout(() => {
                    currentIndex++;
                    playSequence();
                }, config.pauseTime);
            }, config.displayTime);
        } else {
            // Secuencia completa
            isPlaying = false;
            checkButton.disabled = false;
            answerInput.focus();
            
            // Limpiar el display
            puzzleDisplay.textContent = '?';
            puzzleDisplay.classList.add('visible');
        }
    }
    
    // Función para iniciar una nueva secuencia --- partir del tercer método (7..0) (Problema en secuencias revisar segunda versión)
    function startSequence() {
        isPlaying = true;
        puzzleSolved = false;
        currentIndex = 0;
        answerInput.value = '';
        resultDiv.textContent = '';
        resultDiv.className = 'result';
        puzzleDisplay.classList.remove('visible');
        checkButton.disabled = true;
        startButton.disabled = true;

        generateSequence();

        progressBar.style.width = '0%';

        enableCheckButton();

        setTimeout(() => {
            playSequence();
        }, 500);
    }
    
    function disableCheckButton() {
        checkButton.disabled = true;
        checkButton.classList.add('disabled');
    }
    
    function enableCheckButton() {
        checkButton.disabled = false;
        checkButton.classList.remove('disabled');
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
            score += parseInt(levelSelect.value) * currentSequence.length;
            scoreDiv.textContent = `Puntuación: ${score}`;
            disableCheckButton();
            puzzleSolved = true;
        } else {
            resultDiv.textContent = `Incorrecto. La respuesta correcta es ${correctAnswer}.`;
            resultDiv.className = 'result incorrect';
            disableCheckButton();
            puzzleSolved = true;
        }
        
        startButton.disabled = false;
    }
    
    checkButton.addEventListener('click', checkAnswer);
    
    startButton.addEventListener('click', startSequence);
    
    levelSelect.addEventListener('change', () => {
        isPlaying = false;
        currentIndex = 0;
        puzzleDisplay.classList.remove('visible');
        puzzleDisplay.textContent = '';
        resultDiv.textContent = '';
        resultDiv.className = 'result';
        progressBar.style.width = '0%';
        checkButton.disabled = true;
        startButton.disabled = false;
        
        const level = parseInt(levelSelect.value);
        const config = levelConfig[level];
        updateStatusIndicator((config.length + 1) / 2 * 2 - 1);
        sequenceInfo.textContent = `Secuencia: 0 elementos`;
    });
    
    const level = parseInt(levelSelect.value);
    const config = levelConfig[level];
    updateStatusIndicator((config.length + 1) / 2 * 2 - 1);
});