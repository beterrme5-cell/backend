export const incorporateShortCodes = (codesUsed, contact, message) => {
  for (let i = 0; i < codesUsed.length; i++) {
    const code = codesUsed[i];
    let replacement = "";
    if (code == "{{name}}") {
      replacement =
        (contact.firstNameLowerCase || "") +
        " " +
        (contact.lastNameLowerCase || "");
    } else if (code == "{{first_name}}") {
      replacement = contact.firstNameLowerCase || "";
    } else if (code == "{{last_name}}") {
      replacement = contact.lastNameLowerCase || "";
    } else if (code == "{{email}}") {
      replacement = contact.email || "";
    } else if (code == "{{phone}}") {
      replacement = contact.phone || "";
    } else if (code == "{{company_name}}") {
      replacement = contact.companyName || "";
    } else if (code == "{{full_address}}") {
      replacement = contact.address || "";
    } else if (code == "{{city}}") {
      replacement = contact.city || "";
    } else if (code == "{{state}}") {
      replacement = contact.state || "";
    } else if (code == "{{country}}") {
      replacement = contact.country || "";
    } else if (code == "{{postal_code}}") {
      replacement = contact.postalCode || "";
    } else if (code == "{{date_of_birth}}") {
      replacement = contact.dateOfBirth || "";
    } else if (code == "{{source}}") {
      replacement = contact.source || "";
    } else if (code == "{{id}}") {
      replacement = contact.id || "";
    }
    const regex = new RegExp(code, "g");
    message = message.replace(regex, replacement);
  }
  return message;
};
