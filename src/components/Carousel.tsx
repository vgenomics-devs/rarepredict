'use client'

import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { Shield, TrendingUp, Brain } from 'lucide-react'
import React from 'react'

const features = [
    {
        Icon: Shield,
        title: 'Secure & Private',
        desc: 'Your health data is encrypted and never shared without your consent.',
    },
    {
        Icon: TrendingUp,
        title: 'Evidence-Based',
        desc: 'Powered by the latest medical research and validated clinical data',
    },
    {
        Icon: Brain,
        title: 'Clinical Validation',
        desc: 'Developed in collaboration with medical professionals',
    },
]

export default function FeatureCarousel() {
    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: {
            perView: 1,
            spacing: 16,
        },
        breakpoints: {
            '(min-width: 768px)': {
                slides: { perView: 2 },
            },
            '(min-width: 1024px)': {
                slides: { perView: 3 },
            },
        },
    })

    return (
        <div ref={sliderRef} className="keen-slider">
            {features.map((feature, idx) => (
                <div key={idx} className="keen-slider__slide">
                    <div className="backdrop-blur-sm p-6 rounded-xl border border-border/30 bg-[#DFDAE4] h-full">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#DFDAE4]">
                            <feature.Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-jakarta text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
