# Deployment Guide - VisionMetadata Pro

This project is configured to deploy on **Vercel** with serverless API functions. Follow these steps to deploy successfully.

## Prerequisites

1. GitHub account with your code pushed
2. Vercel account (free tier available at vercel.com)
3. Node.js installed locally

## Deployment Steps

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Setup videos folder and prepare for Vercel deployment"
git push origin main
```

**Before pushing:** Make sure you have added the 4 tutorial videos to `public/videos/`:
- `demo1.mp4` - Installation & Setup (3:45)
- `demo2.mp4` - Connect Your AI Keys (4:20)
- `demo3.mp4` - Upload & Generate Metadata (6:15)
- `demo4.mp4` - Bulk Processing & Export (5:40)

See `public/videos/README.md` for video specifications.

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
npm install -g vercel
vercel
```

This will:
- Authenticate with GitHub
- Detect your project settings
- Build and deploy automatically

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects settings from `vercel.json`
5. Click "Deploy"

### 4. Verify Deployment

After deployment completes:

✅ Visit your Vercel domain to see the live site
✅ Test the contact form by sending a test message
✅ Check Vercel logs for contact submissions

## Environment Variables (Optional)

If you want to integrate email services later, add these in Vercel project settings:

- `SENDGRID_API_KEY` - For SendGrid email service
- `MAILGUN_API_KEY` - For Mailgun email service
- Custom variables as needed

## Video Setup

The tutorials page displays 4 embedded tutorial videos. Videos are stored locally in `public/videos/`.

### Adding Tutorial Videos

1. **Prepare your videos:**
   - Duration: 3:45, 4:20, 6:15, 5:40 (shown in tutorial cards)
   - Format: MP4 (H.264 codec)
   - Resolution: 1280x720 (720p) minimum
   - File size: 10-20MB each (under 50MB)

2. **Place videos in `public/videos/`:**
   ```
   public/videos/
   ├── demo1.mp4    (Installation & Setup)
   ├── demo2.mp4    (Connect Your AI Keys)
   ├── demo3.mp4    (Upload & Generate)
   └── demo4.mp4    (Bulk Processing)
   ```

3. **Commit and push to GitHub:**
   ```bash
   git add public/videos/*.mp4
   git commit -m "Add tutorial videos"
   git push origin main
   ```

4. **Videos auto-deploy with Vercel**
   - No code changes needed
   - Vercel serves videos from CDN automatically
   - Videos appear on tutorials page after deployment

### Video Player Features

- **Full-screen modal:** Click any video to open full-screen player
- **HTML5 controls:** Play, pause, progress bar, volume, full-screen
- **Duration badges:** Auto-display on each tutorial card
- **Responsive:** Works on desktop, tablet, mobile
- **No external dependencies:** Uses native HTML5 video element

## File Structure

```
project-root/
├── api/
│   └── contact.ts          ← Vercel serverless function
├── public/
│   ├── videos/
│   │   ├── demo1.mp4       ← Tutorial 1: Installation
│   │   ├── demo2.mp4       ← Tutorial 2: AI Keys
│   │   ├── demo3.mp4       ← Tutorial 3: Upload & Generate
│   │   ├── demo4.mp4       ← Tutorial 4: Bulk Processing
│   │   └── README.md       ← Video setup instructions
│   └── ...
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   └── ...
├── vercel.json             ← Vercel configuration
├── vite.config.ts          ← Frontend build config
├── package.json
└── DEPLOYMENT.md
```

## How It Works

### Frontend (React + Vite)
- Builds to static files in `/dist`
- Served on Vercel's edge network
- No proxy needed in production

### Backend (Serverless Functions)
- `/api/contact.ts` → `https://yourdomain.vercel.app/api/contact`
- Auto-deployed when you push to GitHub
- Uses Node.js runtime

### Contact Form Flow
1. User fills form and clicks "Send Message"
2. React sends `POST /api/contact` request
3. Vercel serverless function processes it
4. Logs appear in Vercel dashboard
5. User sees success message

### Video Playback Flow
1. User visits `/tutorials` page
2. Page displays 4 tutorial cards with play buttons
3. User clicks "Watch Video"
4. Modal opens with full-screen HTML5 video player
5. Video streams from `/public/videos/demo[1-4].mp4`
6. Duration badge shows (3:45, 4:20, 6:15, 5:40)
7. Video controls: play, pause, full-screen, progress bar

## Local Development

To test locally before deployment:

```bash
# Terminal 1: Run backend server
cd server
npm install
npm run dev

# Terminal 2: Run frontend
npm run dev
```

Visit `http://localhost:8080` and test the tutorials page video playback.

### Testing Videos Locally

1. Add your 4 videos to `public/videos/`:
   - `demo1.mp4`
   - `demo2.mp4`
   - `demo3.mp4`
   - `demo4.mp4`

2. Run `npm run dev` and visit `/tutorials`

3. Click any "Watch Video" button to test the modal player

## Troubleshooting

### Contact Form Not Working
- Check Vercel logs: `vercel logs`
- Ensure `/api/contact.ts` is deployed
- Verify CORS is enabled in the function

### Build Fails
- Check `vercel.json` configuration
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Videos Not Playing
- Ensure all 4 videos are in `public/videos/` folder
- File names must be exact: `demo1.mp4`, `demo2.mp4`, `demo3.mp4`, `demo4.mp4`
- Check browser console for 404 errors
- Verify videos are `.mp4` format (H.264 codec)
- File size should be under 50MB each for fast loading

### Environment Issues
- Clear Vercel cache: Project Settings → Advanced → Clear Cache
- Redeploy: `vercel --prod`

## Next Steps

### Email Integration (Recommended)
To actually send emails when users submit the contact form:

1. **Option 1: SendGrid**
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Add API key to Vercel environment variables
   - Update `/api/contact.ts` to call SendGrid API

2. **Option 2: Mailgun**
   - Sign up at [mailgun.com](https://mailgun.com)
   - Similar setup as SendGrid

3. **Option 3: Resend** (Email for developers)
   - Sign up at [resend.com](https://resend.com)
   - Easy React integration

### Analytics
Track deployments and traffic:
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- View deployment logs

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Project Logs: `vercel logs --prod`
- GitHub Issues: Check your repository
