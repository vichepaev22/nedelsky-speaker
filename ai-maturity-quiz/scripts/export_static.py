"""Export the accepted quiz to one self-contained, host-independent static bundle."""
from pathlib import Path
from types import SimpleNamespace
import argparse,ast,hashlib,json,re,sys
from jinja2 import Environment,FileSystemLoader,select_autoescape

parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=Path(__file__).resolve().parent.parent)
parser.add_argument('--web',type=Path)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
root=args.source.resolve();web=(args.web or root/'web').resolve();out=args.out.resolve()
out.mkdir(parents=True,exist_ok=True);assets=out/'static';assets.mkdir(exist_ok=True)
sys.path.insert(0,str(root))
from app.questions import ALL_QUESTIONS,QUESTIONS,CHAPTERS,public_question
from app.content import LEVELS,DIMENSIONS,GATE_TEXT,GOALS,ROLE_CONTEXT,TRANSITIONS

env=Environment(loader=FileSystemLoader(root/'app/templates'),autoescape=select_autoescape(['html']))
settings=SimpleNamespace(site_url='..',consultation_url='https://vk.ru/ndlsky',diagnostic_url='',ttl_seconds=86400)
base=dict(settings=settings,session={'csrf':'','started':False},focus=False)
def render(name,**values):return env.get_template(name).render(**(base|values))
def normalize(html):
    html=re.sub(r'<input\b[^>]*name="csrf"[^>]*>','',html)
    html=html.replace('/static/','static/')
    html=re.sub(r'href="/quiz/(\d+)"',r'href="#/q/\1"',html)
    html=re.sub(r'href="/chapter/(\d+)"',r'href="#/chapter/\1"',html)
    html=html.replace('href="/"','href="#/"').replace('href="/result"','href="#/result"')
    html=html.replace('action="/start" method="post"','data-action="start" action="#/q/0" method="get"')
    html=html.replace('action="/restart" method="post"','data-action="restart" action="#/" method="get"')
    html=re.sub(r'action="/answer/(\d+)" method="post"',r'data-action="answer" data-step="\1" action="#/q/\1" method="get"',html)
    return html
def view(html):
    match=re.search(r'<main id="main" class="([^"]*)">(.*?)</main>',normalize(html),re.S)
    assert match,'Main content missing'
    return {'className':match[1],'html':match[2]}

