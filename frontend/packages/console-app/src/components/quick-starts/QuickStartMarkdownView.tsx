import * as React from 'react';
import { extension } from 'showdown';
import { SyncMarkdownView } from '@console/internal/components/markdown-view';
import { MarkdownHighlightExtension } from '@console/shared';
import { HIGHLIGHT_REGEXP } from '@console/shared/src/components/markdown-highlight-extension/highlight-consts';

const EXTENSION_NAME = 'quickstart';
extension(EXTENSION_NAME, () => {
  return [
    {
      type: 'lang',
      regex: HIGHLIGHT_REGEXP,
      replace: (text: string, linkLabel: string, linkType: string, linkId: string): string => {
        if (!linkLabel || !linkType || !linkId) return text;
        return `<button class="pf-c-button pf-m-inline pf-m-link" data-highlight="${linkId}">${linkLabel}</button>`;
      },
    },
    {
      type: 'lang',
      regex: /`(.*?)`{{copy}}/g,
      replace: (text: string, linkLabel: string, linkType: string, linkId: string): string => {
        if (!linkLabel || !linkType || !linkId) return text;
        return `<code id="${linkType}" data-copy-text="${linkType}">${linkLabel}</code><button data-copy-for="${linkType}">Copy</button>`;
      },
    },
    {
      type: 'lang',
      regex: /```(.*\n)+```{{copy execute}}/g,
      replace: (text: string, linkLabel: string, linkType: string, linkId: string): string => {
        if (!linkLabel || !linkType || !linkId) return text;
        return `<pre><code id="${linkType}" data-copy-text="${linkType}">${
          text.split('```')[1]
        }</code></pre><button data-copy-for="${linkType}">Copy</button>`;
      },
    },
  ];
});

const QuickStartMarkdownCopy = ({ docContext, rootSelector }) => {
  React.useEffect(() => {
    const elements = docContext.querySelectorAll(`${rootSelector} [data-copy-for]`);
    const consoleLog = (e) => {
      const attributeValue = e.target.getAttribute('data-copy-for');
      const textToCopy = docContext.querySelector(`[data-copy-text="${attributeValue}"]`).innerText;
      // eslint-disable-next-line
      console.log('Copied to Clipboard', textToCopy);
    };

    elements && elements.forEach((elm) => elm.addEventListener('click', consoleLog));
    return () => {
      elements && elements.forEach((elm) => elm.removeEventListener('click', consoleLog));
    };
  }, [docContext, rootSelector]);

  return null;
};

type QuickStartMarkdownViewProps = {
  content: string;
  exactHeight?: boolean;
};

const QuickStartMarkdownView: React.FC<QuickStartMarkdownViewProps> = ({
  content,
  exactHeight,
}) => {
  return (
    <SyncMarkdownView
      inline
      content={content}
      exactHeight={exactHeight}
      extensions={[EXTENSION_NAME]}
      renderExtension={(docContext, rootSelector) => (
        <>
          <MarkdownHighlightExtension
            key={content}
            docContext={docContext}
            rootSelector={rootSelector}
          />
          <QuickStartMarkdownCopy docContext={docContext} rootSelector={rootSelector} />
        </>
      )}
    />
  );
};
export default QuickStartMarkdownView;
