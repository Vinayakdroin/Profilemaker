// Initialize form validation and PDF generation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('aedpForm');
    
    // Form submission handler
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (form.checkValidity()) {
            generatePDF();
        }
        
        form.classList.add('was-validated');
    });
    
    // Show/hide conditional fields
    setupConditionalFields();
});

function setupConditionalFields() {
    // Show/hide "Other" text fields based on radio button selections
    const otherWhyRadio = document.getElementById('otherWhy');
    const otherWhyText = document.getElementById('otherWhyText');
    
    document.querySelectorAll('input[name="primaryWhy"]').forEach(radio => {
        radio.addEventListener('change', function() {
            otherWhyText.style.display = this.value === 'Other' ? 'block' : 'none';
        });
    });
    
    // Similar for other conditional fields
    const otherInfluencerCheckbox = document.getElementById('otherInfluencer');
    const otherInfluencerText = document.getElementById('otherInfluencerText');
    
    otherInfluencerCheckbox.addEventListener('change', function() {
        otherInfluencerText.style.display = this.checked ? 'block' : 'none';
    });
    
    const otherTriggerRadio = document.getElementById('otherTrigger');
    const otherTriggerText = document.getElementById('otherTriggerText');
    
    document.querySelectorAll('input[name="keyTrigger"]').forEach(radio => {
        radio.addEventListener('change', function() {
            otherTriggerText.style.display = this.value === 'Other' ? 'block' : 'none';
        });
    });
}

function getFormData() {
    const formData = {};
    
    // Personal Information
    formData.fullName = document.getElementById('fullName').value;
    formData.mobileNumber = document.getElementById('mobileNumber').value;
    formData.emailAddress = document.getElementById('emailAddress').value;
    formData.currentCity = document.getElementById('currentCity').value;
    
    // First Contact
    formData.exclusivityLine = getRadioValue('exclusivityLine');
    formData.candidateReaction = getRadioValue('candidateReaction');
    
    // Qualification Questions
    formData.nameEducation = document.getElementById('nameEducation').value;
    formData.programInterest = getRadioValue('programInterest');
    formData.partTimeWork = getRadioValue('partTimeWork');
    formData.commsComfort = getRadioValue('commsComfort');
    formData.careerGoal = document.getElementById('careerGoal').value;
    
    // Core Motivation & Pain Points
    formData.primaryWhy = getRadioValue('primaryWhy');
    if (formData.primaryWhy === 'Other') {
        formData.primaryWhy += ': ' + document.getElementById('otherWhyText').value;
    }
    formData.biggestWorry = document.getElementById('biggestWorry').value;
    formData.pastDisappointments = document.getElementById('pastDisappointments').value;
    
    // Decision Style & Influencers
    formData.decisionSpeed = getRadioValue('decisionSpeed');
    formData.influencers = getCheckboxValues('influencers');
    if (document.getElementById('otherInfluencer').checked) {
        formData.influencers.push('Other: ' + document.getElementById('otherInfluencerText').value);
    }
    formData.scarcityReaction = getRadioValue('scarcityReaction');
    
    // Communication & Personality Lens
    formData.preferredTone = getRadioValue('preferredTone');
    formData.channel = getRadioValue('channel');
    formData.detailLevel = getRadioValue('detailLevel');
    formData.personalityModel = getRadioValue('personalityModel');
    formData.assignedTraits = document.getElementById('assignedTraits').value;
    
    // Objections & Triggers
    formData.statedObjections = document.getElementById('statedObjections').value;
    formData.unspokenHesitations = document.getElementById('unspokenHesitations').value;
    formData.keyTrigger = getRadioValue('keyTrigger');
    if (formData.keyTrigger === 'Other') {
        formData.keyTrigger += ': ' + document.getElementById('otherTriggerText').value;
    }
    
    // Next Steps & Close
    formData.followupAsk = document.getElementById('followupAsk').value;
    formData.customBenefit = document.getElementById('customBenefit').value;
    
    // Follow-up Schedule & Signature
    formData.nextReminderDateTime = document.getElementById('nextReminderDateTime').value;
    formData.channelFormat = document.getElementById('channelFormat').value;
    formData.executiveSignature = document.getElementById('executiveSignature').value;
    
    return formData;
}

function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function generatePDF() {
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('aedpForm').style.display = 'none';
    
    const formData = getFormData();
    
    // Send form data to Flask backend
    fetch('/generate_pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('PDF generation failed');
        }
        return response.blob();
    })
    .then(blob => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `AEDP_Profile_${formData.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Hide loading and show success message
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('aedpForm').style.display = 'block';
        showAlert('PDF generated successfully!', 'success');
    })
    .catch(error => {
        console.error('Error generating PDF:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('aedpForm').style.display = 'block';
        showAlert('Error generating PDF. Please try again.', 'danger');
    });
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('aedpForm').reset();
        document.getElementById('aedpForm').classList.remove('was-validated');
        
        // Hide conditional fields
        document.getElementById('otherWhyText').style.display = 'none';
        document.getElementById('otherInfluencerText').style.display = 'none';
        document.getElementById('otherTriggerText').style.display = 'none';
        
        showAlert('Form cleared successfully!', 'info');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Auto-save functionality (optional - saves to localStorage)
function autoSave() {
    const formData = getFormData();
    localStorage.setItem('aedpFormData', JSON.stringify(formData));
}

function loadSavedData() {
    const savedData = localStorage.getItem('aedpFormData');
    if (savedData && confirm('Found saved form data. Would you like to load it?')) {
        const formData = JSON.parse(savedData);
        
        // Populate form fields
        Object.entries(formData).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else if (element.type === 'checkbox') {
                    if (Array.isArray(value)) {
                        value.forEach(val => {
                            const checkbox = document.querySelector(`input[name="${key}"][value="${val}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    element.value = value;
                }
            }
        });
    }
}

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

// Load saved data on page load
document.addEventListener('DOMContentLoaded', loadSavedData);
