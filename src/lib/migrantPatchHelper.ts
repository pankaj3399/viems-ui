/**
 * Helper to build a standardized Migrant PATCH payload.
 * Consolidates common fields across EditContactDetailsModal, EditHomeAddressModal, and EditPersonalDetailsModal.
 */
export function buildMigrantPatchPayload(migrantData: any, overrides: any = {}): any {
  const pInfo = migrantData?.personalInfo || migrantData?.user?.personalInfo || {};
  const nameParts = (migrantData?.name || pInfo.fullName || "").trim().split(/\s+/);
  const fallbackFirst = nameParts[0] || "";
  const fallbackLast = nameParts.slice(1).join(" ") || "";

  const firstName =
    overrides.first_name !== undefined
      ? overrides.first_name
      : migrantData?.first_name ||
        pInfo.firstName ||
        migrantData?.firstName ||
        migrantData?.user?.firstName ||
        fallbackFirst ||
        "";

  const lastName =
    overrides.last_name !== undefined
      ? overrides.last_name
      : migrantData?.last_name ||
        pInfo.lastName ||
        migrantData?.lastName ||
        migrantData?.user?.lastName ||
        fallbackLast ||
        "";

  const rawStageName =
    overrides.stage_name !== undefined
      ? overrides.stage_name
      : migrantData?.stage_name || `${firstName}${lastName}`;

  const cleanStageName =
    (rawStageName || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || `migrant${migrantData?.id || ""}`;

  const existingContacts = migrantData?.contacts || migrantData?.contact || {};
  const contactsOverride = overrides.contacts || {};

  const userEmail =
    overrides.user?.email ||
    overrides.email ||
    migrantData?.user?.email ||
    migrantData?.email ||
    migrantData?.contact?.email ||
    existingContacts.contact_email ||
    existingContacts.email ||
    null;

  const rawGender =
    overrides.gender !== undefined
      ? overrides.gender
      : migrantData?.gender ??
        pInfo.gender ??
        pInfo.sex ??
        migrantData?.sex ??
        null;

  const rawDob =
    overrides.date_of_birth !== undefined
      ? overrides.date_of_birth
      : migrantData?.date_of_birth ??
        pInfo.dob ??
        pInfo.dateOfBirth ??
        migrantData?.dateOfBirth ??
        null;

  const rawNationality =
    overrides.nationality !== undefined
      ? overrides.nationality
      : pInfo.nationality?.id ??
        pInfo.nationalityCode ??
        pInfo.nationality ??
        migrantData?.nationality?.id ??
        (typeof migrantData?.nationality === "number" ? migrantData.nationality : null);

  const payload: any = {
    ...overrides,
    first_name: firstName,
    last_name: lastName,
    user: {
      ...(migrantData?.user || {}),
      ...(overrides.user || {}),
      email: userEmail,
      personalInfo: {
        ...(migrantData?.user?.personalInfo || {}),
        ...(overrides.user?.personalInfo || {}),
        firstName,
        lastName,
        dateOfBirth: rawDob && rawDob !== "NaN-NaN-NaN" ? rawDob : null,
        sex: rawGender,
        nationality: rawNationality,
      },
    },
    gender: rawGender,
    date_of_birth: rawDob && rawDob !== "NaN-NaN-NaN" ? rawDob : null,
    nationality: rawNationality,
    place_of_birth:
      overrides.place_of_birth !== undefined
        ? overrides.place_of_birth
        : migrantData?.place_of_birth ?? pInfo.cityOfBirth ?? null,
    stage_name: cleanStageName,
    with_stage_name:
      overrides.with_stage_name !== undefined
        ? Boolean(overrides.with_stage_name)
        : (migrantData?.with_stage_name ?? true),
    deletedFiles: overrides.deletedFiles ?? [],
    logs: overrides.logs ?? [],
    contacts: {
      address_line_1: existingContacts.address_line_1 || "",
      address_line_2: existingContacts.address_line_2 || null,
      zip_code: existingContacts.zip_code || "",
      phone_1: existingContacts.phone_1 || existingContacts.contact_number || "",
      phone_2: existingContacts.phone_2 || null,
      phone_3: existingContacts.phone_3 || null,
      phone_4: existingContacts.phone_4 || null,
      country: existingContacts.country?.id || null,
      state: existingContacts.state?.id || null,
      city: existingContacts.city?.id || null,
      ...contactsOverride,
      contact_email:
        contactsOverride.contact_email ||
        existingContacts.contact_email ||
        existingContacts.email ||
        userEmail ||
        null,
    },
  };

  // Handle passport / passports validation
  let cleanPassports: any[] | undefined = undefined;
  let cleanPassport: any = undefined;

  const rawPassports = overrides.passports || migrantData?.passports;
  const rawPassport = overrides.passport || migrantData?.passport;

  if (Array.isArray(rawPassports) && rawPassports.length > 0) {
    const valid = rawPassports
      .filter((p: any) => {
        const pNum = String(p?.passport_number ?? "").trim();
        return pNum !== "" && pNum !== "—";
      })
      .map((p: any) => {
        const pNum = String(p.passport_number ?? "").trim();
        return {
          ...(p.id ? { id: typeof p.id === "number" ? p.id : parseInt(p.id, 10) } : {}),
          passport_number: pNum,
          place_of_issue: (p.place_of_issue && p.place_of_issue !== "—" ? p.place_of_issue : null) || migrantData?.place_of_birth || pInfo.cityOfBirth || null,
          issue_passport_date: (p.issue_passport_date && p.issue_passport_date !== "—" && p.issue_passport_date !== "NaN-NaN-NaN" ? p.issue_passport_date : null),
          expired_passport_date: (p.expired_passport_date && p.expired_passport_date !== "—" && p.expired_passport_date !== "NaN-NaN-NaN" ? p.expired_passport_date : null),
          is_actual: p.is_actual !== undefined ? Boolean(p.is_actual) : true,
        };
      });
    if (valid.length > 0) {
      cleanPassports = valid;
      cleanPassport = valid[0];
    }
  } else if (rawPassport) {
    const pNum = String(rawPassport.passport_number ?? "").trim();
    if (pNum !== "" && pNum !== "—") {
      const p = rawPassport;
      cleanPassport = {
        ...(p.id ? { id: typeof p.id === "number" ? p.id : parseInt(p.id, 10) } : {}),
        passport_number: pNum,
        place_of_issue: (p.place_of_issue && p.place_of_issue !== "—" ? p.place_of_issue : null) || migrantData?.place_of_birth || pInfo.cityOfBirth || null,
        issue_passport_date: (p.issue_passport_date && p.issue_passport_date !== "—" && p.issue_passport_date !== "NaN-NaN-NaN" ? p.issue_passport_date : null),
        expired_passport_date: (p.expired_passport_date && p.expired_passport_date !== "—" && p.expired_passport_date !== "NaN-NaN-NaN" ? p.expired_passport_date : null),
        is_actual: p.is_actual !== undefined ? Boolean(p.is_actual) : true,
      };
      cleanPassports = [cleanPassport];
    }
  }

  if (cleanPassports) {
    payload.passports = cleanPassports;
    payload.passport = cleanPassport;
  } else {
    delete payload.passports;
    delete payload.passport;
  }

  return payload;
}
