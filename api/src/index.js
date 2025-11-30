/**
 * Savyn Beta Signup API
 * 
 * Cloudflare Worker that adds users to a Google Group for Play Store closed beta access.
 * Uses Google Admin Directory API with domain-wide delegation.
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(env);
    }

    // Route requests
    const url = new URL(request.url);
    
    if (url.pathname === '/join-beta' && request.method === 'POST') {
      return handleJoinBeta(request, env);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS(env) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

/**
 * Add response headers including CORS
 */
function jsonResponse(data, status = 200, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    }
  });
}

/**
 * POST /join-beta
 * Body: { email: string }
 * 
 * Adds the email to the Google Group for beta testers.
 * Returns the Play Store opt-in URL on success.
 */
async function handleJoinBeta(request, env) {
  try {
    // Parse and validate input
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ 
        ok: false, 
        error: 'Invalid email address' 
      }, 400, env);
    }

    // Get Google access token using service account
    const accessToken = await getGoogleAccessToken(env);

    // Add user to the beta testers group
    const result = await addMemberToGroup(email, accessToken, env);

    if (result.success) {
      return jsonResponse({
        ok: true,
        optInUrl: env.PLAY_OPT_IN_URL,
        message: result.alreadyMember 
          ? "You're already signed up! Click below to join the beta." 
          : "You're in! Click below to join the beta on Google Play."
      }, 200, env);
    } else {
      return jsonResponse({
        ok: false,
        error: result.error || 'Failed to add to beta list'
      }, 500, env);
    }

  } catch (error) {
    console.error('Join beta error:', error);
    return jsonResponse({
      ok: false,
      error: 'Something went wrong. Please try again.'
    }, 500, env);
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a Google OAuth2 access token using service account credentials
 * with domain-wide delegation.
 */
async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  
  // JWT Header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // JWT Claim Set - impersonate admin user for domain-wide delegation
  const claimSet = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    sub: env.GOOGLE_ADMIN_EMAIL, // Admin user to impersonate
    scope: 'https://www.googleapis.com/auth/admin.directory.group.member',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600 // 1 hour
  };

  // Create JWT
  const jwt = await createJWT(header, claimSet, env.GOOGLE_PRIVATE_KEY);

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    console.error('Token error:', tokenData);
    throw new Error(`Failed to get access token: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

/**
 * Create a signed JWT using RS256
 */
async function createJWT(header, payload, privateKeyPem) {
  // Encode header and payload
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import private key
  const privateKey = await importPrivateKey(privateKeyPem);

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Encode signature
  const encodedSignature = base64urlEncode(signature);

  return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Import PEM private key for Web Crypto API
 */
async function importPrivateKey(pemKey) {
  // Handle escaped newlines from env var
  const formattedKey = pemKey.replace(/\\n/g, '\n');
  
  // Extract the base64 content
  const pemContents = formattedKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Decode base64 to binary
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import key
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
}

/**
 * Base64url encode (RFC 4648)
 */
function base64urlEncode(data) {
  let base64;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    // ArrayBuffer
    base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Add a member to the Google Group using Directory API
 */
async function addMemberToGroup(email, accessToken, env) {
  const groupEmail = env.BETA_GROUP_EMAIL;
  const url = `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(groupEmail)}/members`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      role: 'MEMBER'
    })
  });

  const data = await response.json();

  // Success
  if (response.ok) {
    return { success: true, alreadyMember: false };
  }

  // Already a member - treat as success
  if (response.status === 409 && data.error?.message?.includes('Member already exists')) {
    return { success: true, alreadyMember: true };
  }

  // Actual error
  console.error('Directory API error:', data);
  return { 
    success: false, 
    error: data.error?.message || 'Failed to add to group'
  };
}

