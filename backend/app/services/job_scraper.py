import threading
import time
import requests
import logging
from app.extensions import db
from app.models.placement import Placement
from app.services.ingest_parser import parse_placement_email
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

class JobScraper:
    def __init__(self, app):
        self.app = app
        self.running = True
        self.thread = threading.Thread(target=self.run, daemon=True)

    def start(self):
        self.thread.start()

    def stop(self):
        self.running = False

    def run(self):
        """Polls an RSS feed every 60 seconds for demo purposes."""
        with self.app.app_context():
            logger.info("JobScraper started...")
            
            # Seed the database with some initial mocked jobs if empty
            if Placement.query.count() == 0:
                logger.info("Seeding initial placements...")
                self._ingest_raw_text("Google is hiring SDE 1 offering 32 LPA. Required: Go, C++, Kubernetes.")
                self._ingest_raw_text("Palantir seeks Forward Deployed Engineer with 45 LPA. Required: React, Python, AWS.")
                self._ingest_raw_text("OpenAI needs AI Researchers at 60 LPA. Required: PyTorch, CUDA, Python.")
            
            # Simple polling loop
            while self.running:
                time.sleep(60)
                try:
                    import os
                    import imaplib
                    import email
                    from email.header import decode_header
                    
                    imap_server = os.environ.get("IMAP_SERVER")
                    imap_user = os.environ.get("IMAP_USERNAME")
                    imap_pass = os.environ.get("IMAP_PASSWORD")
                    
                    if not imap_server or not imap_user or not imap_pass:
                        # Fallback to mock generation if IMAP not configured
                        import random
                        companies = ["Stripe", "Anthropic", "SpaceX", "Databricks"]
                        roles = ["Backend Engineer", "Data Scientist", "Frontend Architect", "SRE"]
                        ctc = random.randint(20, 80)
                        raw_text = f"{random.choice(companies)} is urgently hiring a {random.choice(roles)} offering {ctc} LPA. Required skills: Python, React, AWS, Docker."
                        self._ingest_raw_text(raw_text)
                        logger.info("JobScraper: IMAP not configured, ingested mock job instead.")
                    else:
                        # Connect to IMAP
                        mail = imaplib.IMAP4_SSL(imap_server)
                        mail.login(imap_user, imap_pass)
                        mail.select("inbox")
                        
                        status, messages = mail.search(None, "UNSEEN")
                        if status == "OK":
                            for num in messages[0].split():
                                status, data = mail.fetch(num, "(RFC822)")
                                if status == "OK":
                                    for response_part in data:
                                        if isinstance(response_part, tuple):
                                            msg = email.message_from_bytes(response_part[1])
                                            
                                            body = ""
                                            if msg.is_multipart():
                                                for part in msg.walk():
                                                    if part.get_content_type() == "text/plain":
                                                        body = part.get_payload(decode=True).decode(errors='ignore')
                                                        break
                                            else:
                                                if msg.get_content_type() == "text/plain":
                                                    body = msg.get_payload(decode=True).decode(errors='ignore')
                                            
                                            if body.strip():
                                                logger.info("JobScraper: Processing new unread email from IMAP.")
                                                self._ingest_raw_text(body.strip())
                                                
                        mail.logout()
                        
                except Exception as e:
                    logger.error(f"JobScraper error: {str(e)}")

    def _ingest_raw_text(self, raw_text: str):
        try:
            extracted = parse_placement_email(raw_text)
            placement = Placement(
                university_id=1,
                company_name=extracted["company_name"],
                role=extracted["role"],
                ctc=extracted["ctc"],
                source_raw=raw_text
            )
            placement.tech_stack = extracted["tech_stack"]
            db.session.add(placement)
            db.session.commit()
        except Exception as e:
            logger.error(f"Failed to parse and ingest job: {str(e)}")
