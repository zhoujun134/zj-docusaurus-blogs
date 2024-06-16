import Translate from '@docusaurus/Translate'
import features, {type FeatureItem} from '@site/data/features'
import {cn} from "@site/src/utils/cnUtils";
import React from "react";
import Skill from "@site/src/components/loading/FeaturesSection/Skill";
import {Section} from "@site/src/components/loading/Section";
import Github from "@site/src/components/loading/FeaturesSection/Github";

function Feature({title, Svg, text}: FeatureItem) {
    return (
        <div
            className={cn(
                'relative flex w-full flex-col gap-2 rounded-md bg-transparent p-0 transition-all duration-300 ease-linear',
            )}
        >
            <div className="text-center">
                <Svg className={'h-[150px] w-full'} role="img"/>
            </div>
            <div className="py-4 text-left">
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
        </div>
    )
}

export default function FeaturesSection() {
    return (
        <Section title={<Translate id="homepage.feature.title">个人特点</Translate>} icon={'ri:map-pin-user-line'}>
            <div className="flex w-full flex-col justify-center gap-4 md:flex-row max-lg:px-4">
                {features.map((props, idx) => (
                    <Feature key={idx} {...props} />
                ))}
            </div>
            <div
                className="flex w-full flex-col justify-center gap-4 md:grid md:grid-cols-6 md:grid-rows-2 max-md:px-4">
                <Skill className="md:col-span-2 md:row-span-2"/>
                <Github className="h-full md:col-span-4 md:row-span-2"/>
            </div>
        </Section>
    )
}
