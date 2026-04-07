import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const assets = [
  // Logos
  {
    url: "https://d2xkd1fof6iiv9.cloudfront.net/images/logos/web-header-black.svg",
    dest: "images/logos/web-header-black.svg",
  },
  {
    url: "https://d2xkd1fof6iiv9.cloudfront.net/images/logos/headicon.png",
    dest: "images/logos/headicon.png",
  },
  // Hero background
  {
    url: "https://d2xkd1fof6iiv9.cloudfront.net/images/home/joshua-ellish-splash.jpg",
    dest: "images/home/joshua-ellish-splash.jpg",
  },
  // Course images - Hot & New
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2936/169_820@2x.jpg",
    dest: "images/courses/2936.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2960/169_820@2x.jpg",
    dest: "images/courses/2960.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2966/169_820@2x.jpg",
    dest: "images/courses/2966.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2954/169_820@2x.jpg",
    dest: "images/courses/2954.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2934/169_820@2x.jpg",
    dest: "images/courses/2934.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2962/169_820@2x.jpg",
    dest: "images/courses/2962.jpg",
  },
  // Course images - Most Popular
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1762/169_820@2x.jpg",
    dest: "images/courses/1762.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1944/169_820@2x.jpg",
    dest: "images/courses/1944.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/696/169_820@2x.jpg",
    dest: "images/courses/696.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1385/169_820@2x.jpg",
    dest: "images/courses/1385.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1303/169_820@2x.jpg",
    dest: "images/courses/1303.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1505/169_820@2x.jpg",
    dest: "images/courses/1505.jpg",
  },
  // Course images - Song Lessons
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1907/169_820@2x.jpg",
    dest: "images/courses/1907.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2683/169_820@2x.jpg",
    dest: "images/courses/2683.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/1954/169_820@2x.jpg",
    dest: "images/courses/1954.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2727/169_820@2x.jpg",
    dest: "images/courses/2727.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2853/169_820@2x.jpg",
    dest: "images/courses/2853.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/courses/2741/169_820@2x.jpg",
    dest: "images/courses/2741.jpg",
  },
  // Featured Artists
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4866/square_600.jpg",
    dest: "images/educators/eric-gales.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4826/square_600.jpg",
    dest: "images/educators/eric-johnson.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4680/square_600.jpg",
    dest: "images/educators/guthrie-trapp.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4800/square_600.jpg",
    dest: "images/educators/yngwie-malmsteen.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4676/square_600.jpg",
    dest: "images/educators/marty-friedman.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4616/square_600.jpg",
    dest: "images/educators/eric-haugen.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4539/square_600.jpg",
    dest: "images/educators/tim-lerch.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/3861/square_600.jpg",
    dest: "images/educators/tommy-emmanuel.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4915/square_600.jpg",
    dest: "images/educators/andy-wood.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4045/square_600.jpg",
    dest: "images/educators/robben-ford.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4924/square_600.jpg",
    dest: "images/educators/lindsay-ell.jpg",
  },
  {
    url: "https://df4emreqpcien.cloudfront.net/images/educators/4919/square_600.jpg",
    dest: "images/educators/keb-mo.jpg",
  },
  // All Access logo
  {
    url: "https://df4emreqpcien.cloudfront.net/images/all-access/AA.svg",
    dest: "images/all-access-aa.svg",
  },
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(publicDir, destPath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(fullPath);
    const makeRequest = (requestUrl) => {
      https
        .get(requestUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            makeRequest(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${requestUrl}`));
            return;
          }
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(destPath);
          });
        })
        .on("error", reject);
    };
    makeRequest(url);
  });
}

async function downloadBatch(items, batchSize = 4) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((item) => download(item.url, item.dest))
    );
    batchResults.forEach((r, j) => {
      if (r.status === "fulfilled") {
        console.log(`  OK: ${r.value}`);
        results.push(r.value);
      } else {
        console.error(`  FAIL: ${batch[j].dest} - ${r.reason.message}`);
      }
    });
  }
  return results;
}

console.log(`Downloading ${assets.length} assets...`);
downloadBatch(assets).then((results) => {
  console.log(`\nDone. ${results.length}/${assets.length} downloaded successfully.`);
});
