"use client";

function UndergraduateLayout({
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

export default UndergraduateLayout;
