#!/usr/bin/env node

/**
 * Generate residence pages from templates and data
 * 
 * Usage: node tools/generate-residences.js
 * 
 * Reads:
 *   - data/residences.json (canonical residence data)
 *   - templates/residence-template.html (HTML template)
 * 
 * Outputs:
 *   - residence-XXX.html (8 generated files)
 */

const fs = require('fs');
const path = require('path');

// Paths
const DATA_FILE = path.join(__dirname, '../data/residences.json');
const TEMPLATE_FILE = path.join(__dirname, '../templates/residence-template.html');
const OUTPUT_DIR = path.join(__dirname, '../');
const IMG_ROOT = path.join(__dirname, '../img');

// Number of images shown in the curated preview grid before "View All"
const PREVIEW_COUNT = 6;

/**
 * Discover all unique gallery images for a residence directly from the
 * filesystem (img/{number}/), so counts always reflect actual uploaded photography.
 * Sort order: 0.jpg..7.jpg first (the original curated set), then any
 * additional uploaded photo_online_XXX.jpg files in ascending numeric order.
 */
function discoverResidenceImages(number) {
  const dir = path.join(IMG_ROOT, number);
  const files = fs.readdirSync(dir).filter(f => /\.jpe?g$/i.test(f));

  files.sort((a, b) => {
    const aNumbered = /^\d+\.jpe?g$/i.test(a);
    const bNumbered = /^\d+\.jpe?g$/i.test(b);
    if (aNumbered && bNumbered) return parseInt(a) - parseInt(b);
    if (aNumbered && !bNumbered) return -1;
    if (!aNumbered && bNumbered) return 1;
    const aNum = parseInt(a.match(/(\d+)/)[1], 10);
    const bNum = parseInt(b.match(/(\d+)/)[1], 10);
    return aNum - bNum;
  });

  return files.map(f => `img/${number}/${f}`);
}

function residenceVideoPath(number) {
  return `/Videos/${number}%20-%20The%20Colorfield%20-%20Austin,%20TX%20-%20Bridget%20Ramey.mp4`;
}

/**
 * Read and parse the canonical residences data
 */
function loadResidencesData() {
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Read the HTML template
 */
function loadTemplate() {
  return fs.readFileSync(TEMPLATE_FILE, 'utf-8');
}

/**
 * Find a residence by number in the data
 */
function findResidence(residences, number) {
  return residences.find(r => r.number === number);
}

/**
 * Format gallery images as JSON array for lightbox
 */
function formatImagesJson(images) {
  return images
    .map(img => JSON.stringify(img))
    .join(',');
}

/**
 * Generate gallery preview HTML (curated editorial selection, not the full set)
 */
function generateGalleryPreview(images) {
  const preview = images.slice(0, PREVIEW_COUNT);
  return preview
    .map(img => `<div class="res-gallery-item" style="background-image:url('${img}'); background-size:cover; background-position:center;"></div>`)
    .join('\n      ');
}

/**
 * Generate other residences list (excluding current)
 */
function generateOtherResidences(residences, currentNumber) {
  // Order: 304, 204, 303, 203, 302, 202, 301, 201
  const order = ['304', '204', '303', '203', '302', '202', '301', '201'];
  const ordered = order.map(num => residences.find(r => r.number === num));
  const other = ordered.filter(r => r.number !== currentNumber);
  
  return other
    .map(r => `<article class="other-residence-card"><a href="residence-${r.number}.html"><div class="other-residence-image" style="background-image:url('img/${r.number}/0.jpg');"></div><div class="other-residence-name">Residence ${r.number}</div><div class="other-residence-price">${r.price}</div><span class="other-residence-link">View Residence &rarr;</span></a></article>`)
    .join('\n      ');
}

/**
 * Perform template substitutions
 */
function substituteTemplate(template, residence, residences) {
  let html = template;
  
  // Basic residence info
  html = html.replace(/{{number}}/g, residence.number);
  html = html.replace(/{{beds}}/g, residence.beds);
  html = html.replace(/{{baths}}/g, residence.baths);
  html = html.replace(/{{interior_sf}}/g, residence.interior_sf);
  html = html.replace(/{{total_sf}}/g, residence.total_sf);
  html = html.replace(/{{status}}/g, residence.status);
  html = html.replace(/{{price}}/g, residence.price);
  html = html.replace(/{{video_id}}/g, residence.video_id);
  html = html.replace(/{{residence_video}}/g, residenceVideoPath(residence.number));
  html = html.replace(/{{floorplan}}/g, residence.floorplan);
  
  // Gallery images - discovered live from img/{number}/ so counts always match uploaded photography
  const images = discoverResidenceImages(residence.number);
  const imagesJson = formatImagesJson(images);
  const galleryPreview = generateGalleryPreview(images);
  
  html = html.replace(/{{gallery_preview}}/g, galleryPreview);
  html = html.replace(/{{images_json}}/g, imagesJson);
  html = html.replace(/{{images_count}}/g, images.length);
  
  // Explore other residences
  const otherResidences = generateOtherResidences(residences, residence.number);
  html = html.replace(/{{other_residences}}/g, otherResidences);
  
  return html;
}

/**
 * Main generator function
 */
function generatePages() {
  console.log('🏗️  Loading data...');
  const residences = loadResidencesData();
  const template = loadTemplate();
  
  console.log(`📋 Found ${residences.length} residences in data`);
  
  // Generate pages in the order: 304, 204, 303, 203, 302, 202, 301, 201
  const order = ['304', '204', '303', '203', '302', '202', '301', '201'];
  
  order.forEach(number => {
    const residence = findResidence(residences, number);
    
    if (!residence) {
      console.warn(`⚠️  Residence ${number} not found in data!`);
      return;
    }
    
    const html = substituteTemplate(template, residence, residences);
    const outputPath = path.join(OUTPUT_DIR, `residence-${number}.html`);
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✓ Generated residence-${number}.html`);
  });
  
  console.log('\n✅ All residence pages generated successfully!');
}

// Run generator
try {
  generatePages();
} catch (err) {
  console.error('❌ Error generating pages:', err.message);
  process.exit(1);
}
