import json
import bs4
import re

html = open('site_3.txt', encoding='utf-8').read()
soup = bs4.BeautifulSoup(html, 'html.parser')

inputs = soup.find_all(['input', 'select', 'textarea'])

fields = {}
dummy_data = {}

for el in inputs:
    name = el.get('name') or el.get('id')
    if not name: continue
    
    # skip some
    if name in ['token', 'captcha', 'image_verification'] or name.startswith('captcha'): continue
    if el.get('type') in ['hidden', 'submit', 'button', 'file']: continue
    if el.get('style') and 'display:none' in el.get('style'): continue

    label_text = ''
    
    # try to find label by id
    if el.get('id'):
        lbl = soup.find('label', {'for': el.get('id')})
        if lbl:
            # get all text, strip inside parenthesis
            label_text = lbl.text.strip().replace('\n', ' ').replace('\t', '')
            label_text = re.sub(' +', ' ', label_text)

    # fallback: look at previous td or th
    if not label_text:
        parent_td = el.find_parent('td')
        if parent_td:
            prev_td = parent_td.find_previous_sibling('td')
            if prev_td:
                label_text = prev_td.text.strip().replace('\n', ' ').replace('\t', '')
                label_text = re.sub(' +', ' ', label_text)

    # dropdown options
    if el.name == 'select':
        opts = []
        for opt in el.find_all('option'):
            txt = opt.text.strip()
            if txt and txt.lower() not in ['select', '---select---', 'select one', '-select-', 'choose']:
                opts.append(txt)
        if opts:
            opt_str = " [" + ", ".join(opts) + "]"
            if len(opt_str) > 200:
                opt_str = " [" + ", ".join(opts[:5]) + ", ...]"
            label_text += opt_str

    if not label_text:
        label_text = name

    # cleanup label_text
    label_text = label_text.replace('*', '').strip()
    
    # Handle radio buttons properly
    if el.get('type') == 'radio':
        key_name = name
        lbl = el.find_next_sibling('span') or el.find_parent('label')
        if lbl:
            val_text = lbl.text.strip()
        else:
            val_text = el.get('value', '')
        
        if key_name not in fields:
            # We construct a main label
            parent_td = el.find_parent('td')
            main_label = name
            if parent_td:
                prev_td = parent_td.find_previous_sibling('td')
                if prev_td:
                    main_label = prev_td.text.strip().replace('*', '').replace('\n', '')
            fields[key_name] = {
                "name": key_name,
                "label": main_label
            }
        
    else:
        # Avoid overriding with empty
        if name in fields and not label_text:
            pass
        else:
            fields[name] = {
                "name": name,
                "label": label_text
            }
            dummy_data[name] = ""

# Let's fix some keys
final_fields = {}
for k, v in fields.items():
    # normalize key (valid js property)
    key_prop = k.replace('.', '_').replace('[', '_').replace(']', '')
    final_fields[key_prop] = v

print("Generated mapping for", len(final_fields), "fields")

js_template = f"""// Indian Visa Application Field Definitions
export const INDIAN_VISA_FIELDS = {json.dumps(final_fields, indent=4)};

export const INDIAN_VISA_DUMMY_PROFILE = {{
    id: 'profile_indian_visa_demo',
    name: 'Indian Visa (Demo)',
    site: 'indian_visa',
    profilePic: null,
    data: {json.dumps(dummy_data, indent=4)}
}};
"""

open('modules/indian_visa_config.js', 'w', encoding='utf-8').write(js_template)
