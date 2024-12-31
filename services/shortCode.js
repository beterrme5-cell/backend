export const incorporateShortCodes = (
  codesUsed,
  customFieldsUsed,
  contact,
  message
) => {
  for (let i = 0; i < codesUsed.length; i++) {
    const code = codesUsed[i];
    let replacement = "";

    if (code == "{{contact.name}}") {
      replacement =
        (contact.firstNameLowerCase || "") +
        " " +
        (contact.lastNameLowerCase || "");
    } else if (code == "{{contact.first_name}}") {
      replacement = contact.firstNameLowerCase || "";
    } else if (code == "{{contact.last_name}}") {
      replacement = contact.lastNameLowerCase || "";
    } else if (code == "{{contact.email}}") {
      replacement = contact.email || "";
    } else if (code == "{{contact.phone}}") {
      replacement = contact.phone || "";
    } else if (code == "{{contact.company_name}}") {
      replacement = contact.companyName || "";
    } else if (code == "{{contact.full_address}}") {
      replacement = contact.address || "";
    } else if (code == "{{contact.city}}") {
      replacement = contact.city || "";
    } else if (code == "{{contact.state}}") {
      replacement = contact.state || "";
    } else if (code == "{{contact.country}}") {
      replacement = contact.country || "";
    } else if (code == "{{contact.postal_code}}") {
      replacement = contact.postalCode || "";
    } else if (code == "{{contact.date_of_birth}}") {
      if (contact.dateOfBirth) {
        const date = new Date(contact.dateOfBirth); // Format the date as needed
        const formattedDate = date.toISOString().split("T")[0]; // Outputs in 'YYYY-MM-DD'
        replacement = formattedDate;
      }
    } else if (code == "{{contact.source}}") {
      replacement = contact.source || "";
    }

    const regex = new RegExp(code, "g");
    message = message.replace(regex, replacement);
  }

  for (let i = 0; i < customFieldsUsed.length; i++) {
    const customField = customFieldsUsed[i];
    let customFieldValue = "";

    const actualField = contact.customFields.find(
      (field) => field.id === customField.id
    );

    if (actualField) {
      customFieldValue = actualField.value;
    }

    const regex = new RegExp(customField.name, "g");
    message = message.replace(regex, customFieldValue);
  }

  return message;
};
