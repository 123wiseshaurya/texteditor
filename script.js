document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('lineNumbers');
    const jumpInput = document.getElementById('jumpInput');
    const jumpBtn = document.getElementById('jumpBtn');
    const fileInput = document.getElementById('fileInput');
    
    // Initialize line numbers
    updateLineNumbers();
    
    // Event Listeners
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', syncScroll);
    editor.addEventListener('keyup', highlightCurrentLine);
    editor.addEventListener('click', highlightCurrentLine);
    jumpBtn.addEventListener('click', jumpToLine);
    jumpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') jumpToLine();
    });
    fileInput.addEventListener('change', handleFileUpload);
    
    // Update line numbers based on content
    function updateLineNumbers() {
        const lines = editor.value.split('\n');
        const lineCount = Math.max(1, lines.length);
        let numbers = '';
        
        // Create line numbers with consistent formatting
        for (let i = 1; i <= lineCount; i++) {
            numbers += i + '\n';
        }
        
        // Ensure we have at least one line number
        if (lineCount === 0) numbers = '1';
        
        // Remove trailing newline if present
        if (numbers.endsWith('\n')) {
            numbers = numbers.slice(0, -1);
        }
        
        lineNumbers.textContent = numbers;
        syncScroll();
        
        // Force reflow to ensure proper rendering
        lineNumbers.style.display = 'none';
        lineNumbers.offsetHeight; // Trigger reflow
        lineNumbers.style.display = 'block';
    }
    
    // Synchronize scroll between line numbers and editor
    function syncScroll() {
        lineNumbers.scrollTop = editor.scrollTop;
    }
    
    // Jump to a specific line
    function jumpToLine() {
        const lineNumber = parseInt(jumpInput.value);
        if (isNaN(lineNumber) || lineNumber < 1) {
            alert('Please enter a valid line number');
            return;
        }
        
        const lines = editor.value.split('\n');
        if (lineNumber > lines.length) {
            alert(`Line number exceeds total lines (${lines.length})`);
            return;
        }
        
        // Calculate position to scroll to
        const text = lines.slice(0, lineNumber - 1).join('\n');
        const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight) || 20;
        const offset = (lineNumber - 1) * lineHeight;
        
        // Scroll to the line
        editor.scrollTo(0, offset);
        
        // Highlight the line
        highlightLine(lineNumber);
        
        // Focus the editor at the beginning of the line
        const startPos = text.length + (lineNumber > 1 ? 1 : 0);
        editor.setSelectionRange(startPos, startPos);
        editor.focus();
    }
    
    // Highlight a specific line
    function highlightLine(lineNumber) {
        // Remove previous highlights
        const lines = editor.value.split('\n');
        const lineElements = lineNumbers.querySelectorAll('div');
        
        lineElements.forEach((el, index) => {
            if (index + 1 === lineNumber) {
                el.classList.add('highlight-line');
                // Scroll the line into view if needed
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                el.classList.remove('highlight-line');
            }
        });
    }
    
    // Highlight the current line where cursor is
    function highlightCurrentLine() {
        const cursorPosition = editor.selectionStart;
        const textBeforeCursor = editor.value.substring(0, cursorPosition);
        const lineNumber = textBeforeCursor.split('\n').length;
        
        // Update the jump input to show current line
        jumpInput.value = lineNumber;
        
        // Highlight the line
        highlightLine(lineNumber);
    }
    
    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            updateLineNumbers();
            // Reset file input to allow selecting the same file again
            event.target.value = '';
        };
        reader.readAsText(file);
    }
    
    // Handle tab key for indentation
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            
            // Insert tab character
            editor.value = editor.value.substring(0, start) + '\t' + editor.value.substring(end);
            
            // Move cursor position after the tab
            editor.selectionStart = editor.selectionEnd = start + 1;
            
            updateLineNumbers();
        }
    });
});
