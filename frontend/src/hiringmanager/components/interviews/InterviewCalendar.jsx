import React, { useState } from 'react';
import { calendarEvents, timeSlots, weekDays } from '../../data/hmInterviewsData';

const HOUR_HEIGHT = 80; 

function getEventStyle(event) {
  const top = (event.startHour - 9) * HOUR_HEIGHT + (event.startMin / 60) * HOUR_HEIGHT;
  const height = (event.durationMins / 60) * HOUR_HEIGHT;
  return { top, height };
}

export default function InterviewCalendar() {
  const [view, setView] = useState('Week');
  const views = ['Day', 'Week', 'Month'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-700 p-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="font-bold text-[17px] text-gray-900">October 21 – 27, 2024</h2>
          <button className="text-gray-400 hover:text-gray-700 p-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
            {views.map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-[12.5px] font-medium px-3 py-1.5 rounded-md transition-colors
                  ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="text-[12.5px] font-semibold border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Today
          </button>
        </div>
      </div>

     
      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '70px repeat(4, 1fr)' }}>
        <div className="border-r border-gray-100" />
        {weekDays.map((d, i) => (
          <div key={i} className={`text-center py-3 border-r border-gray-100 last:border-r-0 ${d.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wide">{d.day}</div>
            <div className={`text-[18px] font-bold mt-0.5 ${d.isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'}`}>
              {d.date}
            </div>
          </div>
        ))}
      </div>

     
      <div className="relative overflow-y-auto" style={{ maxHeight: '400px' }}>
        <div className="grid" style={{ gridTemplateColumns: '70px repeat(4, 1fr)' }}>
          
          <div className="flex flex-col border-r border-gray-100">
            {timeSlots.map(slot => (
              <div key={slot} className="text-[11px] text-gray-400 px-2 text-right shrink-0" style={{ height: `${HOUR_HEIGHT}px`, paddingTop: '4px' }}>
                {slot}
              </div>
            ))}
          </div>

          
          {weekDays.map((d, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-gray-100 last:border-r-0" style={{ height: `${timeSlots.length * HOUR_HEIGHT}px` }}>
              {/* Hour lines */}
              {timeSlots.map((_, si) => (
                <div key={si} className="absolute w-full border-t border-gray-50" style={{ top: `${si * HOUR_HEIGHT}px` }} />
              ))}
              
              {calendarEvents
                .filter(e => e.dayIndex === dayIdx)
                .map(event => {
                  const { top, height } = getEventStyle(event);
                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ top: `${top}px`, height: `${height}px`, backgroundColor: event.color + '22', borderLeft: `3px solid ${event.color}` }}
                    >
                      <div className="text-[12px] font-semibold truncate" style={{ color: event.color }}>{event.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{event.type}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
