import React from "react";

export default function About() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      <h1>About Us</h1>
      <p>
        QuickShift is dedicated to making shift management simple and efficient. Our team is passionate about building tools that help businesses and teams work better together.
      </p>
      <p style={{ marginTop: 24 }}>
        Contact us: <a href="mailto:support@quickshift.com">support@quickshift.com</a>
      </p>
    </main>
  );
}
