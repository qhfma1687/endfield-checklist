import { primaryAttributes, skills, alluviumSkills } from './data.js';

export const generateCombos = (alluviumKey = null) => {
  const attrsCombos = combinations(primaryAttributes, 3);
  const availSkills = alluviumKey ? alluviumSkills[alluviumKey] || skills : skills;
  return attrsCombos.flatMap(attrs => availSkills.map(skill => ({ attrs, skill })));
};

export const matchWeapon = (weapon, combo) => 
  weapon.attributes.some(attr => combo.attrs.includes(attr)) && weapon.skill === combo.skill;

export const getOptimalCombos = (checkedWeaponsObj, combos, includePriority = null) => {
  const scores = combos.map(combo => {
    const count = checkedWeaponsObj.filter(w => matchWeapon(w, combo)).length;
    const includesPri = !includePriority || matchWeapon(includePriority, combo);
    return { combo, count, includesPri, weapons: checkedWeaponsObj.filter(w => matchWeapon(w, combo)).map(w => w.name) };
  }).filter(s => !includePriority || s.includesPri)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);  // Top 5
  return scores;
};

function combinations(arr, k) {
  const result = [];
  function comb(start, path) {
    if (path.length === k) { result.push([...path]); return; }
    for (let i = start; i < arr.length; i++) comb(i + 1, [...path, arr[i]]);
  }
  comb(0, []);
  return result;
}