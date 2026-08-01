import styles from '../../styles/components/menu-bar.module.css';

interface PdfViewerProps {
  filePath: string;
}

export function PdfViewer({ filePath }: PdfViewerProps) {
  return (
    <div className={styles.fileViewer}>
      <div className={styles.fileHeader}>
        <span className={styles.filePath}>{filePath}</span>
      </div>
      <div className={styles.fileContent}>
        <iframe
          className={styles.pdfFrame}
          src={filePath}
          title={filePath}
        />
      </div>
    </div>
  );
}
