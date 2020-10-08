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
- Uploading images to articles (with Multer middleware)
- Removed layout_ignore file (and moved categories to config.env)
- Cookies consent
- Google Analytics (added gtag.js to layout.pug; updated helmet for google analytics links)

  9/24/2020

- Fixed the sidebar articles error (caused by the links in the truncated text)
- Separated recommended articles in a different query to DB

  9/28/2020

- Added favicon
- Search - show results chronologically + show the date

  10/1/2020

- Improved exchange rate box design

  10/8/2020

- Added social media buttons

TODO

- SEO
- comments section
- newsletter
- logo
- Search - in progress (search for category + pagination)

Notes:

- for starting the pm2: NODE_ENV=production pm2 start npm -- start --update-env
- for deploying a new site version:
  - before deleting folder from Digital Ocean, copy folder with images in backup folder:
    - [~/apps/ronews/public/images$] cp -avr articles ~/apps/backup
  - create config.env file
  - copy info from local file
  - copy images folder from backup back to app folder:
    - [~/apps/ronews/public$] cp -avr ~/apps/backup/articles images
- Email (Zoho Mail + Sendgrid): not able to open email links, due to sendgrid link behind my link - TBD how to fix it (so, no registration possible for now)
