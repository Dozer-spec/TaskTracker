"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: Date | null;
  userId: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, dueDate: Date) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  editTask: (id: string, text: string, dueDate: Date) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  sortTasksByDueDate: (tasks: Task[]) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null
        } as Task;
      });
      setTasks(sortTasksByDueDate(tasksData));
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (text: string, dueDate: Date) => {
    if (!user) throw new Error("User not authenticated");
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dueDate < now) {
      throw new Error("Cannot add tasks with due dates in the past");
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        text,
        completed: false,
        dueDate: Timestamp.fromDate(dueDate),
        userId: user.uid
      });
    } catch (error) {
      console.error("Error adding task: ", error);
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    const taskRef = doc(db, 'tasks', id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateDoc(taskRef, { completed: !task.completed });
    }
  };

  const editTask = async (id: string, text: string, dueDate: Date) => {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { text, dueDate });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const sortTasksByDueDate = (tasksToSort: Task[]): Task[] => {
    return tasksToSort.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask, editTask, deleteTask, sortTasksByDueDate }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}