import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const demoVehicles = {
  "AB12CDE": { registration: "AB12 CDE", make: "FORD", model: "Focus", colour: "Blue", fuelType: "Petrol", year: 2018, engineCapacity: 999 },
  "YK68XYZ": { registration: "YK68 XYZ", make: "TOYOTA", model: "Prius", colour: "Silver", fuelType: "Hybrid", year: 2018, engineCapacity: 1798 }
};

let cachedDvlaKey;

async function getDvlaApiKey() {
  if (process.env.DVLA_API_KEY) return process.env.DVLA_API_KEY;
  if (cachedDvlaKey) return cachedDvlaKey;

  const secretName = process.env.AWS_SECRET_NAME;
  if (!secretName) throw new Error("DVLA API key is not configured");

  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "eu-west-2"
  });

  const result = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  if (!result.SecretString) throw new Error("DVLA secret has no SecretString");

  let secret;
  try {
    secret = JSON.parse(result.SecretString);
  } catch {
    secret = result.SecretString;
  }

  cachedDvlaKey =
    typeof secret === "string"
      ? secret
      : secret.DVLA_API_KEY || secret.dvlaApiKey || secret.apiKey;

  if (!cachedDvlaKey) throw new Error("DVLA_API_KEY was not found in AWS Secrets Manager");
  return cachedDvlaKey;
}

export async function lookupVehicle(registration) {
  const normalized = registration.replace(/\s+/g, "").toUpperCase();

  if (process.env.VEHICLE_API_MODE === "dvla") {
    const apiKey = await getDvlaApiKey();

    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ registrationNumber: normalized })
      }
    );

    const body = await response.json().catch(() => ({}));

    if (response.status === 404) throw new Error("Vehicle not found");
    if (response.status === 429) throw new Error("DVLA rate limit reached");
    if (!response.ok) {
      throw new Error(body.message || body.error || `DVLA lookup failed (${response.status})`);
    }

    return {
      registration: body.registrationNumber || normalized,
      make: body.make,
      model: null,
      colour: body.colour,
      fuelType: body.fuelType,
      year: body.yearOfManufacture,
      engineCapacity: body.engineCapacity,
      co2Emissions: body.co2Emissions,
      taxStatus: body.taxStatus,
      taxDueDate: body.taxDueDate,
      motStatus: body.motStatus,
      motExpiryDate: body.motExpiryDate,
      markedForExport: body.markedForExport,
      typeApproval: body.typeApproval,
      wheelplan: body.wheelplan,
      dateOfLastV5CIssued: body.dateOfLastV5CIssued,
      monthOfFirstRegistration: body.monthOfFirstRegistration
    };
  }

  return demoVehicles[normalized] || {
    registration: normalized,
    make: "VAUXHALL",
    model: "Astra",
    colour: "Black",
    fuelType: "Petrol",
    year: 2019,
    engineCapacity: 1399
  };
}
