import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ExternalLink, Code2, Link2, FileText, Wrench } from 'lucide-react';
import { SkillVideo, ResourceItem } from '../types';
import { sound } from '../utils/audio';

interface ResourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
}

export const ResourcesDrawer: React.FC<ResourcesDrawerProps> = ({
  isOpen,
  onClose,
  skill,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    sound.playPop();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (type: ResourceItem['type']) => {
    switch (type) {
      case 'code':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'link':
        return <ExternalLink className="w-4 h-4 text-cyan-400" />;
      case 'prompt':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/20">
                🛠️
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                  صندوق الأدوات والمصادر
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                    {skill.resources.length} موارد
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  أكواد، قوالب وروابط خارجية جاهزة للاستخدام الفوري
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Resources List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {skill.resources.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-2 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neutral-900">
                      {getIcon(item.type)}
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-neutral-100">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-cyan-600/30 text-neutral-400 hover:text-cyan-300 transition-colors"
                        title="فتح الرابط"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleCopy(item.id, item.content)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">تم</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
