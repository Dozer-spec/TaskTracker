"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTaskContext} from "@/contexts/TaskContext";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function Home() {
  const { tasks, addTask, toggleTask, editTask, deleteTask } = useTaskContext();
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(new Date());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; taskId: string; taskText: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() && newTaskDate) {
      try {
        await addTask(newTaskText.trim(), newTaskDate);
        setNewTaskText("");
        setNewTaskDate(new Date());
        setError(null);
      } catch (err) {
        setError("Failed to add task. Please try again.");
        console.error(err);
      }
    }
  };

  const handleEditTask = (id: string, text: string, dueDate: Date) => {
    editTask(id, text, dueDate);
    setEditingTask(null);
  };

  const handleDeleteClick = (taskId: string, taskText: string) => {
    setDeleteConfirmation({ isOpen: true, taskId, taskText });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation) {
      deleteTask(deleteConfirmation.taskId);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-red-600">Task Tracker</h1>
      
      <form onSubmit={handleAddTask} className="mb-6 sm:mb-8 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Enter new task"
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <div className="flex space-x-2">
          <DatePicker
            selected={newTaskDate}
            onChange={(date: Date) => setNewTaskDate(date)}
            className="p-2 border border-gray-300 rounded w-full sm:w-auto"
          />
          <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Add Task
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-2 border border-gray-200 rounded">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 text-red-600"
              />
              <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.text}
              </span>
            </div>
            {editingTask === task.id ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const text = (form.elements.namedItem('text') as HTMLInputElement).value;
                const date = new Date((form.elements.namedItem('date') as HTMLInputElement).value);
                handleEditTask(task.id, text, date);
              }} className="flex-grow flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
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
                <button type="submit" className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Save</button>
              </form>
            ) : (
              <div className="flex items-center justify-between sm:justify-end space-x-2 mt-2 sm:mt-0">
                <span className="text-sm text-gray-500">
                  {task.dueDate?.toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingTask(task.id)} className="p-1 text-blue-500 hover:text-blue-700">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(task.id, task.text)} className="p-1 text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {deleteConfirmation && (
        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={handleConfirmDelete}
          taskText={deleteConfirmation.taskText}
        />
      )}
    </div>
  );
}