
import React from 'react';
import { Character, UpgradeMaterial, UpgradeConsumable } from '../types';
import { UPGRADE_MATERIALS_DATA, UPGRADE_CONSUMABLES_DATA } from '../constants';

interface ResourcesScreenProps {
    character: Character;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ character }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Nguyên Liệu Cường Hóa</h3>
                <div className="space-y-2 text-sm bg-gray-800/50 p-4 rounded-lg">
                    {Object.values(UpgradeMaterial).map(mat => (
                        <div key={mat} className="flex justify-between items-center text-gray-300">
                            <span>{UPGRADE_MATERIALS_DATA[mat].name}</span>
                            <span className="font-bold text-white bg-gray-700 px-2.5 py-1 rounded-full">{character.materials[mat] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Vật Phẩm Hỗ Trợ</h3>
                <div className="space-y-2 text-sm bg-gray-800/50 p-4 rounded-lg">
                    {Object.values(UpgradeConsumable).map(con => (
                        <div key={con} className="flex justify-between items-center text-gray-300">
                            <span>{UPGRADE_CONSUMABLES_DATA[con].name}</span>
                            <span className="font-bold text-white bg-gray-700 px-2.5 py-1 rounded-full">{character.consumables[con] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResourcesScreen;
