'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language = 'tsx', children }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(children);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-4 top-4 h-7 w-7"
        onClick={onCopy}
      >
        {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        <span className="sr-only">Copy code</span>
      </Button>
      <pre className="mb-4 mt-6 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900">
        <code
          className="relative rounded bg-muted p-4 px-[1rem] font-mono text-sm text-white"
          data-language={language}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}