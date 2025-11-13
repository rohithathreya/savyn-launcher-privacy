# Savyn Labs Website

Official website for Savyn Labs and Savyn Launcher.

**Live at:** https://savynlabs.com

---

## 📁 Structure

```
website/
├── index.html          # Homepage - landing page
├── privacy-policy.html # Privacy policy
├── styles.css          # All styling
├── CNAME              # Custom domain configuration
└── README.md          # This file
```

---

## 🚀 Deployment Instructions

### GitHub Pages Setup

1. **Create GitHub Repository**
   ```bash
   # Create new repo: "savynlabs-website"
   # Public repository
   ```

2. **Push Website Files**
   ```bash
   cd website
   git init
   git add .
   git commit -m "Initial website launch"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/savynlabs-website.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repo Settings
   - Scroll to "Pages" section
   - Source: Deploy from main branch
   - Folder: / (root)
   - Custom domain: savynlabs.com
   - Save

4. **Configure DNS (at your domain registrar)**
   
   **A Records (for savynlabs.com):**
   ```
   Type: A
   Host: @
   Value: 185.199.108.153

   Type: A
   Host: @
   Value: 185.199.109.153

   Type: A
   Host: @
   Value: 185.199.110.153

   Type: A
   Host: @
   Value: 185.199.111.153
   ```

   **CNAME Record (for www.savynlabs.com):**
   ```
   Type: CNAME
   Host: www
   Value: YOUR_USERNAME.github.io
   ```

5. **Wait for DNS Propagation** (5-60 minutes)
   - Check status: https://dnschecker.org/
   - GitHub will auto-issue SSL certificate
   - Site will be live at https://savynlabs.com

---

## ✏️ Updating Content

### Update Homepage
Edit `index.html` - Main sections:
- Hero text and CTA buttons
- Features grid
- Privacy messaging
- Contact information

### Update Privacy Policy
Edit `privacy-policy.html` - Keep in sync with app

### Update Styles
Edit `styles.css` - CSS variables at top for easy color changes

### Deploy Updates
```bash
git add .
git commit -m "Update: [description]"
git push
```

Changes go live in ~1 minute!

---

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-green: #078428;     /* Main brand color */
    --gradient-start: #078428;    /* Gradient start */
    --gradient-end: #0ca832;      /* Gradient end */
}
```

### Content Sections
Each section in `index.html` has clear comments:
- `<!-- Hero Section -->`
- `<!-- Features Section -->`
- `<!-- Privacy Section -->`
- etc.

### When Beta Goes Live
Update these in `index.html`:
1. Replace `#coming-soon` with actual Play Store link
2. Change button text from "Coming Soon" to "Download Now"
3. Update `<a href="#coming-soon"...` (appears twice)

Example:
```html
<!-- OLD: -->
<a href="#coming-soon" class="btn btn-primary">Coming Soon to Google Play</a>

<!-- NEW: -->
<a href="https://play.google.com/store/apps/details?id=com.savyn.launcher" class="btn btn-primary">Download on Google Play</a>
```

---

## 📱 Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Modern, clean design matching app theme
- ✅ Fast loading (no external dependencies)
- ✅ SEO optimized (meta tags, semantic HTML)
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Privacy-focused messaging
- ✅ Professional appearance

---

## 🔧 Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling, CSS Grid, Flexbox
- **Vanilla JavaScript** - Smooth scrolling (minimal)
- **GitHub Pages** - Free hosting + SSL
- **Custom Domain** - savynlabs.com

No frameworks, no build process, no dependencies!

---

## 📊 SEO

Included meta tags:
- Description
- Keywords
- Open Graph (social media previews)
- Viewport (mobile optimization)

To improve SEO after launch:
1. Submit sitemap to Google Search Console
2. Add more content (blog posts)
3. Get backlinks from app directories
4. Regular updates

---

## 🐛 Troubleshooting

**Site not loading after DNS change?**
- Wait longer (DNS can take up to 24 hours, usually 5-60 min)
- Check DNS propagation: https://dnschecker.org/
- Verify DNS records match exactly
- Clear browser cache (Ctrl+Shift+R)

**HTTPS not working?**
- GitHub auto-issues SSL certificate
- Takes 5-30 minutes after DNS propagation
- Check "Enforce HTTPS" is enabled in GitHub Pages settings

**Custom domain not working in GitHub Pages?**
- Verify CNAME file has correct domain
- Check GitHub Pages settings shows your domain
- Ensure DNS records are correct
- Try removing and re-adding custom domain in settings

---

## 📞 Support

Questions or issues?
**Email:** support@savynlabs.com

---

## 📝 License

© 2025 Savyn Labs. All rights reserved.

---

**Last Updated:** November 12, 2025

