class WordSearch {
    constructor() {
        this.words = [];
        this.grid = [];
        this.foundWords = new Set();
        this.selectedCells = new Set();
        this.startCell = null;
        this.currentCell = null;
        this.isSelecting = false;
        this.learnEnglish = false;
        this.currentLanguage = 'es';

        // Configuración de dificultad
        this.difficultySettings = {
            easy: {
                gridSize: 10,
                wordCount: 6,
                directions: [[0, 1], [1, 0]],
                minWordLength: 3,
                maxWordLength: 5
            },
            medium: {
                gridSize: 12,
                wordCount: 8,
                directions: [[0, 1], [1, 0], [1, 1]],
                minWordLength: 4,
                maxWordLength: 7
            },
            hard: {
                gridSize: 15,
                wordCount: 10,
                directions: [[0, 1], [1, 0], [1, 1], [-1, 1]],
                minWordLength: 5,
                maxWordLength: 8
            }
        };

        this.initializeElements();
        this.initializeEventListeners();
        this.loadGame();
    }

    initializeElements() {
        this.gridElement = document.getElementById('word-grid');
        this.wordsToFindElement = document.getElementById('words-to-find');
        this.learnEnglishCheckbox = document.getElementById('learn-english');
        this.translationsElement = document.getElementById('translations');
        this.foundWordsListElement = document.getElementById('found-words-list');
        this.victoryModal = document.getElementById('victory-modal');
        this.nextRoundButton = document.getElementById('next-round');
        this.newGameButton = document.getElementById('new-game');
        this.difficultySelect = document.getElementById('difficulty');
    }

    initializeEventListeners() {
        this.gridElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.gridElement.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        this.learnEnglishCheckbox.addEventListener('change', () => this.handleLanguageChange());
        this.nextRoundButton.addEventListener('click', () => this.startNewRound());
        this.newGameButton.addEventListener('click', () => this.startNewRound());
        this.difficultySelect.addEventListener('change', () => this.startNewRound());
    }

    handleLanguageChange() {
        this.learnEnglish = this.learnEnglishCheckbox.checked;
        this.currentLanguage = this.learnEnglish ? 'en' : 'es';
        
        // Actualizar la visualización de las palabras sin reiniciar el juego
        this.updateWordList();
        this.updateTranslations();
        
        // Recrear la cuadrícula con las palabras en el nuevo idioma
        this.recreateGrid();
    }

    recreateGrid() {
        // Guardar las palabras encontradas
        const foundWordsBackup = new Set(this.foundWords);
        
        // Recrear la cuadrícula
        this.createGrid();
        
        // Restaurar las palabras encontradas
        this.foundWords = foundWordsBackup;
        
        // Marcar las celdas de las palabras encontradas
        this.markFoundWords();
    }

