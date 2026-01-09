import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseLine = (line: string) => {
    // Handle Bold (**text**)
    // Use React.ReactNode instead of JSX.Element to avoid namespace errors
    let parts: (string | React.ReactNode)[] = [line];
    
    // Bold
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*\*.*?\*\*)/);
      return subParts.map((sub, i) => 
        sub.startsWith('**') && sub.endsWith('**') 
          ? <strong key={i} className="font-bold text-slate-900">{sub.slice(2, -2)}</strong> 
          : sub
      );
    });

    // Italics (*text*)
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*.*?\*)/);
      return subParts.map((sub, i) => 
        sub.startsWith('*') && sub.endsWith('*') 
          ? <em key={i} className="italic">{sub.slice(1, -1)}</em> 
          : sub
      );
    });

    return parts;
  };

  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;

      if (trimmed.startsWith('# ')) {
        return <h1 key={i} className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900 serif leading-tight">{parseLine(trimmed.slice(2))}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-slate-800 border-b border-slate-100 pb-3">{parseLine(trimmed.slice(3))}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-slate-700">{parseLine(trimmed.slice(4))}</h3>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={i} className="ml-6 mb-3 list-disc text-slate-700 leading-relaxed pl-2">{parseLine(trimmed.slice(2))}</li>;
      }
      if (trimmed.match(/^\d+\./)) {
        return <li key={i} className="ml-6 mb-3 list-decimal text-slate-700 leading-relaxed pl-2">{parseLine(trimmed.replace(/^\d+\. /, ''))}</li>;
      }
      if (trimmed.startsWith('> ')) {
        return <blockquote key={i} className="border-l-4 border-emerald-500 pl-6 py-2 my-6 italic text-slate-600 bg-emerald-50/30 rounded-r-lg">{parseLine(trimmed.slice(2))}</blockquote>;
      }

      return <p key={i} className="mb-6 text-slate-700 leading-relaxed text-lg md:text-xl font-normal">{parseLine(line)}</p>;
    });
  };

  return (
    <div className="max-w-none">
      {renderContent()}
    </div>
  );
};

export default MarkdownRenderer;