import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

const VisualizerId = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation() as ReturnType<typeof useLocation> & {
        state?: { image?: string };
    };

    const [image, setImage] = useState<string | null>(
        (location.state && location.state.image) ? location.state.image : null
    );

    const storageKey = useMemo(() => (id ? `uploadedImage:${id}` : null), [id]);

    useEffect(() => {
        // If we don't already have the image from navigation state, try sessionStorage
        if (!image && storageKey) {
            try {
                const stored = sessionStorage.getItem(storageKey);
                if (stored && stored.startsWith("data:image/")) {
                    setImage(stored);
                }
            } catch (e) {
                // ignore storage errors, user might have disabled it
            }
        }
    }, [image, storageKey]);

    const handleBack = () => navigate("/");

    return (
        <div className="visualizer-page" style={{ padding: "24px" }}>
            {!image ? (
                <div className="empty-state" style={{ textAlign: "center", marginTop: 40 }}>
                    <h2>No image available</h2>
                    <p style={{ color: "#666", marginTop: 8 }}>
                        We couldn't find an uploaded image for this session. Please go back and upload a floor plan.
                    </p>
                    <button onClick={handleBack} style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8 }}>
                        Go to Home
                    </button>
                </div>
            ) : (
                <div className="visualizer-canvas" style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ maxWidth: 1024, width: "100%" }}>
                        <img
                            src={image}
                            alt="Uploaded floor plan"
                            style={{ width: "100%", height: "auto", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
export default VisualizerId
