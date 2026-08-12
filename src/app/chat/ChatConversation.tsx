"use client";

import { useState } from "react";
import { Copy, Code, Check, CodeXml, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Define a custom Prism theme to match the reference design colors
const customPrismTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#171717",
    background: "#F3F3F3",
    fontFamily:
      '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "400",
  },
  'pre[class*="language-"]': {
    color: "#000000",
    background: "transparent",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    margin: 0,
    padding: "0 24px 24px 24px",
    overflowX: "auto",
  },
  keyword: {
    color: "#D946EF",
  },
  string: { color: "#16A34A" }, // Green strings
  builtin: { color: "#6366F1" }, // Violet builtins/variables
  variable: { color: "#6366F1" },
  function: { color: "#6366F1" },
  "class-name": { color: "#6366F1" },
  operator: { color: "#000000" },
  punctuation: { color: "#1F2937" },
  property: { color: "#6366F1" },
  number: { color: "#6366F1" },
  comment: { color: "#9CA3AF" },
};

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string | null;
  provider?: string | null;
}

interface ChatConversationProps {
  messages: Message[];
  isGenerating?: boolean;
}

interface CodeBlockProps {
  language: string;
  codeText: string;
  [key: string]: unknown;
}

const CodeBlock = ({ language, codeText, ...props }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-3xl bg-[#F3F3F3]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2 select-none">
        <div className="flex items-center gap-2 text-neutral-900">
          <CodeXml size={16} strokeWidth={1.8} className="text-neutral-700" />
          <span className="text-sm font-medium capitalize">{language}</span>
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
};

export default function ChatConversation({ messages, isGenerating }: ChatConversationProps) {
  return (
    <div className="w-[55%] max-w-[1100px] py-8 flex flex-col gap-6">
      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="rounded-xl bg-[#F5F5F5] select-none">
                <p className="text-sm text-neutral-900 font-normal px-4 py-2">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className="flex justify-start">
            <div className="rounded-xl max-w-full">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="mb-1 text-sm font-semibold text-neutral-900">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-1 mt-5 text-sm font-semibold text-neutral-900">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="mb-1 text-sm font-normal leading-6 text-neutral-900">
                      {children}
                    </p>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-900">
                      {children}
                    </strong>
                  ),

                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-2 border-neutral-300 pl-3 text-sm text-neutral-700">
                      {children}
                    </blockquote>
                  ),

                  ul: ({ children }) => (
                    <ul className="mb-4 list-disc pl-5 space-y-1">
                      {children}
                    </ul>
                  ),

                  li: ({ children }) => (
                    <li className="text-sm leading-6 text-neutral-900">
                      {children}
                    </li>
                  ),

                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeText = String(children).replace(/\n$/, "");
                    const language = match ? match[1] : "";

                    if (match) {
                      return (
                        <CodeBlock
                          language={language}
                          codeText={codeText}
                          {...props}
                        />
                      );
                    }

                    return (
                      <code
                        className="bg-neutral-100 rounded px-1.5 py-0.5 text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
      {isGenerating && (
        <div className="flex justify-start">
          <div className="bg-[#F5F5F5] px-4 py-2 rounded-xl max-w-full flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            <p className="text-sm font-normal text-neutral-900">
              Generating...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

