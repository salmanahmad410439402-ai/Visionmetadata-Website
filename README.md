\# Welcome to your Lovable project



\## Project info



\*\*URL\*\*: https://lovable.dev/projects/REPLACE\_WITH\_PROJECT\_ID



\## How can I edit this code?



There are several ways of editing your application.



\*\*Use Lovable\*\*



Simply visit the \[Lovable Project](https://lovable.dev/projects/REPLACE\_WITH\_PROJECT\_ID) and start prompting.



Changes made via Lovable will be committed automatically to this repo.



\*\*Use your preferred IDE\*\*



If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.



The only requirement is having Node.js \& npm installed - \[install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)



Follow these steps:



```sh

\# Step 1: Clone the repository using the project's Git URL.

git clone <YOUR\_GIT\_URL>



\# Step 2: Navigate to the project directory.

cd <YOUR\_PROJECT\_NAME>



\# Step 3: Install the necessary dependencies.

npm i



\# Step 4: Start the development server with auto-reloading and an instant preview.

npm run dev

```



\*\*Edit a file directly in GitHub\*\*



\- Navigate to the desired file(s).

\- Click the "Edit" button (pencil icon) at the top right of the file view.

\- Make your changes and commit the changes.



\*\*Use GitHub Codespaces\*\*



\- Navigate to the main page of your repository.

\- Click on the "Code" button (green button) near the top right.

\- Select the "Codespaces" tab.

\- Click on "New codespace" to launch a new Codespace environment.

\- Edit files directly within the Codespace and commit and push your changes once you're done.



\## What technologies are used for this project?



This project is built with:



\- Vite

\- TypeScript

\- React

\- shadcn-ui

\- Tailwind CSS



\## How can I deploy this project?



Simply open \[Lovable](https://lovable.dev/projects/REPLACE\_WITH\_PROJECT\_ID) and click on Share -> Publish.



\## Can I connect a custom domain to my Lovable project?



Yes, you can!



To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.



Read more here: \[Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

**Fullstack deployment (production)**

This project now includes a minimal Express backend in `/server` which provides the following endpoints used by the frontend:

- `GET /api/download/latest` — streams the latest installer (server acts as a proxy and logs download events to `/server/logs/downloads.log`).
- `POST /api/contact` — accepts contact form submissions (logged to `/server/logs/contacts.log`).

Quick production steps (Linux example):

1. Build frontend (project root):

```bash
npm install
npm run build
```

2. Build and start server (from `/server`):

```bash
cd server
npm install --production
npm run build
NODE_ENV=production PORT=4000 node build/index.js
```

3. (Recommended) Use a process manager (pm2) and a reverse proxy (Nginx) to serve on port 80/443:

```bash
# Install pm2 globally
npm i -g pm2
pm2 start build/index.js --name visionmeta --env production

# Example Nginx server block (proxy to backend)
# server {
#   listen 80;
#   server_name yourdomain.com;
#   location / {
#     proxy_pass http://127.0.0.1:4000;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#   }
# }
```

Environment variables and notes:
- `DOWNLOAD_URL` — optional. Set this to a direct installer URL if you want to override the default GitHub release asset.
- Logs are written to `/server/logs` by default; rotate and secure these in production.
- The server serves the frontend `dist/` when `NODE_ENV=production` and `dist/` exists next to the server build output.

Windows notes:
- On Windows you can run the server with `node build/index.js`. Use a Windows service manager (NSSM) or `pm2-windows` for production services.

Security & production checklist:
- Use HTTPS (configure TLS at the reverse proxy).
- Do not commit `/server/logs` to source control. Add it to `.gitignore` if needed.
- Consider moving contact handling to a transactional email/CRM provider in production (SendGrid, Mailgun, etc.) instead of plain logs.
- Monitor server disk usage and rotating logs to avoid uncontrolled growth.

If you want, I can add a systemd unit file, an example Nginx config file, or a simple GitHub Actions workflow to build and deploy automatically.

