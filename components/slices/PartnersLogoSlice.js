import React from 'react'
import { PageContainer, SectionContainer } from './PartnersLogoSliceStyles'
const PartnersLogoSlice = ( {slice} ) => {
    return (
    <PageContainer>
        <SectionContainer>
            <h3>{slice.primary.partners_title.text}</h3>
            <div className="partner-logo-container">
                {slice.items.map((logo, index) => (
                <div className="item" key={`logo-${index}`}>
                <img
                    src={logo.partnerlogo.fixed.src}
                    alt={logo.partnerlogo_alt.text}
                />
                </div>
                ))}
            </div>
        </SectionContainer>
    </PageContainer>
    )
}

export default PartnersLogoSlice
