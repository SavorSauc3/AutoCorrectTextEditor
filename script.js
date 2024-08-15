// script.js

// Handle the settings button click
document.getElementById('settings-icon').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'block';
});

// Handle the close button click
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
});

// Handle outside click to close the modal
window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('settings-modal')) {
        document.getElementById('settings-modal').style.display = 'none';
    }
});

// Update modal background color based on current theme
function updateModalStyles() {
    const theme = document.body.className;
    const modalContent = document.querySelector('.modal-content');
    
    switch (theme) {
        case 'dark-theme':
            modalContent.style.backgroundColor = '#444';
            break;
        case 'high-contrast-theme':
            modalContent.style.backgroundColor = '#111';
            break;
        default:
            modalContent.style.backgroundColor = '#fefefe';
    }
}

// Call the function when the page loads and when the theme changes
updateModalStyles();
document.getElementById('theme-select-modal').addEventListener('change', (event) => {
    document.body.className = event.target.value;
    updateModalStyles();
});

// Ensure num-reruns value is between 1 and 5
function validateNumReruns() {
    const numRerunsInput = document.getElementById('num-reruns');
    let value = parseInt(numRerunsInput.value, 10);

    if (isNaN(value) || value < 1) {
        numRerunsInput.value = 1;
    } else if (value > 5) {
        numRerunsInput.value = 5;
    }
}

// Attach validation to the input field
document.getElementById('num-reruns').addEventListener('input', validateNumReruns);

document.getElementById('check-btn').addEventListener('click', async () => {
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');

    // Show the spinner and hide the text
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';

    const text = document.getElementById('editor').value;
    const numReruns = parseInt(document.getElementById('num-reruns').value, 10);
    try {
        const response = await fetch('http://localhost:5000/autocorrect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, num_reruns: numReruns })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        document.getElementById('result').value = data.corrected_text;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').value = 'Error processing request';
    } finally {
        // Hide the spinner and show the text
        spinner.style.display = 'none';
        buttonText.style.display = 'inline';
    }
});
