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

  10/14/2020

- Added sitemap
- Changed page title tag to h1

  11/5/2020

- Cleared html tags from truncated texts

  11/12/2020

- Added canonical to article_detail, category_details and category_list
- Added meta description to index, article_detail, category_details and category_list
- Added CKFinder (file uploader)
- Updated sitemap

  12/3/2020

- Added image uploader(multer) to the admin dashboard - for inserting images inside an article
- Moved exchange rate and pagination in separate file
- Fixed the sorting of articles for a category
- Tweaked the published date, title font size, article image size, sidebar article format

  12/10/2020

- Added emoji & image2 plugind to ckeditor, removed CKFinder
- Fixed exchange rate for individual article
- Image inside article - working, but not responsive (CKEditor solution requires paid cloud subscription)
- Related articles algorithm - fixed to show the latest articles

  12/17/2020

- Mobile - container padding, pagination design, article tag design, social media buttons padding
- Search - design
