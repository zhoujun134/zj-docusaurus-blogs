import Link from '@docusaurus/Link'
import type { Props } from '@theme/PaginatorNavLink'
import {cn} from "@site/src/utils/cnUtils";

export default function PaginatorNavLink(props: Props): JSX.Element {
    const { permalink, title, subLabel, isNext } = props
    return (
        <Link
            className={cn(
                'pagination-nav__link border-2 border-link hover:bg-[#a1d8f71b]',
                isNext ? 'pagination-nav__link--next' : 'pagination-nav__link--prev',
            )}
            to={permalink}
        >
            {subLabel && <div className="pagination-nav__sublabel">{subLabel}</div>}
            <div className="pagination-nav__label">{title}</div>
        </Link>
    )
}
