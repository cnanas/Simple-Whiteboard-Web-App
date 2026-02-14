"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize rendering for better widget display
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-2 mb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mt-1 mb-0.5">{children}</h3>
          ),
          p: ({ children }) => <p className="my-1">{children}</p>,
          ul: ({ children }) => <ul className="my-1 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 pl-4">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code
                className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="block p-2 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono overflow-x-auto"
                {...props}
              >
                {children}
              </code>
            ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-1 italic">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
