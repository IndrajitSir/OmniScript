import { useEffect, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, ToolCard, ToolFrame } from '../../../../components/toolkit';

const ALGORITHMS = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'].map((value) => ({
  value,
  label: value,
}));

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function HashGeneratorTool() {
  const [text, setText] = useState('OmniScript');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setError('');
      if (!globalThis.crypto?.subtle) {
        setDigest('');
        setError('WebCrypto is unavailable — hashing needs a secure context (https or localhost).');
        return;
      }
      try {
        const data = new TextEncoder().encode(text);
        const buffer = await crypto.subtle.digest(algorithm, data);
        if (!cancelled) setDigest(`${toHex(buffer)}\n\nbase64: ${toBase64(buffer)}`);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'digest failed');
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [text, algorithm]);

  return (
    <ToolFrame>
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolCard title="Input">
          <Field label="Plaintext">
            <TextArea value={text} onChange={(event) => setText(event.target.value)} />
          </Field>
          <div className="max-w-[12rem]">
            <Field label="Algorithm">
              <Select value={algorithm} onChange={setAlgorithm} options={ALGORITHMS} />
            </Field>
          </div>
          <Hint>SHA-1 is listed for legacy checksum comparison only — do not use it for security.</Hint>
        </ToolCard>

        <ToolCard
          title="Digest"
          actions={digest ? <CopyButton text={digest.split('\n')[0]!} label="Copy hex" /> : undefined}
        >
          <OutputPane tone={error ? 'err' : 'ok'}>{error || digest || 'computing…'}</OutputPane>
        </ToolCard>
      </div>
    </ToolFrame>
  );
}
