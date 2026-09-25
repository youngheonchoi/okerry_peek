import { useEffect, useMemo, useState } from 'react'
import './App.css'

const trainingList = {
  left: [
    { name: '기본 피킹', description: '이동과 기울이기의 기본 순서를 익힙니다.', keys: 'A → Q → 복귀' },
    { name: '피킹 후 발사', description: '피킹한 뒤 조준과 발사까지 연결합니다.', keys: 'A → Q → ADS → FIRE' },
    { name: '복귀 포함', description: '발사 후 다시 엄폐물 뒤로 숨는 흐름입니다.', keys: 'A → Q → ADS → FIRE → 복귀' },
    { name: '앉았다 피킹', description: '앉기 상태를 섞은 피킹 입력입니다.', keys: 'CROUCH → A → Q → ADS → FIRE' },
    { name: '조준 후 피킹', description: '조준을 먼저 잡고 피킹하는 흐름입니다.', keys: 'ADS → A → Q → FIRE' },
    { name: '랜덤 좌각', description: '배운 패턴을 랜덤으로 섞어 반응합니다.', keys: '패턴 RANDOM' },
  ],
  right: [
    { name: '기본 피킹', description: '이동과 기울이기의 기본 순서를 익힙니다.', keys: 'D → E → 복귀' },
    { name: '피킹 후 발사', description: '피킹한 뒤 조준과 발사까지 연결합니다.', keys: 'D → E → ADS → FIRE' },
    { name: '복귀 포함', description: '발사 후 다시 엄폐물 뒤로 숨는 흐름입니다.', keys: 'D → E → ADS → FIRE → 복귀' },
    { name: '앉았다 피킹', description: '앉기 상태를 섞은 피킹 입력입니다.', keys: 'CROUCH → D → E → ADS → FIRE' },
    { name: '조준 후 피킹', description: '조준을 먼저 잡고 피킹하는 흐름입니다.', keys: 'ADS → D → E → FIRE' },
    { name: '랜덤 우각', description: '배운 패턴을 랜덤으로 섞어 반응합니다.', keys: '패턴 RANDOM' },
  ],
}

const labels = { left: '좌각 피킹', right: '우각 피킹', move: '무빙' }
const difficulties = ['초보자', '중급자', '상급자']

function Header({ onBack, onSettings, right }) {
  return <header className="header"><button className="brand" onClick={onBack}>okerry peek</button>{onSettings && <button className="settings-link" onClick={onSettings}>{right || 'Settings'}</button>}</header>
}

