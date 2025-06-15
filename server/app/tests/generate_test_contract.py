from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

def generate_employment_contract():
    # Create test_data directory if it doesn't exist
    test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
    os.makedirs(test_data_dir, exist_ok=True)
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        os.path.join(test_data_dir, "sample_employment_contract.pdf"),
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    # Content
    story = []
    
    # Title
    story.append(Paragraph("EMPLOYMENT AGREEMENT", title_style))
    story.append(Spacer(1, 12))
    
    # Agreement details
    story.append(Paragraph("This Employment Agreement (the 'Agreement') is made and entered into on January 1, 2024, by and between:", styles["Normal"]))
    story.append(Spacer(1, 12))
    
    # Company and Employee details
    company_details = [
        ["Company:", "TechCorp Solutions Inc."],
        ["Address:", "123 Business Avenue, Suite 100, San Francisco, CA 94105"],
        ["Employee:", "John Doe"],
        ["Position:", "Senior Software Engineer"],
        ["Start Date:", "January 15, 2024"]
    ]
    
    t = Table(company_details, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    
    # Terms and Conditions
    story.append(Paragraph("1. TERMS OF EMPLOYMENT", styles["Heading2"]))
    story.append(Paragraph("""
    The Employee's employment with the Company shall commence on the Start Date and shall continue until terminated 
    in accordance with the terms of this Agreement. This is an at-will employment relationship.
    """, styles["Normal"]))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("2. COMPENSATION", styles["Heading2"]))
    story.append(Paragraph("""
    The Employee shall receive an annual base salary of $120,000, payable in accordance with the Company's 
    standard payroll practices. The Employee shall also be eligible for an annual performance bonus of up to 20% 
    of the base salary, subject to the Company's performance and the Employee's individual performance.
    """, styles["Normal"]))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("3. BENEFITS", styles["Heading2"]))
    story.append(Paragraph("""
    The Employee shall be eligible to participate in the Company's standard benefits programs, including health 
    insurance, dental insurance, vision insurance, 401(k) plan, and paid time off, subject to the terms and 
    conditions of such programs.
    """, styles["Normal"]))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("4. CONFIDENTIALITY", styles["Heading2"]))
    story.append(Paragraph("""
    The Employee agrees to maintain the confidentiality of all proprietary and confidential information of the 
    Company, both during and after the term of employment.
    """, styles["Normal"]))
    story.append(Spacer(1, 12))
    
    # Signatures
    story.append(Paragraph("IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.", styles["Normal"]))
    story.append(Spacer(1, 30))
    
    signature_lines = [
        ["Company:", "_______________________"],
        ["", "Authorized Signatory"],
        ["", "TechCorp Solutions Inc."],
        ["", ""],
        ["Employee:", "_______________________"],
        ["", "John Doe"]
    ]
    
    t = Table(signature_lines, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(t)
    
    # Build the PDF
    doc.build(story)

if __name__ == "__main__":
    generate_employment_contract() 