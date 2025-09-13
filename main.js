const themeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const html = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

function updateIcon(theme) {
    if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

updateIcon(currentTheme);

function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
}

themeToggleBtn.addEventListener('click', toggleTheme);

const editBtn = document.getElementById('edit-about-btn');
const resetBtn = document.getElementById('reset-about-btn');
const aboutDescription = document.getElementById('about-description');
const editBtnText = document.querySelector('.edit-btn-text');
let isEditing = false;

function toggleEditMode() {
    isEditing = !isEditing;

    if (isEditing) {
        aboutDescription.contentEditable = true;
        aboutDescription.focus();
        aboutDescription.classList.add('editing');
        editBtnText.textContent = 'Save';
        editBtn.classList.add('save-mode');

        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(aboutDescription);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

    } else {
        aboutDescription.contentEditable = false;
        aboutDescription.classList.remove('editing');
        editBtnText.textContent = 'Edit';
        editBtn.classList.remove('save-mode');

        const editedContent = aboutDescription.textContent.trim();
        localStorage.setItem('aboutDescription', editedContent);
    }
}

function loadSavedContent() {
    const savedContent = localStorage.getItem('aboutDescription');
    if (savedContent) {
        aboutDescription.textContent = savedContent;
    }
}

document.addEventListener('DOMContentLoaded', loadSavedContent);

function resetToOriginal() {
    const originalContent = aboutDescription.getAttribute('data-original-content');
    aboutDescription.textContent = originalContent;
    localStorage.removeItem('aboutDescription');

    if (isEditing) {
        toggleEditMode();
    }
}

editBtn.addEventListener('click', toggleEditMode);
resetBtn.addEventListener('click', resetToOriginal);

aboutDescription.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        toggleEditMode();
    }
});
