I have created the Git documentation file in your workspace directory. You can find it at:


GIT_DOCUMENTATION.md

What it covers:
Branching Strategy: Standard branching flow (Core branches, feature, bugfix, and hotfix naming structures) with a Mermaid flow visualization.
Commit Message Standards: Conventional Commit conventions and types (feat, fix, docs, perf, chore, etc.).
Workflow Guidelines: Step-by-step tasks from branch creation to pull requests.
Conflict Resolution Guide: Handling code overlaps and resolving merge conflicts in files.
Git Reference Cheat Sheet: Safe revert guides, branch switching, logs inspection, and repository configurations.
CI/CD Integration: Sample GitHub Actions workflow template for auto-deployments to Firebase Hosting on merge.
GIT_DOCUMENTATION.md
+226
-0
11:38 AM
say about this project simply but include everything
Here is a simple summary of the NISERS project that explains how it works, what it does, and how it is built.

What is NISERS?
NISERS (National Integrated Safety & Emergency Response System) is a web-based, real-time platform designed to coordinate emergency services (medical and fire response) in the Kathmandu Valley, linking citizens, emergency responders, hospitals, and control centers.

Who Uses It? (The 5 Roles)
Citizens: Can request ambulances, report fire emergencies with specific building floor details, submit community hazard alerts (floods, road blocks), request blood donors, and chat with an AI legal assistant.
Control Center (Command Center): A central operator dashboard that approves emergency agency registrations, moderates community safety warnings, and monitors active dispatch operations on a master map.
Ambulances: Receive medical emergency assignments, track patient locations, navigate to scenes using built-in maps, and update their mission progress.
Fire Stations: Track fire alerts, view building fire details, dispatch fire vehicles, and manage fire-control status updates.
Hospitals: Monitor incoming patient ETAs, manage blood demands, and request and dispatch UAV Drones for medical supplies (blood, medicine) using direct flight paths.
Core Systems & Features
Offline-First with Real-Time Sync: Works instantly using local mock data (offline mode). When connected to Firebase, it synchronizes state in real-time across all portals.
Dual-Engine Map & Routing: Renders Leaflet maps with custom vehicle markers and routes. It queries the OSRM API for road routes, falling back to a custom local A grid pathfinder* with Douglas-Peucker path simplification if offline.
OSM Overpass POI Fetcher: Queries OpenStreetMap data to locate hospitals, pharmacies, and police stations within a 5km radius of the user’s real GPS location.
AI Law Assistant ("Nepal Kanoon Sahayak"): A floating chatbot powered by Sarvam AI that provides advice on Nepalese laws in Devanagari script and English. It has an offline regex-based keyword database in case the API is unavailable.
Media Attachment Engine: Enables upload of photos and videos to document hazards and fires using Firebase Storage.
