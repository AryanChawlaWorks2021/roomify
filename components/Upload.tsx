import {useCallback, useEffect, useRef, useState} from "react";
import {useOutletContext} from "react-router";
import {UploadIcon, ImageIcon, CheckCircle2} from "lucide-react";
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from "lib/constants";


type UploadProps = {
    onComplete: (dataUrl: string) => void;
};

const Upload = ({ onComplete }: UploadProps) => {

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const dataUrlRef = useRef<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    const {isSignedIn} = useOutletContext<AuthContext>();

    const clearProgressInterval = () => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearProgressInterval();
        };
    }, []);

    const startProgress = useCallback(() => {
        clearProgressInterval();
        setProgress(0);
        intervalRef.current = window.setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(100, prev + PROGRESS_STEP);
                if (next === 100) {
                    clearProgressInterval();
                    // Delay completion to simulate redirect timing
                    window.setTimeout(() => {
                        if (dataUrlRef.current) {
                            onComplete(dataUrlRef.current);
                        }
                    }, REDIRECT_DELAY_MS);
                }
                return next;
            });
        }, PROGRESS_INTERVAL_MS);
    }, [onComplete]);

    const processFile = useCallback((f: File) => {
        if (!isSignedIn) return; // Block all logic when signed out
        setFile(f);
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            dataUrlRef.current = result;
            startProgress();
        };
        reader.onerror = () => {
            // reset state on error
            dataUrlRef.current = null;
            setFile(null);
            setProgress(0);
            clearProgressInterval();
        };
        reader.readAsDataURL(f);
    }, [isSignedIn, startProgress]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const f = e.target.files && e.target.files[0];
        if (f) processFile(f);
    }, [isSignedIn, processFile]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!isSignedIn) return;
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) processFile(f);
    }, [isSignedIn, processFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    }, [isSignedIn]);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    }, [isSignedIn]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''} `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg, .jpeg, .png"
                        disabled={!isSignedIn}
                        onChange={onChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20}/>
                        </div>
                        <p>
                            {isSignedIn ? ("Click to upload or just drag and drop")
                                : ("Sign in or sign up with puter to upload")}
                        </p>
                        <p className="help">
                            Maximum file size 50MB.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check"/>
                            ) : (
                                <ImageIcon className="image"/>
                            )}
                        </div>

                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? "Analyzing floor plan..." : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload
