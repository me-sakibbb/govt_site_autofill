import json
import bs4
import re

html = open('site_3.txt', encoding='utf-8').read()
soup = bs4.BeautifulSoup(html, 'html.parser')

selects = soup.find_all('select')

options_map = {}
for sel in selects:
    name = sel.get('name')
    if not name:
        name = sel.get('id')
    if not name: continue
    
    options = []
    for opt in sel.find_all('option'):
        txt = opt.text.strip()
        if txt and txt.lower() not in ['select', '---select---', 'select one', '-select-', 'choose']:
            options.append(txt)
    if options:
        options_map[name] = options

content = open('modules/indian_visa_config.js', encoding='utf-8').read()

# Extract INDIAN_VISA_FIELDS
match = re.search(r'export const INDIAN_VISA_FIELDS = (\{.*?\});\n', content, re.DOTALL)
if match:
    fields_json = match.group(1)
    # The JSON might have some trailing commas or comments, but let's assume it's clean enough or use a dirty json loader.
    # Actually, ast.literal_eval or json won't work perfectly if it's strictly JS. We'll try json.loads.
    try:
        fields = json.loads(fields_json)
        for key, data in fields.items():
            html_name = data.get('name', '')
            if html_name in options_map:
                opts = options_map[html_name]
                opt_str = " [" + ", ".join(opts) + "]"
                if len(opt_str) > 200:
                    opt_str = " [" + ", ".join(opts[:5]) + ", ...]"
                data['label'] = data['label'].split(' [')[0] + opt_str

        new_fields_json = json.dumps(fields, indent=4)
        new_content = content[:match.start(1)] + new_fields_json + content[match.end(1):]
        open('modules/indian_visa_config.js', 'w', encoding='utf-8').write(new_content)
        print("Updated INDIAN_VISA_FIELDS successfully.")
    except Exception as e:
        print("Failed to parse JSON:", e)
else:
    print("Could not find INDIAN_VISA_FIELDS.")
