import json
import bs4
import re

html = open('site_2.txt', encoding='utf-8').read()
soup = bs4.BeautifulSoup(html, 'html.parser')

selects = soup.find_all('select')

options_map = {}
for sel in selects:
    name = sel.get('name')
    if not name: continue
    options = []
    for opt in sel.find_all('option'):
        txt = opt.text.strip()
        if txt and txt.lower() != 'select':
            options.append(txt)
    if options:
        options_map[name] = options

# read teletalk_config.js
content = open('modules/teletalk_config.js', encoding='utf-8').read()

# Extract TELETALK_FIELDS
match = re.search(r'export const TELETALK_FIELDS = (\{.*?\});\n\nexport const TELETALK_DUMMY_PROFILE', content, re.DOTALL)
if match:
    fields_json = match.group(1)
    # clean up JS-specific stuff or just use json.loads if valid JSON
    # It should be valid JSON
    
    fields = json.loads(fields_json)
    for key, data in fields.items():
        html_name = data['name']
        if html_name in options_map:
            opts = options_map[html_name]
            # don't append if there's already a [] or () with exact options, but let's just append
            opt_str = " [" + ", ".join(opts) + "]"
            # limit length so we don't have all districts etc if it's too long
            if len(opt_str) > 200:
                # Truncate
                opt_str = " [" + ", ".join(opts[:5]) + ", ...]"
            # Add to label
            data['label'] = data['label'].split(' [')[0] + opt_str

    new_fields_json = json.dumps(fields, indent=4)
    new_content = content[:match.start(1)] + new_fields_json + content[match.end(1):]
    open('modules/teletalk_config.js', 'w', encoding='utf-8').write(new_content)
    print("Updated labels with dropdown options.")
else:
    print("Could not parse config.")
