import * as React from 'react';
import { extension } from 'showdown';
import { SyncMarkdownView } from '@console/internal/components/markdown-view';
import { MarkdownHighlightExtension } from '@console/shared';
import { HIGHLIGHT_REGEXP } from '@console/shared/src/components/markdown-highlight-extension/highlight-consts';
import { useCloudShellCommandDispatch } from '../../redux/actions/cloud-shell-actions';

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
      regex: /`(.*?)`{{execute}}/g,
      replace: (text: string, linkLabel: string, linkType: string, linkId: string): string => {
        if (!linkLabel || !linkType || !linkId) return text;
        return `<code id="${linkType}" data-execute-text="${linkType}">${linkLabel}</code><button data-execute-for="${linkType}">Execute</button>`;
      },
    },
  ];
});

type QuickStartMarkdownViewProps = {
  content: string;
  exactHeight?: boolean;
};

const QuickStartMarkdownExecute = ({ docContext, rootSelector }) => {
  const setCloudShellCommand = useCloudShellCommandDispatch();
  React.useEffect(() => {
    const elements = docContext.querySelectorAll(`${rootSelector} [data-execute-for]`);
    const execute = (e) => {
      const attributeValue = e.target.getAttribute('data-execute-for');
      const textToExecute = docContext.querySelector(`[data-execute-text="${attributeValue}"]`)
        .innerText;
      // eslint-disable-next-line
      console.log('Excuted:', textToExecute);
      setCloudShellCommand(textToExecute);
    };

    elements && elements.forEach((elm) => elm.addEventListener('click', execute));
    return () => {
      elements && elements.forEach((elm) => elm.removeEventListener('click', execute));
    };
  }, [docContext, rootSelector, setCloudShellCommand]);

  return null;
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
          <QuickStartMarkdownExecute docContext={docContext} rootSelector={rootSelector} />
        </>
      )}
    />
  );
};
export default QuickStartMarkdownView;
