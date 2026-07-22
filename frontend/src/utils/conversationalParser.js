/**
 * Parses natural-language correction sentences to extract target form fields and their values.
 * Identifies verbs like "add", "set", "change" and supports standard separators (is, as, to).
 * 
 * @param {string} text The conversational input.
 * @returns {null|{field: string, label: string, value: string}} Correction metadata or null if no pattern matches.
 */
export const parseNaturalLanguageCorrection = (text) => {
  if (!text) return null;

  let cleaned = text.trim();
  let lowercase = cleaned.toLowerCase();

  // Common leading command verbs to strip from intent checks
  const commandPrefixes = [
    "add ", "change ", "set ", "update ", "make ", "modify ", "put "
  ];

  for (const prefix of commandPrefixes) {
    if (lowercase.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      lowercase = cleaned.toLowerCase();
      break;
    }
  }

  // Keyword maps corresponding to QMS form input states
  const keywords = [
    { keys: ["batch number", "batch no.", "batch no", "batch", "lot number", "lot no.", "lot no", "lot"], field: "batchNumber", label: "Batch / Lot Number" },
    { keys: ["customer name", "complainant name", "customer", "complainant"], field: "customerName", label: "Customer Name" },
    { keys: ["customer organization", "organization", "company"], field: "customerOrganization", label: "Customer Organization" },
    { keys: ["customer contact", "contact"], field: "customerContact", label: "Customer Contact" },
    { keys: ["product name", "product"], field: "productName", label: "Product Name" },
    { keys: ["product strength", "strength", "product grade", "grade"], field: "productStrength", label: "Product Strength / Grade" },
    { keys: ["dosage form", "dosage"], field: "dosageForm", label: "Dosage Form" },
    { keys: ["manufacturing date", "mfg date", "mfd date"], field: "mfgDate", label: "Manufacturing Date" },
    { keys: ["expiry date", "exp date"], field: "expDate", label: "Expiry Date" },
    { keys: ["quantity affected", "quantity", "affected qty", "qty"], field: "affectedQty", label: "Quantity Affected" },
    { keys: ["complaint category", "category"], field: "complaintCategory", label: "Complaint Category" },
    { keys: ["complaint date", "date"], field: "complaintDate", label: "Complaint Date" },
    { keys: ["complaint description", "description", "complaint text", "text"], field: "complaintDescription", label: "Complaint Description" },
    { keys: ["requested action", "suggested action", "action"], field: "requestedAction", label: "Requested Action" },
    { keys: ["risk level", "initial risk"], field: "aiRiskLevel", label: "AI Risk Level" },
    { keys: ["priority"], field: "priority", label: "Initial Priority" },
    { keys: ["severity"], field: "severity", label: "Initial Severity" }
  ];

  // Common delimiters separating the key from the target value
  const delimiters = [
    "should be ", "change to ", "update to ", "set to ", "is ", "as ", "to ", "be "
  ];

  for (const item of keywords) {
    for (const key of item.keys) {
      if (lowercase.startsWith(key)) {
        const rest = lowercase.substring(key.length).trim();
        for (const delim of delimiters) {
          if (rest.startsWith(delim.trim())) {
            // Find starting index of the value in the cleaned casing string
            const valueIndex = cleaned.toLowerCase().indexOf(delim.trim(), key.length) + delim.trim().length;
            let value = cleaned.substring(valueIndex).trim();

            // Strip wrapping single or double quotes
            if (
              (value.startsWith("'") && value.endsWith("'")) ||
              (value.startsWith('"') && value.endsWith('"'))
            ) {
              value = value.substring(1, value.length - 1).trim();
            }

            // Normalize QMS classification fields casing
            if ((item.field === "severity" || item.field === "priority" || item.field === "aiRiskLevel") && value) {
              const lowerVal = value.toLowerCase();
              if (lowerVal === "low") value = "Low";
              else if (lowerVal === "medium") value = "Medium";
              else if (lowerVal === "high") value = "High";
              else if (lowerVal === "critical") value = "Critical";
            }

            return {
              field: item.field,
              label: item.label,
              value,
            };
          }
        }
      }
    }
  }

  return null;
};
