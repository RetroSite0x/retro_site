import {
  identity,
  links,
  focusAreas,
  workRoles,
  skills,
  projects,
  papers,
} from '../../data/portfolio';
import styles from '../../styles/components/dashboard.module.css';

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      {/* Identity Header */}
      <header className={styles.header}>
        <h1 className={styles.name}>{identity.name}</h1>
        <p className={styles.role}>{identity.role}</p>
        <p className={styles.location}>{identity.location}</p>
      </header>

      {/* Work & Passion Roles */}
      <section className={styles.section} aria-labelledby="dash-roles">
        <h2 id="dash-roles" className={styles.sectionTitle}>
          Work &amp; Passion
        </h2>
        <ul className={styles.roleList}>
          {workRoles.map((wr) => (
            <li key={wr.org} className={styles.roleItem}>
              <span className={styles.roleLabel}>{wr.role}</span>
              <span className={styles.roleOrg}>{wr.org}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Research / Focus Areas */}
      <section className={styles.section} aria-labelledby="dash-focus">
        <h2 id="dash-focus" className={styles.sectionTitle}>
          Research Focus
        </h2>
        <div className={styles.tagList}>
          {focusAreas.map((area) => (
            <span key={area} className={styles.tag}>
              {area}
            </span>
          ))}
        </div>
      </section>

      {/* Selected Projects */}
      <section className={styles.section} aria-labelledby="dash-projects">
        <h2 id="dash-projects" className={styles.sectionTitle}>
          Projects
        </h2>
        <ul className={styles.projectList}>
          {projects.map((p) => (
            <li key={p.name} className={styles.projectItem}>
              <span className={styles.projectName}>{p.name}</span>
              <span className={styles.projectDesc}>{p.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Skills Summary */}
      <section className={styles.section} aria-labelledby="dash-skills">
        <h2 id="dash-skills" className={styles.sectionTitle}>
          Skills
        </h2>
        <div className={styles.skillsGrid}>
          {skills.map((cat) => (
            <div key={cat.category} className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>{cat.category}</h3>
              <p className={styles.skillItems}>{cat.items.join(' \u00b7 ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Papers */}
      <section className={styles.section} aria-labelledby="dash-papers">
        <h2 id="dash-papers" className={styles.sectionTitle}>
          Publications
        </h2>
        <ul className={styles.paperList}>
          {papers.map((p) => (
            <li key={p.title} className={styles.paperItem}>
              <span className={styles.paperTitle}>{p.title}</span>
              <span className={styles.paperMeta}>
                {p.venue} ({p.year})
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact Links */}
      <section className={styles.section} aria-labelledby="dash-contact">
        <h2 id="dash-contact" className={styles.sectionTitle}>
          Contact
        </h2>
        <div className={styles.linksList}>
          {links.githubResearch && (
            <a
              className={styles.link}
              href={links.githubResearch}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {links.linkedin && (
            <a
              className={styles.link}
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
          {links.x && (
            <a
              className={styles.link}
              href={links.x}
              target="_blank"
              rel="noopener noreferrer"
            >
              {links.xHandle}
            </a>
          )}
          {links.huggingface && (
            <a
              className={styles.link}
              href={links.huggingface}
              target="_blank"
              rel="noopener noreferrer"
            >
              HuggingFace
            </a>
          )}
          {links.academic && (
            <a
              className={styles.link}
              href={links.academic}
              target="_blank"
              rel="noopener noreferrer"
            >
              Academic Profile
            </a>
          )}
          {identity.email && (
            <a className={styles.link} href={`mailto:${identity.email}`}>
              {identity.email}
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.hint}>
          Type <code>help</code> in the terminal for the full command list.
        </p>
      </footer>
    </div>
  );
}