function App() {
  const [screen, setScreen] = useState('home')
  const [angle, setAngle] = useState('left')
  const [difficulty, setDifficulty] = useState('초보자')
  const [training, setTraining] = useState(trainingList.left[1])
  const [mode, setMode] = useState('guide')
  const [countdown, setCountdown] = useState(5)
  const [time, setTime] = useState(60)
  const [settings, setSettings] = useState({ front: 'W', back: 'S', left: 'A', right: 'D', fire: 'Mouse 1', crouch: 'C', crouchType: 'TOGGLE' })
  const [step, setStep] = useState(0)
  const [hits, setHits] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [lastInput, setLastInput] = useState('준비됨')

  useEffect(() => { if (!screen.includes('countdown')) return; setCountdown(5); const timer = window.setInterval(() => setCountdown(value => value - 1), 1000); return () => window.clearInterval(timer) }, [screen])
  useEffect(() => { if (screen.includes('countdown') && countdown <= 0) setScreen(mode === 'guide' ? 'guided' : 'rhythm') }, [countdown, mode, screen])
  useEffect(() => { if (screen !== 'guided' && screen !== 'rhythm') return; setTime(60); const timer = window.setInterval(() => setTime(value => value - 1), 1000); return () => window.clearInterval(timer) }, [screen])
  useEffect(() => { if ((screen === 'guided' || screen === 'rhythm') && time <= 0) setScreen('result') }, [screen, time])

  const beginAngle = key => { if (key === 'move') return; setAngle(key); setTraining(trainingList[key][1]); setScreen('select') }
  const beginMode = selected => { setMode(selected); setStep(0); setHits(0); setMistakes(0); setLastInput('준비됨'); setScreen(`${selected}-countdown`) }
  const remaining = `01:${String(Math.max(time, 0)).padStart(2, '0')}`
  const sequence = useMemo(() => training.keys.split(' → ').filter(item => !['복귀', 'RANDOM'].includes(item)), [training])
  const inputFor = item => ({ A: settings.left, D: settings.right, CROUCH: settings.crouch, Q: 'Q', E: 'E', ADS: 'Mouse 2', FIRE: settings.fire })[item] || item
  const expected = inputFor(sequence[step % sequence.length] || sequence[0])
  const recordInput = input => {
    if (screen !== 'guided' && screen !== 'rhythm') return
    setLastInput(input)
    if (input.toLowerCase() === expected.toLowerCase()) { setHits(value => value + 1); setStep(value => value + 1) } else setMistakes(value => value + 1)
  }
  const saveShortcut = (key, event) => {
    event.preventDefault()
    const value = event.key === ' ' ? 'Space' : event.key.length === 1 ? event.key.toUpperCase() : event.key
    setSettings(current => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    const onKey = event => recordInput(event.key.length === 1 ? event.key.toUpperCase() : event.key)
    const onMouse = event => recordInput(event.button === 0 ? 'Mouse 1' : event.button === 2 ? 'Mouse 2' : `Mouse ${event.button + 1}`)
    const blockMenu = event => { if (screen === 'guided' || screen === 'rhythm') event.preventDefault() }
    window.addEventListener('keydown', onKey); window.addEventListener('mousedown', onMouse); window.addEventListener('contextmenu', blockMenu)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouse); window.removeEventListener('contextmenu', blockMenu) }
  })

  if (screen === 'home') return <main className="app"><Header onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><section className="home page"><h1>PEEK TRAINER</h1><p className="subtitle">피킹 영상만 봐서는 어려운 입력 순서와 타이밍을 직접 따라하며 익혀보세요.</p><div className="angle-grid">{Object.entries(labels).map(([key, label]) => <article className="angle-card" key={key}><h2>{label}</h2><button className="primary" onClick={() => beginAngle(key)}>트레이닝 시작</button></article>)}</div><aside className="note"><strong>이 서비스에서 배우는 것</strong><p>1. 어떤 키를 먼저 누르는지　2. 얼마나 유지하는지　3. 언제 떼는지　4. 언제 조준하고 발사하는지</p><p>초보자는 느린 가이드부터 시작하고, 익숙해지면 실제 속도에 가까운 반복 훈련으로 넘어갑니다.</p></aside></section></main>

  if (screen === 'select') return <main className="app"><Header onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><section className="page select-page"><h1>{labels[angle]} 연습</h1><div className="filters">{difficulties.map(item => <button className={difficulty === item ? 'chip active' : 'chip'} key={item} onClick={() => setDifficulty(item)}>{item}</button>)}</div><div className="drill-grid">{trainingList[angle].map(item => <article className="drill-card" key={item.name}><h2>{item.name}</h2><p>{item.description}</p><code>{item.keys}</code><button className="text-action" onClick={() => { setTraining(item); setScreen('intro') }}>연습 시작　→</button></article>)}</div></section></main>

  if (screen === 'intro') return <main className="app"><Header onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><section className="page intro-page"><h1>{labels[angle]} {training.name}</h1><p className="subtitle">입력 순서와 각 키의 누름/유지/해제 타이밍을 먼저 확인하세요.</p><section className="panel sequence"><h3>입력 흐름</h3><div className="key-row">{sequence.map((key, index) => <span className="keycap" key={`${key}-${index}`}>{inputFor(key)}</span>)}</div><hr/><h4>타이밍 포인트</h4><p>{training.keys.replaceAll(' → ', ' 누름 → ')} 순서로 입력합니다.</p><p>앉기 타입은 현재 {settings.crouchType}으로 적용됩니다.</p></section><div className="mode-grid"><article className="mode-card"><div><h2>가이드 모드</h2><em>추천</em></div><p>현재 눌러야 할 키와 다음 키를 직접 입력하며 단계별로 진행합니다.</p><button className="primary" onClick={() => beginMode('guide')}>가이드 모드 시작</button></article><article className="mode-card"><div><h2>리듬 모드</h2><em>숙련용</em></div><p>고정 템포에서 입력 순서를 반복하고 정답·실수를 기록합니다.</p><button className="primary" onClick={() => beginMode('rhythm')}>리듬 모드 시작</button></article></div><section className="current-settings"><strong>현재 설정</strong><span>앞 {settings.front}</span><span>뒤 {settings.back}</span><span>왼쪽 {settings.left}</span><span>오른쪽 {settings.right}</span><span>발사 {settings.fire}</span><span>앉기 {settings.crouch} : {settings.crouchType}</span></section></section></main>

  if (screen.includes('countdown')) return <main className="app countdown"><Header onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><div><p>{mode === 'guide' ? '가이드 모드 준비' : '리듬 모드 준비'}</p><b>{Math.max(countdown, 0)}</b><span>준비되면 자동으로 훈련을 시작합니다.</span></div></main>

  if (screen === 'guided' || screen === 'rhythm') return <main className="app"><Header onBack={() => setScreen('home')} right={`남은 시간 ${remaining}`} /><section className="page training-page"><h1>{screen === 'guided' ? `지금은 ${expected}를 입력하세요` : `${expected} 입력 타이밍입니다`}</h1><p className="subtitle">키보드 또는 마우스로 입력하세요. 현재 순서: {step + 1} / {sequence.length}</p><section className="timing-board">{sequence.map((key, i) => <div className="track" key={`${key}-${i}`}><label>{inputFor(key)}</label><div className="line"><i className={`event ${i === step % sequence.length ? 'active-event' : ''}`}>{i === step % sequence.length ? 'NOW' : 'READY'}</i></div></div>)}<b className="now">입력 대기</b></section><section className="current-key"><small>현재 입력</small><strong>{expected}</strong><b>{screen === 'guided' ? '순서대로 입력' : '박자에 맞춰 입력'}</b><span>최근 입력: {lastInput}</span></section><section className="feedback"><div><small>정답</small><b>{hits}</b></div><div><small>현재 순서</small><b>{(step % sequence.length) + 1} / {sequence.length}</b></div><div><small>Combo</small><b>× {hits}</b></div><div><small>Mistake</small><b>{mistakes}</b></div></section></section></main>

  if (screen === 'result') return <main className="app"><Header onBack={() => setScreen('home')} /><section className="page result-page"><h1>{labels[angle]} {training.name} · {difficulty}</h1><p className="subtitle">입력 순서와 타이밍을 기준으로 분석한 결과입니다.</p><div className="metric-grid">{[['정확도',`${hits + mistakes ? Math.round((hits / (hits + mistakes)) * 100) : 0}%`],['정답 입력',hits],['순서 오류',mistakes],['완료 패턴',Math.floor(hits / sequence.length)]].map(([label,value]) => <article key={label}><small>{label}</small><b>{value}</b></article>)}</div><section className="panel analysis"><h3>훈련 분석</h3><p>{mistakes ? '입력 순서를 다시 확인해 보세요. 다음 연습에서는 현재 안내되는 키를 먼저 입력하면 됩니다.' : '입력 순서를 정확히 따라왔습니다. 다음 난이도로 속도를 높여보세요.'}</p></section><div className="result-actions"><button className="primary" onClick={() => beginMode(mode)}>다시 연습</button><button className="secondary" onClick={() => setScreen('select')}>훈련 목록</button></div></section></main>

  return <main className="app"><Header onBack={() => setScreen('home')} /><section className="page settings-page"><h1>Settings</h1><p className="subtitle">입력 칸을 클릭한 뒤 원하는 키를 누르세요.</p><div className="settings-grid">{Object.entries(settings).filter(([key]) => key !== 'crouchType').map(([key, value]) => <label key={key}>{({ front: '앞', back: '뒤', left: '왼쪽', right: '오른쪽', fire: '발사', crouch: '앉기' })[key]}<input className="shortcut-input" value={value} readOnly onKeyDown={event => saveShortcut(key, event)} aria-label={`${key} 단축키`} /></label>)}<label>앉기 타입<select value={settings.crouchType} onChange={event => setSettings(current => ({ ...current, crouchType: event.target.value }))}><option>TOGGLE</option><option>HOLD</option></select></label></div><button className="primary" onClick={() => setScreen('home')}>저장</button></section></main>
}

export default App
