const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Read site_3.txt
const html = fs.readFileSync('site_3.txt', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

// Grab all selects and their options
const selects = document.querySelectorAll('select');
const optionsMap = {};

selects.forEach(sel => {
    const name = sel.getAttribute('name') || sel.getAttribute('id');
    if (!name) return;
    
    const options = [];
    sel.querySelectorAll('option').forEach(opt => {
        const txt = opt.textContent.trim();
        const lower = txt.toLowerCase();
        if (txt && !['select', '---select---', 'select one', '-select-', 'choose'].includes(lower)) {
            options.push(txt);
        }
    });
    
    if (options.length > 0) {
        optionsMap[name] = options;
    }
});

// Read indian_visa_config.js
let content = fs.readFileSync('modules/indian_visa_config.js', 'utf-8');

// The file likely exports a const object. Let's do a trick using eval to parse it.
const regex = /export const INDIAN_VISA_FIELDS = (\{[\s\S]*?\});(?:\n|$)/m;
const match = content.match(regex);

if (match) {
    let objStr = match[1];
    let fields;
    eval(`fields = ${objStr};`);
    
    // Process fields
    for (const [key, data] of Object.entries(fields)) {
        const htmlName = data.name;
        if (optionsMap[htmlName]) {
            const opts = optionsMap[htmlName];
            let optStr = " [" + opts.join(', ') + "]";
            if (optStr.length > 200) {
                optStr = " [" + opts.slice(0, 5).join(', ') + ", ...]";
            }
            // Remove existing brackets if present and append new ones
            data.label = data.label.split(' [')[0] + optStr;
        }
    }
    
    // Stringify back
    const newFieldsJson = JSON.stringify(fields, null, 4);
    content = content.replace(regex, `export const INDIAN_VISA_FIELDS = ${newFieldsJson};`);
    
    fs.writeFileSync('modules/indian_visa_config.js', content, 'utf-8');
    console.log("Updated INDIAN_VISA_FIELDS successfully.");
} else {
    console.log("Could not find INDIAN_VISA_FIELDS. Using backup regex...");
}
