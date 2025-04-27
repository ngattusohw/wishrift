import { useState, useCallback, useEffect } from "react";

const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setCopied(false);
      }
    );
  }, []);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return [copied, copy] as const;
};

export default useCopyToClipboard;
