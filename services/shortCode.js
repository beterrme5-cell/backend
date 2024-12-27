export const incorporateShortCodes = (codesUsed, contact, message) => {
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
      replacement = contact.dateOfBirth || "";
    } else if (code == "{{contact.source}}") {
      replacement = contact.source || "";
    } else if (code == "{{contact.id}}") {
      replacement = contact.id || "";
    }
    const regex = new RegExp(code, "g");
    message = message.replace(regex, replacement);
  }
  return message;
};
