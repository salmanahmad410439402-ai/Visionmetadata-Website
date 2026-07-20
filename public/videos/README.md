# Tutorial Videos Setup

This folder should contain the 4 tutorial videos for the VisionMetadata Pro tutorials page.

## Files to Add

Place the following video files in this directory:

1. **demo1.mp4** - Installation & Setup tutorial (3:45 duration)
2. **demo2.mp4** - Connect Your AI Keys tutorial (4:20 duration)
3. **demo3.mp4** - Upload & Generate Metadata tutorial (6:15 duration)
4. **demo4.mp4** - Bulk Processing & Export tutorial (5:40 duration)

## Video Requirements

- **Format:** MP4 (H.264 video codec)
- **Resolution:** 1280x720 (720p) minimum, 1920x1080 (1080p) recommended
- **Aspect Ratio:** 16:9
- **File Size:** Keep under 50MB each for fast loading
- **Bitrate:** 2-5 Mbps for good quality

## How Videos Display

✅ Videos will automatically appear on the tutorials page
✅ Duration badges and play buttons are pre-configured
✅ When user clicks "Watch Video", a full-screen player modal opens
✅ No code changes needed - just add the video files

## Deployment

When you deploy to Vercel:
1. Push this folder with the videos to GitHub
2. Vercel automatically serves videos from /public/videos/
3. All 4 videos will be accessible immediately after deploy

## Local Testing

To test locally:
1. Place demo1.mp4, demo2.mp4, demo3.mp4, demo4.mp4 in this folder
2. Run `npm run dev`
3. Visit tutorials page and click any video to test playback

## Troubleshooting

**Videos not playing:**
- Ensure files are named exactly: demo1.mp4, demo2.mp4, demo3.mp4, demo4.mp4
- Check browser console for 404 errors
- Verify videos are in `.mp4` format (not .avi, .mov, etc.)

**Slow video loading:**
- Reduce video file size (aim for 10-20MB per video)
- Use video compression tools before uploading
- Host on CDN if serving to many users

## Notes

- This folder is version controlled (videos included in git)
- For very large videos, consider hosting on external CDN and updating URLs in TutorialsSection.tsx
- Browser automatically caches videos for better performance on repeat views
