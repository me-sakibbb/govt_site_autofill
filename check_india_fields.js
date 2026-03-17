const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('site_3.txt', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

let content = fs.readFileSync('modules/indian_visa_config.js', 'utf-8');
const regex = /export const INDIAN_VISA_FIELDS = (\{[\s\S]*?\});/;
const match = content.match(regex);
let fields = {};
if (match) {
    eval(`fields = ${match[1]};`);
}

const existingNames = new Set(Object.values(fields).map(f => f.name));

const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');

let missing = [];

inputs.forEach(el => {
    const name = el.getAttribute('name') || el.getAttribute('id');
    if (!name) return;
    
    // Ignore some system fields
    if (name === 'token' || name === 'captcha' || name === 'image_verification' || name.startsWith('captcha')) return;
    if (el.disabled || el.type === 'file') return;
    if (el.style.display === 'none') return;
    
    if (!existingNames.has(name) && !existingNames.has(name.replace('[]', ''))) {
        missing.push({
            tag: el.tagName.toLowerCase(),
            type: el.type,
            name: name,
            id: el.id
        });
    }
});

console.log("Missing fields:", JSON.stringify(missing, null, 2));
console.log("Total missing:", missing.length);
