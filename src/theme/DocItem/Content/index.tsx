import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import Comments from "@site/src/components/Comments";
import {useLocation} from "@docusaurus/router";

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
    const {pathname} = useLocation();
    return (
        <>
            <Content {...props} />
            <Comments articleId={pathname}/>
        </>
    );
}
