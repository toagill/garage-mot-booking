const demoVehicles = {
  "AB12CDE": { registration: "AB12 CDE", make: "FORD", model: "Focus", colour: "Blue", fuelType: "Petrol", year: 2018, engineCapacity: 999 },
  "YK68XYZ": { registration: "YK68 XYZ", make: "TOYOTA", model: "Prius", colour: "Silver", fuelType: "Hybrid", year: 2018, engineCapacity: 1798 }
};

export async function lookupVehicle(registration) {
  const normalized = registration.replace(/\s+/g, "").toUpperCase();

  if (process.env.VEHICLE_API_MODE === "dvla" && process.env.DVLA_API_KEY) {
    const response = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.DVLA_API_KEY
      },
      body: JSON.stringify({ registrationNumber: normalized })
    });

    if (!response.ok) throw new Error("Vehicle lookup failed");
    const v = await response.json();
    return {
      registration: normalized,
      make: v.make,
      model: null,
      colour: v.colour,
      fuelType: v.fuelType,
      year: v.yearOfManufacture,
      engineCapacity: v.engineCapacity
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
