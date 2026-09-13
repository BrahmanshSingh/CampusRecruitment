import os
from app import create_app
from app.extensions import db
from app.models.university import University
from app.models.placement import Placement
from app.models.user import User

app = create_app()

with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()

    print("Seeding universities...")
    thapar = University(name="Thapar Institute of Engineering & Technology", domain="thapar.edu")
    vit = University(name="Vellore Institute of Technology (VIT)", domain="vit.ac.in")
    db.session.add(thapar)
    db.session.add(vit)
    db.session.commit()

    print("Seeding in-campus placements (Thapar)...")
    p1 = Placement(
        university_id=thapar.id,
        is_off_campus=False,
        company_name="JP Morgan Chase & Co.",
        role="Software Engineer Analyst",
        ctc=22.0,
        source_raw="Campus Email: JP Morgan hiring...",
        tech_stack=["C++", "Python", "Distributed Systems"]
    )
    p2 = Placement(
        university_id=thapar.id,
        is_off_campus=False,
        company_name="Google India",
        role="SDE-1",
        ctc=32.0,
        source_raw="Campus Email: Google SDE-1...",
        tech_stack=["Go", "Kubernetes", "Data Structures"]
    )
    db.session.add(p1)
    db.session.add(p2)
    
    print("Seeding off-campus (Global) placements...")
    p3 = Placement(
        university_id=None,
        is_off_campus=True,
        company_name="DE Shaw",
        role="Quantitative Analyst",
        ctc=45.0,
        apply_url="https://www.deshawindia.com/careers",
        source_raw="Off-Campus LinkedIn Post",
        tech_stack=["Python", "Pandas", "Mathematics"]
    )
    p4 = Placement(
        university_id=None,
        is_off_campus=True,
        company_name="Microsoft",
        role="Cloud Solution Architect",
        ctc=35.0,
        apply_url="https://careers.microsoft.com/v2/global/en/home.html",
        source_raw="Off-Campus Careers Page",
        tech_stack=["Azure", "C#", "System Design"]
    )
    db.session.add(p3)
    db.session.add(p4)

    db.session.commit()
    print("Database seeding completed successfully.")
