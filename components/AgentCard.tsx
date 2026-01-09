
import React from 'react';
import { Agent, AgentId } from '../types';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  isCompleted: boolean;
  isWaiting: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, isCompleted, isWaiting }) => {
  return (
    <div className={`
      relative p-3 rounded-2xl border transition-all duration-300
      ${isActive ? 'bg-white border-orange-500 shadow-md translate-x-1' : 'border-transparent'}
      ${isCompleted ? 'bg-orange-50/50' : ''}
      ${isWaiting ? 'opacity-40 grayscale' : ''}
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0
          ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 animate-pulse' : 'bg-slate-100'}
          ${isCompleted ? 'bg-orange-100 text-orange-600' : ''}
        `}>
          {isCompleted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-xs font-bold truncate ${isActive ? 'text-orange-600' : 'text-slate-700'}`}>
            {agent.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{agent.role}</p>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-2 pl-12">
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-1/2 animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
