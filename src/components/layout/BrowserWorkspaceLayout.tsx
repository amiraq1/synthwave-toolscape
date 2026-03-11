import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Maximize2, Minimize2, Plus, X, ArrowLeft, ArrowRight, RotateCw, Home, Search, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

// -----------------------------------------------------
// 🚀 THE BLUEPRINT: Desktop-Class Browser Workspace Shell
// -----------------------------------------------------
// 1. Grid structure for the outer shell (Tabs + Toolbars)
// 2. Resizable Panels for the Viewport vs. Sidebar
// 3. Absolute Overflow control to prevent outer document scrolling
// -----------------------------------------------------

export const BrowserWorkspaceLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-cairo flex flex-col selection:bg-neon-purple/30">
        
      {/* ========================================== */}
      {/* 1. TITLE BAR & TABS (Grid: auto)           */}
      {/* ========================================== */}
      <header className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-2 select-none">
        {/* Window Controls (Mac style for aesthetics) */}
        <div className="flex items-center gap-2 px-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer" />
        </div>

        {/* Browser Tabs (Flexbox) */}
        <div className="flex-1 flex items-center gap-1 overflow-hidden h-full">
            <div className="h-8 max-w-[200px] min-w-[120px] bg-zinc-800 rounded-t-md border border-b-0 border-zinc-700 flex items-center px-3 gap-2 mt-auto relative z-10 group">
                <span className="w-4 h-4 rounded-sm bg-neon-purple/20 flex items-center justify-center text-neon-purple"><Zap className="w-3 h-3" /></span>
                <span className="text-sm truncate flex-1 font-medium">نبض AI Workspace</span>
                <X className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 hover:bg-zinc-700 rounded-sm cursor-pointer" />
            </div>
            
            <button className="h-6 w-6 rounded-md hover:bg-zinc-800 flex items-center justify-center ml-1 opacity-70 hover:opacity-100 transition-colors">
                <Plus className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. NAVIGATION BAR (Toolbar)                 */}
      {/* ========================================== */}
      <nav className="h-12 bg-zinc-900 flex items-center gap-2 px-3 border-b border-zinc-800 shadow-sm z-10">
          <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors" disabled><ArrowRight className="w-4 h-4 opacity-50" /></button>
              <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"><RotateCw className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors ml-1"><Home className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 max-w-3xl flex items-center h-8 bg-zinc-950 rounded-full border border-zinc-800 px-3 overflow-hidden focus-within:border-neon-purple/50 focus-within:ring-1 focus-within:ring-neon-purple/20 transition-all">
              <Search className="w-3.5 h-3.5 text-zinc-500 mr-2" />
              <input 
                type="text" 
                defaultValue="https://amiraq.org/workspace"
                className="w-full h-full bg-transparent border-none outline-none text-sm text-zinc-300 font-mono tracking-wide"
                readOnly
              />
          </div>

          <div className="flex items-center gap-2 ml-auto">
              <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={cn(
                      "p-1.5 rounded-md transition-colors border",
                      isSidebarOpen ? "bg-neon-purple/10 border-neon-purple/30 text-neon-purple" : "hover:bg-zinc-800 border-transparent text-zinc-400"
                  )}
              >
                  <Maximize2 className="w-4 h-4" />
              </button>
          </div>
      </nav>

      {/* ========================================== */}
      {/* 3. SPLIT WORKSPACE (Main Content + Sidebar) */}
      {/* ========================================== */}
      <main className="flex-1 flex overflow-hidden relative">
          <PanelGroup direction="horizontal" className="h-full w-full">
              
              {/* PRIMARY VIEWPORT (Iframe/App Space) */}
              <Panel defaultSize={75} minSize={30} className="h-full relative overflow-y-auto overflow-x-hidden bg-zinc-950 browser-viewport">
                  {children ? children : (
                      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-dot-pattern">
                          <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center shadow-2xl shadow-neon-purple/20">
                              <Zap className="w-10 h-10 text-white fill-white" />
                          </div>
                          <h1 className="text-3xl font-bold font-editorial mb-4">Workspace Engine Active</h1>
                          <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
                              This viewport operates independently. Scrolling here will not affect the sidebar or navigation layout. Perfect for nested routes or isolated dashboards.
                          </p>
                      </div>
                  )}
              </Panel>

              {/* RESIZER HANDLE (The intelligent draggable border) */}
              {isSidebarOpen && (
                  <PanelResizeHandle className="w-1.5 bg-zinc-900 border-x border-zinc-800 hover:bg-neon-purple/50 active:bg-neon-purple transition-colors cursor-col-resize z-20 flex flex-col justify-center items-center group">
                      <div className="h-8 w-0.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                  </PanelResizeHandle>
              )}

              {/* INTELLIGENT SIDEBAR (Smart Assistant) */}
              {isSidebarOpen && (
                  <Panel defaultSize={25} minSize={20} maxSize={40} className="h-full bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10">
                      
                      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md">
                          <h2 className="text-sm font-semibold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                              المساعد الذكي نبض
                          </h2>
                          <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                              <Minimize2 className="w-4 h-4" />
                          </button>
                      </div>

                      {/* Sidebar Content (Independent Scroll) */}
                      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                           <div className="space-y-4">
                               <div className="p-3 bg-zinc-800 rounded-xl rounded-tr-sm border border-zinc-700 text-sm leading-relaxed">
                                   مرحباً The Blueprint! الشاشة مقسمة هيكلياً والمساحات معزولة بنجاح لضمان (Zero CLS). يمكنك سحب الحافة لتوسيع هذا الشريط بدون إعادة حساب لتصميم الواجهة المجاورة. ماذا تريد أن تبني تالياً؟
                               </div>
                               
                               <div className="w-[85%] ml-auto p-3 bg-neon-purple/20 rounded-xl rounded-tl-sm border border-neon-purple/30 text-neon-purple-light text-sm">
                                   نفذ كافة الاصلاحات ULTRATHINK
                               </div>
                           </div>
                      </div>

                      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur">
                          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-full p-1 pl-4 focus-within:border-neon-purple/50">
                              <input type="text" placeholder="اكتب أمراً للذكاء الاصطناعي..." className="flex-1 bg-transparent text-sm outline-none" />
                              <button className="h-8 w-8 rounded-full bg-neon-purple text-white flex items-center justify-center hover:bg-neon-purple/90 shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                                  <ArrowLeft className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </Panel>
              )}
          </PanelGroup>
      </main>

    </div>
  );
};
