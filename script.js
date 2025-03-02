// game data for each category
const categories = {
    animals: {
        words: ['mamba', 'penguin', 'peacocks', 'cat', 'leopard', 'cheetah', 'hippopotamus', 'iguana', 'whale', 'butterfly', 'eagle', 'periwinkle'],
        hint: 'guess the animal'
    },
    countries: {
        words: ['canada', 'nigeria', 'senegal', 'ghana', 'nicaragua', 'honduras', 'cameroon', 'malawi', 'Australia', 'benin', 'rwanda'],
        hint: 'guess the country'
    },
    fruits: {
        words: ['apple', 'soursop', 'kiwi', 'avocado', 'watermelon', 'pineapple', 'date', 'orange', 'strawberry', 'tangerine', 'mango'],
        hint: 'guess the fruit'
    },
    sports: {
        words: ['soccer', 'javelin', 'discus', 'shortput', 'tennis', 'archery', 'basketball', 'volleyball', 'polevault', 'fencing', 'baseball', 'swimming'],
        hint: 'guess the sport'
    },
}

// Global variables
let currentWord = '' // Split each letter as an item in an array
let guessedLetters = []
let score = 0
let maxTries = 8
let wrongGuesses = 0
let gamesWon = 0
let gamesLost = 0
let currentDifficulty = 'medium'

// DOM elements
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const messageElement = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');
const triesLeft = document.getElementById('tries-left');
const scoreElement = document.getElementById('score');
const hintElement = document.getElementById('hint');
const categorySelect = document.getElementById('category-select');
const hangmanParts = document.querySelectorAll('.hangman-part');
const difficultySelect = document.getElementById('difficulty-select');
const statsElement = document.getElementById('game-stats');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close');
const modalPlayAgainBtn = document.getElementById('modal-play-again');

// Difficulty settings
const difficultySettings = {
    easy: {
        maxLength: 5,
        maxTries: 10
    },
    medium: {
        maxLength: 8,
        maxTries: 8
    },
    hard: {
        maxLength: 12,
        maxTries: 6
    }
};

// Main function that initializes the game
function gamePlay() {
    // Clean out the state
    guessedLetters = []
    wrongGuesses = 0

    // Apply difficulty settings
    currentDifficulty = difficultySelect ? difficultySelect.value : 'medium';
    maxTries = difficultySettings[currentDifficulty].maxTries;

    // Reset the visual part of the state
    triesLeft.textContent = maxTries;
    messageElement.textContent = '';

    // Get current category
    const category = categorySelect.value;
    hintElement.textContent = categories[category].hint;

    // Generate the random word from the chosen category based on difficulty
    const words = categories[category].words;
    const filteredWords = words.filter(word => 
        word.length <= difficultySettings[currentDifficulty].maxLength
    );
    
    if (filteredWords.length > 0) {
        currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)].toLowerCase();
    } else {
        // Fallback if no words match the difficulty criteria
        currentWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
    }

    console.log(currentWord);

    // Update stats display
    updateStats();

    // Function to display guessed letters(word)
    createWordDisplay();

    // Create keyboard
    createKeyboard();

    // Create function reset hangman 
    resetHangman();
    
    // Hide any open modal
    hideModal();
}

function createWordDisplay() {
    wordDisplay.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.dataset.letter = currentWord[i];
        wordDisplay.appendChild(letterBox);
    }
}

function createKeyboard() {
    keyboard.innerHTML = '';
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < letters.length; i++) {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = letters[i];
        key.addEventListener('click', () => handleGuess(letters[i]));
        keyboard.appendChild(key);
    }
}

function resetHangman() {
    hangmanParts.forEach((part, index) => {
        if (index < 2) {
            part.style.display = 'block';
        } else {
            part.style.display = 'none';
        }
    });
}

function handleGuess(letter) {
    // Deny function run when tries max have been reached or the letter has been clicked before
    if (guessedLetters.includes(letter) || wrongGuesses >= maxTries || isWordComplete()) {
        return;
    }

    guessedLetters.push(letter);

    // Update the keyboard button when it has been used
    const key = [...keyboard.children].find(key => key.textContent === letter);
    key.classList.add('used');

    if (currentWord.includes(letter)) {
        key.classList.add('correct');
        updateWordDisplay(letter);
        
        // Check if word is complete after updating the display
        if (isWordComplete()) {
            handleWin();
        }
    } else {
        key.classList.add('wrong');
        wrongGuesses++;
        triesLeft.textContent = maxTries - wrongGuesses;
        updateHangman();
        
        // Check if game is over (lost)
        if (wrongGuesses >= maxTries) {
            handleLoss();
        }
    }
}

function updateWordDisplay(letter) {
    const letterBoxes = wordDisplay.children;
    for (let i = 0; i < letterBoxes.length; i++) {
        if (letterBoxes[i].dataset.letter === letter) {
            letterBoxes[i].textContent = letter;
        }
    }
}

function updateHangman() {
    if (wrongGuesses + 1 < hangmanParts.length) {
        hangmanParts[wrongGuesses + 1].style.display = 'block';
    }
}

function isWordComplete() {
    const letterBoxes = wordDisplay.children;
    for (let i = 0; i < letterBoxes.length; i++) {
        const letter = letterBoxes[i].dataset.letter;
        if (!guessedLetters.includes(letter)) {
            return false;
        }
    }
    return true;
}

// New functions for win/loss handling
function handleWin() {
    score += 10;
    gamesWon++;
    scoreElement.textContent = score;
    updateStats();
    
    showModal('You Win!', `Congratulations! You guessed "${currentWord}" correctly!`, 'win');
}

function handleLoss() {
    gamesLost++;
    updateStats();
    
    // Reveal the correct word
    const letterBoxes = wordDisplay.children;
    for (let i = 0; i < letterBoxes.length; i++) {
        letterBoxes[i].textContent = letterBoxes[i].dataset.letter;
        if (!guessedLetters.includes(letterBoxes[i].dataset.letter)) {
            letterBoxes[i].classList.add('missed');
        }
    }
    
    showModal('Game Over', `Sorry, you ran out of tries! The word was "${currentWord}".`, 'loss');
}

function updateStats() {
    if (statsElement) {
        statsElement.innerHTML = `
            <p>Games Won: ${gamesWon}</p>
            <p>Games Lost: ${gamesLost}</p>
            <p>Current Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</p>
        `;
    }
}

// Modal functions
function showModal(title, message, type) {
    if (modalOverlay && modalContent) {
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = title;
        
        const modalMessage = document.createElement('p');
        modalMessage.textContent = message;
        
        modalContent.innerHTML = '';
        modalContent.classList.remove('win', 'loss');
        modalContent.classList.add(type);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalMessage);
        
        modalOverlay.classList.add('active');
    }
}

function hideModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
}

// Event listeners
if (categorySelect) categorySelect.addEventListener('change', gamePlay);
if (newGameBtn) newGameBtn.addEventListener('click', gamePlay);
if (difficultySelect) difficultySelect.addEventListener('change', gamePlay);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
if (modalPlayAgainBtn) modalPlayAgainBtn.addEventListener('click', gamePlay);

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (/^[a-z]$/.test(e.key)) {
        handleGuess(e.key);
    }
});

// Call function to start the game
gamePlay();