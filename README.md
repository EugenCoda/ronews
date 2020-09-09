# ronews

Ro News

- Created new express app skeleton
- Added users & categories
- Added articles
- Added admin dashboard
- Fixed adding multiple categories to an article
- Added slug urls
- Added exchange rate from BNR
- Option to mark article as "recommended"
- Display recommended articles on right-side bar on home page
- Display related articles on right-side bar on article detail page
- Font-family chosen: "Roboto", sans-serif
- Deployed - digital ocean, nginx, domain name (namecheap), ssl certificate
- Deployed - .env; helmet, compression;
- Email (Zoho Mail + Sendgrid)
- New database for production

TODO

- upload/handling images
- search - in progress (search for category + pagination)
- comments section
- newsletter
- social media
- google analytics
- cookies messages and settings
- logo

Notes:

- for starting the pm2: NODE_ENV=production pm2 start npm -- start --update-env
- Email (Zoho Mail + Sendgrid): not able to open email links, due to sendgrid link behind my link - TBD how to fix it (so, no registration possible for now)
