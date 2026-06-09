import { Country, State, City } from "country-state-city";

const normalize = (value: string) =>
    value.trim().toLowerCase();

function isValidLocation(
    cityValue: string,
    stateValue: string,
    countryValue: string
): boolean {

    // Country can be:
    // India OR IN
    const country = Country.getAllCountries().find(
        c =>
            normalize(c.name) === normalize(countryValue) ||
            normalize(c.isoCode) === normalize(countryValue)
    );

    if (!country) return false;

    // State can be:
    // Uttar Pradesh OR UP
    const state = State.getStatesOfCountry(country.isoCode).find(
        s =>
            normalize(s.name) === normalize(stateValue) ||
            normalize(s.isoCode) === normalize(stateValue)
    );

    if (!state) return false;

    // City normally uses name only
    const city = City.getCitiesOfState(
        country.isoCode,
        state.isoCode
    ).find(
        c =>
            normalize(c.name) === normalize(cityValue)
    );

    return !!city;
}

export default isValidLocation;