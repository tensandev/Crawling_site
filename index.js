const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql2/promise");
const https = require("https");
const cloudscraper = require("cloudscraper");

// 🌟 MySQL 接続設定
const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "crawler"
};

// 🌟 axios の設定（User-Agent, SSL, リダイレクト）
const axiosInstance = axios.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    timeout: 5000,
    maxRedirects: 5,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// 🌟 URL を保存するキュー（重複を防ぐため Set を使用）
const visitedUrls = new Set();
const queue = [];

// 🌟 Web ページをスクレイピングする関数
async function fetchPage(url) {
    try {
        let response;

        // 🌟 Cloudflare 対策（cloudscraper を試す）
        try {
            response = await cloudscraper.get(url);
        } catch (e) {
            console.warn("Cloudflare protection detected, falling back to axios...");
            response = await axiosInstance.get(url);
        }

        const $ = cheerio.load(response);
        const bodyHtml = $("body").html(); // 🌟 body のみ取得
        const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

        console.log(`✅ Fetched: ${url}`);

        // 🌟 MySQL に保存
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            "INSERT INTO pages (url, date, html) VALUES (?, ?, ?)",
            [url, currentDate, bodyHtml]
        );
        await connection.end();

        // 🌟 <a> タグから新しい URL を取得
        $("a").each((_, el) => {
            const href = $(el).attr("href");
            if (href && !visitedUrls.has(href) && href.startsWith("http")) {
                visitedUrls.add(href);
                queue.push(href);
            }
        });

    } catch (error) {
        console.error(`❌ Failed to fetch: ${url}`, error.message);
    }
}

// 🌟 並列処理でスクレイピング
async function crawl(startUrl, maxDepth = 500) {
    visitedUrls.add(startUrl);
    queue.push(startUrl);

    for (let depth = 0; depth < maxDepth; depth++) {
        console.log(`🔎 Depth ${depth + 1}: Crawling ${queue.length} URLs...`);

        const tasks = queue.splice(0, 1).map(url => fetchPage(url)); // 1 件ずつ並列処理（デフォルトで１件）
        await Promise.all(tasks);

        if (queue.length === 0) break; // 取得する URL がなくなったら終了
    }

    console.log("🎉 Crawling finished!");
}

// 🌟 実行
crawl("https://www.example.com");
