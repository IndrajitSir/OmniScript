import { useMemo, useState } from 'react';
import { CopyButton, Field, Hint, OutputPane, Select, TextArea, TextInput, ToolCard, ToolFrame } from '../../../../components/toolkit';

function slugify(input: string, separator: string, maxLength: number): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
  return maxLength > 0 ? slug.slice(0, maxLength).replace(new RegExp(`\\${separator}+$`), '') : slug;
}

export function SlugifyTool() {
  const [input, setInput] = useState('10 Tips for a Healthier Développement Workflow!');
  const [separator, setSeparator] = useState('-');
  const [maxLength, setMaxLength] = useState('160');
  const limit = Number(maxLength) || 0;
  const slug = useMemo(() => slugify(input, separator, limit), [input, separator, limit]);

  return (
    <ToolFrame>
      <ToolCard title="Headline">
        <Field label="Input text">
          <TextArea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[6rem]" />
        </Field>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <Field label="Separator">
            <Select
              value={separator}
              onChange={setSeparator}
              options={[
                { value: '-', label: 'Hyphen (-)' },
                { value: '_', label: 'Underscore (_)' },
                { value: '.', label: 'Dot (.)' },
              ]}
            />
          </Field>
          <Field label="Max length">
            <TextInput
              value={maxLength}
              onChange={(event) => setMaxLength(event.target.value.replace(/[^0-9]/g, ''))}
              placeholder="160"
            />
          </Field>
        </div>
        <Hint>Diacritics are transliterated (déjà → deja) and punctuation is dropped.</Hint>
      </ToolCard>

      <ToolCard title="Slug" actions={<CopyButton text={slug} />}>
        <OutputPane tone={slug ? 'ok' : 'warn'}>{slug || '(empty — nothing slugifiable)'}</OutputPane>
      </ToolCard>
    </ToolFrame>
  );
}
