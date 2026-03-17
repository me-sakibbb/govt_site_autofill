import jsonimport json

import re

with open('teletalk_extracted2.json', 'r', encoding='utf-8') as f:

    fields = json.load(f)with open('teletalk_extracted2.json', 'r', encoding='utf-8') as f:

    fields = json.load(f)

def to_camel(s):

    s = s.replace('[', '_').replace(']', '')def to_camel(s):

    parts = s.split('_')    # If the string contains brackets, replace them

    return parts[0] + ''.join(x.title() for x in parts[1:])    s = s.replace('[', '_').replace(']', '')

    parts = s.split('_')

new_fields = {}    return parts[0] + ''.join(x.title() for x in parts[1:])

dummy_data = {}

for html_name, data in fields.items():new_fields = {}

    if data['label'] == 'agree' or data['label'] == 'captcha' or 'value' in html_name or 'Refresh' in data['label']:dummy_data = {}

        continuefor html_name, data in fields.items():

        if data['label'] == 'agree' or data['label'] == 'captcha' or 'value' in html_name or hasattr(data['label'], 'find') and 'Refresh' in data['label']:

    key = to_camel(html_name)        continue

    label = data['label'].strip()    

    label = " ".join(label.split())    key = to_camel(html_name)

    if "Refresh" in label:    label = data['label'].strip()

        continue    # remove newlines

    label = " ".join(label.split())

    new_fields[key] = {    if "Refresh" in label:

        "name": html_name,        continue

        "label": label

    }    new_fields[key] = {

    dummy_data[key] = ""        "name": html_name,

        "label": label

with open('modules/teletalk_config.js', 'w', encoding='utf-8') as f:    }

    f.write("export const TELETALK_FIELDS = " + json.dumps(new_fields, indent=4) + ";\n\n")    dummy_data[key] = ""

    

    dummy = {print("export const TELETALK_FIELDS = " + json.dumps(new_fields, indent=4) + ";\n")

        "id": "teletalk_dummy",

        "name": "Teletalk Dummy Profile",dummy = {

        "site": "teletalk",    "id": "teletalk_dummy",

        "data": dummy_data    "name": "Teletalk Dummy Profile",

    }    "site": "teletalk",

        "data": dummy_data

    f.write("export const TELETALK_DUMMY_PROFILE = " + json.dumps(dummy, indent=4) + ";\n")}


print("export const TELETALK_DUMMY_PROFILE = " + json.dumps(dummy, indent=4) + ";\n")
