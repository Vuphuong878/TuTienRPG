import React, { useState } from 'react';
// Fix: Corrected import path for types.
import { useGame } from '../contexts/GameContext';
import { ServantTask, Servant, Retainer } from '../types';

const ServantCard: React.FC<{ servant: Servant }> = ({ servant }) => {
    const { handleAssignServantTask } = useGame();
    return (
        <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
            <img src={servant.imageUrl || 'https://via.placeholder.com/150'} alt={servant.name} className="w-16 h-16 rounded-full border-2 border-gray-500 object-cover" />
            <div className="flex-grow">
                <h4 className="text-lg font-bold text-gray-300">{servant.name}</h4>
                <p className="text-sm text-gray-400">Cấp {servant.level} {servant.characterClass}</p>
                <div className="mt-2 flex items-center gap-2">
                    <label htmlFor={`task-${servant.id}`} className="text-xs text-gray-300">Nhiệm vụ:</label>
                    <select
                        id={`task-${servant.id}`}
                        value={servant.task}
                        onChange={(e) => handleAssignServantTask(servant.id, e.target.value as ServantTask)}
                        className="bg-gray-700 text-white text-xs p-1 rounded"
                    >
                        {Object.values(ServantTask).map((task: ServantTask) => (
                            <option key={task} value={task}>{task}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

const RetainerCard: React.FC<{ retainer: Retainer, isActive: boolean }> = ({ retainer, isActive }) => {
    const { handleTrainRetainer, handleSetActiveRetainer } = useGame();
    return (
        <div className={`p-4 rounded-lg border-2 transition-all ${isActive ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-800/60 border-gray-700'}`}>
            <div className="flex items-center gap-4 mb-3">
                <img src={retainer.imageUrl || 'https://via.placeholder.com/150'} alt={retainer.name} className="w-16 h-16 rounded-full border-2 border-purple-400 object-cover" />
                <div className="flex-grow">
                    <h4 className="text-lg font-bold text-purple-300">{retainer.name}</h4>
                    <p className="text-sm text-gray-400">Cấp {retainer.level} {retainer.playerClass}</p>
                    <p className="text-xs text-yellow-400 mt-1">Tư chất: {retainer.linhCan?.quality} (x{retainer.potential})</p>
                </div>
            </div>
            {/* Add more stats if needed */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => handleTrainRetainer(retainer.id)}
                    className="flex-1 bg-green-700 hover:bg-green-600 text-white text-sm font-bold py-2 rounded-md transition-colors"
                >
                    Truyền Công
                </button>
                <button
                    onClick={() => handleSetActiveRetainer(isActive ? null : retainer.id)}
                    className={`flex-1 text-sm font-bold py-2 rounded-md transition-colors ${isActive ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {isActive ? 'Ngừng Theo' : 'Cho Theo'}
                </button>
            </div>
        </div>
    );
};

type CompanionTab = 'retainers' | 'servants';

const CompanionScreen: React.FC = () => {
    const { character, handleRecruitRetainer } = useGame();
    const [activeTab, setActiveTab] = useState<CompanionTab>('retainers');

    if (!character) return null;

    const { retainers, servants, activeRetainerId } = character;

    const TabButton: React.FC<{ tab: CompanionTab; label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {label}
        </button>
    );

    return (
        <div className="max-h-[70vh] overflow-y-auto pr-3 space-y-6">
            <div className="flex justify-center gap-2 p-2 bg-black/20 rounded-lg">
                <TabButton tab="retainers" label={`Đệ Tử (${retainers.length})`} />
                <TabButton tab="servants" label={`Nô Bộc (${servants.length})`} />
            </div>

            {activeTab === 'retainers' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-cyan-300">Quản lý Đệ Tử</h3>
                        <button
                            onClick={handleRecruitRetainer}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Chiêu Mộ
                        </button>
                    </div>
                    {retainers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {retainers.map(retainer => (
                                <RetainerCard key={retainer.id} retainer={retainer} isActive={activeRetainerId === retainer.id} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-8 bg-gray-700/50 rounded-lg">
                            <p>Chưa có đệ tử nào. Hãy chiêu mộ để có người đồng hành!</p>
                        </div>
                    )}
                </div>
            )}
             {activeTab === 'servants' && (
                 <div>
                    <h3 className="text-xl font-bold text-cyan-300 mb-3">Quản lý Nô Bộc</h3>
                    {servants.length > 0 ? (
                        <div className="space-y-4">
                            {servants.map(servant => <ServantCard key={servant.id} servant={servant} />)}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-8 bg-gray-700/50 rounded-lg">
                            <p>Chưa có nô bộc nào.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanionScreen;