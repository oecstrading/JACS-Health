/**
 * Notice of Privacy Practices (NPP)
 * 
 * HIPAA-compliant Notice of Privacy Practices with February 2026 updates
 * and Texas Medical Privacy Act requirements for electronic health records.
 * 
 * Effective Date: February 16, 2026
 */

export interface NPPVersion {
  version: string;
  effectiveDate: string;
  content: NPPContent;
}

export interface NPPContent {
  legalHeader: string;
  introduction: string;
  sections: NPPSection[];
  footer: string;
}

export interface NPPSection {
  id: string;
  title: string;
  content: string;
  subsections?: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Current NPP Version (February 2026 HIPAA Updates)
 */
export const CURRENT_NPP_VERSION: NPPVersion = {
  version: "2.0",
  effectiveDate: "2026-02-16",
  content: {
    legalHeader: "THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.",
    
    introduction: `This Notice of Privacy Practices describes how HealthMate Health Companion ("we," "us," or "our") may use and disclose your protected health information (PHI) to carry out treatment, payment, or health care operations, and for other purposes that are permitted or required by law. It also describes your rights to access and control your protected health information.

We are required by applicable federal and state law, including the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and the Texas Medical Privacy Act, to maintain the privacy of your protected health information. We are also required to give you this Notice about our privacy practices, our legal duties, and your rights concerning your protected health information.

This Notice is effective as of February 16, 2026, and incorporates the most recent federal HIPAA updates regarding the use and disclosure of sensitive health records.`,

    sections: [
      {
        id: "definitions",
        title: "Important Definitions",
        content: `**Protected Health Information (PHI):** Information about you, including demographic information, that may identify you and that relates to your past, present, or future physical or mental health or condition and related health care services.

**Sensitive Health Records:** As of February 16, 2026, federal HIPAA regulations specifically identify certain types of health information as "sensitive," including:
- Behavioral health information (mental health and psychiatric care)
- Substance use disorder information (alcohol and drug treatment)
- Reproductive health care information
- Gender-affirming care information
- Genetic testing information
- Sexually transmitted infection (STI) information

**Use:** The sharing, employment, application, utilization, examination, or analysis of PHI within our organization.

**Disclosure:** The release, transfer, provision of access to, or divulging of PHI outside our organization.`,
      },
      {
        id: "how_we_use",
        title: "How We May Use and Disclose Your Health Information",
        content: "We may use and disclose your protected health information for the following purposes:",
        subsections: [
          {
            title: "For Treatment",
            content: "We may use and disclose your PHI to provide, coordinate, or manage your health care and related services. This includes consultation between health care providers regarding your care and referrals to other health care providers. For example, we may share your medication list with your primary care physician or specialist to coordinate your care.",
          },
          {
            title: "For Payment",
            content: "We may use and disclose your PHI to obtain payment for health care services provided to you. This includes billing and collection activities, and determining eligibility for insurance coverage. For example, we may submit your intake form to your insurance company to verify coverage for a medical procedure.",
          },
          {
            title: "For Health Care Operations",
            content: "We may use and disclose your PHI for our health care operations, which include quality assessment and improvement activities, case management, care coordination, and business planning and development. For example, we may use your information to evaluate the quality of care you received or to train our staff.",
          },
          {
            title: "Sensitive Health Records - Enhanced Protections",
            content: "As of February 16, 2026, federal law provides enhanced protections for sensitive health records. We will not use or disclose sensitive health information (behavioral health, substance use disorder, reproductive health, gender-affirming care, genetic testing, or STI information) without your specific written authorization, except as required by law or for treatment, payment, and health care operations directly related to that sensitive information. You have the right to request additional restrictions on the use and disclosure of your sensitive health records.",
          },
        ],
      },
      {
        id: "permitted_uses",
        title: "Other Permitted and Required Uses and Disclosures",
        content: "We may also use and disclose your PHI without your authorization in the following situations:",
        subsections: [
          {
            title: "As Required by Law",
            content: "We will disclose your PHI when required to do so by federal, state, or local law, including the Texas Medical Privacy Act.",
          },
          {
            title: "Public Health Activities",
            content: "We may disclose your PHI for public health activities, such as reporting diseases, injuries, vital events (births and deaths), and public health investigations.",
          },
          {
            title: "Health Oversight Activities",
            content: "We may disclose your PHI to health oversight agencies for activities authorized by law, such as audits, investigations, inspections, and licensure actions.",
          },
          {
            title: "Judicial and Administrative Proceedings",
            content: "We may disclose your PHI in response to a court order, subpoena, discovery request, or other lawful process, subject to applicable legal protections.",
          },
          {
            title: "Law Enforcement",
            content: "We may disclose your PHI to law enforcement officials for law enforcement purposes, such as identifying or locating a suspect, fugitive, material witness, or missing person, or reporting a crime.",
          },
          {
            title: "To Avert a Serious Threat",
            content: "We may use and disclose your PHI when necessary to prevent a serious and imminent threat to your health or safety or the health or safety of others.",
          },
          {
            title: "Military and Veterans",
            content: "If you are a member of the armed forces, we may disclose your PHI as required by military command authorities.",
          },
          {
            title: "Workers' Compensation",
            content: "We may disclose your PHI for workers' compensation or similar programs that provide benefits for work-related injuries or illness.",
          },
        ],
      },
      {
        id: "your_rights",
        title: "Your Rights Regarding Your Health Information",
        content: "You have the following rights regarding your protected health information:",
        subsections: [
          {
            title: "Right to Inspect and Copy",
            content: "You have the right to inspect and obtain a copy of your PHI contained in your medical and billing records and in any other records used by us to make decisions about you. To inspect and copy your PHI, you must submit a written request. We may charge a reasonable fee for copying and mailing costs. In certain limited circumstances, we may deny your request to inspect and copy your PHI.",
          },
          {
            title: "Right to Amend",
            content: "If you believe that your PHI is incorrect or incomplete, you may request that we amend it. You have the right to request an amendment for as long as the information is kept by or for us. To request an amendment, you must submit a written request that provides a reason to support your request. We may deny your request if it is not in writing or does not include a reason to support the request.",
          },
          {
            title: "Right to an Accounting of Disclosures",
            content: "You have the right to request an accounting of certain disclosures of your PHI made by us during the six years prior to your request. This accounting will not include disclosures made for treatment, payment, or health care operations, or disclosures made to you or pursuant to your authorization.",
          },
          {
            title: "Right to Request Restrictions",
            content: "You have the right to request a restriction on the use and disclosure of your PHI for treatment, payment, or health care operations. You also have the right to request a limit on the PHI we disclose about you to someone who is involved in your care or the payment for your care. We are not required to agree to your request unless you are asking us to restrict the disclosure of PHI to a health plan for payment or health care operations purposes and the PHI pertains solely to a health care item or service for which you have paid us in full out-of-pocket.",
          },
          {
            title: "Right to Request Confidential Communications",
            content: "You have the right to request that we communicate with you about medical matters in a certain way or at a certain location. For example, you can ask that we only contact you at work or by mail. We will accommodate all reasonable requests.",
          },
          {
            title: "Right to a Paper Copy of This Notice",
            content: "You have the right to a paper copy of this Notice at any time, even if you have agreed to receive the Notice electronically. You may obtain a copy of this Notice from our website or by contacting us directly.",
          },
          {
            title: "Right to Be Notified of a Breach",
            content: "You have the right to be notified if we (or one of our Business Associates) discover a breach of your unsecured PHI.",
          },
          {
            title: "Right to Revoke Authorization",
            content: "You have the right to revoke any authorization you have given us to use or disclose your PHI, except to the extent that we have already taken action in reliance on your authorization.",
          },
        ],
      },
      {
        id: "texas_specific",
        title: "Texas Medical Privacy Act - Additional Protections",
        content: "Under the Texas Medical Privacy Act (Texas Health and Safety Code Chapter 181), you have additional privacy protections:",
        subsections: [
          {
            title: "Electronic Health Records",
            content: "Texas law requires that electronic health records be stored and maintained in compliance with state and federal privacy and security standards. Your health information collected through this electronic intake form is stored securely within the United States and is protected by encryption both at rest and in transit.",
          },
          {
            title: "Data Storage Location",
            content: "In compliance with Texas law, all protected health information collected through HealthMate is stored on servers located within the United States. We do not transfer or store your PHI outside of the United States without your explicit written consent.",
          },
          {
            title: "Unauthorized Access",
            content: "Texas law provides civil and criminal penalties for unauthorized access, use, or disclosure of protected health information. We maintain strict access controls and audit logs to prevent unauthorized access to your information.",
          },
          {
            title: "Patient Rights Under Texas Law",
            content: "Under Texas law, you have the right to: (1) access your health records within 15 business days of a request; (2) request correction of inaccurate information; (3) receive notice of any unauthorized access or disclosure of your PHI; and (4) file a complaint with the Texas Attorney General if you believe your privacy rights have been violated.",
          },
        ],
      },
      {
        id: "authorization",
        title: "Uses and Disclosures That Require Your Authorization",
        content: `Most uses and disclosures of psychotherapy notes, uses and disclosures of PHI for marketing purposes, and disclosures that constitute a sale of PHI require your written authorization. We will obtain your written authorization before using or disclosing your PHI for purposes other than those provided for in this Notice (or as otherwise permitted or required by law).

As of February 16, 2026, federal law requires your specific written authorization for any use or disclosure of sensitive health records (behavioral health, substance use disorder, reproductive health, gender-affirming care, genetic testing, or STI information) beyond treatment, payment, and health care operations directly related to that sensitive information.

You may revoke your authorization at any time by submitting a written revocation, except to the extent that we have already taken action in reliance on your authorization.`,
      },
      {
        id: "changes",
        title: "Changes to This Notice",
        content: "We reserve the right to change this Notice at any time. We reserve the right to make the revised or changed Notice effective for PHI we already have about you as well as any information we receive in the future. We will post a copy of the current Notice in our app and on our website. The Notice will contain the effective date on the first page.",
      },
      {
        id: "complaints",
        title: "Complaints",
        content: `If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of the U.S. Department of Health and Human Services. To file a complaint with us, contact:

**HealthMate Privacy Officer**
Email: privacy@healthmate.app
Phone: (555) 123-4567

To file a complaint with the U.S. Department of Health and Human Services:
Office for Civil Rights
U.S. Department of Health and Human Services
200 Independence Avenue, S.W.
Washington, D.C. 20201
Phone: 1-877-696-6775
Website: www.hhs.gov/ocr/privacy/hipaa/complaints

You may also file a complaint with the Texas Attorney General:
Office of the Attorney General
Privacy and Data Security Division
P.O. Box 12548
Austin, TX 78711-2548
Phone: (512) 463-2100

**You will not be penalized or retaliated against for filing a complaint.**`,
      },
      {
        id: "contact",
        title: "Contact Information",
        content: `If you have questions about this Notice or need more information about our privacy practices, please contact:

**HealthMate Privacy Officer**
Email: privacy@healthmate.app
Phone: (555) 123-4567
Address: HealthMate Health Companion, Privacy Office, [Address]

**Effective Date:** February 16, 2026
**Version:** 2.0`,
      },
    ],

    footer: `**ACKNOWLEDGMENT OF RECEIPT**

By signing below (or providing verbal consent), I acknowledge that I have received a copy of this Notice of Privacy Practices and have had the opportunity to review it.

I understand that:
- This Notice describes how my health information may be used and disclosed
- I have the right to receive a copy of this Notice
- HealthMate has the right to change this Notice at any time
- I can obtain a current copy of this Notice from the HealthMate app or website

**Federal and Texas Law Notice:** Unauthorized access, use, or disclosure of protected health information is prohibited by federal law (HIPAA) and Texas law (Texas Health and Safety Code Chapter 181) and may result in civil and criminal penalties.`,
  },
};

/**
 * Get current NPP version
 */
export function getCurrentNPP(): NPPVersion {
  return CURRENT_NPP_VERSION;
}

/**
 * Get NPP as plain text for display
 */
export function getNPPAsText(): string {
  const npp = CURRENT_NPP_VERSION.content;
  let text = `${npp.legalHeader}\n\n`;
  text += `NOTICE OF PRIVACY PRACTICES\n`;
  text += `Effective Date: ${CURRENT_NPP_VERSION.effectiveDate}\n`;
  text += `Version: ${CURRENT_NPP_VERSION.version}\n\n`;
  text += `${npp.introduction}\n\n`;

  for (const section of npp.sections) {
    text += `${section.title.toUpperCase()}\n`;
    text += `${section.content}\n\n`;

    if (section.subsections) {
      for (const subsection of section.subsections) {
        text += `  ${subsection.title}\n`;
        text += `  ${subsection.content}\n\n`;
      }
    }
  }

  text += `${npp.footer}\n`;

  return text;
}

/**
 * Get NPP summary for voice consent
 */
export function getNPPSummary(): string {
  return `This is a summary of your HIPAA privacy rights. 

Your health information is protected by federal and Texas law. We may use your information for treatment, payment, and healthcare operations. 

As of February 2026, sensitive health records including behavioral health, substance use disorder, reproductive health, gender-affirming care, genetic testing, and STI information have enhanced protections and require your specific authorization for most uses.

You have the right to:
- Access and copy your health records
- Request corrections to your information
- Request restrictions on how your information is used
- Receive confidential communications
- Be notified of any data breaches
- File a complaint if your privacy rights are violated

All your information is stored securely in the United States with encryption. You will not be penalized for filing a privacy complaint.

Do you understand and acknowledge these privacy practices?`;
}

/**
 * Get NPP sections for display
 */
export function getNPPSections(): NPPSection[] {
  return CURRENT_NPP_VERSION.content.sections;
}

/**
 * Check if user has acknowledged current NPP version
 */
export function hasAcknowledgedCurrentNPP(acknowledgedVersion?: string): boolean {
  if (!acknowledgedVersion) return false;
  return acknowledgedVersion === CURRENT_NPP_VERSION.version;
}
