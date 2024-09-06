import type { MetaFunction } from "@remix-run/node";
import TimerComponent from "../components/Timer";
import { ThemeProvider } from "../provider/ThemeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Zaman Takipçisi" },
    { name: "description", content: "Tauri ile yapılmış zaman takip uygulaması" },
  ];
};

export default function Index() {
  return (
    <ThemeProvider>
    <div className="font-sans">
      <TimerComponent />
    </div>
    </ThemeProvider>
  );
}
