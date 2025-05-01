// Your Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPUfAx1rUH9Vq12zuDdpYHNUdcw8ck-V64MFb6L-8uvy24kyPbsLgZQlx7BznLzxr0/exec';

// DOM elements
const registrationForm = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const ticketDisplay = document.getElementById('ticketDisplay');

// Add success and error message elements if they don't exist
if (!successMessage) {
  const successDiv = document.createElement('div');
  successDiv.id = 'successMessage';
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <h2>Registration Successful!</h2>
    <p>Your registration has been received.</p>
    <div id="ticketDisplay"></div>
    <p>A confirmation email will be sent to you shortly.</p>
  `;
  document.body.insertBefore(successDiv, registrationForm);
}

if (!errorMessage) {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'errorMessage';
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <h2>Registration Failed</h2>
    <p>There was an error processing your registration. Please try again.</p>
  `;
  document.body.insertBefore(errorDiv, registrationForm);
}

if (!loadingIndicator) {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingIndicator';
  loadingDiv.className = 'loading';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Processing your registration...</p>
  `;
  document.body.insertBefore(loadingDiv, registrationForm);
}

// Add CSS styles for new elements
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .success-message {
      display: none;
      background-color: #d4edda;
      color: #155724;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 50px auto;
      max-width: 600px;
    }

    .error-message {
      display: none;
      background-color: #f8d7da;
      color: #721c24;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 50px auto;
      max-width: 600px;
    }

    #ticketDisplay {
      font-size: 24px;
      font-weight: bold;
      color: #4F46E5;
      margin-top: 10px;
    }

    .loading {
      display: none;
      text-align: center;
      margin: 50px auto;
      max-width: 600px;
    }

    .loading-spinner {
      border: 6px solid #f3f3f3;
      border-top: 6px solid #4F46E5;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`);

// Form submission handler
registrationForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Show loading indicator
  loadingIndicator.style.display = 'block';
  registrationForm.style.display = 'none';
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';

  // Collect form data
  const formData = new FormData(this);
  const jsonData = {};
  
  // Convert FormData to JSON object
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });
  
  // Handle file upload (convert to base64)
  const fileInput = document.getElementById('paymentScreenshot');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // Add base64 encoded file data
      jsonData.paymentScreenshot = e.target.result;
      
      // Send data to the Apps Script web app
      submitFormData(jsonData);
    };
    
    reader.readAsDataURL(file);
  } else {
    // No file selected, just send the form data
    submitFormData(jsonData);
  }
});

// Function to send data to Apps Script
function submitFormData(jsonData) {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  })
  .then(response => response.json())
  .then(data => {
    loadingIndicator.style.display = 'none';
    
    if (data.status === 'success') {
      successMessage.style.display = 'block';
      
      // Display ticket ID
      if (data.ticketId) {
        ticketDisplay.textContent = `Your Ticket ID: ${data.ticketId}`;
      }
      
      // Reset form
      registrationForm.reset();
      document.getElementById('memberFields').innerHTML = '';
      document.getElementById('registerBtn').disabled = true;
      document.getElementById('registerBtn').classList.remove('enabled');
    } else {
      // Show error message
      errorMessage.style.display = 'block';
      
      // Show form again after error
      setTimeout(() => {
        errorMessage.style.display = 'none';
        registrationForm.style.display = 'flex';
      }, 5000);
    }
  })
  .catch(error => {
    console.error('Form submission error:', error);
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'block';
    
    // Show form again after error
    setTimeout(() => {
      errorMessage.style.display = 'none';
      registrationForm.style.display = 'flex';
    }, 5000);
  });
}
