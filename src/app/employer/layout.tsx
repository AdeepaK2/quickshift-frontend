// app/employer/layout.tsx
"use client";

import React from 'react';

function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      {children}
    </div>
  );
}

// Export directly since middleware handles auth protection
export default EmployerLayout;
