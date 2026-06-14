export default function FirebaseConfigError({ missing = [] }) {
    return (
        <div
            style={{
                maxWidth: "640px",
                margin: "4rem auto",
                padding: "1.5rem 2rem",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.6,
                color: "#1a1a1a",
                border: "1px solid #f5c2c7",
                borderRadius: "8px",
                background: "#f8d7da",
            }}
        >
            <h1 style={{ marginTop: 0, fontSize: "1.25rem" }}>
                Firebase configuration is incomplete
            </h1>
            <p>
                The app cannot start because required Vite environment variables
                are missing. Production works because Render sets these in the
                dashboard; local dev needs them in <code>.env.local</code>.
            </p>
            {missing.length > 0 && (
                <>
                    <p style={{ marginBottom: "0.5rem" }}>
                        <strong>Missing variables:</strong>
                    </p>
                    <ul style={{ marginTop: 0 }}>
                        {missing.map((key) => (
                            <li key={key}>
                                <code>{key}</code>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <p style={{ marginBottom: 0 }}>
                Copy <code>.env.example</code> to <code>.env.local</code>, paste
                your Firebase Web app config, then restart{" "}
                <code>npm run dev</code>.
            </p>
        </div>
    );
}
