# HereAI

A dark emerald attendance prototype. Open `index.html` in your browser, or serve this folder with VS Code Live Server. It uses plain HTML, CSS and JavaScript without a build step. Deploy this folder as a static Vercel project with output directory `.` and no build command.

## Included

- Three fictional people to explore the interface; add your own names, unique student IDs, classes and optional details.
- Downloadable QR passes on enrollment and in People & classes. Camera QR scanning uses ZXing Browser; QR generation uses QRCode.js. Both libraries load from pinned CDN URLs, so internet access is required. Camera frames are processed in the browser and are not uploaded.
- ID check-in with timestamps and one entry per person per local calendar day.
- “Not you?” correction: replace only an attendance entry created in the current confirmation flow, preserve earlier entries, and retain an audit record in local storage.
- Class/date filters and CSV export compatible with Google Sheets imports. Select a class before exporting to import each class into a separate tab.
- Explicitly simulated recognition screen. It selects a demo identity; it does not access a camera, save face templates, identify people or train a recognition model. Simulations do not create attendance records unless the user enters an ID through the correction form.

Data is stored in this browser's local storage. This is a preview, with no authentication or shared server database. Supabase, Google Sheets sync, GitHub publishing and Vercel deployment have not been connected. Do not use the local prototype as a production attendance system. Google Fonts are optional; the interface falls back to system fonts offline.

## Supabase implementation plan

Use Supabase Auth for administrators, then create `classes`, `people`, `attendance` and `attendance_corrections` tables. Enforce a unique constraint on `(person_id, attendance_date)` and restrict access with row-level security. Check-in and correction should run through an authenticated server endpoint; apply corrections and audit entries in one database transaction. Keep service-role keys and Google credentials on the server. A server endpoint can queue attendance updates to the Google Sheets API, with one tab per class and idempotent retries.

## Python and machine learning phase

A suitable ML feature is aggregate attendance forecasting per class, using daily totals rather than biometric identity data. Python libraries: pandas for data preparation, scikit-learn for training and evaluation, and FastAPI for serving predictions. Train on historical daily counts, include weekday and term-calendar features, and compare against a simple previous-week baseline using a chronological validation split and mean absolute error. Show predictions only after they outperform that baseline. There is no trained model included in this prototype.

The frontend can stay on Vercel while the Python API runs on a host appropriate for the selected model and workload. Decide hosting after implementing and measuring the Python module.

## Deploy this update

Upload `index.html`, `style.css`, `app.js`, `camera.js` and `README.md` to the GitHub repository root. Vercel redeploys after the commit. Open Check-in station, choose Start camera, and allow permission. Camera access requires HTTPS (such as Vercel) or localhost. Show a downloaded student QR on another device or print it. Enrollment must exist in the scanning browser while storage is local. This QR pass is a static ID credential, not identity verification.