cover=normalize(render('index.html',expired=False))
cover=re.sub(r'<p class="storage-note">Не экзамен и не сертификат\..*?</p>','<p class="storage-note">Не экзамен и не сертификат. Ответы не отправляются на сервер. Прогресс сохраняется в этой вкладке до 24 часов; без доступа к хранилищу можно пройти тест без обновления страницы. Контакты не нужны.</p>',cover,flags=re.S)
cover=cover.replace('{%','')
# Always render the optional restart control; runtime exposes it only for an active quiz.
restart='<form data-action="restart" action="#/" method="get" class="inline-form"><button class="text-button" type="submit">Начать новый тест</button></form>'
cover=cover.replace('<p class="cover-note">',restart+'<p class="cover-note">',1)
views={'cover':view(cover),'questions':[],'chapters':{},'results':{}}
for step,q in enumerate(ALL_QUESTIONS):
    views['questions'].append(view(render('question.html',step=step,q=public_question(q),selected=None,error='',chapters=CHAPTERS,chapter=max(0,(step-3)//4),progress=max(0,step-3))))
for number,transition in enumerate(TRANSITIONS,1):
    views['chapters'][number]=view(render('chapter.html',number=number,next_step=3+number*4,transition=transition))
template_source=(root/'app/templates/result.html').read_text(encoding='utf-8')
steps=ast.literal_eval(re.search(r'{% set step_details = (.*?)%}',template_source,re.S)[1].strip())
for number,level in LEVELS.items():
    result={'index':'__RESULT_INDEX__','level':number,'blocks':{c:f'__BLOCK_{c}__' for c in 'BPSA'},'strength':'B','growth':'P','gate_gap':None}
    views['results'][number]=view(render('result.html',result=result,level=level,dimensions=DIMENSIONS,gate_text=GATE_TEXT,goal=GOALS['A'],role_context=ROLE_CONTEXT['A'],product_url=f'../ai-for-business/?product={level["slug"]}#details-{level["slug"]}'))

data={'ALL_QUESTIONS':ALL_QUESTIONS,'QUESTIONS':QUESTIONS,'LEVELS':LEVELS,'DIMENSIONS':DIMENSIONS,'GATE_TEXT':GATE_TEXT,'GOALS':GOALS,'ROLE_CONTEXT':ROLE_CONTEXT,'STEP_DETAILS':steps}
(assets/'data.mjs').write_text('\n'.join(f'export const {name}={json.dumps(value,ensure_ascii=False,separators=(",",":"))};' for name,value in data.items())+'\n',encoding='utf-8')
(assets/'views.mjs').write_text('export const VIEWS='+json.dumps(views,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

def scoped(text,name,kind):
    text=text.replace('\r\n','\n').replace('\r','\n')
    imports=''
    while text.startswith('import ' ) or text.startswith('import{'):
        line,text=text.split('\n',1);imports+=line+'\n'
    if kind=='ui':
        text=text.replace('"use strict";\n','',1)
        start=text.index('  if (form) {');end=text.index('  const save =',start)
        text=text[:start]+text[end:]
        text=text.replace('  const form = document.querySelector(".answer-form");\n','')
        text=text.replace('(() => {','',1)
        assert text.rstrip().endswith('})();')
        text=text.rstrip()[:-5]
    # Convert existing listeners to a scoped AbortController so SPA navigation disposes them.
    text=text.replace('firstChapter.querySelector("[data-begin-chapter]").addEventListener(', 'listen(firstChapter.querySelector("[data-begin-chapter]"),')
    text=text.replace('document.getElementById("delete-saved").addEventListener(', 'listen(document.getElementById("delete-saved"),')
    text=re.sub(r'\b([a-zA-Z_]\w*)\.addEventListener\(',r'listen(\1,',text)
    assert '.addEventListener(' not in text,kind
    if kind=='chapter':
        text=text.replace('if(section.hidden)return;','if(!section.isConnected||section.hidden)return;')
        i=text.rfind('\n}')
        text=text[:i]+'\n  cleanup=()=>{stop();cancelInvitation();observer.disconnect();};'+text[i:]
    if kind=='disclosure':
        i=text.rfind('\n}')
        text=text[:i]+'\n  cleanup=()=>settle(desiredOpen);'+text[i:]
    if kind=='offers':
        anchor="observer.observe(section.querySelector('.offer-grid'));"
        assert anchor in text
        text=text.replace(anchor,anchor+'\n    cleanup=()=>{observer.disconnect();cancelMotion();};')
    if kind=='offer':
        i=text.rfind('\n}')
        text=text[:i]+'\n  cleanup=()=>{clearInterval(interval);interval=0;};'+text[i:]
    helper=f'''export function {name}() {{
  const controller=new AbortController();
  let cleanup=()=>{{}};
  function listen(target,event,handler,options={{}}){{target.addEventListener(event,handler,{{...options,signal:controller.signal}});}}
'''
    return imports+helper+text+'\n  return ()=>{controller.abort();cleanup();};\n}\n'

effects=[('app.js','ui.mjs','mountUI','ui'),('chapter-motion.js','chapter.mjs','mountChapter','chapter'),('result-disclosure.js','disclosure.mjs','mountDisclosure','disclosure'),('offers-motion.js','offers.mjs','mountOffers','offers'),('result-offer.js','offer.mjs','mountOffer','offer')]
for original,target,function,kind in effects:
    source=(root/'app/static'/original).read_text(encoding='utf-8')
    (assets/target).write_text(scoped(source,function,kind),encoding='utf-8')
for name in ['styles.css','offers.css','result-disclosure.css','favicon.svg','chapter-physics.mjs','roadmap-offer.mjs']:
    (assets/name).write_bytes((root/'app/static'/name).read_bytes())
for name in ['runtime.mjs','domain.mjs']:(assets/name).write_bytes((web/name).read_bytes())
cover=re.sub(r'<script\b[^>]*>.*?</script>','',cover,flags=re.S)
cover=cover.replace('</head>','<meta name="quiz-build" content="quiz-2026-10-28"><meta name="description" content="Бесплатная диагностика вашей практики работы с ИИ. 16 ситуаций, четыре направления и три шага на неделю."><link rel="stylesheet" href="static/offers.css"><link rel="stylesheet" href="static/result-disclosure.css"><script type="module" src="static/runtime.mjs"></script></head>')
cover=cover.replace('</body>','<noscript><p class="notice">Для интерактивного теста включите JavaScript. Здесь нет регистрации и передачи ответов на сервер.</p></noscript></body>')
cover=cover.replace('<button class="button primary" type="submit">','<button class="button primary" type="submit">',1)
(out/'index.html').write_text(cover,encoding='utf-8')
(out/'.nojekyll').write_text('',encoding='utf-8')
manifest={str(p.relative_to(out)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name!='build-manifest.json'}
(out/'build-manifest.json').write_text(json.dumps({'revision':'quiz-2026-10-28','files':manifest},indent=2),encoding='utf-8')
assert not any('/answer/' in v['html'] for v in views['questions'])
assert not any('csrf' in v['html'] for v in views['questions'])
print(f'Exported {len(manifest)} static files, 19 questions, 3 chapters and 4 result variants.')
