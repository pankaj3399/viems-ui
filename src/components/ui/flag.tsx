"use client";

import * as React from "react";

export interface FlagProps extends React.SVGProps<SVGSVGElement> {
  country: string;
}

function normalizeCountryCode(country: string): string {
  if (!country) return "";
  const clean = country.trim().toLowerCase();

  // US variants
  if (
    clean === "us" ||
    clean === "usa" ||
    clean === "united states" ||
    clean === "united states of america" ||
    clean === "american"
  ) {
    return "US";
  }

  // India variants
  if (
    clean === "in" ||
    clean === "ind" ||
    clean === "india" ||
    clean === "indian"
  ) {
    return "IN";
  }

  // China variants
  if (
    clean === "cn" ||
    clean === "chn" ||
    clean === "china" ||
    clean === "chinese"
  ) {
    return "CN";
  }

  // France variants
  if (
    clean === "fr" ||
    clean === "fra" ||
    clean === "france" ||
    clean === "french"
  ) {
    return "FR";
  }

  // South Africa variants
  if (
    clean === "za" ||
    clean === "sa" ||
    clean === "south africa" ||
    clean === "south african"
  ) {
    return "ZA";
  }

  // Italy variants
  if (
    clean === "it" ||
    clean === "ita" ||
    clean === "italy" ||
    clean === "italian"
  ) {
    return "IT";
  }

  // Greenland variants
  if (
    clean === "gl" ||
    clean === "grl" ||
    clean === "greenland" ||
    clean === "greenlandic"
  ) {
    return "GL";
  }

  // Jamaica variants
  if (
    clean === "jm" ||
    clean === "jam" ||
    clean === "jamaica" ||
    clean === "jamaican"
  ) {
    return "JM";
  }

  // UK variants
  if (
    clean === "gb" ||
    clean === "gbr" ||
    clean === "uk" ||
    clean === "united kingdom" ||
    clean === "britain" ||
    clean === "british"
  ) {
    return "GB";
  }

  // Pakistan variants
  if (
    clean === "pk" ||
    clean === "pak" ||
    clean === "pakistan" ||
    clean === "pakistani"
  ) {
    return "PK";
  }

  // Germany variants
  if (
    clean === "de" ||
    clean === "deu" ||
    clean === "germany" ||
    clean === "german"
  ) {
    return "DE";
  }

  // Nepal variants
  if (
    clean === "np" ||
    clean === "npl" ||
    clean === "nepal" ||
    clean === "nepalese"
  ) {
    return "NP";
  }

  return country.toUpperCase();
}

