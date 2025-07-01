const functions = require('firebase-functions');
const admin = require('firebase-admin');
const SerpApi = require('google-search-results-nodejs')

admin.initializeApp();

const OPENAI_KEY = functions.config().openai.key;
const VISION_KEY = functions.config().vision.key;
const CSE_ID = functions.config().cse.key
const CUSTOM_SEARCH = functions.config().customsearch.key
const SERP_KEY = functions.config().serp.key
const db = admin.firestore()

const searchClient = new SerpApi.GoogleSearch(SERP_KEY)

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});



exports.checkPriceAlerts = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Tbilisi')
  .onRun(async () => {

  });

const SITES = [
  'Zappos',
  "Levi's",
  'River Island',
  'Nordstrom',
  'Urban Outfitters',
  'Revolve',
  'Lululemon',
  'MR PORTER',
  'Cettire',
  "Macy's",
  'farfetch.com',
  'giglio.com',
]

const QUERIES = ['clothes', 'jacket', 'sale', 'sneakers', 'trousers']

exports.generateTrending = functions.pubsub
  .schedule('0 0 * * 1')
  .timeZone('Asia/Tbilisi')
  .onRun(async () => {
    const col = db.collection('trendingProducts')

    // 1) Pick 5 random, non‑repeating store names
    const selectedSites = SITES
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)

    // 2) Fire one SerpApi call per store+query
    const sitePromises = selectedSites.map(store => {
      const query = QUERIES[Math.floor(Math.random() * QUERIES.length)]
      const q = `${store} ${query}`  // e.g. "Zappos sneakers"

      console.log(`▶️  Querying "${q}"`)

      const params = {
        engine: 'google_shopping',
        q,                            // use the dynamic q variable
        gl: 'us',
        google_domain: 'google.com',
        hl: 'en',
        num: 100,
        no_cache: true,
        api_key: SERP_KEY
      }

      return new Promise(resolve => {
        searchClient.json(params, data => {
          if (data.error) {
            console.warn(`• [${store}] SerpApi error:`, data.error)
            return resolve([])
          }
          // filter only items whose `source` matches `store`
          const re = new RegExp(
            store.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
            'i'
          )
          const hits = (data.shopping_results || []).filter(item =>
            typeof item.product_link === 'string' &&
            typeof item.source === 'string' &&
            re.test(item.source)
          )
          console.log(`• [${store}] returned ${hits.length} matching hits`)
          resolve(hits)
        })
      })
    })

    try {
      // 3) Gather, flatten, and dedupe by product_link
      const allResults = (await Promise.all(sitePromises)).flat()
      console.log(`• Fetched ${allResults.length} total hits`)
      const uniqueByProduct = Array.from(
        new Map(allResults.map(r => [r.product_link, r])).values()
      )
      console.log(`• Deduped → ${uniqueByProduct.length} unique products`)

      // 4) Simplify each hit
      const simplified = uniqueByProduct.map(item => ({
        title: item.title || null,
        product_link: item.product_link,
        source: item.source,
        rating: item.rating || null,
        reviews: item.reviews || null,
        image: item.thumbnail || null,
        price: item.price || null
      }))

      // 5) Batch delete old + write new
      const batch = db.batch()
      const oldSnap = await col.get()
      console.log(`• Deleting ${oldSnap.size} old docs`)
      oldSnap.forEach(d => batch.delete(d.ref))

      simplified.forEach((p, i) => {
        const ref = col.doc()
        batch.set(ref, {
          title: p.title,
          product_link: p.product_link,
          rating: p.rating,
          reviews: p.reviews,
          source: p.source,
          image: p.image,
          price: p.price,
          fetchedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        console.log(`  + [${i}] ${p.product_link} ← ${p.source} → ${p.price}`)
      })

      await batch.commit()
      console.log(`✅ Wrote ${simplified.length} trending items`)
    } catch (e) {
      console.error('⚠️ Unexpected error in generateTrending:', e)
    }

    return null
  })


exports.generateImage = functions.https.onCall(async (data, ctx) => {
  const prompt = data.prompt;
  const resp = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    n: 1,
  });
  return { imageUrl: resp.data[0].url };
});


exports.buildOutfit = functions.https.onCall(async ({ recentItems }, ctx) => {
  const messages = [
    { role: "system", content: "You are a personal stylist." },
    { role: "user", content: `User likes: ${recentItems.join(", ")}. Suggest 3 outfits.` }
  ];
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    max_tokens: 300,
  });
  return { outfits: chat.choices[0].message.content };
});


exports.detectImage = functions.https.onCall(async ({ imageBase64 }, ctx) => {
  const body = {
    requests: [{
      image: { content: imageBase64 },
      features: [{ type: "WEB_DETECTION", maxResults: 10 }]
    }]
  };
  const visionResp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
    {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const json = await visionResp.json();
  const web = json.responses?.[0]?.webDetection || {};
  return {
    webEntities: web.webEntities || [],
    pages: web.pagesWithMatchingImages || []
  };
});




exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send('Hello from Firebase!');
});


// import { getFunctions, httpsCallable } from "firebase/functions";
// const fn = httpsCallable(getFunctions(), "detectImage");
// const { data } = await fn({ imageUrl: myImageUrl });
// console.log(data.webMatches, data.pages);

