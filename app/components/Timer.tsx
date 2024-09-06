import React, { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import MotionNumber from "motion-number";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Task } from "../types/Task";
import { formatTime } from "../lib/formatTime";
import TaskList from "./TaskList";
import {
  PlayIcon,
  PauseIcon,
  CircleStopIcon,
  SettingsIcon,
  HandHelpingIcon,
  LinkIcon,
} from "../components/Icon";
import { useTheme } from "../provider/ThemeContext";

const saveData = async (data: Task[]) => {
  try {
    await invoke("save_data", { data: JSON.stringify(data) });
  } catch (error) {
    console.error("Veri kaydedilirken hata oluştu:", error);
  }
};

const loadData = async (): Promise<Task[]> => {
  try {
    const data = await invoke("load_data");
    return JSON.parse(data as string);
  } catch (error) {
    console.error("Veri yüklenirken hata oluştu:", error);
    return [];
  }
};

const TimerComponent: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [taskUrl, setTaskUrl] = useState<string>("");

  useEffect(() => {
    loadData().then((loadedTasks) => setTasks(loadedTasks));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    if (taskId.trim() !== "") {
      setIsRunning(true);
    } else {
      alert("Lütfen bir Görev ID'si girin.");
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (taskId.trim() !== "") {
      const newTask: Task = { id: taskId, time, url: taskUrl };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveData(updatedTasks);
      setTaskId("");
      setTaskUrl("");
      setTime(0);
      setShowUrlInput(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    await saveData(updatedTasks);
  };

  const openGitHubProfile = async () => {
    try {
      await open("https://github.com/hsnlbnan");
    } catch (error) {
      console.error("GitHub profili açılırken hata oluştu:", error);
    }
  };

  const { hours, minutes, seconds } = formatTime(time);

  return (
    <div className="p-4 w-[400px] transition-colors duration-200">
      <div className="bg-card shadow-lg p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-black text-card-foreground text-xl dark:text-white">
            Time Tracker
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className="w-4 h-4 text-muted-foreground dark:text-gray-300" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openGitHubProfile}>
              <HandHelpingIcon className="w-4 h-4 text-muted-foreground dark:text-gray-300" />
            </Button>
          </div>
        </div>
        {showSettings && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground text-sm dark:text-gray-300">
              Karanlık Mod
            </span>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        )}
        <div className="flex justify-center items-center mb-4">
          <div
            className={`text-6xl font-bold text-primary ${
              isRunning ? "animate-pulse" : ""
            }`}
          >
            <MotionNumber value={hours} format={{ minimumIntegerDigits: 2 }} />:
            <MotionNumber
              value={minutes}
              format={{ minimumIntegerDigits: 2 }}
            />
            :
            <MotionNumber
              value={seconds}
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
        </div>
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Görev ID"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="border-input focus:border-primary px-2 py-1 pr-8 border rounded-md focus:ring-1 focus:ring-primary text-black text-sm dark:text-white"
            />
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="top-1/2 right-2 absolute text-muted-foreground hover:text-primary transform -translate-y-1/2"
            >
              <LinkIcon width={16} height={16} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={handleStart} disabled={isRunning}>
              <PlayIcon className="w-4 h-4 text-primary-foreground" />
            </Button>
            <Button size="sm" onClick={handlePause} disabled={!isRunning}>
              <PauseIcon className="w-4 h-4 text-primary-foreground" />
            </Button>
            <Button size="sm" onClick={handleStop}>
              <CircleStopIcon className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
        {showUrlInput && (
          <div className="mb-4">
            <Input
              type="url"
              placeholder="Görev URL'si"
              value={taskUrl}
              onChange={(e) => setTaskUrl(e.target.value)}
              className="border-input focus:border-primary px-2 py-1 border rounded-md focus:ring-1 focus:ring-primary w-full text-black text-sm dark:text-white"
            />
          </div>
        )}
        <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
      </div>
    </div>
  );
};

export default TimerComponent;