    markFoundWords() {

        const cells = this.gridElement.getElementsByClassName('grid-cell');
        Array.from(cells).forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.foundWords.forEach(word => {
                if (this.isCellPartOfWord(row, col, word)) {
                    cell.classList.add('found');
                }
            });
        });
    }

    isCellPartOfWord(row, col, word) {
        const directions = this.getCurrentDifficulty().directions;
        const wordToCheck = this.currentLanguage === 'en' ? word : 
            this.words.find(w => w.en === word).es;

        for (let dir of directions) {
            if (this.checkWordInDirection(row, col, wordToCheck, dir)) {
                return true;
            }
        }
        return false;
    }

    checkWordInDirection(row, col, word, direction) {

        if (this.checkWordFromPosition(row, col, word, direction)) {
            return true;
        }

        const reversedWord = word.split('').reverse().join('');
        return this.checkWordFromPosition(row, col, reversedWord, direction);
    }

    checkWordFromPosition(row, col, word, direction) {
        if (row < 0 || col < 0 || row >= this.getCurrentDifficulty().gridSize || 
            col >= this.getCurrentDifficulty().gridSize) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + direction[0] * i;
            const currentCol = col + direction[1] * i;

            if (currentRow < 0 || currentCol < 0 || 
                currentRow >= this.getCurrentDifficulty().gridSize || 
                currentCol >= this.getCurrentDifficulty().gridSize) {
                return false;
            }

            if (this.grid[currentRow][currentCol] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    getCurrentDifficulty() {
        return this.difficultySettings[this.difficultySelect.value];
    }

    async loadGame() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            this.wordCategories = data.categories;
            this.startNewRound();
        } catch (error) {
            console.error('Error cargando las palabras:', error);
        }
    }

    startNewRound() {
        this.foundWords.clear();
        this.selectedCells.clear();
        this.victoryModal.classList.remove('visible');
        
        const difficulty = this.getCurrentDifficulty();
        const category = this.wordCategories[Math.floor(Math.random() * this.wordCategories.length)];
        

        const validWords = category.words.filter(word => {
            const length = this.currentLanguage === 'en' ? word.en.length : word.es.length;
            return length >= difficulty.minWordLength && length <= difficulty.maxWordLength;
        });


        this.words = this.shuffleArray([...validWords])
            .slice(0, difficulty.wordCount)
            .map(word => ({
                ...word,
                found: false
            }));

        this.createGrid();
        this.updateWordList();
        this.updateTranslations();

 
        document.documentElement.style.setProperty('--grid-size', difficulty.gridSize);
    }

    createGrid() {
        const difficulty = this.getCurrentDifficulty();
        this.grid = Array(difficulty.gridSize).fill().map(() => 
            Array(difficulty.gridSize).fill(''));

        this.words.forEach(word => {
            let placed = false;
            while (!placed) {
                const wordToPlace = this.currentLanguage === 'en' ? word.en : word.es;
                placed = this.tryPlaceWord(wordToPlace, difficulty.directions);
            }
        });

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < difficulty.gridSize; i++) {
            for (let j = 0; j < difficulty.gridSize; j++) {
                if (this.grid[i][j] === '') {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }

        this.renderGrid();
    }

    tryPlaceWord(word, allowedDirections) {
        const direction = allowedDirections[Math.floor(Math.random() * allowedDirections.length)];
        const wordLength = word.length;

        let startX = Math.floor(Math.random() * this.getCurrentDifficulty().gridSize);
        let startY = Math.floor(Math.random() * this.getCurrentDifficulty().gridSize);

        const endX = startX + direction[0] * (wordLength - 1);
        const endY = startY + direction[1] * (wordLength - 1);

        if (endX < 0 || endX >= this.getCurrentDifficulty().gridSize || endY < 0 || endY >= this.getCurrentDifficulty().gridSize) {
            return false;
        }

        for (let i = 0; i < wordLength; i++) {
            const x = startX + direction[0] * i;
            const y = startY + direction[1] * i;
            if (this.grid[x][y] !== '' && this.grid[x][y] !== word[i]) {
                return false;
            }
        }

        for (let i = 0; i < wordLength; i++) {
            const x = startX + direction[0] * i;
            const y = startY + direction[1] * i;
            this.grid[x][y] = word[i];
        }

        return true;
    }

    renderGrid() {
        const difficulty = this.getCurrentDifficulty();
        this.gridElement.innerHTML = '';
        for (let i = 0; i < difficulty.gridSize; i++) {
            for (let j = 0; j < difficulty.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = this.grid[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridElement.appendChild(cell);
            }
        }
    }

    updateWordList() {
        this.wordsToFindElement.innerHTML = '';
        this.words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = this.currentLanguage === 'en' ? word.en : word.es;
            if (this.foundWords.has(word.en)) {
                li.classList.add('found');
            }
            this.wordsToFindElement.appendChild(li);
        });
    }

    updateTranslations() {
        if (!this.learnEnglish) {
            this.translationsElement.classList.add('hidden');
            return;
        }

        this.translationsElement.classList.remove('hidden');
        this.foundWordsListElement.innerHTML = '';
        
        Array.from(this.foundWords).forEach(wordEn => {
            const word = this.words.find(w => w.en === wordEn);
            if (word) {
                const div = document.createElement('div');
                div.className = 'translation-item';
                div.innerHTML = `
                    <span>${word.en}</span>
                    <span>→</span>
                    <span>${word.es}</span>
                `;
                this.foundWordsListElement.appendChild(div);
            }
        });
    }

    handleMouseDown(e) {
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;

        this.isSelecting = true;
        this.startCell = cell;
        this.selectedCells.clear();
        this.selectedCells.add(cell);
        cell.classList.add('selected');
    }

    handleMouseOver(e) {
        if (!this.isSelecting) return;

        const cell = e.target.closest('.grid-cell');
        if (!cell) return;

        const startRow = parseInt(this.startCell.dataset.row);
        const startCol = parseInt(this.startCell.dataset.col);
        const currentRow = parseInt(cell.dataset.row);
        const currentCol = parseInt(cell.dataset.col);

        this.selectedCells.forEach(cell => cell.classList.remove('selected'));
        this.selectedCells.clear();

        const rowDiff = currentRow - startRow;
        const colDiff = currentCol - startCol;
        
        if (Math.abs(rowDiff) === Math.abs(colDiff) || rowDiff === 0 || colDiff === 0) {
            const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
            const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
            
            let row = startRow;
            let col = startCol;
            
            while (true) {
                const currentCell = this.gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (!currentCell) break;
                
                this.selectedCells.add(currentCell);
                currentCell.classList.add('selected');
                
                if (row === currentRow && col === currentCol) break;
                row += rowDir;
                col += colDir;
            }
        }
    }

    handleMouseUp() {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        const selectedWord = Array.from(this.selectedCells)
            .sort((a, b) => {
                const rowDiff = parseInt(a.dataset.row) - parseInt(b.dataset.row);
                return rowDiff === 0 ? parseInt(a.dataset.col) - parseInt(b.dataset.col) : rowDiff;
            })
            .map(cell => cell.textContent)
            .join('');

        const foundWord = this.words.find(word => {
            const wordToCheck = this.currentLanguage === 'en' ? word.en : word.es;
            return wordToCheck === selectedWord || 
                   wordToCheck === selectedWord.split('').reverse().join('');
        });

        if (foundWord && !this.foundWords.has(foundWord.en)) {
            this.foundWords.add(foundWord.en);
            this.selectedCells.forEach(cell => cell.classList.add('found'));
            this.updateWordList();
            this.updateTranslations();

            if (this.foundWords.size === this.words.length) {
                this.showVictoryModal();
            }
        }

        this.selectedCells.forEach(cell => cell.classList.remove('selected'));
        this.selectedCells.clear();
    }

    showVictoryModal() {
        this.victoryModal.classList.add('visible');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

new WordSearch(); 