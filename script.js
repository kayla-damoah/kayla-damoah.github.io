// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Pipeline demo
const stage = document.getElementById('newStage');
const badge = document.getElementById('prBadge');
const note = document.getElementById('pipeNote');
document.getElementById('breakBtn').onclick = () => {
  stage.className = 'stage fail';
  stage.innerHTML = 'Run tool on sample<small>failed</small>';
  badge.className = 'badge good';
  badge.textContent = 'Pull request: can still merge';
  note.textContent = 'The stage is red and the artifacts are archived for inspection, but unrelated work keeps moving. Once the check proves reliable, it can become a gate.';
};
document.getElementById('resetBtn').onclick = () => {
  stage.className = 'stage soft';
  stage.innerHTML = 'Run tool on sample<small>non-blocking</small>';
  badge.textContent = 'Pull request: can merge';
  note.textContent = 'The new stage runs the freshly built tool against a sample recording on every pull request.';
};

// Log classifier demo (all data is invented)
const scenarios = {
  'Clean pass': {
    log: ['t=0.00 attempt=1 start', 't=0.41 frames=3 quality=ok', 't=0.52 match score=0.97', 't=0.53 result=unlock'],
    rule: 'matched on the first attempt, score above threshold', verdict: 'PASS', kind: 'good', label: 'Fast pass'
  },
  'Slow pass': {
    log: ['t=0.00 attempt=1 start', 't=0.38 frames=3 quality=low', 't=0.40 attempt=1 rejected reason=quality', 't=0.41 attempt=2 start', 't=0.95 frames=4 quality=ok', 't=1.02 match score=0.94', 't=1.03 result=unlock'],
    rule: 'first attempt rejected on quality, second attempt matched', verdict: 'PASS', kind: 'good', label: 'Slow pass (second attempt)'
  },
  'Low coverage': {
    log: ['t=0.00 attempt=1 start', 't=0.40 frames=3 coverage=0.52', 't=0.42 attempt=1 rejected reason=low_coverage', 't=0.43 attempt=2 start', 't=0.90 frames=3 coverage=0.55', 't=0.93 result=fail reason=low_coverage'],
    rule: 'coverage stayed under threshold on both attempts', verdict: 'FAIL', kind: 'bad', label: 'Expected fail (low coverage)'
  },
  'Timeout': {
    log: ['t=0.00 attempt=1 start', 't=2.00 no frames received', 't=5.00 timeout', 't=5.01 result=fail reason=timeout'],
    rule: 'no frames arrived before the deadline', verdict: 'FAIL', kind: 'bad', label: 'Unexpected fail (timeout)'
  }
};
const tabs = document.getElementById('tabs');
const logBox = document.getElementById('logBox');
const verdict = document.getElementById('verdict');
let timer;
function run(name, btn) {
  clearTimeout(timer);
  tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
  const s = scenarios[name];
  logBox.textContent = ''; verdict.className = 'verdict'; verdict.textContent = '';
  let i = 0;
  (function next() {
    if (i < s.log.length) { logBox.textContent += s.log[i++] + '\n'; timer = setTimeout(next, 280); }
    else {
      verdict.className = 'verdict show ' + s.kind;
      verdict.innerHTML = '<b>' + s.verdict + '</b> · ' + s.label + '<small>Why: ' + s.rule + '</small>';
    }
  })();
}
Object.keys(scenarios).forEach((n, idx) => {
  const b = document.createElement('button');
  b.className = 'btn'; b.textContent = n;
  b.onclick = () => run(n, b);
  tabs.appendChild(b);
  if (idx === 0) run(n, b);
});
