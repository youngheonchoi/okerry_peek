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

function Header({ back, onBack, onSettings, right }) {
  return <header className="header"><button className="brand" onClick={onBack}>{back || 'okerry peek'}</button>{onSettings && <button className="settings-link" onClick={onSettings}>{right || 'Settings'}</button>}</header>
}

function App() {
  const [screen, setScreen] = useState('home')
  const [angle, setAngle] = useState('left')
  const [difficulty, setDifficulty] = useState('초보자')
  const [training, setTraining] = useState(trainingList.left[1])
  const [mode, setMode] = useState('guide')
  const [countdown, setCountdown] = useState(5)
  const [time, setTime] = useState(60)
  const [settings, setSettings] = useState({ left: 'A', right: 'D', leanLeft: 'Q', leanRight: 'E', ads: 'Mouse 2', fire: 'Mouse 1', crouch: 'C', leanType: 'HOLD', adsType: 'HOLD', crouchType: 'TOGGLE' })

  useEffect(() => { if (!screen.includes('countdown')) return; setCountdown(5); const timer = window.setInterval(() => setCountdown(value => value - 1), 1000); return () => window.clearInterval(timer) }, [screen])
  useEffect(() => { if (screen.includes('countdown') && countdown <= 0) setScreen(mode === 'guide' ? 'guided' : 'rhythm') }, [countdown, mode, screen])
  useEffect(() => { if (screen !== 'guided' && screen !== 'rhythm') return; setTime(60); const timer = window.setInterval(() => setTime(value => value - 1), 1000); return () => window.clearInterval(timer) }, [screen])
  useEffect(() => { if ((screen === 'guided' || screen === 'rhythm') && time <= 0) setScreen('result') }, [screen, time])

  const beginAngle = key => { if (key === 'move') return; setAngle(key); setTraining(trainingList[key][1]); setScreen('select') }
  const beginMode = selected => { setMode(selected); setScreen(`${selected}-countdown`) }
  const remaining = `01:${String(Math.max(time, 0)).padStart(2, '0')}`
  const sequence = useMemo(() => training.keys.split(' → ').filter(item => !['복귀', 'RANDOM'].includes(item)), [training])

  if (screen === 'home') return <main className="app"><Header onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><section className="home page"><h1>PEEK TRAINER</h1><p className="subtitle">피킹 영상만 봐서는 어려운 입력 순서와 타이밍을 직접 따라하며 익혀보세요.</p><div className="angle-grid">{Object.entries(labels).map(([key, label]) => <article className="angle-card" key={key}><h2>{label}</h2><button className="primary" onClick={() => beginAngle(key)}>트레이닝 시작</button></article>)}</div><aside className="note"><strong>이 서비스에서 배우는 것</strong><p>1. 어떤 키를 먼저 누르는지　2. 얼마나 유지하는지　3. 언제 떼는지　4. 언제 조준하고 발사하는지</p><p>초보자는 느린 가이드부터 시작하고, 익숙해지면 실제 속도에 가까운 반복 훈련으로 넘어갑니다.</p></aside></section></main>

  if (screen === 'select') return <main className="app"><Header back="← 뒤로가기" onBack={() => setScreen('home')} onSettings={() => setScreen('settings')} /><section className="page select-page"><h1>{labels[angle]} 연습</h1><div className="filters">{difficulties.map(item => <button className={difficulty === item ? 'chip active' : 'chip'} key={item} onClick={() => setDifficulty(item)}>{item}</button>)}</div><div className="drill-grid">{trainingList[angle].map(item => <article className="drill-card" key={item.name}><h2>{item.name}</h2><p>{item.description}</p><code>{item.keys}</code><button className="text-action" onClick={() => { setTraining(item); setScreen('intro') }}>연습 시작　→</button></article>)}</div></section></main>

  if (screen === 'intro') return <main className="app"><Header back={`←　${labels[angle]} ${training.name}`} onBack={() => setScreen('select')} onSettings={() => setScreen('settings')} /><section className="page intro-page"><h1>{labels[angle]} {training.name}</h1><p className="subtitle">입력 순서와 각 키의 누름/유지/해제 타이밍을 먼저 확인하세요.</p><section className="panel sequence"><h3>입력 흐름</h3><div className="key-row">{sequence.map((key, index) => <span className="keycap" key={`${key}-${index}`}>{key}</span>)}</div><hr/><h4>타이밍 포인트</h4><p>{training.keys.replaceAll(' → ', ' 누름 → ')} 순서로 입력합니다.</p><p>HOLD 설정이면 키를 누른 채 유지해야 하고, TOGGLE은 한 번 눌러 상태를 전환합니다.</p></section><div className="mode-grid"><article className="mode-card"><div><h2>가이드 모드</h2><em>추천</em></div><p>현재 눌러야 할 키, 유지 시간, 다음 키를 단계별로 안내합니다.</p><button className="primary" onClick={() => beginMode('guide')}>가이드 모드 시작</button></article><article className="mode-card"><div><h2>리듬 모드</h2><em>숙련용</em></div><p>패턴을 익힌 뒤 정해진 템포에 맞춰 반복합니다.</p><button className="primary" onClick={() => beginMode('rhythm')}>리듬 모드 시작</button></article></div><section className="current-settings"><strong>현재 설정</strong><span>Lean {settings.leanLeft} : {settings.leanType}</span><span>ADS {settings.ads} : {settings.adsType}</span><span>Crouch {settings.crouch} : {settings.crouchType}</span><span>Fire {settings.fire}</span></section></section></main>

  if (screen.includes('countdown')) return <main className="app countdown"><Header back={`←　${labels[angle]} ${training.name}`} onBack={() => setScreen('intro')} onSettings={() => setScreen('settings')} /><div><p>{mode === 'guide' ? '가이드 모드 준비' : '리듬 모드 준비'}</p><b>{Math.max(countdown, 0)}</b><span>준비되면 자동으로 훈련을 시작합니다.</span></div></main>

  if (screen === 'guided' || screen === 'rhythm') return <main className="app"><Header back={`←　${mode === 'guide' ? '가이드 모드' : '리듬 모드'} / ${labels[angle]} ${training.name}`} onBack={() => setScreen('intro')} right={`남은 시간 ${remaining}`} /><section className="page training-page"><h1>{screen === 'guided' ? `지금은 ${settings.leanLeft}를 누른 채 유지하세요` : '리듬에 맞춰 다음 입력을 준비하세요'}</h1><p className="subtitle">{screen === 'guided' ? `${settings.left}는 계속 누르고 있습니다. 다음 입력은 ADS(${settings.ads})입니다.` : `${difficulty} 난이도의 고정 속도로 패턴을 반복합니다.`}</p><section className="timing-board">{[settings.left, settings.leanLeft, 'RMB', 'LMB'].map((key, i) => <div className="track" key={key}><label>{key}</label><div className="line"><i className={`event event-${i}`}>{i === 0 ? `${key} HOLD` : i === 1 ? `${key} HOLD` : i === 2 ? 'ADS' : 'FIRE'}</i></div></div>)}<b className="now">NOW ↓</b></section><section className="current-key"><small>현재 입력</small><strong>{settings.leanLeft}</strong><b>누른 채 유지</b><span>다음: {settings.ads} / ADS</span></section><section className="feedback"><div><small>판정</small><b>PERFECT</b></div><div><small>Timing</small><b>+18ms</b></div><div><small>Combo</small><b>× 7</b></div><div><small>Mistake</small><b>0</b></div></section></section></main>

  if (screen === 'result') return <main className="app"><Header back="←　훈련 결과" onBack={() => setScreen('select')} /><section className="page result-page"><h1>{labels[angle]} {training.name} · {difficulty}</h1><p className="subtitle">입력 순서와 타이밍을 기준으로 분석한 결과입니다.</p><div className="metric-grid">{[['정확도','94.2%'],['평균 타이밍','+18ms'],['순서 오류','1'],['유지 오류','0']].map(([label,value]) => <article key={label}><small>{label}</small><b>{value}</b></article>)}</div><section className="panel analysis"><h3>훈련 분석</h3><p>전반적으로 입력 순서가 안정적입니다. Q 유지 후 ADS 전환 구간을 조금 더 빠르게 연결해 보세요.</p></section><div className="result-actions"><button className="primary" onClick={() => setScreen(`${mode}-countdown`)}>다시 연습</button><button className="secondary" onClick={() => setScreen('select')}>훈련 목록</button></div></section></main>

  return <main className="app"><Header back="←　뒤로가기" onBack={() => setScreen('home')} /><section className="page settings-page"><h1>Settings</h1><p className="subtitle">실제 PUBG 키 설정과 입력 방식을 맞춰주세요.</p><div className="settings-grid">{Object.entries(settings).map(([key, value]) => <label key={key}>{key.replace(/([A-Z])/g, ' $1')}<input value={value} onChange={event => setSettings({ ...settings, [key]: event.target.value })} /></label>)}</div><button className="primary" onClick={() => setScreen('home')}>저장</button></section></main>
}

export default App
