with open('options.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('initialData = { ...BDRIS_FIELDS };', 'initialData = { ...BDRIS_DUMMY_PROFILE.data };')

with open('options.js', 'w', encoding='utf-8') as f:
    f.write(text)
