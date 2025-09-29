const themeToggleBtn = document.getElementById('theme-toggle-btn');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const html = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

document.addEventListener("DOMContentLoaded", () => {
  fetch('/public/uploads/picture.png')
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Unable to access uploads directory');
      }
    })
    .then(data => {
      const profilePicture = document.getElementById('my-profile-picture');
      if (profilePicture) {
        profilePicture.src ='public/uploads/picture.png';
      }

      // const parser = new DOMParser();
      // const htmlDoc = parser.parseFromString(data, 'text/html');
      // const images = htmlDoc.querySelectorAll('img');
      // if (images.length > 0) {
      //   console.log('Images are present in the uploads directory.');
      // } else {
      //   console.log('No images found in the uploads directory.');
      // }
    })
    .catch(error => {
      console.error('Error:', error);
    });
})

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

// Upload Modal Functionality
const uploadModal = document.getElementById('upload-modal');
const uploadToggleBtn = document.getElementById('upload-toggle-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const cancelUploadBtn = document.getElementById('cancel-upload-btn');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const fileInputContainer = document.querySelector('.file-input-container');
const fileText = document.querySelector('.file-text');
const uploadProgress = document.getElementById('upload-progress');
const uploadResult = document.getElementById('upload-result');

// Open modal
uploadToggleBtn.addEventListener('click', () => {
    uploadModal.classList.add('show');
    document.body.style.overflow = 'hidden';
});

// Close modal functions
function closeModal() {
    uploadModal.classList.remove('show');
    document.body.style.overflow = '';
    resetForm();
}

modalCloseBtn.addEventListener('click', closeModal);
cancelUploadBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && uploadModal.classList.contains('show')) {
        closeModal();
    }
});

// File input handling
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileText.textContent = `Selected: ${file.name}`;
        fileText.classList.add('file-selected');
    }
});

// Drag and drop functionality
fileInputContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileInputContainer.classList.add('dragover');
});

fileInputContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileInputContainer.classList.remove('dragover');
});

fileInputContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInputContainer.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        const file = files[0];
        fileText.textContent = `Selected: ${file.name}`;
        fileText.classList.add('file-selected');
    }
});

// Form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const file = fileInput.files[0];

    if (!file) {
        showUploadResult('Please select a file to upload.', 'error');
        return;
    }

    formData.append('file', file);

    // Show progress
    uploadProgress.style.display = 'block';
    uploadResult.style.display = 'none';

    // Disable form during upload
    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.text();
            showUploadResult(result, 'success');

            // Update profile picture if it's an image
            if (file.type.startsWith('image/')) {
                setTimeout(() => {
                    const profilePicture = document.getElementById('my-profile-picture');
                    if (profilePicture) {
                        // Add timestamp to prevent caching
                        profilePicture.src = `public/uploads/picture${getFileExtension(file.name)}?t=${Date.now()}`;
                    }
                }, 1000);
            }
        } else {
            const error = await response.text();
            showUploadResult(`Upload failed: ${error}`, 'error');
        }
    } catch (error) {
        showUploadResult(`Upload failed: ${error.message}`, 'error');
    } finally {
        // Hide progress and reset form
        uploadProgress.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload File';
    }
});

// Helper functions
function showUploadResult(message, type) {
    uploadResult.textContent = message;
    uploadResult.className = `upload-result ${type}`;
    uploadResult.style.display = 'block';
}

function resetForm() {
    uploadForm.reset();
    fileText.textContent = 'Click to select file or drag and drop';
    fileText.classList.remove('file-selected');
    uploadProgress.style.display = 'none';
    uploadResult.style.display = 'none';

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Upload File';
}

function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
}
