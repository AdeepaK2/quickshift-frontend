// app/admin/layout.tsx
"use client";

import React from 'react';

function AdminLayout({
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

// Export directly since middleware handles all auth protection
export default AdminLayout;