import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";

function LocationSelector({ profileData, setProfileData }) {

    const location = profileData.location || {
        country: "",
        state: "",
        city: ""
    };

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const countries = Country.getAllCountries();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfileData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
    };

    useEffect(() => {
        if (location.country) {
            const fetchedStates = State.getStatesOfCountry(location.country);
            setStates(fetchedStates);

            setProfileData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    state: "",
                    city: ""
                }
            }));

            setCities([]);
        }
    }, [location.country]);

    useEffect(() => {
        if (location.state) {
            const fetchedCities = City.getCitiesOfState(
                location.country,
                location.state
            );

            setCities(fetchedCities);

            setProfileData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    city: ""
                }
            }));
        }
    }, [location.state]);

    const fullLocation = [
        cities.find(c => c.name === location.city)?.name,
        states.find(s => s.isoCode === location.state)?.name,
        countries.find(c => c.isoCode === location.country)?.name
    ].filter(Boolean).join(", ");

    return (
        <div className="w-full grid grid-cols-3 gap-2">

            {/* Full Location */}
            <label className="col-span-3 flex justify-center">
                <input
                    type="text"
                    value={fullLocation}
                    className="w-[80%] inp-cl"
                    readOnly
                />
            </label>

            {/* Country */}
            <label className="flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="country"
                    value={location.country}
                    onChange={handleChange}
                >
                    <option value="">Country</option>
                    {countries.map((c) => (
                        <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* State */}
            <label className="flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="state"
                    value={location.state}
                    onChange={handleChange}
                    disabled={!location.country}
                >
                    <option value="">State</option>
                    {states.map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </label>

            {/* City */}
            <label className="flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="city"
                    value={location.city}
                    onChange={handleChange}
                    disabled={!location.state}
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

export default LocationSelector;