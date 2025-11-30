# 🚀 Savyn Beta API Setup

This Cloudflare Worker handles beta signups by adding users to a Google Group, which gives them access to the Play Store closed testing track.

---

## 📋 Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Google Workspace** with Admin access
3. **Google Cloud Project** with Admin SDK API enabled
4. **Play Console** with closed testing track configured

---

## 🔧 Step 1: Google Cloud Setup

### 1.1 Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Navigate to **IAM & Admin → Service Accounts**
4. Click **Create Service Account**:
   - Name: `savyn-beta-signup`
   - Description: `Adds users to beta tester Google Group`
5. Click **Create and Continue**
6. Skip the roles step (we'll use domain-wide delegation)
7. Click **Done**

### 1.2 Create Private Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key → Create new key**
4. Choose **JSON** format
5. Download and save securely (you'll need the `private_key` and `client_email` fields)

### 1.3 Enable Admin SDK API

1. Go to **APIs & Services → Library**
2. Search for **Admin SDK API**
3. Click **Enable**

### 1.4 Enable Domain-Wide Delegation

1. Go back to your service account
2. Click on the service account name
3. Scroll down and click **Show Advanced Settings**
4. Check **Enable Google Workspace Domain-wide Delegation**
5. Click **Save**
6. Copy the **Client ID** (you'll need this)

---

## 🔐 Step 2: Google Workspace Admin Setup

### 2.1 Authorize the Service Account

1. Sign in to [Google Admin Console](https://admin.google.com) as a super admin
2. Go to **Security → Access and data control → API controls**
3. Click **Manage Domain Wide Delegation**
4. Click **Add new**
5. Enter:
   - **Client ID**: (the one you copied from Step 1.4)
   - **OAuth Scopes**: `https://www.googleapis.com/auth/admin.directory.group.member`
6. Click **Authorize**

### 2.2 Create Beta Testers Google Group

1. In Google Admin, go to **Directory → Groups**
2. Click **Create group**:
   - Name: `Beta Testers`
   - Email: `beta-testers@savynlabs.com`
   - Access: Who can view members → Only group members and managers
3. Click **Create group**

---

## 📱 Step 3: Play Console Setup

### 3.1 Configure Closed Testing Track

1. Go to [Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Release → Testing → Closed testing**
4. Create or edit a closed testing track
5. Under **Testers**, select **Use Google Groups**
6. Add: `beta-testers@savynlabs.com`
7. Save changes

### 3.2 Get Opt-In URL

1. In the closed testing track, find the **How testers join your test** section
2. Copy the opt-in URL (looks like: `https://play.google.com/apps/testing/com.savyn.launcher`)

---

## ☁️ Step 4: Deploy Cloudflare Worker

### 4.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 4.2 Login to Cloudflare

```bash
wrangler login
```

### 4.3 Install Dependencies

```bash
cd website/api
npm install
```

### 4.4 Set Environment Secrets

From your service account JSON file, extract the values and set as secrets:

```bash
# Service account email (client_email from JSON)
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
# Paste: savyn-beta-signup@your-project.iam.gserviceaccount.com

# Private key (private_key from JSON - include the full -----BEGIN/END----- block)
wrangler secret put GOOGLE_PRIVATE_KEY
# Paste the entire private key including newlines

# Admin email to impersonate (must be a Workspace super admin)
wrangler secret put GOOGLE_ADMIN_EMAIL
# Paste: admin@savynlabs.com

# Beta testers group email
wrangler secret put BETA_GROUP_EMAIL
# Paste: beta-testers@savynlabs.com

# Play Store opt-in URL
wrangler secret put PLAY_OPT_IN_URL
# Paste: https://play.google.com/apps/testing/com.savyn.launcher
```

### 4.5 Deploy

```bash
wrangler deploy
```

You'll get a URL like: `https://savyn-beta-api.YOUR_SUBDOMAIN.workers.dev`

---

## 🌐 Step 5: Custom Domain (Optional but Recommended)

### 5.1 Add Custom Domain in Cloudflare

1. In Cloudflare dashboard, go to **Workers & Pages**
2. Select your worker
3. Go to **Triggers → Custom Domains**
4. Add: `api.savynlabs.com`

### 5.2 Update DNS

If your domain is already on Cloudflare, it auto-configures.

If not, add a CNAME record:
```
Type: CNAME
Name: api
Content: savyn-beta-api.YOUR_SUBDOMAIN.workers.dev
Proxy: Yes (orange cloud)
```

---

## 🔄 Step 6: Update Frontend

In `website/index.html`, update the API URL:

```javascript
const API_URL = 'https://api.savynlabs.com';
```

Or use the workers.dev URL if not using custom domain.

---

## ✅ Testing

### Test the API directly:

```bash
curl -X POST https://api.savynlabs.com/join-beta \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{
  "ok": true,
  "optInUrl": "https://play.google.com/apps/testing/com.savyn.launcher",
  "message": "You're in! Click below to join the beta on Google Play."
}
```

### Health check:

```bash
curl https://api.savynlabs.com/health
```

---

## 🐛 Troubleshooting

### "Failed to get access token"
- Verify domain-wide delegation is enabled
- Check the OAuth scope matches exactly
- Ensure the admin email is a super admin

### "Not authorized to access this resource"
- The impersonated admin needs permissions to manage the group
- Try using a different super admin email

### "Member already exists" 
- This is treated as success (user already signed up)

### CORS errors
- Update `ALLOWED_ORIGIN` in `wrangler.toml` to match your domain
- Or set to `*` for testing

---

## 📊 Monitoring

View real-time logs:
```bash
wrangler tail
```

View in Cloudflare dashboard:
**Workers & Pages → Your Worker → Logs**

---

## 🔒 Security Notes

1. **Never commit** the service account JSON file
2. **Private key** is stored as a Cloudflare secret (encrypted at rest)
3. **CORS** is restricted to your domain in production
4. **Rate limiting** is handled by Cloudflare (1000 req/min on free tier)

---

## 📝 Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | `savyn-beta@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | RSA private key (full PEM) | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_ADMIN_EMAIL` | Admin to impersonate | `admin@savynlabs.com` |
| `BETA_GROUP_EMAIL` | Google Group email | `beta-testers@savynlabs.com` |
| `PLAY_OPT_IN_URL` | Play Store opt-in link | `https://play.google.com/apps/testing/...` |
| `ALLOWED_ORIGIN` | CORS origin (in wrangler.toml) | `https://savynlabs.com` |

