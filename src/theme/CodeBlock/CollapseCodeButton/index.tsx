// 代码折叠组件
import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';

import styles from './styles.module.css';
import {Props} from "@theme/CodeBlock/WordWrapButton";

export default function CollapseCodeButton({
                                               className,
                                               onClick,
                                               isEnabled,
                                           }: Props): JSX.Element | null {
    const title = translate({
        id: 'theme.CodeBlock.wordWrapToggle',
        message: '代码折叠展开',
        description:
            'The title attribute for toggle word wrapping button of code block lines',
    });
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'clean-btn',
                className,
                isEnabled && styles.wordWrapButtonEnabled,
            )}
            aria-label={title}
            title={title}>
            {isEnabled ? '折叠代码' : '展开代码'}
        </button>
    );
}
