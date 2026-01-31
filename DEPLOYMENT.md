# Deployment Guide for Transport App

## Vercel Deployment (Frontend Only)

Vercel is serverless, so the file system is **read-only and ephemeral**. Changes won't persist across deployments. For saving records to Excel, you need a **separate backend server**.

### Option 1: Vercel Frontend + Separate Backend Server

**Deploy Angular to Vercel:**
```bash
npm run build
vercel deploy --prod
```

**Deploy Node.js server to a VPS (DigitalOcean, AWS, etc.):**
```bash
# On your VPS
npm install
npm run build
pm2 start server.js --name transport-api
pm2 save
pm2 startup
```

**Update the API URL in Angular:**
1. Deploy the Node.js server and get its URL (e.g., `https://api.yourdomain.com`)
2. Update the API URL in `src/app/transport/transport.component.ts`:
   ```typescript
   private readonly API_URL = 'https://api.yourdomain.com';
   ```
3. Rebuild and redeploy to Vercel

### Option 2: Deploy Everything to a VPS (Recommended for Excel file persistence)

**On your VPS (Ubuntu/DigitalOcean/Railway/Render):**

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup-18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Upload your project
git clone your-repo
cd your-project

# 3. Install dependencies
npm install

# 4. Build Angular
npm run build

# 5. Install PM2
npm install -g pm2

# 6. Start the server
pm2 start server.js --name transport-app
pm2 save
pm2 startup

# 7. Set up Nginx (optional, for domain)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
# Add nginx config to forward port 80 to 3000
sudo nginx -t && sudo systemctl restart nginx
```

**Access your app at:** `http://your-server-ip` or `http://your-domain.com`

## PM2 Commands (for VPS deployment)

| Command | Description |
|---------|-------------|
| `pm2 start server.js --name transport-app` | Start the app |
| `pm2 status` | Check if running |
| `pm2 logs transport-app` | View logs |
| `pm2 restart transport-app` | Restart after updates |
| `pm2 stop transport-app` | Stop the app |
| `pm2 save` | Save process list |
| `pm2 startup` | Setup auto-start on boot |

## Updating the Live Site (VPS)

```bash
git pull
npm install
npm run build
pm2 restart transport-app
```

The Excel file at `src/assets/Data/DataTransportsFile-updated.xlsx` is preserved across updates.

## File Locations

| Path | Description |
|------|-------------|
| `src/assets/Data/DataTransportsFile-updated.xlsx` | Excel file with transport data |
| `dist/browser` | Compiled Angular app |
| `server.js` | Express server |

## Troubleshooting

### Server won't start
```bash
pm2 logs transport-app --lines 50
```

### Port in use
```bash
lsof -i :3000
kill <PID>
```

### Excel not saving
- Check that `src/assets/Data/` directory exists and is writable
- Check PM2 logs for permission errors
