document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const difficultySelect = document.getElementById('difficulty');
    const startButton = document.getElementById('start-button');
    const statusDisplay = document.getElementById('status');
    const sequenceDisplay = document.getElementById('sequence-display');
    const inputDisplay = document.getElementById('input-display');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const inputInstruction = document.getElementById('input-instruction');
    
    let sequence = [];
    let playerInput = [];
    let currentLevel = 1;
    let score = 0;
    let gameActive = false;
    let waitingForInput = false;
    let currentSequenceIndex = 0;
    
    const difficulties = {
        'facil': {
            baseSequenceLength: 3,
            levelIncrement: 1,
            showDelay: 1000,
            elements: ['↑', '↓', '←', '→'],
        },
        'medio': {
            baseSequenceLength: 4,
            levelIncrement: 2,
            showDelay: 800,
            elements: ['↑', '↓', '←', '→'],
        },
        'dificil': {
            baseSequenceLength: 4,
            levelIncrement: 2,
            showDelay: 700,
            elements: ['↑', '↓', '←', '→', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        }
    };
    
    const keyMap = {
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9'
    };
    
    function startGame() {
        currentLevel = 1;
        score = 0;
        updateScoreAndLevel();
        generateSequence();
        gameActive = true;
        startButton.disabled = true;
        difficultySelect.disabled = true;
    }
    
    function generateSequence() {
        const difficulty = difficulties[difficultySelect.value];
        const sequenceLength = difficulty.baseSequenceLength + 
                              (currentLevel - 1) * difficulty.levelIncrement;
        
        sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            const randomElement = difficulty.elements[
                Math.floor(Math.random() * difficulty.elements.length)
            ];
            sequence.push(randomElement);
        }
        
        statusDisplay.textContent = 'Memoriza la secuencia...';
        setTimeout(() => {
            showSequence();
        }, 1000);
    }
    
    function showSequence() {
        currentSequenceIndex = 0;
        
        sequenceDisplay.textContent = '';
        sequenceDisplay.classList.remove('visible');
        
        const difficulty = difficulties[difficultySelect.value];
        
        function displayNextElement() {
            if (currentSequenceIndex < sequence.length) {
                sequenceDisplay.textContent = sequence[currentSequenceIndex];
                sequenceDisplay.classList.add('visible');
                
                setTimeout(() => {
                    sequenceDisplay.classList.remove('visible');
                    currentSequenceIndex++;
                    
                    setTimeout(displayNextElement, difficulty.showDelay / 2);
                }, difficulty.showDelay);
            } else {
                startInputPhase();
            }
        }
        
        displayNextElement();
    }
    
    function startInputPhase() {
        waitingForInput = true;
        playerInput = [];
        inputDisplay.innerHTML = '';
        statusDisplay.textContent = '¡Tu turno! Repite la secuencia';
        inputInstruction.textContent = 'Usa las teclas para repetir la secuencia mostrada';
    }
    
    function processInput(key) {
        if (!waitingForInput || !gameActive) return;
        
        const symbol = keyMap[key];
        if (!symbol) return;
        
        const difficulty = difficulties[difficultySelect.value];
        if (!difficulty.elements.includes(symbol)) return;
        
        playerInput.push(symbol);
        
        const inputItem = document.createElement('div');
        inputItem.className = 'input-item';
        inputItem.textContent = symbol;
        inputItem.classList.add('pulse');
        inputDisplay.appendChild(inputItem);
        
        const currentIndex = playerInput.length - 1;
        if (playerInput[currentIndex] !== sequence[currentIndex]) {
            gameOver(false);
            return;
        }
        
        if (playerInput.length === sequence.length) {
            waitingForInput = false;
            
            setTimeout(() => {
                levelComplete();
            }, 500);
        }
    }
    
    function levelComplete() {
        score += sequence.length * currentLevel;
        currentLevel++;
        updateScoreAndLevel();
        
        statusDisplay.textContent = '¡Correcto! Preparándose para el siguiente nivel...';
        statusDisplay.className = 'status-area correct';
        
        setTimeout(() => {
            statusDisplay.className = 'status-area';
            generateSequence();
        }, 1500);
    }
    
    function gameOver(success) {
        gameActive = false;
        waitingForInput = false;
        
        if (success) {
            statusDisplay.textContent = '¡Felicidades! Has completado todos los niveles';
            statusDisplay.className = 'status-area correct';
        } else {
            statusDisplay.textContent = '¡Incorrecto! Juego terminado';
            statusDisplay.className = 'status-area incorrect';
            
            setTimeout(() => {
                statusDisplay.textContent = 'La secuencia correcta era:';
                inputDisplay.innerHTML = '';
                
                for (const item of sequence) {
                    const sequenceItem = document.createElement('div');
                    sequenceItem.className = 'input-item';
                    sequenceItem.textContent = item;
                    inputDisplay.appendChild(sequenceItem);
                }
            }, 1500);
        }
        
        startButton.disabled = false;
        difficultySelect.disabled = false;
        startButton.textContent = 'Jugar de nuevo';
    }
    
    function updateScoreAndLevel() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = currentLevel;
    }
    
    startButton.addEventListener('click', startGame);
    
    document.addEventListener('keydown', function(e) {
        if (Object.keys(keyMap).includes(e.key)) {
            processInput(e.key);
            e.preventDefault();
        }
    });
    

    document.addEventListener('touchstart', function() {

        if (!document.getElementById('touch-controls')) {
            const touchControls = document.createElement('div');
            touchControls.id = 'touch-controls';
            touchControls.style.display = 'flex';
            touchControls.style.flexWrap = 'wrap';
            touchControls.style.justifyContent = 'center';
            touchControls.style.marginTop = '20px';
            touchControls.style.gap = '10px';
            

            const allKeys = [...new Set(Object.values(keyMap))];
            
            for (const key of allKeys) {
                const button = document.createElement('button');
                button.textContent = key;
                button.style.fontSize = '24px';
                button.style.minWidth = '60px';
                button.style.height = '60px';
                

                const keyForSymbol = Object.keys(keyMap).find(k => keyMap[k] === key);
                
                button.addEventListener('click', function() {
                    if (keyForSymbol) {
                        processInput(keyForSymbol);
                    }
                });
                
                touchControls.appendChild(button);
            }
            
            document.querySelector('.game-container').appendChild(touchControls);
        }
    }, { once: true });
});