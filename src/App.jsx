import { useState, useMemo, useEffect } from 'react';
import { weapons, alluviums, primaryAttributes } from './data.js';
import { generateCombos, getOptimalCombos, matchWeaponForAlluvium } from './utils.js';  // alluvium match 추가 가능

function App() {
  const [checked, setChecked] = useState(new Set(JSON.parse(localStorage.getItem('checked') || '[]')));
  const [selectedAlluvium, setSelectedAlluvium] = useState('all');
  const [priority, setPriority] = useState('');

  const checkedWeaponsObj = useMemo(() => weapons.filter(w => checked.has(w.name)), [checked]);

  const combos = useMemo(() => generateCombos(selectedAlluvium === 'all' ? null : selectedAlluvium), [selectedAlluvium]);

  const optimal = useMemo(() => getOptimalCombos(checkedWeaponsObj, combos), [checkedWeaponsObj, combos]);
  const priorityOptimal = useMemo(() => {
    const priW = weapons.find(w => w.name === priority);
    return priW ? getOptimalCombos(checkedWeaponsObj, combos, priW) : [];
  }, [checkedWeaponsObj, combos, priority]);

  useEffect(() => localStorage.setItem('checked', JSON.stringify([...checked])), [checked]);

  const toggle = (name) => {
    const newChecked = new Set(checked);
    if (newChecked.has(name)) newChecked.delete(name); else newChecked.add(name);
    setChecked(newChecked);
    if (priority === name) setPriority('');
  };

  const farmableInAlluvium = (alluviumKey) => checkedWeaponsObj.filter(w => w.alluviums.includes(alluviumKey));

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          엔드필드 무기 기질 파밍 체크리스트
        </h1>
        <p className="text-xl opacity-75 mt-2">체크한 무기 중 최대 커버 각인권 추천 (5성+ {checked.size}/{weapons.length})</p>
      </header>

      {/* 응집점 선택 */}
      <select className="w-full max-w-md mx-auto block p-3 bg-gray-800 border border-gray-600 rounded-xl text-lg" 
              value={selectedAlluvium} onChange={e => setSelectedAlluvium(e.target.value)}>
        <option value="all">전체 응집점</option>
        {alluviums.map(a => <option key={a.key} value={a.key}>{a.name}</option>)}
      </select>

      {/* 무기 체크리스트 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weapons.map(w => (
          <label key={w.name} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            checked.has(w.name) 
              ? 'bg-blue-600/50 border-blue-500 shadow-lg' 
              : 'bg-gray-800 border-gray-600 hover:border-gray-500'
          }`}>
            <input type="checkbox" checked={checked.has(w.name)} onChange={() => toggle(w.name)} className="mr-2 w-5 h-5" />
            <div>
              <div className="font-bold text-lg">{w.name}</div>
              <div className="text-sm opacity-75">★{w.rarity} {w.type}</div>
              <div className="text-xs mt-1">
                <span>기초: {w.attributes.join('/')}</span><br />
                <span>스킬: {w.skill}</span>
              </div>
            </div>
          </label>
        ))}
      </section>

      {/* 우선 무기 */}
      <select className="w-full max-w-md mx-auto block p-3 bg-gray-800 border border-gray-600 rounded-xl text-lg" 
              value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="">우선 무기 (반드시 포함)</option>
        {Array.from(checked).map(name => <option key={name} value={name}>{name}</option>)}
      </select>

      {/* 응집점별 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">선택 응집점 파밍 가능 무기</h2>
        {selectedAlluvium === 'all' ? (
          <p className="text-center opacity-75">응집점 선택 후 확인</p>
        ) : (
          <ul className="space-y-2">
            {farmableInAlluvium(selectedAlluvium).map(w => (
              <li key={w.name} className="p-3 bg-gray-800 rounded-lg">{w.name}</li>
            ))}
          </ul>
        )}
      </section>

      {/* 최적 각인 */}
      {optimal.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">최대 커버 각인권 Top 3</h2>
          {optimal.map((opt, i) => (
            <div key={i} className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-black">{opt.count}개</span>
                <span className="text-xl">#{i+1}</span>
              </div>
              <div className="text-lg">기초: {opt.combo.attrs.join(' + ')} | 스킬: <span className="font-bold text-yellow-400">{opt.combo.skill}</span></div>
              <div className="mt-3 text-sm opacity-90">커버: {opt.weapons.join(', ')}</div>
            </div>
          ))}
        </section>
      )}

      {priorityOptimal.length > 0 && priority && (
        <section>
          <h2 className="text-2xl font-bold">우선 '{priority}' 포함 Top 3</h2>
          {/* 동일 테이블 */}
        </section>
      )}
    </div>
  );
}

export default App;