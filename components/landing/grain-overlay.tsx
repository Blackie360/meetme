"use client";

export function GrainOverlay() {
  return (
    <>
      {/* Primary Fine Grain Layer - Enhanced visibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 20,
          opacity: 0.6,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cfilter id='fineGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='4' result='noise' seed='3'/%3E%3CfeColorMatrix in='noise' type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0.3 0.5 0.7 0.9 1.0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fineGrain)'/%3E%3C/svg%3E\")",
          backgroundSize: "80px 80px",
          mixBlendMode: "overlay",
        }}
      />

      {/* Secondary Coarse Grain Layer - Increased visibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 19,
          opacity: 0.4,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='coarseGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' result='texture' seed='7'/%3E%3CfeColorMatrix in='texture' type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0.2 0.4 0.6 0.8'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23coarseGrain)'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
          mixBlendMode: "multiply",
        }}
      />

      {/* Film Grain Effect - More pronounced */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 18,
          opacity: 0.35,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cfilter id='filmGrain'%3E%3CfeTurbulence type='turbulence' baseFrequency='2.0' numOctaves='1' result='grain' seed='15'/%3E%3CfeColorMatrix in='grain' type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0.1 0.25 0.4 0.55 0.7'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23filmGrain)'/%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle Paper Texture - More visible */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 17,
          opacity: 0.25,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cfilter id='paperTexture'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' result='paper' seed='12'/%3E%3CfeColorMatrix in='paper' type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0.1 0.2 0.3 0.4'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperTexture)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
          mixBlendMode: "soft-light",
        }}
      />
    </>
  );
}

