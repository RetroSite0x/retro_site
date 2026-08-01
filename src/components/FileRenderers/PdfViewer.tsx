import styles from '../../styles/components/menu-bar.module.css';

interface PdfViewerProps {
  filePath: string;
}

const DEFAULT_ZOOM = 1.25;

export function PdfViewer({ filePath }: PdfViewerProps) {
  return (
    <div className={styles.fileViewer}>
      <div className={styles.fileHeader}>
        <span className={styles.filePath}>{filePath}</span>
      </div>
      <div className={styles.fileContent}>
        <div className={styles.pdfFrameViewport}>
          <iframe
            className={styles.pdfFrame}
            style={{ transform: `scale(${DEFAULT_ZOOM})` }}
            src={filePath}
            title={filePath}
          />
        </div>
      </div>
    </div>
  );
}
