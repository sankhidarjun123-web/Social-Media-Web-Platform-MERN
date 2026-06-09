import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from "fs";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: isProduction
    ? undefined
    : {
        host: "localhost",
        port: 5173,
        https: {
          key: fs.readFileSync("./cert/key.pem"),
          cert: fs.readFileSync("./cert/cert.pem"),
        }
      }
})