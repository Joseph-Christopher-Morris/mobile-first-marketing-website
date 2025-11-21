\# Task: Fix Microsoft Clarity Implementation on [vividmediacheshire.com](http://vividmediacheshire.com) 
 
\## Goal
 
\- Ensure **only one** Microsoft Clarity loader is used.
 
\- Remove conflicting / duplicate Clarity scripts.
 
\- End state: Clarity reliably tracks all sessions without console errors or race conditions.
 
\---
 
\## Background & Current Issues
 
\### What we’ve seen
 
1\. Clarity is initialized via a standard Next.js inline loader:
 
\`\`\`js
 
(function(c,l,a,r,i,t,y){
 
c\[a\]=c\[a\]||function(){(c\[a\].q=c\[a\].q||\[\]).push(arguments)};
 
t=l.createElement(r);t.async=1;t.src="[https://www.clarity.ms/tag/"+i](https://www.clarity.ms/tag/"+i) ;
 
y=l.getElementsByTagName(r)\[0\];y.parentNode.insertBefore(t,y);
 
})(window, document, "clarity", "script", "u4yftkmpxx");
 
There is also an additional custom loader present or previously added:
 
js
 
Copy code
 
!function(c, l, a, r, i, t, y) {
 
a\[c\]("metadata", (function() {
 
a\[c\]("set", "C\_IS", "0")
 
}), !1, !0);
 
if (a\[c\].v || a\[c\].t)
 
return a\[c\]("event", c, "dup." + i.projectId);
 
a\[c\].t = !0,
 
(t = l.createElement(r)).async = !0,
 
t.src = "[https://scripts.clarity.ms/0.8.41/clarity.js](https://scripts.clarity.ms/0.8.41/clarity.js) ",
 
(y = l.getElementsByTagName(r)\[0\]).parentNode.insertBefore(t, y),
 
a\[c\]("start", i),
 
a\[c\].q.unshift(a\[c\].q.pop()),
 
a\[c\]("set", "C\_IS", "0")
 
}("clarity", document, window, "script", {
 
"projectId": "u4yftkmpxx",
 
"upload": "[https://q.clarity.ms/collect](https://q.clarity.ms/collect) ",
 
"expire": 365,
 
"cookies": \["\_uetmsclkid", "\_uetvid"\],
 
"track": true,
 
"content": true,
 
"keep": \["msclkid"\],
 
"dob": 2150
 
});
 
In DevTools:
 
typeof clarity === "object"
 
Calling clarity("event", "vmc\_test\_event") throws:
 
Uncaught TypeError: clarity is not a function
 
Root Cause Summary
 
Multiple/overlapping Clarity loaders were used.
 
The custom loader expects window.clarity to already be a function stub.
 
With Next.js script loading + async behaviour, this creates a race condition and potential duplicate initialization.
 
Result: inconsistent global clarity, console errors, and potentially broken tracking.
 
We do not actually need the advanced custom loader options right now, so the easiest and safest fix is to standardise on a single official loader.
 
Target Implementation
 
Use only the standard Microsoft Clarity snippet, injected once at the app level via Next.js next/script with afterInteractive.
 
1\. App Router (app/layout.tsx or app/layout.js)
 
In the root layout, ensure this exists once:
 
tsx
 
Copy code
 
// app/layout.tsx
 
import Script from "next/script";
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
 
return (
 
<html lang="en">
 
<head>
 
<Script
 
id="clarity"
 
strategy="afterInteractive"
 
dangerouslySetInnerHTML={{
 
\_\_html: \`
 
(function(c,l,a,r,i,t,y){
 
c\[a\]=c\[a\]||function(){(c\[a\].q=c\[a\].q||\[\]).push(arguments)};
 
t=l.createElement(r);t.async=1;t.src="[https://www.clarity.ms/tag/"+i](https://www.clarity.ms/tag/"+i) ;
 
y=l.getElementsByTagName(r)\[0\];y.parentNode.insertBefore(t,y);
 
})(window, document, "clarity", "script", "u4yftkmpxx");
 
\`,
 
}}
 
/>
 
</head>
 
<body>{children}</body>
 
</html>
 
);
 
}
 
Key points:
 
id="clarity" so we can easily find this tag later.
 
strategy="afterInteractive" ensures it runs on the client after hydration.
 
This should be the only place where Clarity is initialized.
 
Clean-up Tasks for Kiro
 
1\. Remove the custom loader snippet
 
Search the codebase for the beginning of the advanced loader:
 
!function(c, l, a, r, i, t, y) {
 
or [scripts.clarity.ms/0.8.41/clarity.js](http://scripts.clarity.ms/0.8.41/clarity.js) 
 
or "dob": 2150
 
Delete that entire block wherever it appears.
 
We do not want this code in the final implementation.
 
2\. Ensure no duplicate Clarity tags
 
Search for:
 
"[https://www.clarity.ms/tag/u4yftkmpxx](https://www.clarity.ms/tag/u4yftkmpxx) "
 
data-nscript="afterInteractive" with id "clarity"
 
window.clarity stubs
 
Rules:
 
There should be exactly one Clarity loader: the inline IIFE inside the next/script block shown above.
 
Remove any additional:
 
<script async src="[https://www.clarity.ms/tag/u4yftkmpxx"></script>](https://www.clarity.ms/tag/u4yftkmpxx"></script>) 
 
Other inline Clarity bootstraps outside app/layout.
 
3\. Do not add custom window.clarity manipulation
 
No extra code should redefine or override window.clarity outside of the standard snippet.
 
Post-fix Verification Steps
 
After Kiro applies the changes and the site is deployed:
 
1\. Console Checks
 
In the browser DevTools console on the live site:
 
js
 
Copy code
 
typeof clarity
 
Expected:
 
Either "function" (stub) very early,
 
Or "object" after full initialization.
 
No uncaught errors related to clarity on page load.
 
Do not rely on clarity("event", ...) as a validation method, since Clarity replaces the function with an object after initialization.
 
2\. Network Checks
 
DevTools → Network → filter: clarity
 
Expected requests:
 
[https://www.clarity.ms/tag/u4yftkmpxx](https://www.clarity.ms/tag/u4yftkmpxx) 
 
[https://q.clarity.ms/collect](https://q.clarity.ms/collect) ?...
 
Status codes should be 200 (no 4xx/5xx errors).
 
3\. Clarity Dashboard
 
In Microsoft Clarity:
 
Verify new recordings appear for [vividmediacheshire.com](http://vividmediacheshire.com) .
 
Check that recent sessions match your own visits during testing.
 
Summary for Kiro
 
Standardise on one Clarity implementation: the official inline loader injected via next/script in app/layout.
 
Remove the advanced custom loader and any duplicate <script> references to Clarity.
 
Verify via console + Network + Clarity dashboard that tracking is live and error-free.
 
This Markdown file should be used as the implementation spec for cleaning up and fixing Microsoft Clarity on [vividmediacheshire.com](http://vividmediacheshire.com) .
 
makefile
 
Copy code
 
::contentReference\[oaicite:0\]{index=0}