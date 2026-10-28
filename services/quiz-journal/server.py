"""Small first-party quiz journal. No third-party packages or raw answer storage."""
from __future__ import annotations
import base64,csv,hashlib,hmac,io,json,os,re,sqlite3,threading,time
from contextlib import contextmanager
from collections import defaultdict,deque
from datetime import datetime,timedelta,timezone
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs,urlsplit

PREFIX='/quiz-stats/'
ORIGIN='https://vichepaev22.github.io'
ID=re.compile(r'^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
STAGES={'cover','profile','chapter','question','result'}
MAX_BODY=1500
def validate(value):
    required={'visitId','visitorId','quizId','revision','stage','step','sequence','level'}
    if not isinstance(value,dict) or set(value)!=required:raise ValueError('Invalid event fields')
    if any(not isinstance(value[key],str) or not ID.fullmatch(value[key]) for key in ['visitId','visitorId']):raise ValueError('Invalid identifier')
    if value['quizId']!='ai-maturity' or not isinstance(value['revision'],str) or not re.fullmatch(r'quiz-[a-zA-Z0-9-]{1,40}',value['revision']):raise ValueError('Invalid quiz')
    if value['stage'] not in STAGES:raise ValueError('Invalid stage')
    if type(value['step']) is not int or not 0<=value['step']<=19:raise ValueError('Invalid step')
    if type(value['sequence']) is not int or not 1<=value['sequence']<=100000:raise ValueError('Invalid sequence')
    if value['stage']=='result':
        if value['step']!=19 or type(value['level']) is not int or not 1<=value['level']<=4:raise ValueError('Invalid result')
    elif value['level'] is not None:raise ValueError('Level is allowed only on result')
    if value['stage']=='cover' and value['step']!=0:raise ValueError('Invalid cover')
    if value['stage']=='profile' and not 1<=value['step']<=3:raise ValueError('Invalid profile step')
    if value['stage']=='question' and not 4<=value['step']<=19:raise ValueError('Invalid question step')
    if value['stage']=='chapter' and value['step'] not in [3,7,11,15]:raise ValueError('Invalid chapter')
    return value

class Journal:
    def __init__(self,path,clock=time.time):
        self.path=Path(path);self.path.parent.mkdir(parents=True,exist_ok=True);self.clock=clock
        self.lock=threading.Lock();self.last_prune=0
        with self.connection() as db:
            db.execute('PRAGMA journal_mode=WAL')
            db.execute('''CREATE TABLE IF NOT EXISTS visits(
              visit_id TEXT PRIMARY KEY,visitor_id TEXT NOT NULL,quiz_id TEXT NOT NULL,revision TEXT NOT NULL,
              first_at TEXT NOT NULL,last_at TEXT NOT NULL,stage TEXT NOT NULL,step INTEGER NOT NULL,
              sequence INTEGER NOT NULL,level INTEGER,completed_at TEXT)''')
            db.execute('CREATE INDEX IF NOT EXISTS visits_last_at ON visits(last_at)')
    @contextmanager
    def connection(self):
        db=sqlite3.connect(self.path,timeout=5);db.row_factory=sqlite3.Row
        try:
            with db:yield db
        finally:db.close()
    def timestamp(self,ago=0):return datetime.fromtimestamp(self.clock()-ago,timezone.utc).isoformat(timespec='seconds')
    def save(self,value):
        value=validate(value);stamp=self.timestamp()
        with self.lock,self.connection() as db:
            row=db.execute('SELECT visitor_id,quiz_id,sequence FROM visits WHERE visit_id=?',(value['visitId'],)).fetchone()
            if row and (row['visitor_id']!=value['visitorId'] or row['quiz_id']!=value['quizId'] or row['sequence']>=value['sequence']):return False
            db.execute('''INSERT INTO visits VALUES(?,?,?,?,?,?,?,?,?,?,?)
              ON CONFLICT(visit_id) DO UPDATE SET revision=excluded.revision,last_at=excluded.last_at,
              stage=excluded.stage,step=excluded.step,sequence=excluded.sequence,
              level=COALESCE(excluded.level,visits.level),completed_at=COALESCE(visits.completed_at,excluded.completed_at)''',
              (value['visitId'],value['visitorId'],value['quizId'],value['revision'],stamp,stamp,value['stage'],value['step'],value['sequence'],value['level'],stamp if value['stage']=='result' else None))
            if self.clock()-self.last_prune>3600:
                db.execute('DELETE FROM visits WHERE last_at<?',(self.timestamp(30*86400),));self.last_prune=self.clock()
                db.execute('DELETE FROM visits WHERE visit_id IN (SELECT visit_id FROM visits ORDER BY last_at DESC LIMIT -1 OFFSET 50000)')
            return True
    def prune(self):
        with self.lock,self.connection() as db:
            db.execute('DELETE FROM visits WHERE last_at<?',(self.timestamp(30*86400),))
            db.execute('DELETE FROM visits WHERE visit_id IN (SELECT visit_id FROM visits ORDER BY last_at DESC LIMIT -1 OFFSET 50000)')
            self.last_prune=self.clock()
    def rows(self,days=7):
        if days not in [1,7,30]:raise ValueError('Invalid period')
        with self.lock,self.connection() as db:
            return [dict(row) for row in db.execute('SELECT * FROM visits WHERE last_at>=? ORDER BY last_at DESC LIMIT 500',(self.timestamp(days*86400),))]

class Limiter:
    def __init__(self):self.entries=defaultdict(deque);self.lock=threading.Lock()
    def allow(self,key,limit=300):
        now=time.monotonic()
        with self.lock:
            if len(self.entries)>2048:
                self.entries=defaultdict(deque,{k:v for k,v in self.entries.items() if v and v[-1]>now-60})
            q=self.entries[key]
            while q and q[0]<=now-60:q.popleft()
            if len(q)>=limit:return False
            q.append(now);return True

def make_handler(journal,password_hash,username='owner',assets=None):
    assets=Path(assets or Path(__file__).parent/'admin');limiter=Limiter()
    class Handler(BaseHTTPRequestHandler):
        server_version='QuizJournal'
        sys_version=''
        def log_message(self,*args):pass  # No IPs, credentials or request bodies in app logs.
        def reply(self,status,body=b'',mime='application/json',cors=False,extra=None):
            if isinstance(body,str):body=body.encode('utf-8')
            self.send_response(status);self.send_header('Content-Type',mime+'; charset=utf-8');self.send_header('Content-Length',str(len(body)))
            self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('X-Frame-Options','DENY')
            self.send_header('Content-Security-Policy',"default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
            if cors:self.send_header('Access-Control-Allow-Origin',ORIGIN);self.send_header('Vary','Origin')
            for k,v in (extra or {}).items():self.send_header(k,v)
            self.end_headers()
            if body:self.wfile.write(body)
        def auth(self):
            try:
                header=self.headers.get('Authorization','')
                if len(header)>1024 or not header.startswith('Basic '):raise ValueError()
                user,secret=base64.b64decode(header[6:],validate=True).decode('utf-8').split(':',1)
                good=hmac.compare_digest(user,username) and hmac.compare_digest(hashlib.sha256(secret.encode()).hexdigest(),password_hash)
            except (ValueError,UnicodeError,TypeError):good=False
            if not good:
                self.reply(401,'{"error":"authentication_required"}',extra={'WWW-Authenticate':'Basic realm="Private quiz journal", charset="UTF-8"'})
            return good
        def do_OPTIONS(self):
            if self.path!=PREFIX+'events' or self.headers.get('Origin')!=ORIGIN:return self.reply(403,'{}')
            self.reply(204,cors=True,extra={'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'})
        def do_POST(self):
            if self.path!=PREFIX+'events':return self.reply(404,'{}')
            if self.headers.get('Origin')!=ORIGIN:return self.reply(403,'{}')
            client=self.headers.get('X-Real-IP',self.client_address[0])
            if not limiter.allow(('events',client)):return self.reply(429,'{}',cors=True)
            try:
                length=int(self.headers.get('Content-Length','0'))
                if not 0<length<=MAX_BODY:return self.reply(413,'{}',cors=True)
                if self.headers.get_content_type() not in ['application/json','text/plain']:return self.reply(415,'{}',cors=True)
                data=json.loads(self.rfile.read(length));journal.save(data)
            except (ValueError,UnicodeError,TypeError):return self.reply(400,'{"error":"invalid_event"}',cors=True)
            except sqlite3.Error:return self.reply(503,'{"error":"temporarily_unavailable"}',cors=True)
            self.reply(204,cors=True)
        def do_GET(self):
            url=urlsplit(self.path)
            if url.path==PREFIX+'health':return self.reply(200,'{"ok":true}')
            allowed={PREFIX:'index.html',PREFIX+'index.html':'index.html',PREFIX+'admin.css':'admin.css',PREFIX+'admin.mjs':'admin.mjs'}
            if url.path not in {*allowed,PREFIX+'visits.json',PREFIX+'visits.csv'}:return self.reply(404,'{}')
            if not limiter.allow(('admin',self.client_address[0]),120):return self.reply(429,'{}')
            if not self.auth():return
            if url.path in allowed:
                name=allowed[url.path];mime='text/css' if name.endswith('.css') else 'text/javascript' if name.endswith('.mjs') else 'text/html'
                return self.reply(200,(assets/name).read_bytes(),mime)
            try:rows=journal.rows(int(parse_qs(url.query).get('days',['7'])[0]))
            except ValueError:return self.reply(400,'{}')
            if url.path.endswith('.json'):return self.reply(200,json.dumps({'visits':rows,'retentionDays':30},ensure_ascii=False))
            output=io.StringIO();writer=csv.writer(output,delimiter=';');writer.writerow(['Посетитель','Визит','Первый заход UTC','Последняя активность UTC','Тест','Версия','Экран','Шаг из 19','Уровень','Завершён UTC'])
            for row in rows:writer.writerow([row[k] for k in ['visitor_id','visit_id','first_at','last_at','quiz_id','revision','stage','step','level','completed_at']])
            self.reply(200,'\ufeff'+output.getvalue(),'text/csv',extra={'Content-Disposition':'attachment; filename="quiz-visits.csv"'})
    return Handler

def main():
    password_hash=os.environ.get('QUIZ_ADMIN_PASSWORD_SHA256','')
    if not re.fullmatch(r'[a-f0-9]{64}',password_hash):raise RuntimeError('Admin password hash is required')
    journal=Journal(os.environ.get('QUIZ_JOURNAL_DB','/var/lib/nedelsky-quiz-stats/visits.sqlite3'))
    server=ThreadingHTTPServer(('127.0.0.1',int(os.environ.get('QUIZ_JOURNAL_PORT','8768'))),make_handler(journal,password_hash))
    def maintenance():
        while True:
            journal.prune()
            time.sleep(3600)
    threading.Thread(target=maintenance,daemon=True).start()
    server.daemon_threads=True;server.serve_forever()
if __name__=='__main__':main()
