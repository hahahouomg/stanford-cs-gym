import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {catalog,assignments} from '../data/catalog.js';
import {knowledge,nodeById} from '../data/knowledge.js';
import {reviews} from '../data/curriculum.js';
import {studyGuides,studyRoutes} from '../data/study-guides.js';
import {unitReadings,nodeReadings,collectionReadings,noteSource} from '../data/readings.js';
assert.equal(new Set(knowledge.map(n=>n.id)).size,knowledge.length);
assert.equal(new Set(reviews.map(r=>r.id)).size,reviews.length);
assert.equal(knowledge.length,17);assert.equal(reviews.length,29);
assert.equal(knowledge.filter(n=>n.demo).length,10);
for(const [course,c] of Object.entries(catalog)){
  for(const u of c.units){
    for(const id of u.nodeIds)assert(nodeById.has(id),course+':'+u.id+' -> '+id);
    const route=studyRoutes[course]?.[u.id];
    if(route){assert.equal(route.tasks.length,u.nodeIds.length);for(const id of u.nodeIds)assert(studyGuides[id]);assert(c.units.some(n=>n.id===route.next));}
    if(route)assert(assignments[course].some(a=>a.id===route.assignmentId));
  }
}
for(const n of knowledge)for(const id of n.reviewIds)assert(reviews.some(r=>r.id===id),n.id+' -> '+id);
for(const [id,g] of Object.entries(studyGuides)){
  assert(nodeById.has(id));assert(nodeReadings[id]?.length);assert.equal(g.example.steps.length,3);assert(g.checks.length&&g.pitfall);
}
assert.equal(Object.keys(unitReadings.CS231n).length,18);
assert.equal(Object.keys(unitReadings.CS336).length,17);
assert(!unitReadings.CS336.lecture18&&!unitReadings.CS336.lecture19);
assert(!unitReadings.CS329A.lecture7);
for(const [unit,note] of [[8,7],[17,8],[20,9]])assert(unitReadings.CS329A['lecture'+unit][0].url.includes('lecture0'+note));
assert(readFileSync(new URL('../licenses/ai-course-notes.txt',import.meta.url),'utf8').includes(noteSource.commit));
const all=[...Object.values(unitReadings).flatMap(v=>Object.values(v).flat()),...Object.values(nodeReadings).flat(),...Object.values(collectionReadings).flat()];
for(const r of all){const u=new URL(r.url);assert.equal(u.protocol,'https:');assert.equal(u.hostname,'hqhq1025.github.io');}
console.log('PASS: content IDs, routes, 17 nodes / 10 labs / 29 reviews, guide references, version boundaries and source attribution.');
if(process.argv.includes('--links')){
  // Optional maintainer check; never runs in the app or hermetic browser tests.
  const script=String.raw`
import sys,json,urllib.request,urllib.parse,re,html
from concurrent.futures import ThreadPoolExecutor
groups={}
for url in json.load(sys.stdin):
    page,anchor=urllib.parse.urldefrag(url)
    groups.setdefault(page,set()).add(anchor)
def check(item):
    url,anchors=item
    with urllib.request.urlopen(url,timeout=30) as r:
        assert r.status==200,url
        text=r.read().decode()
    assert '<article' in text,url
    ids=set(html.unescape(s) for s in re.findall(r'\bid="([^"]+)"',text))
    for anchor in anchors:
        assert not anchor or anchor in ids,url+'#'+anchor
    if '/lecture' in url:
        title=re.search(r'<h1\b[^>]*>(.*?)</h1>',text,re.S).group(1).lower()
        course=urllib.parse.urlsplit(url).path.split('/')[2]
        assert course in title,url+' unexpected title'
    return url
with ThreadPoolExecutor(max_workers=6) as pool:
    checked=list(pool.map(check,groups.items()))
print('PASS: '+str(len(checked))+' online reading pages and every referenced chapter anchor.')
`;
  const r=spawnSync('python',['-c',script],{input:JSON.stringify([...new Set(all.map(r=>r.url))]),encoding:'utf8',maxBuffer:1024*1024});
  if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);assert.equal(r.status,0);
}
