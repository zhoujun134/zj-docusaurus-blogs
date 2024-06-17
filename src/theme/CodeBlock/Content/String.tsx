import React, {useState} from 'react';
import clsx from 'clsx';
import {useThemeConfig, usePrismTheme} from '@docusaurus/theme-common';
import {
  parseCodeBlockTitle,
  parseLanguage,
  parseLines,
  containsLineNumbers,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import {Highlight, type Language} from 'prism-react-renderer';
import Line from '@theme/CodeBlock/Line';
import CopyButton from '@theme/CodeBlock/CopyButton';
import WordWrapButton from '@theme/CodeBlock/WordWrapButton';
import Container from '@theme/CodeBlock/Container';
import type {Props} from '@theme/CodeBlock/Content/String';

import styles from './styles.module.css';
import CollapseCodeButton from "@site/src/theme/CodeBlock/CollapseCodeButton";
function normalizeLanguage(language: string | undefined): string | undefined {
  return language?.toLowerCase();
}

export default function CodeBlockString({
  children,
  className: blockClassName = '',
  metastring,
  title: titleProp,
  showLineNumbers: showLineNumbersProp,
  language: languageProp,
}: Props): JSX.Element {
  const {
    prism: {defaultLanguage, magicComments},
  } = useThemeConfig();
  const language = normalizeLanguage(
    languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage,
  );

  const prismTheme = usePrismTheme();
  const wordWrap = useCodeWordWrap();

  const title = parseCodeBlockTitle(metastring) || titleProp;

  const {lineClassNames, code} = parseLines(children, {
    metastring,
    language,
    magicComments,
  });

  // 这里直接修改为 显示行号
  const showLineNumbers = true;
  // 是否折叠代码的变量
  const [isExpanded, setIsExpanded] = useState(true);

  // 触发折叠时，修改 isExpanded 变量的值。
  const toggleCodeView = () => {
    setIsExpanded(!isExpanded);
  };
  return (
      <Container
          as="div"
          className={clsx(
              blockClassName,
              language &&
              !blockClassName.includes(`language-${language}`) &&
              `language-${language}`,
          )}>
        {title && <div className={styles.codeBlockTitle}>{title}</div>}
        <div className=
                 {clsx(
                     styles.codeBlockContent,
                     !isExpanded && styles.codeBlockContentDisplayNone,
                 )}>
          <div className=
                   {clsx(
                       styles.buttonGroup,
                       showLineNumbers && styles.codeBlockLinesWithNumbering,
                       !isExpanded && styles.buttonGroupDisplayNone,
                   )}>
            <button className=
                        {clsx(
                            styles.codeButton,
                            !isExpanded && styles.buttonLanguageDisplayNone,
                        )}> {language} </button>
            <CopyButton className={styles.codeButton} code={code}/>
            <CollapseCodeButton className={styles.codeButton}
                                onClick={toggleCodeView}
                                isEnabled={isExpanded}/>
          </div>
          <Highlight
              theme={prismTheme}
              code={code}
              language={(language ?? 'javascript') as Language}>
            {({className, style, tokens, getLineProps, getTokenProps}) => (
                <pre
                    /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                    tabIndex={0}
                    ref={wordWrap.codeBlockRef}
                    className={clsx(className, styles.codeBlock, 'thin-scrollbar')}
                    style={style}>
              <code
                  className={clsx(
                      styles.codeBlockLines,
                      showLineNumbers && styles.codeBlockLinesWithNumbering,
                      !isExpanded && styles.codeBlockDisplayNone,
                  )}>
                {tokens.map((line, i) => (
                    <Line
                        key={i}
                        line={line}
                        getLineProps={getLineProps}
                        getTokenProps={getTokenProps}
                        classNames={lineClassNames[i]}
                        showLineNumbers={showLineNumbers}
                    />
                ))}
              </code>
            </pre>
            )}
          </Highlight>
        </div>
      </Container>
  );
}
