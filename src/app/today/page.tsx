"use client";

import { useState, useEffect } from 'react';
import { useTaskContext, Task } from '@/contexts/TaskContext';
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function Today() {
  const { tasks, toggleTask, editTask, deleteTask } = useTaskContext();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; taskId: string; taskText: string } | null>(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filtered = tasks.filter(task => {
      const taskDate = new Date(task.dueDate!);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
    setTodayTasks(filtered);
  }, [tasks]);

  function handleEditTask(id: string, text: string, dueDate: Date) {
    editTask(id, text, dueDate);
    setEditingTask(null);
  }

  function handleDeleteClick(taskId: string, taskText: string) {
    setDeleteConfirmation({ isOpen: true, taskId, taskText });
  }

  function handleConfirmDelete() {
    if (deleteConfirmation) {
      deleteTask(deleteConfirmation.taskId);
      setDeleteConfirmation(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-8 text-red-600">Today's Tasks</h1>
      
      {todayTasks.length === 0 ? (
        <p className="text-gray-500">No tasks due today.</p>
      ) : (
        <ul className="space-y-2">
          {todayTasks.map(task => (
            <li
              key={task.id}
              className="flex items-center space-x-2 p-2 border border-gray-200 rounded"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 text-red-600"
              />
              {editingTask === task.id ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const text = (form.elements.namedItem('text') as HTMLInputElement).value;
                  const date = new Date((form.elements.namedItem('date') as HTMLInputElement).value);
                  handleEditTask(task.id, text, date);
                }} className="flex-grow flex space-x-2">
                  <input 
                    name="text"
                    defaultValue={task.text}
                    className="flex-grow p-1 border border-gray-300 rounded"
                  />
                  <input 
                    name="date"
                    type="date"
                    defaultValue={task.dueDate?.toISOString().split('T')[0]}
                    className="p-1 border border-gray-300 rounded"
                  />
                  <button type="submit" className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                </form>
              ) : (
                <>
                  <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                  </span>
                  <button onClick={() => setEditingTask(task.id)} className="p-1 text-blue-500 hover:text-blue-700">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(task.id, task.text)} className="p-1 text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmationDialog
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleConfirmDelete}
        taskText={deleteConfirmation?.taskText || ''}
      />
    </div>
  );
}