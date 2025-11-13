# 🚀 Deploy to GitHub Pages

**Target Repo:** https://github.com/rohithathreya/savyn-launcher-privacy  
**Live URL (after setup):** https://savynlabs.com

---

## 📋 Step-by-Step Deployment

### Step 1: Push Website Files (5 minutes)

Run these commands in PowerShell:

```powershell
# Navigate to website folder
cd C:\Users\Rohith\AndroidStudioProjects\FlowstateLauncher2-Clean\website

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add Savyn Labs website - homepage, styles, privacy policy"

# Add your existing repo as remote
git remote add origin https://github.com/rohithathreya/savyn-launcher-privacy.git

# Push to main branch (will merge with existing privacy-policy.html)
git branch -M main
git push -u origin main --force
```

**Note:** The `--force` is needed because your repo already has privacy-policy.html. This will keep everything but replace with your new structure.

---

### Step 2: Enable GitHub Pages (2 minutes)

1. Go to: https://github.com/rohithathreya/savyn-launcher-privacy/settings/pages

2. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** / (root)

3. Under "Custom domain":
   - Enter: `savynlabs.com`
   - Click **Save**

4. Wait for the "DNS check successful" message

---

### Step 3: Configure DNS at Your Domain Registrar (5-10 minutes)

**Where you bought savynlabs.com** (Namecheap, Google Domains, etc.)

Find DNS settings and add these records:

#### A Records (for savynlabs.com):
```
Type: A
Host: @
Value: 185.199.108.153
TTL: Automatic (or 3600)

Type: A
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A
Host: @
Value: 185.199.111.153
TTL: Automatic
```

#### CNAME Record (for www.savynlabs.com):
```
Type: CNAME
Host: www
Value: rohithathreya.github.io
TTL: Automatic
```

**Save all DNS records**

---

### Step 4: Wait for DNS Propagation (5-60 minutes)

- DNS changes take time to propagate globally
- Usually 5-30 minutes, can be up to 24 hours
- Check status: https://dnschecker.org/#A/savynlabs.com

---

### Step 5: Enable HTTPS (Automatic)

Once DNS propagates:
1. Go back to: https://github.com/rohithathreya/savyn-launcher-privacy/settings/pages
2. Check the box: **Enforce HTTPS**
3. GitHub will auto-issue SSL certificate (takes 5-10 minutes)

---

## ✅ Verification

Visit these URLs (after DNS propagation):
- https://savynlabs.com - Should show your homepage
- https://savynlabs.com/privacy-policy.html - Should show privacy policy
- https://www.savynlabs.com - Should redirect to https://savynlabs.com

---

## 🐛 Troubleshooting

**"DNS check unsuccessful" in GitHub Pages?**
- Wait longer (DNS takes time)
- Verify all 5 DNS records are correct
- Make sure Host is exactly `@` for A records and `www` for CNAME
- Clear browser cache

**Site still not loading?**
- Check https://dnschecker.org/#A/savynlabs.com
- Should show all 4 GitHub IP addresses
- If not, DNS hasn't propagated yet

**"There isn't a GitHub Pages site here"?**
- Verify GitHub Pages is enabled
- Check branch is set to `main` and folder to `/`
- Wait a few more minutes

---

## 🎉 Success!

When working, you'll see:
- Beautiful Savyn Labs homepage at savynlabs.com
- Privacy policy at savynlabs.com/privacy-policy.html
- Green padlock (HTTPS) in browser
- Fast loading via GitHub's CDN

---

**Ready to deploy? Copy the commands from Step 1 and run them!**

