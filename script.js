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
    
    setTimeout(() => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const formData = getFormData();
            
            // PDF Configuration
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const lineHeight = 7;
            let yPosition = margin;
            
            // Helper function to add text with word wrap
            function addText(text, fontSize = 10, isBold = false) {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                
                const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
                doc.text(splitText, margin, yPosition);
                yPosition += splitText.length * lineHeight;
                
                return yPosition;
            }
            
            function addSection(title, content) {
                yPosition += 5; // Extra space before section
                addText(title, 12, true);
                yPosition += 3; // Space after title
                
                Object.entries(content).forEach(([key, value]) => {
                    if (value) {
                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        addText(`${formattedKey}: ${Array.isArray(value) ? value.join(', ') : value}`);
                    }
                });
                
                yPosition += 5; // Space after section
            }
            
            // Title
            addText('AEDP LEAD PSYCHOLOGICAL PROFILE & SCRIPT ADHERENCE FORM', 16, true);
            addText(`Generated on: ${new Date().toLocaleDateString()}`, 10);
            yPosition += 10;
            
            // Section 0: Personal Information
            addSection('0. PERSONAL INFORMATION', {
                'Full Name': formData.fullName,
                'Mobile Number': formData.mobileNumber,
                'Email Address': formData.emailAddress,
                'Current City': formData.currentCity
            });
            
            // Section 1: First Contact
            addSection('1. FIRST CONTACT', {
                'Exclusivity Line Used': formData.exclusivityLine,
                'Candidate Reaction': formData.candidateReaction
            });
            
            // Section 2: Qualification Questions
            addSection('2. QUALIFICATION QUESTIONS', {
                'Name & Education': formData.nameEducation,
                'Program Interest': formData.programInterest,
                'Part-time Work': formData.partTimeWork,
                'Communication Comfort': formData.commsComfort,
                'Career Goal': formData.careerGoal
            });
            
            // Section 3: Core Motivation & Pain Points
            addSection('3. CORE MOTIVATION & PAIN POINTS', {
                'Primary Why': formData.primaryWhy,
                'Biggest Worry': formData.biggestWorry,
                'Past Disappointments': formData.pastDisappointments
            });
            
            // Section 4: Decision Style & Influencers
            addSection('4. DECISION STYLE & INFLUENCERS', {
                'Decision Speed': formData.decisionSpeed,
                'Influencers': formData.influencers,
                'Scarcity Reaction': formData.scarcityReaction
            });
            
            // Section 5: Communication & Personality Lens
            addSection('5. COMMUNICATION & PERSONALITY LENS', {
                'Preferred Tone': formData.preferredTone,
                'Channel': formData.channel,
                'Detail Level': formData.detailLevel,
                'Personality Model': formData.personalityModel,
                'Assigned Traits': formData.assignedTraits
            });
            
            // Section 6: Objections & Triggers
            addSection('6. OBJECTIONS & TRIGGERS', {
                'Stated Objections': formData.statedObjections,
                'Unspoken Hesitations': formData.unspokenHesitations,
                'Key Trigger': formData.keyTrigger
            });
            
            // Section 7: Next Steps & Close
            addSection('7. NEXT STEPS & CLOSE', {
                'Follow-up Ask': formData.followupAsk,
                'Custom Benefit': formData.customBenefit
            });
            
            // Section 8: Follow-up Schedule & Signature
            addSection('8. FOLLOW-UP SCHEDULE & SIGNATURE', {
                'Next Reminder': formData.nextReminderDateTime,
                'Channel & Format': formData.channelFormat,
                'Executive Signature': formData.executiveSignature
            });
            
            // Footer
            yPosition = pageHeight - 20;
            addText('This document is confidential and for internal use only.', 8);
            
            // Save PDF
            const fileName = `AEDP_Profile_${formData.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            // Hide loading and show success message
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('aedpForm').style.display = 'block';
            
            // Show success alert
            showAlert('PDF generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('aedpForm').style.display = 'block';
            showAlert('Error generating PDF. Please try again.', 'danger');
        }
    }, 500); // Small delay to show loading indicator
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
