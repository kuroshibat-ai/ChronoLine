import { defineConfig } from "vitest/config";

// GitHub Pages配信時はリポジトリ名のパスを指定する(例: "/ChronoLine/")。
// 独自ドメインを使う場合は "/" のままでよい。
export default defineConfig({
  base: process.env.VITE_BASE ?? "/ChronoLine/",
});
