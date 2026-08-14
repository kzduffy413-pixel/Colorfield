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
 * Generate gallery preview HTML (first 6 images)
 */
function generateGalleryPreview(images) {
  const preview = images.slice(0, 6);
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
    .map(r => `<div style="text-align:center;"><a href="residence-${r.number}.html" style="display:block;"><div style="aspect-ratio:4/5;background-image:url('img/${r.number}/0.jpg');background-size:cover;background-position:center;margin-bottom:12px;"></div><div style="font-family:'Fraunces',serif;font-size:1.1rem;margin-bottom:6px;">Residence ${r.number}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:0.8rem;color:var(--field-ochre);">${r.price}</div></a></div>`)
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
  html = html.replace(/{{floorplan}}/g, residence.floorplan);
  
  // Gallery images
  const imagesJson = formatImagesJson(residence.images);
  const galleryPreview = generateGalleryPreview(residence.images);
  
  html = html.replace(/{{gallery_preview}}/g, galleryPreview);
  html = html.replace(/{{images_json}}/g, imagesJson);
  html = html.replace(/{{images_count}}/g, residence.images.length);
  
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
