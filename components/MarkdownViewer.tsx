
import React from 'react';
import { marked } from 'marked';

// Basic configuration for marked to render HTML
// In a real-world app, you'd want to use a sanitizer like DOMPurify
const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  return `<a target="_blank" rel="noopener noreferrer" href="${href}" title="${title || ''}" class="text-blue-400 hover:underline">${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

interface MarkdownViewerProps {
    content: string;
}

// A simple component to render markdown.
// WARNING: This is a basic implementation. For production,
// you MUST use a library like DOMPurify to sanitize the HTML
// to prevent XSS attacks. `dangerouslySetInnerHTML` is risky.
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    const parsedContent = marked.parse(content);

    const createMarkup = () => {
        // In a production app, you would sanitize here:
        // const clean = DOMPurify.sanitize(parsedContent);
        // return { __html: clean };
        return { __html: parsedContent as string };
    };

    return (
        <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none 
                       prose-headings:text-slate-100 
                       prose-p:text-slate-300 
                       prose-strong:text-slate-200
                       prose-ul:list-disc prose-ol:list-decimal
                       prose-li:text-slate-300
                       prose-blockquote:border-l-4 prose-blockquote:border-slate-500 prose-blockquote:text-slate-400
                       prose-code:bg-slate-700 prose-code:rounded prose-code:px-1.5 prose-code:py-1 prose-code:text-rose-300
                       prose-pre:bg-slate-900/70 prose-pre:p-4 prose-pre:rounded-md"
            dangerouslySetInnerHTML={createMarkup()}
        />
    );
};