export function Flag({ country, className = "", ...props }: FlagProps) {
  const code = normalizeCountryCode(country);

  const baseClass = "size-5 rounded-full overflow-hidden border border-neutral-100 shadow-x-small shrink-0 object-cover";
  const finalClass = className ? `${baseClass} ${className}` : baseClass;

  switch (code) {
    case "US":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#F0F0F0" />
          <rect y="1.8" width="24" height="1.8" fill="#D80027" />
          <rect y="5.4" width="24" height="1.8" fill="#D80027" />
          <rect y="9" width="24" height="1.8" fill="#D80027" />
          <rect y="12.6" width="24" height="1.8" fill="#D80027" />
          <rect y="16.2" width="24" height="1.8" fill="#D80027" />
          <rect y="19.8" width="24" height="1.8" fill="#D80027" />
          <rect width="11" height="11.5" fill="#0052B4" />
          <circle cx="2.5" cy="2.5" r="0.6" fill="white" />
          <circle cx="5.5" cy="2.5" r="0.6" fill="white" />
          <circle cx="8.5" cy="2.5" r="0.6" fill="white" />
          <circle cx="4" cy="5.5" r="0.6" fill="white" />
          <circle cx="7" cy="5.5" r="0.6" fill="white" />
          <circle cx="2.5" cy="8.5" r="0.6" fill="white" />
          <circle cx="5.5" cy="8.5" r="0.6" fill="white" />
          <circle cx="8.5" cy="8.5" r="0.6" fill="white" />
        </svg>
      );

    case "CN":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#D80027" />
          <polygon points="5,3 5.5,4.5 7,4.5 5.8,5.5 6.2,7 5,6 3.8,7 4.2,5.5 3,4.5 4.5,4.5" fill="#FFDA44" />
          <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(2, 0.5)" />
          <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(3, 2)" />
          <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(3, 4)" />
          <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(2, 5.5)" />
        </svg>
      );

    case "IN":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="8" fill="#FF9933" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
          <rect y="16" width="24" height="8" fill="#128807" />
          <circle cx="12" cy="12" r="2" stroke="#000080" strokeWidth="0.5" fill="none" />
          <circle cx="12" cy="12" r="0.5" fill="#000080" />
        </svg>
      );

    case "FR":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="8" height="24" fill="#002395" />
          <rect x="8" width="8" height="24" fill="#FFFFFF" />
          <rect x="16" width="8" height="24" fill="#ED2939" />
        </svg>
      );

    case "ZA":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#E21C21" />
          <rect y="12" width="24" height="12" fill="#002395" />
          <path d="M0 0 L10 12 L0 24" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M0 0 L10 12 L0 24" fill="none" stroke="#007A3D" strokeWidth="1.8" />
          <rect y="10.8" width="24" height="2.4" fill="#007A3D" />
          <path d="M0 4 L6.5 12 L0 20 Z" fill="#F6B51E" />
        </svg>
      );

    case "IT":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="8" height="24" fill="#009246" />
          <rect x="8" width="8" height="24" fill="#F1F2F1" />
          <rect x="16" width="8" height="24" fill="#CE2B37" />
        </svg>
      );

    case "GL":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="12" fill="#FFFFFF" />
          <rect y="12" width="24" height="12" fill="#C8102E" />
          <path d="M 4,12 A 8,8 0 0,1 20,12 Z" fill="#C8102E" />
          <path d="M 4,12 A 8,8 0 0,0 20,12 Z" fill="#FFFFFF" />
        </svg>
      );

    case "JM":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#009B3A" />
          <path d="M0,0 L12,12 L0,24 Z" fill="#000000" />
          <path d="M24,0 L12,12 L24,24 Z" fill="#000000" />
          <path d="M0,0 L24,24" stroke="#FED100" strokeWidth="2.5" />
          <path d="M24,0 L0,24" stroke="#FED100" strokeWidth="2.5" />
        </svg>
      );

    case "GB":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#00247D" />
          <path d="M0,0 L24,24 M24,0 L0,24" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M0,0 L24,24 M24,0 L0,24" stroke="#CF142B" strokeWidth="1.2" />
          <path d="M12,0 L12,24 M0,12 L24,12" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M12,0 L12,24 M0,12 L24,12" stroke="#CF142B" strokeWidth="3" />
        </svg>
      );

    case "DE":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="8" fill="#000000" />
          <rect y="8" width="24" height="8" fill="#DD0000" />
          <rect y="16" width="24" height="8" fill="#FFCC00" />
        </svg>
      );

    case "PK":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="6" height="24" fill="#FFFFFF" />
          <rect x="6" width="18" height="24" fill="#115B35" />
          <circle cx="15.5" cy="12" r="4.5" fill="#FFFFFF" />
          <circle cx="17.0" cy="11" r="4.5" fill="#115B35" />
          <polygon points="13.5,9.5 14,10.5 15,10.5 14.2,11.2 14.5,12.2 13.5,11.5 12.5,12.2 12.8,11.2 12,10.5 13,10.5" fill="#FFFFFF" />
        </svg>
      );

    case "NP":
      return (
        <svg className={finalClass} viewBox="0 0 24 24" fill="none" {...props}>
          <rect width="24" height="24" fill="#DC143C" />
          <polygon points="2,2 2,13 18,13" fill="#DC143C" stroke="#002868" strokeWidth="1.5" />
          <polygon points="2,11 2,22 20,22" fill="#DC143C" stroke="#002868" strokeWidth="1.5" />
          <circle cx="7" cy="17" r="2.5" fill="#FFFFFF" />
          <path d="M 5,6 A 2.5,2.5 0 0,0 9.5,8 A 2,2 0 0,1 5,6 Z" fill="#FFFFFF" />
        </svg>
      );

    default:
      // A clean fallback circle containing the capitalized 2-letter country code
      const label = code.length > 2 ? code.slice(0, 2) : code || "?";
      return (
        <div 
          className="size-5 rounded-full overflow-hidden flex items-center justify-center bg-neutral-100 border border-neutral-200 text-[10px] font-semibold text-[#5C5C5C] shrink-0 select-none uppercase font-sans"
          style={{ width: "20px", height: "20px" }}
        >
          {label}
        </div>
      );
  }
}
