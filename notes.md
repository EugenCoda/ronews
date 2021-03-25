TODO

- Search - in progress (search for category + pagination)
- SEO
- comments section
- newsletter
- logo

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
