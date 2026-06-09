import { useMemo } from "react";
import { Country, State, City } from "country-state-city";

function LocationSetter({ location, setLocation, editedProfile, setEditedProfile }) {
  const safeLocation = location ?? {
    country: "",
    state: "",
    city: "",
  };

  const countries = useMemo(() => {
    return Country.getAllCountries();
  }, []);

  const states = useMemo(() => {
    if (!safeLocation.country) return [];
    return State.getStatesOfCountry(safeLocation.country);
  }, [safeLocation.country]);

  const cities = useMemo(() => {
    if (!safeLocation.country || !safeLocation.state) return [];
    return City.getCitiesOfState(
      safeLocation.country,
      safeLocation.state
    );
  }, [safeLocation.country, safeLocation.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLocation((prev) => {
      let updatedLocation;

      if (name === "country") {
        updatedLocation = {
          country: value,
          state: "",
          city: "",
        };
      } else if (name === "state") {
        updatedLocation = {
          ...prev,
          state: value,
          city: "",
        };
      } else {
        updatedLocation = {
          ...prev,
          city: value,
        };
      }

      setEditedProfile((prevProfile) => ({
        ...prevProfile,
        location: updatedLocation
      }));

      return updatedLocation;
    });
  };

  const countryName =
    countries.find((c) => c.isoCode === safeLocation.country)?.name || "";

  const stateName =
    states.find((s) => s.isoCode === safeLocation.state)?.name || "";

  const cityName =
    cities.find((c) => c.name === safeLocation.city)?.name || "";

  const fullLocation = [cityName, stateName, countryName]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full grid grid-cols-3 gap-2">

      <label className="col-span-3 flex">
        <input
          type="text"
          value={fullLocation}
          readOnly
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
        />
      </label>

      <label className="flex justify-center">
        <select
          name="country"
          value={safeLocation.country}
          onChange={handleChange}
          className="w-[80%] inp-cl"
        >
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex justify-center">
        <select
          name="state"
          value={safeLocation.state}
          onChange={handleChange}
          disabled={!safeLocation.country}
          className="w-[80%] inp-cl"
        >
          <option value="">State</option>
          {states.map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex justify-center">
        <select
          name="city"
          value={safeLocation.city}
          onChange={handleChange}
          disabled={!safeLocation.state}
          className="w-[80%] inp-cl"
        >
          <option value="">City</option>
          {cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

    </div>
  );
}

export default LocationSetter;