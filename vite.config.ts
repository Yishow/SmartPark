import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 部署到 GitHub Pages 時，資源路徑需要以 repo 名為 base
  base: "/SmartPark/",
  plugins: [react()],
});
