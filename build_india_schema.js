const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('site_3.txt', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

function getLabelFor(el) {
    // 1. Label tag
    if (el.id) {
        const lbl = document.querySelector(`label[for="${el.id}"]`);
        if (lbl) return lbl.textContent.trim().replace(/\*/g, '');
    }
    
    // 2. Previous table row cell or siblings
    const td = el.closest('td');
    if (td) {
        let prev = td.previousElementSibling;
        while (prev && !prev.textContent.trim()) {
            prev = prev.previousElementSibling;
        }
        if (prev) {
            let t = prev.textContent.trim().replace(/\*/g, '');
            if (t) return t.replace(/(\t|\n)+/g, ' ').trim();
        }
        // Maybe it's above in the previous tr
        const tr = el.closest('tr');
        if (tr) {
            const prevTr = tr.previousElementSibling;
            if (prevTr && prevTr.children.length === tr.children.length) {
                const index = Array.from(tr.children).indexOf(td);
                if (prevTr.children[index]) {
                    let t = prevTr.children[index].textContent.trim().replace(/\*/g, '');
                    if (t) return t.replace(/(\t|\n)+/g, ' ').trim();
                }
            }
        }
    }
    
    // 3. Just grab previous div block
    const parent = el.parentElement;
    if (parent && parent.previousElementSibling) {
        let t = parent.previousElementSibling.textContent.trim().replace(/\*/g, '');
        if (t) return t.replace(/(\t|\n)+/g, ' ').trim();
    }
    
    return el.getAttribute('name') || el.id;
}

const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), select, textarea');

let fields = {};
let dummy = {};

inputs.forEach(el => {
    let name = el.getAttribute('name') || el.id;
    if (!name) return;
    if (name.includes('captcha') || name === 'token' || name === 'image_verification') return;
    if (el.style.display === 'none') return;

    let baseName = name;
    if (el.type === 'radio') {
        baseName = name; 
    }

    let label = getLabelFor(el);

    if (el.tagName.toLowerCase() === 'select') {
        const opts = [];
        el.querySelectorAll('option').forEach(o => {
            const t = o.textContent.trim();
            if (t && !['select', '---select---', '-select-', 'choose'].includes(t.toLowerCase())) {
                opts.push(t);
            }
        });
        if (opts.length > 0) {
            let optStr = opts.join(', ');
            if (optStr.length > 200) {
                optStr = opts.slice(0, 5).join(', ') + ', ...';
            }
            label += ` [${optStr}]`;
        }
    }
    
    // Manual mapping for some problematic ones from initial run
    if (name === 'appl.countryname') label = 'Country you are applying visa from' + (label.split('[')[1] ? ' [' + label.split('[')[1] : '');
    if (name === 'appl.missioncode') label = 'Indian Mission/Office' + (label.split('[')[1] ? ' [' + label.split('[')[1] : '');
    if (name === 'appl.nationality') label = 'Nationality' + (label.split('[')[1] ? ' [' + label.split('[')[1] : '');
    if (name === 'appl.birthdate') label = 'Date of Birth (DD/MM/YYYY)';
    if (name === 'appl.email') label = 'Email ID';
    if (name === 'appl.email_re') label = 'Re-enter Email ID';
    if (name === 'appl.journeydate') label = 'Expected Date of Arrival (DD/MM/YYYY)';
    if (name === 'appl.visa_service_id') label = 'Visa Type' + (label.split('[')[1] ? ' [' + label.split('[')[1] : '');
    if (name === 'appl.purpose') label = 'Purpose'  + (label.split('[')[1] ? ' [' + label.split('[')[1] : '');
    if (name === 'sameAddress') label = 'Click Here for Same Address';

    let key = baseName.replace(/\./g, '_').replace(/\[/g, '_').replace(/\]/g, '');
    fields[key] = {
        name: baseName,
        label: label
    };
    dummy[baseName] = "";
});

const content = `// Indian Visa Application Field Definitions
export const INDIAN_VISA_FIELDS = ${JSON.stringify(fields, null, 4)};

export const INDIAN_VISA_DUMMY_PROFILE = {
    id: 'profile_indian_visa_demo',
    name: 'Indian Visa (Demo)',
    site: 'indian_visa',
    profilePic: null,
    data: ${JSON.stringify(dummy, null, 4)}
};
`;

fs.writeFileSync('modules/indian_visa_config.js', content, 'utf-8');
console.log("Written", Object.keys(fields).length, "fields");
