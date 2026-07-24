/**
 * Helper to build a standardized Migrant PATCH payload.
 * Consolidates common fields across EditContactDetailsModal, EditHomeAddressModal, and EditPersonalDetailsModal.
 */
export function buildMigrantPatchPayload(migrantData: any, overrides: any = {}): any {
  const firstName =
    overrides.first_name !== undefined
      ? overrides.first_name
      : migrantData?.first_name ||
        migrantData?.user?.personalInfo?.firstName ||
        migrantData?.user?.firstName ||
        "";

  const lastName =
    overrides.last_name !== undefined
      ? overrides.last_name
      : migrantData?.last_name ||
        migrantData?.user?.personalInfo?.lastName ||
        migrantData?.user?.lastName ||
        "";

  const rawStageName =
    overrides.stage_name !== undefined
      ? overrides.stage_name
      : migrantData?.stage_name || `${firstName}${lastName}`;

  const cleanStageName =
    (rawStageName || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || `migrant${migrantData?.id || ""}`;

  const existingContacts = migrantData?.contacts || {};
  const contactsOverride = overrides.contacts || {};

  const payload: any = {
    first_name: firstName,
    last_name: lastName,
    gender:
      overrides.gender !== undefined
        ? overrides.gender
        : migrantData?.gender ?? migrantData?.user?.personalInfo?.sex ?? null,
    date_of_birth:
      overrides.date_of_birth !== undefined
        ? overrides.date_of_birth
        : migrantData?.date_of_birth ?? migrantData?.user?.personalInfo?.dateOfBirth ?? null,
    nationality:
      overrides.nationality !== undefined
        ? overrides.nationality
        : migrantData?.nationality?.id ??
          (typeof migrantData?.nationality === "number" ? migrantData.nationality : null),
    place_of_birth:
      overrides.place_of_birth !== undefined
        ? overrides.place_of_birth
        : migrantData?.place_of_birth ?? null,
    stage_name: cleanStageName,
    with_stage_name:
      overrides.with_stage_name !== undefined
        ? Boolean(overrides.with_stage_name)
        : (migrantData?.with_stage_name ?? true),
    deletedFiles: overrides.deletedFiles ?? [],
    logs: overrides.logs ?? [],
    contacts: {
      contact_email:
        contactsOverride.contact_email !== undefined
          ? contactsOverride.contact_email
          : existingContacts.contact_email || migrantData?.user?.email || "",
      address_line_1:
        contactsOverride.address_line_1 !== undefined
          ? contactsOverride.address_line_1
          : existingContacts.address_line_1 || "",
      address_line_2:
        contactsOverride.address_line_2 !== undefined
          ? contactsOverride.address_line_2
          : existingContacts.address_line_2 || null,
      zip_code:
        contactsOverride.zip_code !== undefined
          ? contactsOverride.zip_code
          : existingContacts.zip_code || "",
      phone_1:
        contactsOverride.phone_1 !== undefined
          ? contactsOverride.phone_1
          : existingContacts.phone_1 || existingContacts.contact_number || "",
      phone_2:
        contactsOverride.phone_2 !== undefined
          ? contactsOverride.phone_2
          : existingContacts.phone_2 || null,
      phone_3:
        contactsOverride.phone_3 !== undefined
          ? contactsOverride.phone_3
          : existingContacts.phone_3 || null,
      phone_4:
        contactsOverride.phone_4 !== undefined
          ? contactsOverride.phone_4
          : existingContacts.phone_4 || null,
      country:
        contactsOverride.country !== undefined
          ? contactsOverride.country
          : existingContacts.country?.id || null,
      state:
        contactsOverride.state !== undefined
          ? contactsOverride.state
          : existingContacts.state?.id || null,
      city:
        contactsOverride.city !== undefined
          ? contactsOverride.city
          : existingContacts.city?.id || null,
      ...contactsOverride,
    },
    ...overrides,
  };

  if (overrides.passport) {
    payload.passport = overrides.passport;
  } else {
    const activePassport = migrantData?.passports?.find((p: any) => p.is_actual === true);
    if (activePassport) {
      payload.passport = {
        id: activePassport.id,
        passport_number: activePassport.passport_number,
        issue_passport_date: activePassport.issue_passport_date,
        expired_passport_date: activePassport.expired_passport_date,
      };
    }
  }

  return payload;
}
