import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    host: "localhost",
    port: 5173,

    https: {
      key: fs.readFileSync("./cert/key.pem"),
      cert: fs.readFileSync("./cert/cert.pem"),
    }
  }
})