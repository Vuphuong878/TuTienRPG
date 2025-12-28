
import React from 'react';
import { Item, Rarity, SkillType, Element, ItemType } from '../types';
import { RARITY_DATA, ELEMENT_ICONS } from '../constants';

interface ItemCardProps {
  item: Item;
  onPrimaryAction?: () => void;
  isEquipped?: boolean;
}

const StatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}:</span>
        <span className="font-semibold text-gray-200">{value}</span>
    </div>
);

const ItemCard: React.FC<ItemCardProps> = ({ item, onPrimaryAction, isEquipped }) => {
  const rarityInfo = RARITY_DATA[item.rarity] || RARITY_DATA[Rarity.COMMON];

  const renderActionButton = () => {
    if (!onPrimaryAction) {
        return null;
    }

    let text: string;
    let style: string;

    switch (item.type) {
        case ItemType.CULTIVATION_MANUAL:
            text = 'Lĩnh Hội';
            style = 'bg-purple-600 hover:bg-purple-700';
            break;
        case ItemType.SKILL_BOOK:
            text = 'Học Kỹ Năng';
            style = 'bg-cyan-600 hover:bg-cyan-700';
            break;
        default: // Equipment
            if (isEquipped) {
                text = 'Gỡ Trang Bị';
                style = 'bg-red-600 hover:bg-red-700';
            } else {
                text = 'Trang Bị';
                style = 'bg-green-600 hover:bg-green-700';
            }
            break;
    }

    return (
        <button
            onClick={onPrimaryAction}
            className={`w-full mt-4 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md ${style}`}
        >
            {text}
        </button>
    );
  };

  const boxShadowStyle = {
      boxShadow: `0 0 10px ${rarityInfo.borderColor}20, inset 0 0 20px ${rarityInfo.borderColor}10`
  };

  return (
    <div 
        className="relative bg-gray-900/80 backdrop-blur-md rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col h-full" 
        style={{ borderColor: rarityInfo.borderColor, ...boxShadowStyle }}
    >
      {/* Decorative Glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold drop-shadow-md" style={{ color: rarityInfo.color }}>{item.name} {item.upgradeLevel > 0 && `+${item.upgradeLevel}`}</h3>
            {item.element && item.element !== Element.VO && (
                <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10" style={{ color: `var(--element-${item.element.toLowerCase()}-text)` }} title={`Hệ: ${item.element}`}>
                    {ELEMENT_ICONS[item.element]}
                </span>
            )}
          </div>
          
          <div className="flex justify-between items-baseline mb-3">
             <p className="text-xs text-gray-500">{item.type} • <span style={{ color: rarityInfo.color }}>{item.rarity}</span></p>
             {item.setName && (
                <p className="text-xs text-green-400 font-semibold bg-green-900/30 px-2 py-0.5 rounded">Bộ: {item.setName}</p>
             )}
          </div>
          
          {item.description && <p className="text-xs text-gray-400 italic mb-4 pl-2 border-l-2 border-gray-700">"{item.description}"</p>}

          <div className="space-y-1.5 mb-3 flex-grow bg-black/20 p-3 rounded-lg border border-white/5">
            {Object.entries(item.baseStats).filter(([, value]) => value).map(([stat, value]) => (
              <StatDisplay key={stat} label={stat.toUpperCase()} value={value} />
            ))}
            {Object.entries(item.bonusStats).filter(([, value]) => value).map(([stat, value]) => (
              <StatDisplay key={stat} label={stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={`+${value}`} />
            ))}
          </div>
          
           {item.cultivationTechniqueDetails && (
            <div className="my-2 py-2 border-t border-b border-purple-500/30">
                <h4 className="text-purple-300 font-semibold text-sm mb-1">Công Pháp Lĩnh Ngộ</h4>
                {item.cultivationTechniqueDetails.bonuses.map((bonus, index) => (
                    <p key={index} className="text-xs text-gray-300">
                        <span className="font-bold text-green-400">+{bonus.value}{bonus.isPercent ? '%' : ''}</span> {bonus.stat}
                    </p>
                ))}
            </div>
          )}

          {item.skillDetails && (
            <div className="my-2 py-2 border-t border-b border-cyan-500/30">
                <h4 className={`font-semibold text-base ${item.skillDetails.type === SkillType.ACTIVE ? 'text-cyan-300' : 'text-green-300'}`}>
                    Kỹ Năng: {item.skillDetails.name} ({item.skillDetails.type})
                </h4>
                <p className="text-sm text-gray-400 italic my-1">"{item.skillDetails.description}"</p>
                <div className="mt-1 text-sm space-y-1">
                    {item.skillDetails.effects.map((effect, index) => (
                        <div key={index} className="flex items-start text-gray-300">
                            <span className="text-gray-500 font-bold mr-2">✦</span>
                            <p className="flex-1 text-xs">
                                {effect.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
          )}


          {item.affix && (
            <div className="my-3 py-2 bg-yellow-900/10 border border-yellow-500/30 rounded px-2">
                <h4 className="text-yellow-400 font-semibold text-sm">🌟 {item.affix.name}</h4>
                <p className="text-xs text-gray-300 mt-0.5">
                    {item.affix.description}
                </p>
            </div>
          )}

          {item.soulEffect && (
            <div className="my-3 py-2 bg-cyan-900/10 border border-cyan-500/30 rounded px-2">
                <h4 className="text-cyan-400 font-semibold text-sm">🌀 {item.soulEffect.name}</h4>
                <p className="text-xs text-gray-300 mt-0.5">
                    {item.soulEffect.description}
                </p>
            </div>
          )}

          {item.type !== 'Sách Kỹ Năng' && item.type !== 'Công Pháp' && (
            <div className="text-[10px] text-gray-600 mt-2 text-right uppercase tracking-wider">Cường hóa: {item.upgradeLevel}/{item.maxUpgrade}</div>
          )}
          
          {renderActionButton()}
      </div>
    </div>
  );
};

export default ItemCard;
