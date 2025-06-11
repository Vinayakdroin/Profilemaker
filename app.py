import os
from flask import Flask, render_template, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import json
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# configure the database if available
database_url = os.environ.get("DATABASE_URL")
if database_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    try:
        # Get form data
        form_data = request.get_json() or {}
        
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=16,
            textColor=colors.darkblue,
            spaceAfter=20
        )
        story.append(Paragraph("AEDP Lead Psychological Profile & Script Adherence Form", title_style))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Helper function to add sections
        def add_section(title, data):
            # Section title
            section_style = ParagraphStyle(
                'SectionTitle',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.darkblue,
                spaceBefore=10,
                spaceAfter=10
            )
            story.append(Paragraph(title, section_style))
            
            # Section content
            for key, value in data.items():
                if value:
                    formatted_key = key.replace('_', ' ').title()
                    if isinstance(value, list):
                        value = ', '.join(value)
                    story.append(Paragraph(f"<b>{formatted_key}:</b> {value}", styles['Normal']))
            
            story.append(Spacer(1, 10))
        
        # Add all sections
        add_section("0. Personal Information", {
            'full_name': form_data.get('fullName', '') if form_data else '',
            'mobile_number': form_data.get('mobileNumber', '') if form_data else '',
            'email_address': form_data.get('emailAddress', '') if form_data else '',
            'current_city': form_data.get('currentCity', '') if form_data else ''
        })
        
        add_section("1. First Contact", {
            'exclusivity_line_used': form_data.get('exclusivityLine', '') if form_data else '',
            'candidate_reaction': form_data.get('candidateReaction', '') if form_data else ''
        })
        
        add_section("2. Qualification Questions", {
            'name_education': form_data.get('nameEducation', '') if form_data else '',
            'program_interest': form_data.get('programInterest', '') if form_data else '',
            'part_time_work': form_data.get('partTimeWork', '') if form_data else '',
            'communication_comfort': form_data.get('commsComfort', '') if form_data else '',
            'career_goal': form_data.get('careerGoal', '') if form_data else ''
        })
        
        add_section("3. Core Motivation & Pain Points", {
            'primary_why': form_data.get('primaryWhy', '') if form_data else '',
            'biggest_worry': form_data.get('biggestWorry', '') if form_data else '',
            'past_disappointments': form_data.get('pastDisappointments', '') if form_data else ''
        })
        
        add_section("4. Decision Style & Influencers", {
            'decision_speed': form_data.get('decisionSpeed', '') if form_data else '',
            'influencers': form_data.get('influencers', []) if form_data else [],
            'scarcity_reaction': form_data.get('scarcityReaction', '') if form_data else ''
        })
        
        add_section("5. Communication & Personality Lens", {
            'preferred_tone': form_data.get('preferredTone', '') if form_data else '',
            'channel': form_data.get('channel', '') if form_data else '',
            'detail_level': form_data.get('detailLevel', '') if form_data else '',
            'personality_model': form_data.get('personalityModel', '') if form_data else '',
            'assigned_traits': form_data.get('assignedTraits', '') if form_data else ''
        })
        
        add_section("6. Objections & Triggers", {
            'stated_objections': form_data.get('statedObjections', '') if form_data else '',
            'unspoken_hesitations': form_data.get('unspokenHesitations', '') if form_data else '',
            'key_trigger': form_data.get('keyTrigger', '') if form_data else ''
        })
        
        add_section("7. Next Steps & Close", {
            'followup_ask': form_data.get('followupAsk', '') if form_data else '',
            'custom_benefit': form_data.get('customBenefit', '') if form_data else ''
        })
        
        add_section("8. Follow-up Schedule & Signature", {
            'next_reminder': form_data.get('nextReminderDateTime', '') if form_data else '',
            'channel_format': form_data.get('channelFormat', '') if form_data else '',
            'executive_signature': form_data.get('executiveSignature', '') if form_data else ''
        })
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("This document is confidential and for internal use only.", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Prepare response
        buffer.seek(0)
        filename = f"AEDP_Profile_{form_data.get('fullName', 'Client').replace(' ', '_')}_{datetime.now().strftime('%Y-%m-%d')}.pdf"
        
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)