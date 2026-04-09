import { useLocation } from "react-router-dom";

export default function PDFViewer() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const file = params.get("file");

  return (
    <div>
      <h2>📄 PDF Viewer</h2>

      <iframe
        src={file}
        width="100%"
        height="600px"
        title="PDF Viewer"
      />
    </div>
  );
}