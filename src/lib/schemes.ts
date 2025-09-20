

import type { Translations } from './translations';

export interface Scheme {
    id: string;
    name: string;
    description: string;
    eligibility: {
        summary: string;
        landHolding?: string; // e.g., "up to 2 hectares"
        criteria: string[];
    };
    benefitsSummary: string;
    benefits: string[];
    applicationProcess: {
        step: string;
        detail: string;
    }[];
    documents: string[];
    link: string;
    status: 'Ongoing' | 'Upcoming' | 'Closed';
}

// Using a function to incorporate translations
export const schemes = (t: Translations): Scheme[] => [
    {
        id: 'pm-kisan',
        name: t.schemes.pm_kisan.name,
        description: t.schemes.pm_kisan.description,
        eligibility: {
            summary: t.schemes.pm_kisan.eligibility.summary,
            landHolding: "any",
            criteria: t.schemes.pm_kisan.eligibility.criteria,
        },
        benefitsSummary: t.schemes.pm_kisan.benefitsSummary,
        benefits: t.schemes.pm_kisan.benefits,
        applicationProcess: t.schemes.pm_kisan.applicationProcess,
        documents: t.schemes.pm_kisan.documents,
        link: 'https://pmkisan.gov.in/',
        status: 'Ongoing',
    },
    {
        id: 'pmfby',
        name: t.schemes.pmfby.name,
        description: t.schemes.pmfby.description,
        eligibility: {
            summary: t.schemes.pmfby.eligibility.summary,
            criteria: t.schemes.pmfby.eligibility.criteria,
        },
        benefitsSummary: t.schemes.pmfby.benefitsSummary,
        benefits: t.schemes.pmfby.benefits,
        applicationProcess: t.schemes.pmfby.applicationProcess,
        documents: t.schemes.pmfby.documents,
        link: 'https://pmfby.gov.in/',
        status: 'Ongoing',
    },
    {
        id: 'kcc',
        name: t.schemes.kcc.name,
        description: t.schemes.kcc.description,
        eligibility: {
            summary: t.schemes.kcc.eligibility.summary,
            criteria: t.schemes.kcc.eligibility.criteria,
        },
        benefitsSummary: t.schemes.kcc.benefitsSummary,
        benefits: t.schemes.kcc.benefits,
        applicationProcess: t.schemes.kcc.applicationProcess,
        documents: t.schemes.kcc.documents,
        link: 'https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card',
        status: 'Ongoing',
    },
    {
        id: 'pm-kusum',
        name: t.schemes.pm_kusum.name,
        description: t.schemes.pm_kusum.description,
        eligibility: {
            summary: t.schemes.pm_kusum.eligibility.summary,
            criteria: t.schemes.pm_kusum.eligibility.criteria,
        },
        benefitsSummary: t.schemes.pm_kusum.benefitsSummary,
        benefits: t.schemes.pm_kusum.benefits,
        applicationProcess: t.schemes.pm_kusum.applicationProcess,
        documents: t.schemes.pm_kusum.documents,
        link: 'https://pmkusum.mnre.gov.in/',
        status: 'Ongoing',
    },
     {
        id: 'soil-health-card',
        name: t.schemes.soil_health_card.name,
        description: t.schemes.soil_health_card.description,
        eligibility: {
            summary: t.schemes.soil_health_card.eligibility.summary,
            criteria: t.schemes.soil_health_card.eligibility.criteria,
        },
        benefitsSummary: t.schemes.soil_health_card.benefitsSummary,
        benefits: t.schemes.soil_health_card.benefits,
        applicationProcess: t.schemes.soil_health_card.applicationProcess,
        documents: t.schemes.soil_health_card.documents,
        link: 'https://soilhealth.dac.gov.in/',
        status: 'Ongoing',
    },
     {
        id: 'agri-infra-fund',
        name: t.schemes.agri_infra_fund.name,
        description: t.schemes.agri_infra_fund.description,
        eligibility: {
            summary: t.schemes.agri_infra_fund.eligibility.summary,
            criteria: t.schemes.agri_infra_fund.eligibility.criteria,
        },
        benefitsSummary: t.schemes.agri_infra_fund.benefitsSummary,
        benefits: t.schemes.agri_infra_fund.benefits,
        applicationProcess: t.schemes.agri_infra_fund.applicationProcess,
        documents: t.schemes.agri_infra_fund.documents,
        link: 'https://agriinfra.dac.gov.in/',
        status: 'Ongoing',
    },
];
