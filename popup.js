document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.new-window-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const game = button.dataset.game;
            let url;
            
            if (game === 'word-search') {
                url = chrome.runtime.getURL('puzzles/word-search/word-search.html');
            } else if (game === 'crossword') {
                url = chrome.runtime.getURL('crossword.html');
            } else if (game === 'memory-math') {
                url = chrome.runtime.getURL('puzzles/memory-math/memory-math.html');
            } else if (game === 'fast') {
                url = chrome.runtime.getURL('puzzles/fast/fast.html');
            } else if (game === 'fast-math') {
                url = chrome.runtime.getURL('puzzles/fast-math/fast-math.html');
            } else if (game === 'secuency-memory') {
                url = chrome.runtime.getURL('puzzles/secuency-memory/secuency-memory.html');
            }

            if (url) {
                chrome.windows.create({
                    url: url,
                    type: 'popup',
                    width: 1024,
                    height: 768
                });
            }
        });
    });
}); 