import { identity, links } from '../../data/portfolio';
import styles from '../../styles/components/mobile.module.css';

interface ContactLink {
  icon: string;
  label: string;
  url: string;
  displayUrl: string;
}

const CONTACT_LINKS: readonly ContactLink[] = [
  { icon: '◈', label: 'GitHub (Research)', url: links.githubResearch, displayUrl: links.githubUsername },
  { icon: '◈', label: 'GitHub (Engineering)', url: links.githubEngineering, displayUrl: '' },
  { icon: '◇', label: 'LinkedIn', url: links.linkedin, displayUrl: links.linkedinUsername },
  { icon: '✦', label: 'X / Twitter', url: links.x, displayUrl: links.xHandle },
  { icon: '⬡', label: 'HuggingFace', url: links.huggingface, displayUrl: links.huggingfaceUsername },
  { icon: '⊞', label: 'Academic Profile', url: links.academic, displayUrl: '' },
  { icon: '⊘', label: 'ORCID', url: `https://orcid.org/${links.orcid}`, displayUrl: links.orcid },
  { icon: '✉', label: 'Email', url: `mailto:${identity.email}`, displayUrl: identity.email },
] as const;

export function MobileContact() {
  return (
    <div className={styles.contact}>
      <div className={styles.contactIdentity}>
        <div className={styles.contactName}>{identity.name}</div>
        <div className={styles.contactRole}>{identity.role}</div>
        <div className={styles.contactLocation}>{identity.location}</div>
      </div>

      <div>
        <div className={styles.sectionLabel}>Connect</div>
        <div className={styles.contactLinks}>
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              className={styles.contactLink}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.contactLinkIcon}>{link.icon}</span>
              <span className={styles.contactLinkLabel}>{link.label}</span>
              {link.displayUrl && (
                <span className={styles.contactLinkUrl}>{link.displayUrl}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
