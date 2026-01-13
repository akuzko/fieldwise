import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  defaultExpanded?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  title = 'Source Code',
  defaultExpanded = false
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <button
          className="code-block-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="code-block-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="code-block-title">{title}</span>
        </button>
        {isExpanded && (
          <button className="code-block-copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="code-block-content">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              fontSize: '0.875rem'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
