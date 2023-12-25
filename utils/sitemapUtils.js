const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const productModels = require("../models/productModels");

async function generateSitemap() {
  const baseUrl = process.env.BASE_URL;
  const staticRoutes = [{
    route:'/',
    lastmod:'2023-10-24T04:29:55.746Z',
  }];
  const dynamicRoutes = [];

  try {
    const products = await productModels.find({});
    // const priority = product.seo[0].priority || 0.5;
    const priority = 0.5;

    let sitemap =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';
    products.forEach((product, i) => {
        const route = `/shop/dolls/${product.seo[0].metalink}`;
      const lastmod = product.createdate.toISOString();
      dynamicRoutes.push({ route, lastmod});
    });

    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    allRoutes.forEach((route) => {
      sitemap += `
      <url>
        <loc>${baseUrl}${route.route}</loc>
        <lastmod>${route.lastmod}</lastmod>
        <priority>${priority}</priority>
      </url>
    `;
    });

    sitemap += "</urlset>";

    const distfolder = path.join(__dirname, "../../frontend/public");
    const sitemapPath = path.join(distfolder, "sitemap.xml");
    fs.writeFile(sitemapPath, sitemap, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("Sitemap generated successfully!");
    });
  } catch (err) {
    console.error(err);
  }
}
module.exports = generateSitemap;
