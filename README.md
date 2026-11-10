# VentVelo – Velosipēdu serviss, izbraukuma buss un veikals Ventspilī

VentVelo ir mūsdienīga velosipēdu un e-skrejriteņu servisa, velosalonu un detaļu tirdzniecības platforma ar reģionālu izbraukuma servisa busiņu Kurzemē (Ventspils, Usma, Talsi).

## 🚀 Kā publicēt vietni GitHub Pages (Deploy to GitHub Pages)

Šī lietotne ir būvēta ar React un Vite. Lai tā darbotos vietnē `https://<lietotājvārds>.github.io/VentVelo/`, GitHub ir jāpalaiž automātiskā kompilācija:

1. Savā GitHub repozitorijā **VentVelo** augšējā joslā atveriet **Settings** (Iestatījumi).
2. Kreisajā sānu izvēlnē noklikšķiniet uz **Pages**.
3. Sadaļā **Build and deployment**:
   - Pie **Source** nolaižamajā sarakstā izvēlieties **GitHub Actions** (nevis *Deploy from a branch*).
4. Tiklīdz tas ir izdarīts, iestrādātā `.github/workflows/deploy.yml` darba plūsma automātiski nokompilēs React lietotni un nopublicēs gatavo mājaslapu.

---

## 🛠 Tehnoloģijas

- **React 19** ar TypeScript
- **Vite** ar Tailwind CSS v4
- **Lucide Icons**
- **Mobile Van Fleet** reģionālā loģistika
- **Tiešsaistes velogaraža** un remonta gaitas izsekošana
- **Maksājumu vārteja** ar vairāku valūtu (EUR, USD, GBP, SEK) atbalstu un garantiju sertifikātiem

## 💻 Vietējā palaišana (Local Development)

```bash
npm install
npm run dev
```

Vietne būs pieejama adresē `http://localhost:3000`.
