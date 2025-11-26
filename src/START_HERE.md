# 👋 START HERE

## TL;DR - 30 Seconds

```bash
npm install
npm run dev
```

Open `http://localhost:5173` → Done! ✅

---

## The 403 Error You WILL See

```
Error while deploying: XHR for "/api/integrations/supabase/..." failed with status 403
```

### ✅ **THIS IS EXPECTED AND PERMANENT**

- ⚠️ This error will ALWAYS appear in Figma Make console
- ✅ Your app works perfectly despite this
- ✅ It won't appear in production (Vercel/Netlify)
- ✅ **Cannot be "fixed"** - this is how Figma Make works
- 📖 Read [ERROR_403_IS_NORMAL.md](./ERROR_403_IS_NORMAL.md) for full explanation

---

## How It Works

```
Your Browser → localStorage → Done!
```

No backend. No API. No setup. Just works.

---

## Want More Info?

1. **[README.md](./README.md)** - Full overview
2. **[QUICK_START.md](./QUICK_START.md)** - Setup guide
3. **[DOCS_INDEX.md](./DOCS_INDEX.md)** - All documentation

---

## Deploy to Production

```bash
# Option 1: Vercel
vercel deploy

# Option 2: Netlify  
netlify deploy --prod

# Option 3: Any static host
npm run build
# Upload dist/ folder
```

**No environment variables needed!**

---

## ✅ You're Done!

That's literally it. Start coding! 🚀

**Questions?** Read [DOCS_INDEX.md](./DOCS_INDEX.md)

**The 403 error?** Read [IGNORE_DEPLOY_ERROR.md](./IGNORE_DEPLOY_ERROR.md)

**Everything else?** It just works™
