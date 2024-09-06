import React from 'react';
import { open } from '@tauri-apps/api/shell';
import MotionNumber from 'motion-number';

import { formatTime } from '../lib/formatTime';
import { TrashIcon } from './Icon';

import { Task } from '../types/Task'

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void; 
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask }) => {
  const handleLinkClick = async (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await open(url);
    } catch (error) {
      console.error('URL açılırken hata oluştu:', error);
    }
  };

  return (
    <div className="bg-muted p-2 rounded-md text-sm max-h-[60vh] overflow-y-auto">
      {tasks.map((task) => {
        const { hours, minutes, seconds } = formatTime(task.time);
        return (
          <div key={task.id} className="flex flex-col mb-2">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">{task.id}</div>
              <div className="flex items-center">
                <div className="text-muted-foreground mr-2">
                  <MotionNumber value={hours} format={{ minimumIntegerDigits: 2 }} />:
                  <MotionNumber value={minutes} format={{ minimumIntegerDigits: 2 }} />:
                  <MotionNumber value={seconds} format={{ minimumIntegerDigits: 2 }} />
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Görevi sil"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </div>
            {task.url && (
              <div className="text-xs text-muted-foreground mt-1">
                <a 
                  href={task.url} 
                  onClick={(e) => handleLinkClick(task.url!, e)}
                  className="hover:underline"
                >
                  {task.url}
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;