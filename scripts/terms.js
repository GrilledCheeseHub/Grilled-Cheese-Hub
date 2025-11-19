/* --------------------------------------------------------------
   terms‑gate.js
   Adds a Terms‑and‑Conditions gate to any page.
   • If a valid timestamp (≤30 days) exists → page shows.
   • Otherwise a popup with the terms appears.
   • Accept → timestamp stored, page **reloads**.
   • Reject → page replaced with an “Access Denied” notice.
   -------------------------------------------------------------- */

(() => {
  const TERMS_KEY = 'mySiteTermsAcceptedAt';
  const VALID_DAYS = 30;
  const MS_IN_DAY = 24 * 60 * 60 * 1000;

  // -----------------------------------------------------------------
  // Check whether a stored timestamp is still valid
  // -----------------------------------------------------------------
  function hasValidTerms() {
    const ts = localStorage.getItem(TERMS_KEY);
    if (!ts) return false;
    return (Date.now() - Number(ts)) < VALID_DAYS * MS_IN_DAY;
  }

  // -----------------------------------------------------------------
  // Open the terms popup window
  // -----------------------------------------------------------------
  function openTermsPopup() {
    const popup = window.open('', 'termsPopup',
      'width=650,height=500,menubar=no,toolbar=no,location=no');
    if (!popup) {
      alert('Please allow pop‑ups for this site to view the terms.');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Terms & Conditions</title>
<style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;}
  .modal{display:flex;align-items:center;justify-content:center;height:100vh;}
  .modal-content{background:#fff;padding:20px;max-width:600px;width:90%;max-height:80vh;
    box-shadow:0 2px 10px rgba(0,0,0,0.3);border-radius:5px;display:flex;flex-direction:column;}
  .terms{flex:1;overflow:auto;margin-bottom:15px;padding-right:10px;border:1px solid #ddd;}
  .buttons{text-align:right;}
  .buttons button{margin-left:10px;padding:8px 16px;font-size:14px;cursor:pointer;}
</style>
</head>
<body>
<div class="modal">
  <div class="modal-content">
    <h2>Terms &amp; Conditions</h2>
    <div class="terms">
      <!-- INSERT REAL TERMS TEXT BELOW -->
<p><strong>Terms and Conditions</strong></p>

<p>By using this game website, you agree to the following terms and conditions:</p>

<p><strong>Liability</strong></p>
<p>This website and its operators are not liable for any damages, losses, or legal repercussions that may arise from your use of this site. You acknowledge that you use this website at your own risk and that the website is not responsible for any consequences resulting from your engagement with the games provided.</p>

<p><strong>Confidentiality</strong></p>
<p>We are committed to maintaining your confidentiality. Any personal information you provide will be kept confidential and will not be shared with third parties without your explicit consent, unless required by law.</p>

<p><strong>Contact Information</strong></p>
<p>We do not provide contact information for our users, nor do we retain personal data that could be used to identify you. All interactions are conducted anonymously to ensure your privacy.</p>

<p><strong>Amendments</strong></p>
<p>We reserve the right to update or modify these terms at any time. Continued use of the website following any changes constitutes acceptance of the new terms.</p>

<p><strong>Governing Law</strong></p>
<p>These terms and conditions will be governed by and construed in accordance with the laws of the jurisdiction in which the website operates.</p>

    </div>
    <div class="buttons">
      <button id="reject">I Do Not Accept</button>
      <button id="accept">I Accept(reload the page)</button>
    </div>
  </div>
</div>
<script>
  const opener = window.opener;
  document.getElementById('accept').addEventListener('click', () => {
    const now = Date.now();
    try { opener.localStorage.setItem('${TERMS_KEY}', now); } catch(e) {}
    // Tell the opener that the terms were accepted
    opener.postMessage('terms-accepted', '*');
    alert('reload the page')
    window.close();
  });
  document.getElementById('reject').addEventListener('click', () => {
    opener.postMessage('terms-rejected', '*');
    window.close();
  });
</script>
</body>
</html>`;

    popup.document.write(html);
    popup.document.close();
  }

  // -----------------------------------------------------------------
  // Handle messages from the popup
  // -----------------------------------------------------------------
  function handleMessage(event) {
    if (event.source !== window) return; // ignore unrelated messages
    if (event.data === 'terms-accepted') {
      // Reload the page – on reload the script will see a fresh, valid timestamp
      location.reload();
    } else if (event.data === 'terms-rejected') {
      document.body.innerHTML = '<h2>Access Denied</h2><p>You must accept the terms to view this site.</p>';
    }
  }

  // -----------------------------------------------------------------
  // Initialise after DOM is ready
  // -----------------------------------------------------------------
  function init() {
    // Hide the page until acceptance
    const hideStyle = document.createElement('style');
    hideStyle.textContent = 'body.terms‑gate‑hidden{display:none;}';
    document.head.appendChild(hideStyle);
    document.body.classList.add('terms‑gate‑hidden');

    if (hasValidTerms()) {
      document.body.classList.remove('terms‑gate‑hidden');
      return;
    }

    openTermsPopup();
    window.addEventListener('message', handleMessage, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();