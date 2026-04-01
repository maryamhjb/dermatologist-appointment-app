'use client'

import { HomeFeaturesSection } from '@/components/home/home-features-section'
import { HomeHero } from '@/components/home/home-hero'
import { HomeOfficesSection } from '@/components/home/home-offices-section'

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeFeaturesSection />
      <HomeOfficesSection />
    </>
  )
}
