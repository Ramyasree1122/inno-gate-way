"use client";

import { useState } from "react";
import { Copy, Code, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Define a custom Prism theme to match the reference design colors
const customPrismTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#000000",
    background: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  'pre[class*="language-"]': {
    color: "#000000",
    background: "transparent",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    margin: 0,
    padding: "0 24px 24px 24px",
    overflowX: "auto",
  },
  "keyword": { color: "#c026d3" },      // Pink/magenta keywords e.g. import
  "string": { color: "#16A34A" },       // Green strings
  "builtin": { color: "#6366F1" },      // Violet builtins/variables
  "variable": { color: "#6366F1" },
  "function": { color: "#6366F1" },
  "class-name": { color: "#6366F1" },
  "operator": { color: "#000000" },
  "punctuation": { color: "#1F2937" },
  "property": { color: "#6366F1" },
  "number": { color: "#6366F1" },
  "comment": { color: "#9CA3AF" },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatConversationProps {
  messages: Message[];
}

export default function ChatConversation({ messages }: ChatConversationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[50%] max-w-[1100px] mx-auto py-8 flex flex-col gap-6 flex-1 overflow-y-auto min-h-0">
      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="rounded-2xl bg-neutral-100 px-5 py-2.5 max-w-[80%]">
                <p className="text-sm text-neutral-900 select-none">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className="w-full">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mb-4 text-2xl font-semibold text-neutral-900">
                    {children}
                  </h2>
                ),
                p: ({ children }) => {
                  // Only render paragraph element if it has non-empty children
                  if (!children) return null;
                  return <p className="mb-4 text-neutral-900">{children}</p>;
                },
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeText = String(children).replace(/\n$/, "");
                  const language = match ? match[1] : "";

                  if (match) {
                    return (
                      <div className="my-4 overflow-hidden rounded-3xl bg-[#F5F5F5]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-2 select-none">
                          <div className="flex items-center gap-2 text-neutral-900">
                            <Code size={16} strokeWidth={1.8} className="text-neutral-700" />
                            <span className="text-sm font-medium capitalize">
                              {language}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(codeText)}
                            className="cursor-pointer text-neutral-500 hover:text-black transition-colors"
                            title="Copy code"
                          >
                            {copied ? (
                              <Check size={16} strokeWidth={1.8} className="text-green-600" />
                            ) : (
                              <Copy size={16} strokeWidth={1.8} />
                            )}
                          </button>
                        </div>

                        {/* Syntax Highlighted Code */}
                        <SyntaxHighlighter
                          style={customPrismTheme}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {codeText}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className="bg-neutral-100 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

