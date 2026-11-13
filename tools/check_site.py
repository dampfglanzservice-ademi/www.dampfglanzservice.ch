from pathlib import Path
from urllib.parse import urlsplit,unquote
from lxml import html
import json,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
quote_script = (root/'quote-request.js').read_text()
conditional_fields = {
 'package': ("pack=$('package')", "setName(pack,'Paket',Object.hasOwn(catalog,service.value)&&pack.value!=='custom')"),
 'cleaning-tier': ("tier=$('cleaning-tier')", "setName(tier,'Autoreinigung_Umfang',auto&&['basis','intensiv'].includes(tier.value))"),
 'condition': ("condition=$('condition')", "setName(condition,'Zustand',['normal','special'].includes(condition.value))"),
 'auto-handover': ("handover=$('auto-handover')", "setName(handover,'Auto_Uebergabe',auto&&handover.value!=='discuss')"),
}

def has_quote_mapping(control, form, tree):
 field_id = control.get('id')
 scripts = [urlsplit(src).path for src in tree.xpath('//script[@src]/@src')]
 if '/quote-request.js' not in scripts:
  return False
 if field_id in conditional_fields:
  binding, assignment = conditional_fields[field_id]
  return control.tag == 'select' and binding in quote_script and assignment in quote_script
 if field_id == 'customer-contact':
  return (
   control.tag == 'input' and control.get('type') == 'text'
   and len(form.xpath('.//input[@type="hidden" and @id="customer-email" and @name="email"]')) == 1
   and len(form.xpath('.//input[@type="hidden" and @id="customer-phone" and @name="Telefon"]')) == 1
   and "contact=$('customer-contact')" in quote_script
   and 'classifyContact(contact.value)' in quote_script
   and "$('customer-email').value=result?.email" in quote_script
   and "$('customer-phone').value=result?.phone" in quote_script
   and '!syncContact()' in quote_script
  )
 return False

sitemap = ET.parse(root/'sitemap.xml')
sitemap_paths = {urlsplit(loc.text).path for loc in sitemap.findall('.//{*}loc')}
errors=[];titles=set();descriptions=set();count=0
for file in root.rglob('*.html'):
 tree=html.fromstring(file.read_text());count+=1
 def expect(test,msg):
  if not test:errors.append(str(file.relative_to(root))+': '+msg)
 expect(len(tree.xpath('//h1'))==1,'must have exactly one H1')
 title=tree.xpath('string(//title)');expect(bool(title) and title not in titles,'missing/duplicate title');titles.add(title)
 diagnostic = file.relative_to(root).as_posix() == 'messdiagnose/index.html'
 if diagnostic:
  robots = tree.xpath('string(//meta[@name="robots"]/@content)')
  expect('noindex' in {token.strip().lower() for token in robots.split(',')}, 'diagnostic must be noindex')
  expect(not {'/messdiagnose', '/messdiagnose/', '/messdiagnose/index.html'} & sitemap_paths, 'diagnostic in acquisition sitemap')
 else:
  desc=tree.xpath('string(//meta[@name="description"]/@content)');expect(bool(desc) and desc not in descriptions,'missing/duplicate description');descriptions.add(desc)
  expect(len(tree.xpath('//link[@rel="canonical"]'))==1,'missing canonical')
 expect('```' not in file.read_text(),'Markdown fence rendered in page')
 ids=tree.xpath('//@id');expect(len(ids)==len(set(ids)),'duplicate IDs')
 for script in tree.xpath('//script[@type="application/ld+json"]'):
  try:json.loads(script.text)
  except Exception as e:errors.append(f'{file}: invalid JSON-LD {e}')
 for el in tree.xpath('//a[@href] | //img[@src] | //script[@src] | //link[@href]'):
  ref=el.get('href') or el.get('src');u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=root/unquote(u.path.lstrip('/')) if u.path.startswith('/') else file.parent/unquote(u.path)
  if not u.path:target=file
  if target.is_dir():target=target/'index.html'
  expect(target.exists(),'broken local link: '+ref)
  if u.fragment and target.exists() and target.suffix=='.html':expect(bool(html.fromstring(target.read_text()).xpath('//*[@id=$id]',id=u.fragment)),'missing anchor: '+ref)
 for image in tree.xpath('//img'):expect(image.get('alt') is not None and image.get('width') and image.get('height'),'image accessibility/dimensions')
 for form in tree.xpath('//form'):
  expect(form.get('method','').lower()=='post','form method not POST')
  if form.xpath('.//input[@type="file"]'):expect(form.get('enctype')=='multipart/form-data','photo form encoding missing')
  for input in form.xpath('.//input[not(@type="hidden") and not(@type="radio") and not(@type="checkbox") and not(@name="_honey")] | .//select | .//textarea'):
   quote = file.relative_to(root).as_posix() == 'offerte/index.html' and form.get('id') == 'quote-form'
   expect(input.get('name') or (quote and has_quote_mapping(input, form, tree)),
          'unnamed form input: '+(input.get('id') or input.tag))
   expect(input.xpath('ancestor::label') or (input.get('id') and form.xpath('.//label[@for=$id]',id=input.get('id'))),'unlabelled input')
if errors:print('\n'.join(errors));raise SystemExit(1)
print(f'{count} pages checked: metadata, JSON-LD, links, anchors, forms, images and sitemap passed.')
