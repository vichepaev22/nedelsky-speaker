import base64,hashlib,http.client,json,tempfile,threading,unittest,uuid
from pathlib import Path
from http.server import ThreadingHTTPServer
from server import Journal,make_handler,validate,ORIGIN

def event(**changes):
    value={'visitId':str(uuid.uuid4()),'visitorId':str(uuid.uuid4()),'quizId':'ai-maturity','revision':'quiz-2026-10-28-r18','stage':'profile','step':1,'sequence':1,'level':None};value.update(changes);return value

class JournalTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.now=1793200000;self.db=Journal(Path(self.tmp.name)/'isolated.sqlite3',lambda:self.now)
    def tearDown(self):self.tmp.cleanup()
    def test_minimal_idempotent_out_of_order_and_result_updates(self):
        first=event();self.assertTrue(self.db.save(first));self.assertFalse(self.db.save(first))
        later={**first,'sequence':3,'stage':'question','step':10};self.now+=20;self.assertTrue(self.db.save(later));self.assertFalse(self.db.save({**first,'sequence':2,'step':2}))
        completed={**first,'sequence':4,'stage':'result','step':19,'level':2};self.db.save(completed)
        self.db.save({**first,'sequence':5,'stage':'question','step':6});row=self.db.rows()[0]
        self.assertEqual(row['step'],6);self.assertEqual(row['level'],2);self.assertIsNotNone(row['completed_at']);self.assertNotEqual(row['first_at'],row['last_at'])
        self.assertEqual(set(row),{'visit_id','visitor_id','quiz_id','revision','first_at','last_at','stage','step','sequence','level','completed_at'})
    def test_rejects_raw_answers_contacts_invalid_stage_and_incomplete_result(self):
        for patch in [{'answers':{'B01':'A'}},{'email':'user@mail.ru'},{'step':True},{'step':20},{'stage':'result','step':18,'level':1},{'visitorId':'<script>'},{'stage':'profile','step':8},{'stage':'question','step':2},{'stage':'cover','step':5},{'revision':'bad\nrevision'}]:
            with self.assertRaises((ValueError,TypeError)):validate(event(**patch))
        self.assertEqual(self.db.rows(),[])
    def test_retention_and_visit_id_cannot_be_reassigned(self):
        first=event();self.db.save(first);self.assertFalse(self.db.save({**first,'visitorId':str(uuid.uuid4()),'sequence':2}));self.now+=31*86400;self.db.save(event());self.assertEqual(len(self.db.rows(30)),1)
    def test_retention_maintenance_without_new_visitors(self):
        self.db.save(event());self.now+=31*86400;self.db.prune()
        with self.db.connection() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM visits').fetchone()[0],0)
    def test_private_http_routes_origin_and_body_limits(self):
        secret='synthetic-local-password';server=ThreadingHTTPServer(('127.0.0.1',0),make_handler(self.db,hashlib.sha256(secret.encode()).hexdigest()));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        def request(method,path,body=None,headers=None):
            c=http.client.HTTPConnection(*server.server_address,timeout=3)
            try:c.request(method,path,body,headers or {});r=c.getresponse();return r.status,dict(r.getheaders()),r.read()
            finally:c.close()
        try:
            status,headers,body=request('GET','/quiz-stats/visits.json');self.assertEqual(status,401);self.assertEqual(headers['Cache-Control'],'no-store')
            self.assertEqual(request('GET','/quiz-stats/admin.mjs')[0],401)
            auth={'Authorization':'Basic '+base64.b64encode(('owner:'+secret).encode()).decode()}
            self.assertEqual(request('GET','/quiz-stats/visits.json',headers=auth)[0],200)
            self.assertEqual(request('GET','/quiz-stats/health')[0],200)
            value=event();body=json.dumps(value);good={'Origin':ORIGIN,'Content-Type':'text/plain'}
            self.assertEqual(request('POST','/quiz-stats/events',body,{**good,'Origin':'https://foreign.invalid'})[0],403)
            self.assertEqual(request('POST','/quiz-stats/events','x'*1600,good)[0],413)
            self.assertEqual(request('POST','/quiz-stats/events','{',good)[0],400)
            status,headers,_=request('POST','/quiz-stats/events',body,good);self.assertEqual(status,204);self.assertEqual(headers['Access-Control-Allow-Origin'],ORIGIN)
            status,headers,_=request('OPTIONS','/quiz-stats/events',headers={'Origin':ORIGIN});self.assertEqual(status,204);self.assertNotIn('Access-Control-Allow-Credentials',headers)
            status,headers,body=request('GET','/quiz-stats/visits.json?days=7',headers=auth);self.assertEqual(len(json.loads(body)['visits']),1);self.assertNotIn('Access-Control-Allow-Origin',headers)
            self.assertEqual(request('GET','/quiz-stats/visits.json?days=999',headers=auth)[0],400)
            self.assertEqual(request('GET','/quiz-stats/../../etc/passwd',headers=auth)[0],404)
        finally:server.shutdown();server.server_close();thread.join()
if __name__=='__main__':unittest.main()
