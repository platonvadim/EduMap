# Deploy EduMap to platon.md/edumap/

Use this build when the site is hosted in a subfolder:

```bash
npm install
npm run typecheck
npm run build:platon
```

Upload the **contents of `dist/`** to the server folder:

```txt
public_html/edumap/
```

Do not upload the `dist` folder itself as `public_html/edumap/dist`.

After upload, these URLs must work:

```txt
https://platon.md/edumap/
https://platon.md/edumap/assets/...
https://platon.md/edumap/data/vacante_by_city.json
https://platon.md/edumap/data/moldova-districts.json
```

If the home page opens but refresh/direct links return 404, make sure `.htaccess` from `dist/.htaccess` was uploaded too. Some FTP clients hide dotfiles.
