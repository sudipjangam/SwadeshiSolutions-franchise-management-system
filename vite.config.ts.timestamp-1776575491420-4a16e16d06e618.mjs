// vite.config.ts
import { defineConfig } from "file:///E:/Swadeshi%20Solutions/SwadeshiSolutions-franchise-management-system/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Swadeshi%20Solutions/SwadeshiSolutions-franchise-management-system/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///E:/Swadeshi%20Solutions/SwadeshiSolutions-franchise-management-system/node_modules/lovable-tagger/dist/index.js";
import fs from "fs";
var __vite_injected_original_dirname = "E:\\Swadeshi Solutions\\SwadeshiSolutions-franchise-management-system";
var packageJson = JSON.parse(fs.readFileSync(path.resolve(__vite_injected_original_dirname, "package.json"), "utf-8"));
var APP_VERSION = packageJson.version;
var BUILD_TIMESTAMP = Date.now().toString();
var vite_config_default = defineConfig(({ mode }) => {
  if (mode === "production") {
    const swPath = path.resolve(__vite_injected_original_dirname, "public/sw.js");
    let swContent = fs.readFileSync(swPath, "utf-8");
    swContent = swContent.replace("__BUILD_TIMESTAMP__", BUILD_TIMESTAMP);
    fs.writeFileSync(swPath, swContent);
    console.log(`[Build] Service Worker cache version: swadeshi-${BUILD_TIMESTAMP}`);
    const versionInfo = {
      version: APP_VERSION,
      buildTimestamp: BUILD_TIMESTAMP,
      buildDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs.writeFileSync(
      path.resolve(__vite_injected_original_dirname, "public/version.json"),
      JSON.stringify(versionInfo, null, 2)
    );
    console.log(`[Build] App version: ${APP_VERSION}`);
    console.log(`[Build] App version: ${APP_VERSION} (tracked in version.json)`);
  }
  return {
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION)
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy /api/supabase to the real Supabase URL during local development.
        // In production, Vercel/Netlify rewrites handle this instead.
        // This bypasses Jio and other ISP blocks on *.supabase.co domains.
        "/api/supabase": {
          target: "https://swadeshisolutions.co.in",
          changeOrigin: true,
          // When proxying to Vercel, we actually DON'T want to rewrite the path 
          // because Vercel handles the /api/supabase -> real supabase routing.
          // We just want to forward the request as-is to the Vercel app.
          secure: true,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("[Proxy Error]", err.message);
            });
          }
        }
      }
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      // Suppress warnings for expected large vendor chunks like pdf/excel utils
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks - split large dependencies
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-select",
              "@radix-ui/react-toast"
            ],
            "data-vendor": ["@supabase/supabase-js", "@tanstack/react-query"],
            "chart-vendor": ["recharts", "highcharts", "highcharts-react-official"],
            "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
            "utils-vendor": ["date-fns", "clsx", "tailwind-merge"],
            "pdf-vendor": ["jspdf", "html2canvas", "html2pdf.js"],
            "excel-vendor": ["xlsx", "exceljs"],
            "icon-vendor": ["lucide-react"]
          }
        }
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.ts"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxTd2FkZXNoaSBTb2x1dGlvbnNcXFxcU3dhZGVzaGlTb2x1dGlvbnMtZnJhbmNoaXNlLW1hbmFnZW1lbnQtc3lzdGVtXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxTd2FkZXNoaSBTb2x1dGlvbnNcXFxcU3dhZGVzaGlTb2x1dGlvbnMtZnJhbmNoaXNlLW1hbmFnZW1lbnQtc3lzdGVtXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Td2FkZXNoaSUyMFNvbHV0aW9ucy9Td2FkZXNoaVNvbHV0aW9ucy1mcmFuY2hpc2UtbWFuYWdlbWVudC1zeXN0ZW0vdml0ZS5jb25maWcudHNcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuXHJcbi8vIFJlYWQgdmVyc2lvbiBmcm9tIHBhY2thZ2UuanNvblxyXG5jb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwYWNrYWdlLmpzb24nKSwgJ3V0Zi04JykpO1xyXG5jb25zdCBBUFBfVkVSU0lPTiA9IHBhY2thZ2VKc29uLnZlcnNpb247XHJcblxyXG4vLyBHZW5lcmF0ZSBidWlsZCB0aW1lc3RhbXAgZm9yIHNlcnZpY2Ugd29ya2VyIGNhY2hlIGJ1c3RpbmdcclxuY29uc3QgQlVJTERfVElNRVNUQU1QID0gRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIC8vIFVwZGF0ZSBzZXJ2aWNlIHdvcmtlciBhbmQgZ2VuZXJhdGUgdmVyc2lvbiBmaWxlcyBvbiBidWlsZFxyXG4gIGlmIChtb2RlID09PSAncHJvZHVjdGlvbicpIHtcclxuICAgIC8vIFVwZGF0ZSBzZXJ2aWNlIHdvcmtlciB3aXRoIGJ1aWxkIHRpbWVzdGFtcFxyXG4gICAgY29uc3Qgc3dQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9zdy5qcycpO1xyXG4gICAgbGV0IHN3Q29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzd1BhdGgsICd1dGYtOCcpO1xyXG4gICAgc3dDb250ZW50ID0gc3dDb250ZW50LnJlcGxhY2UoJ19fQlVJTERfVElNRVNUQU1QX18nLCBCVUlMRF9USU1FU1RBTVApO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhzd1BhdGgsIHN3Q29udGVudCk7XHJcbiAgICBjb25zb2xlLmxvZyhgW0J1aWxkXSBTZXJ2aWNlIFdvcmtlciBjYWNoZSB2ZXJzaW9uOiBzd2FkZXNoaS0ke0JVSUxEX1RJTUVTVEFNUH1gKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSB2ZXJzaW9uLmpzb24gZm9yIHJ1bnRpbWUgdmVyc2lvbiBjaGVja2luZ1xyXG4gICAgY29uc3QgdmVyc2lvbkluZm8gPSB7XHJcbiAgICAgIHZlcnNpb246IEFQUF9WRVJTSU9OLFxyXG4gICAgICBidWlsZFRpbWVzdGFtcDogQlVJTERfVElNRVNUQU1QLFxyXG4gICAgICBidWlsZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgfTtcclxuICAgIGZzLndyaXRlRmlsZVN5bmMoXHJcbiAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMvdmVyc2lvbi5qc29uJyksXHJcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZlcnNpb25JbmZvLCBudWxsLCAyKVxyXG4gICAgKTtcclxuICAgIGNvbnNvbGUubG9nKGBbQnVpbGRdIEFwcCB2ZXJzaW9uOiAke0FQUF9WRVJTSU9OfWApO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGBbQnVpbGRdIEFwcCB2ZXJzaW9uOiAke0FQUF9WRVJTSU9OfSAodHJhY2tlZCBpbiB2ZXJzaW9uLmpzb24pYCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gIGRlZmluZToge1xyXG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShBUFBfVkVSU0lPTiksXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBQcm94eSAvYXBpL3N1cGFiYXNlIHRvIHRoZSByZWFsIFN1cGFiYXNlIFVSTCBkdXJpbmcgbG9jYWwgZGV2ZWxvcG1lbnQuXHJcbiAgICAgIC8vIEluIHByb2R1Y3Rpb24sIFZlcmNlbC9OZXRsaWZ5IHJld3JpdGVzIGhhbmRsZSB0aGlzIGluc3RlYWQuXHJcbiAgICAgIC8vIFRoaXMgYnlwYXNzZXMgSmlvIGFuZCBvdGhlciBJU1AgYmxvY2tzIG9uICouc3VwYWJhc2UuY28gZG9tYWlucy5cclxuICAgICAgJy9hcGkvc3VwYWJhc2UnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9zd2FkZXNoaXNvbHV0aW9ucy5jby5pbicsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIC8vIFdoZW4gcHJveHlpbmcgdG8gVmVyY2VsLCB3ZSBhY3R1YWxseSBET04nVCB3YW50IHRvIHJld3JpdGUgdGhlIHBhdGggXHJcbiAgICAgICAgLy8gYmVjYXVzZSBWZXJjZWwgaGFuZGxlcyB0aGUgL2FwaS9zdXBhYmFzZSAtPiByZWFsIHN1cGFiYXNlIHJvdXRpbmcuXHJcbiAgICAgICAgLy8gV2UganVzdCB3YW50IHRvIGZvcndhcmQgdGhlIHJlcXVlc3QgYXMtaXMgdG8gdGhlIFZlcmNlbCBhcHAuXHJcbiAgICAgICAgc2VjdXJlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5OiBhbnkpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHkgRXJyb3JdJywgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTUwMCwgLy8gU3VwcHJlc3Mgd2FybmluZ3MgZm9yIGV4cGVjdGVkIGxhcmdlIHZlbmRvciBjaHVua3MgbGlrZSBwZGYvZXhjZWwgdXRpbHNcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBWZW5kb3IgY2h1bmtzIC0gc3BsaXQgbGFyZ2UgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFtcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRhYnMnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9hc3QnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdkYXRhLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJywgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxyXG4gICAgICAgICAgJ2NoYXJ0LXZlbmRvcic6IFsncmVjaGFydHMnLCAnaGlnaGNoYXJ0cycsICdoaWdoY2hhcnRzLXJlYWN0LW9mZmljaWFsJ10sXHJcbiAgICAgICAgICAnZm9ybS12ZW5kb3InOiBbJ3JlYWN0LWhvb2stZm9ybScsICdAaG9va2Zvcm0vcmVzb2x2ZXJzJywgJ3pvZCddLFxyXG4gICAgICAgICAgJ3V0aWxzLXZlbmRvcic6IFsnZGF0ZS1mbnMnLCAnY2xzeCcsICd0YWlsd2luZC1tZXJnZSddLFxyXG4gICAgICAgICAgJ3BkZi12ZW5kb3InOiBbJ2pzcGRmJywgJ2h0bWwyY2FudmFzJywgJ2h0bWwycGRmLmpzJ10sXHJcbiAgICAgICAgICAnZXhjZWwtdmVuZG9yJzogWyd4bHN4JywgJ2V4Y2VsanMnXSxcclxuICAgICAgICAgICdpY29uLXZlbmRvcic6IFsnbHVjaWRlLXJlYWN0J10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3RzL3NldHVwLnRz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
