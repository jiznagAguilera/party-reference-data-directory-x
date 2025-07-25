function applyTemplate(template, variables) {
  return template.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`);
}

function validateStringField(value, fieldName, isRequired, minLength, maxLength, allowSpecialChars = true) {
  if (!isRequired && (value === null || value === undefined)) {
    return;
  }

  if (isRequired && (value === null || value === undefined)) {
    return [applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: fieldName })];
  }

  if (typeof value !== 'string') {
    return [applyTemplate(context.get('api.properties.prop-msg-tipo-dato-incorrecto-cadena'), { headerName: fieldName })];
  }

  const errorMessages = [];

  if (!allowSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errorMessages.push(applyTemplate(context.get('api.properties.prop-msg-caracteres-especiales'), { headerName: fieldName }));
  }

  if ((minLength === maxLength && value.length !== maxLength) || (value.length < minLength || value.length > maxLength)) {
    if (minLength === maxLength) {
      errorMessages.push(applyTemplate(context.get('api.properties.prop-msg-longitud-incorrecta-exacta'), {
        headerName: fieldName,
        exactLength: maxLength
      }));
    } else {
      errorMessages.push(applyTemplate(context.get('api.properties.prop-msg-longitud-incorrecta-rango'), {
        headerName: fieldName,
        minLength: minLength,
        maxLength: maxLength
      }));
    }
  }

  return errorMessages.length ? errorMessages : null;
}

function validateNumericField(value, fieldName, isRequired, minLength, maxLength) {
  if (!isRequired && (value === null || value === undefined)) {
    return;
  }

  if (isRequired && (value === null || value === undefined)) {
    return [applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: fieldName })];
  }

  if (typeof value !== 'number') {
    return [applyTemplate(context.get('api.properties.prop-msg-tipo-dato-incorrecto-numero'), { headerName: fieldName })];
  }

  const valueAsNumber = Number(value);
  if (isNaN(valueAsNumber)) {
    return [applyTemplate(context.get('api.properties.prop-msg-tipo-dato-incorrecto-numero'), { headerName: fieldName })];
  }

  const errorMessages = [];
  const valueLength = String(value).length;

  if ((minLength === maxLength && valueLength !== maxLength) || (valueLength < minLength || valueLength > maxLength)) {
    if (minLength === maxLength) {
      errorMessages.push(applyTemplate(context.get('api.properties.prop-msg-longitud-incorrecta-exacta'), {
        headerName: fieldName,
        exactLength: maxLength
      }));
    } else {
      errorMessages.push(applyTemplate(context.get('api.properties.prop-msg-longitud-incorrecta-rango'), {
        headerName: fieldName,
        minLength: minLength,
        maxLength: maxLength
      }));
    }
  }

  return errorMessages.length ? errorMessages : null;
}

function validateRequestBody(requestBody) {
  const errors = [];
  const headers = context.request.headers;
  const userId = headers['UserId'] ?? headers['userid'];
  const branchCode = headers['BranchCode'] ?? headers['branchcode'];
  const countryCode = headers['CountryCode'] ?? headers['countrycode'];
  const deviceId = headers['DeviceId'] ?? headers['deviceid'];
  const contentType = headers['Content-Type'] ?? headers['content-type'];

  let error;

  // Headers validation (simula lógica YAML)
  error = validateStringField(contentType, "Content-Type", true, 9, 50, true);
  if (error) errors.push(...error);

  if (userId !== undefined && userId !== null) {
    error = validateStringField(userId, "UserId", false, 0, 36, false);
    if (error) errors.push(...error);
  }
  if (branchCode !== undefined && branchCode !== null) {
    error = validateStringField(branchCode, "BranchCode", false, 2, 10, false);
    if (error) errors.push(...error);
  }
  if (countryCode !== undefined && countryCode !== null) {
    error = validateStringField(countryCode, "CountryCode", false, 2, 3, false);
    if (error) errors.push(...error);
  }
  if (deviceId !== undefined && deviceId !== null) {
    error = validateStringField(deviceId, "DeviceId", false, 2, 36, false);
    if (error) errors.push(...error);
  }

  // Body validations (ajustar según tu schema party-reference)
  if (requestBody.PartyName !== undefined) {
    if (!requestBody.PartyName) {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: "PartyName" }));
    } else {
      error = validateStringField(requestBody.PartyName, "PartyName", true, 1, 100);
      if (error) errors.push(...error);
    }
  }
  if (requestBody.PartyType !== undefined) {
    if (!requestBody.PartyType) {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: "PartyType" }));
    } else {
      error = validateStringField(requestBody.PartyType, "PartyType", true, 1, 30);
      if (error) errors.push(...error);
    }
  }
  if (requestBody.PartyIdentification !== undefined) {
    if (!requestBody.PartyIdentification) {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: "PartyIdentification" }));
    } else {
      error = validateStringField(requestBody.PartyIdentification, "PartyIdentification", true, 1, 30);
      if (error) errors.push(...error);
    }
  }
  if (requestBody.Contact !== undefined) {
    if (!requestBody.Contact) {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: "Contact" }));
    } else if (typeof requestBody.Contact !== 'object') {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-tipo-dato-incorrecto-cadena'), { headerName: "Contact" }));
    }
  }
  if (requestBody.Address !== undefined) {
    if (!requestBody.Address) {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-campo-obligatorio'), { headerName: "Address" }));
    } else if (typeof requestBody.Address !== 'object') {
      errors.push(applyTemplate(context.get('api.properties.prop-msg-tipo-dato-incorrecto-cadena'), { headerName: "Address" }));
    }
  }

  // Para compatibilidad con pruebas anteriores (RetrievePartyReferenceDataDirectoryEntryNatural)
  if (requestBody.RetrievePartyReferenceDataDirectoryEntryNatural) {
    const body = requestBody.RetrievePartyReferenceDataDirectoryEntryNatural;
    error = validateStringField(body.ServiceType, "ServiceType", true, 6, 6, false);
    if (error) errors.push(...error);
    error = validateStringField(body.PersonIdentificationType, "PersonIdentificationType", true, 1, 3, false);
    if (error) errors.push(...error);
    error = validateStringField(body.PersonIdentification, "PersonIdentification", true, 8, 12, false);
    if (error) errors.push(...error);
  }

  return errors;
}

// Contexto simulado con las propiedades
const context = {
  request: {
    headers: {
      "Content-Type": "application/json",
      "UserId": "12345",
      "BranchCode": "BRANCH01"
    }
  },
  get: (prop) => {
    const properties = {
      'api.properties.prop-msg-campo-obligatorio': "Campo Obligatorio: {headerName}",
      'api.properties.prop-msg-tipo-dato-incorrecto-cadena': "Tipo Dato Incorrecto: {headerName} debe ser una cadena de texto",
      'api.properties.prop-msg-tipo-dato-incorrecto-numero': "Tipo Dato Incorrecto: {headerName} debe ser un número",
      'api.properties.prop-msg-longitud-incorrecta-exacta': "Longitud Incorrecta: {headerName} debe tener una longitud exacta de {exactLength}",
      'api.properties.prop-msg-longitud-incorrecta-rango': "Longitud Incorrecta: {headerName} debe tener longitud entre {minLength} y {maxLength}",
      'api.properties.prop-msg-caracteres-especiales': "Caracteres Especiales No Permitidos: {headerName} no puede contener caracteres especiales"
    };
    return properties[prop];
  }
};

// Función para ejecutar casos de prueba
function runTests() {
    const testCases = [
        {
            name: "Caso 1: Datos válidos",
            request: {
                RetrievePartyReferenceDataDirectoryEntryNatural: {
                    ServiceType: "S00080",
                    PersonIdentificationType: "DNI",
                    PersonIdentification: "12345678"
                }
            },
            headers: {
                "Content-Type": "application/json",
                "UserId": "12345",
                "BranchCode": "BRANCH01"
            }
        },
        {
            name: "Caso 2: ServiceType inválido (longitud incorrecta)",
            request: {
                RetrievePartyReferenceDataDirectoryEntryNatural: {
                    ServiceType: "S123",  // Debería ser 6 caracteres
                    PersonIdentificationType: "DNI",
                    PersonIdentification: "12345678"
                }
            },
            headers: {
                "Content-Type": "application/json",
                "UserId": "12345",
                "BranchCode": "BRANCH01"
            }
        },
        {
            name: "Caso 3: Caracteres especiales no permitidos",
            request: {
                RetrievePartyReferenceDataDirectoryEntryNatural: {
                    ServiceType: "S00@80",  // Contiene @
                    PersonIdentificationType: "DNI",
                    PersonIdentification: "12345678"
                }
            },
            headers: {
                "Content-Type": "application/json",
                "UserId": "12345",
                "BranchCode": "BRANCH01"
            }
        },
        {
            name: "Caso 4: Headers inválidos",
            request: {
                RetrievePartyReferenceDataDirectoryEntryNatural: {
                    ServiceType: "S00080",
                    PersonIdentificationType: "DNI",
                    PersonIdentification: "12345678"
                }
            },
            headers: {
                "Content-Type": "text",  // Longitud incorrecta
                "UserId": "",           // Campo obligatorio vacío
                "BranchCode": "BR"      // Longitud menor a 5
            }

        },
        {
            name: "Caso 5: Prueba de números",
            request: {
                RetrievePartyReferenceDataDirectoryEntryNatural: {
                    ServiceType: "S00080",
                    PersonIdentificationType: "DNI",
                    PersonIdentification: 12345678  // Número en lugar de string
                }
            },
            headers: {
                "Content-Type": "application/json",
                "UserId": "12345",
                "BranchCode": "BRANCH01"
            }
        }
    ];

    const results = [];
    
    testCases.forEach(testCase => {
        console.log(`\nEjecutando: ${testCase.name}`);
        // Actualizar headers del contexto
        context.request.headers = testCase.headers;
        
        // Ejecutar validación
        const errors = validateRequestBody(testCase.request);
        
        results.push({
            name: testCase.name,
            errors: errors || []
        });
        
        console.log('Resultado:', errors || 'Sin errores');
    });

    return results;
}

// Exponer las funciones y resultados para la interfaz web
window.runTests = runTests;
window.validateRequestBody = validateRequestBody;
window.context = context;
