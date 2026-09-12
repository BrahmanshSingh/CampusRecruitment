import os
from app import create_app
from app.services.job_scraper import JobScraper

app = create_app()

scraper = JobScraper(app)
scraper.start()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Auror Command Center on port {port}...")
    print(f"[*] Swagger UI available at http://localhost:{port}/apidocs/")
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)

