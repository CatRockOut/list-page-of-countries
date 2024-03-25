function initCountryList() {
    const searchInput = document.querySelector('.input');

    if (!searchInput) {
        return;
    }

    const darkThemeBtn = document.querySelector('input[type="checkbox"].toggle');
    const regionTitle = document.querySelector('.region__title');
    const regionList = document.querySelector('.list-regions');
    const countryList = document.querySelector('.list-countries');
    const url = 'https://restcountries.com/v3.1/all';

    // Function to save the selected theme in cookies:
    function saveThemeToCookie() {
        const theme = darkThemeBtn.checked
            ? 'dark'
            : 'light';

        // To create cookies for 2 hours:
        const expirationDate = new Date(Date.now() + 2 * 60 * 60 * 1000)

        document.cookie = `theme=${theme}; expires=${expirationDate.toUTCString()}; path=/`;
    }

    // Dark theme:
    darkThemeBtn && darkThemeBtn.addEventListener('change', () => {
        if (darkThemeBtn.checked) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        saveThemeToCookie();
    });

    // Opening and closing the Regional list by click:
    regionTitle && regionTitle.addEventListener('click', () => {
        const hiddenRegionList = document.querySelector('.region__hide');

        if (regionList === hiddenRegionList) {
            regionList.classList.remove('region__hide');
            regionTitle.classList.add('active');
        } else {
            regionList.classList.add('region__hide');
            regionTitle.classList.remove('active');
        }
    });

    // Set the selected theme when DOMContentLoaded:
    const selectedTheme = () => {
        darkThemeBtn.checked = loadThemeFromCookie();

        if (darkThemeBtn.checked) {
            document.body.classList.add('dark');
        }
    };

    selectedTheme();

    const fetchData = async () => {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    };

    const createCountryTemplate = ({ flags, name, population, region, capital }) =>
        `<li class="country">
            <img src="${flags.svg}" alt="country flag">
            <h3>${name.common}</h3>
            <span class="country-info">Population: ${population}</span>
            <span class="country-info region">Region: ${region}</span>
            <span class="country-info">Capital: ${capital || 'No capital'}</span>
        </li>`;

    const createRegionTemplate = (region) => `
        <li class="region__name">
            <span>${region}</span>
        </li>`;

    // API manipulation:
    const getData = async () => {
        try {
            const data = await fetchData(url);

            const allRegions = [];
            let isFlagForSelectedRegion = false;

            data.forEach((country) => {
                // Displaying all countries when DOMContentLoaded:
                countryList.innerHTML += createCountryTemplate(country);

                // Sorting repeating regions and saving only one copy without repetitions:
                const { region } = country;
                if (region && !allRegions.includes(region)) {
                    allRegions.push(region);
                }
            });

            // Displaying all regions when DOMContentLoaded:
            allRegions.forEach((region) => {
                regionList.innerHTML += createRegionTemplate(region);
            });

            // Event listener by click on dynamically created .region__name elements:
            regionList && regionList.addEventListener('click', (event) => {
                const regionNameElement = event.target.closest('.region__name');

                if (regionNameElement) {
                    loadCountriesByRegion(regionNameElement.textContent);
                    isFlagForSelectedRegion = true;
                }
            });

            // API manipulation via input:
            searchInput && searchInput.addEventListener('input', () => {
                if (isFlagForSelectedRegion) {
                    // If a specific region is selected, then the search through input will occur only in this region:
                    searchCountryInSpecificRegion(data);
                } else {
                    // If the region is NOT selected, then the search will occur in all regions of the world:
                    searchCountryAroundTheWorld(data);
                }
            });

            // Function to display all countries by clicking on a specific region:
            const displayCountriesByRegion = (regionName, selectedCountries) => {
                data.forEach(({ flags, name, population, region, capital }) => {
                    if (regionName.includes(region)) {
                        selectedCountries.push({
                            flag: flags.svg,
                            name: name.common,
                            population: population,
                            region: region,
                            capital: capital || 'No capital'
                        });

                    }
                });
            };

            // Function to search for a country from input in the selected region:
            const filterCountriesFromInputAndRegion = (regionName) => {
                const filteredCountries = data.filter(({ region, name }) => {
                    const regionNameIncludes = regionName.includes(region);
                    const commonNameLower = name.common.toLowerCase();
                    const searchValueLower = searchInput.value.toLowerCase();

                    return regionNameIncludes && commonNameLower.includes(searchValueLower);
                }).map(({ flags, name, population, region, capital }) => {
                    return {
                        flag: flags.svg,
                        name: name.common,
                        population: population,
                        region: region,
                        capital: capital || 'No capital'
                    };
                });

                return filteredCountries;
            };

            const createCountriesViaListOfRegion = (selectedCountries) => {
                let countryTemplate = '';

                selectedCountries.forEach(({ flag, name, population, region, capital }) => {
                    countryTemplate += `
                        <li class="country">
                            <img src="${flag}" alt="country flag">
                            <h3>${name}</h3>
                            <span class="country-info">Population: ${population}</span>
                            <span class="country-info region">Region: ${region}</span>
                            <span class="country-info">Capital: ${capital}</span>
                        </li>
                    `;
                });

                return countryTemplate;
            };

            // API manipulation via the list of regions:
            const loadCountriesByRegion = (regionName) => {
                let selectedCountries = [];

                if (searchInput.value === '') {
                    // Display all countries by clicking on a specific region:
                    displayCountriesByRegion(regionName, selectedCountries);
                } else {
                    // Search for a country from input in the selected region:
                    selectedCountries = filterCountriesFromInputAndRegion(regionName);
                    // filterCountriesFromInputAndRegion(regionName, selectedCountries);
                }

                countryList.innerHTML = '';
                countryList.innerHTML = createCountriesViaListOfRegion(selectedCountries);

                regionList.classList.add('region__hide');
                regionTitle.classList.remove('active');
                regionTitle.innerText = regionName.trim();
            };

        } catch (error) {
            console.log(error.message);
        }
    };

    getData();

    // Preloader:
    window.addEventListener('load', () => {
        document.body.classList.add('loaded_hiding');

        if (document.readyState === 'complete') {
            document.body.classList.add('loaded');
            document.body.classList.remove('loaded_hiding');
        }
    });

    /* LIST OF ALL FUNCTIONS THAT ARE USED ABOVE */
    // Function to load the selected theme from a cookie:
    function loadThemeFromCookie() {
        const cookies = document.cookie.split(';');

        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');

            if (name === 'theme') {
                return value === 'dark';
            }
        }
        // Light theme by default:
        return false;
    }

    // Function for filtering countries when entering input based on the selected region:
    function filterCountries(data, regionFilter, nameFilter) {
        const filteredCountries = data.filter(({ name, region }) => {
            const nameCountry = name.common.toLowerCase();
            const regionCountry = region.toLowerCase();

            // Filter by name and region:
            return nameCountry.includes(nameFilter) && regionCountry.includes(regionFilter);
        });

        // After filtering, get a new array of filtered countries:
        return filteredCountries;
    }

    // Function to search for a country in a specific region if the region is selected:
    function searchCountryInSpecificRegion(data) {
        const searchInputValue = searchInput.value.toLowerCase();
        const isSelectedRegion = regionTitle.innerText;

        const filteredData = filterCountries(data, isSelectedRegion.toLowerCase(), searchInputValue.toLowerCase());

        countryList.innerHTML = '';

        filteredData.forEach((country) => {
            countryList.innerHTML += createCountryTemplate(country);
        });
    }

    // Template to search for a country around the world if a specific region is NOT selected:
    const filterCountriesIfRegionNotSelected = (data) => {
        const countryTemplate = data.map(({ flags, name, population, region, capital }) => {
            const flagCountry = flags.svg;
            const nameCountry = name.common;
            const populationCountry = population;
            const regionCountry = region;
            const capitalCountry = capital || 'No capital';
            const isVisible = name.common.toLowerCase().includes(searchInput.value);

            return `
                <li class="country ${isVisible ? '' : 'hide'}">
                    <img src="${flagCountry}" alt="country flag">
                    <h3>${nameCountry}</h3>
                    <span class="country-info">Population: ${populationCountry}</span>
                    <span class="country-info region">Region: ${regionCountry}</span>
                    <span class="country-info">Capital: ${capitalCountry}</span>
                </li>
            `;
        }).join('');

        return countryTemplate;
    };

    // Function to search for a country around the world if a specific region is NOT selected:
    function searchCountryAroundTheWorld(data) {
        countryList.innerHTML = filterCountriesIfRegionNotSelected(data);
        regionList.classList.add('region__hide');
        regionTitle.classList.remove('active');

        // Displaying the region in regionTitle from the entered country in the search input:
        const firstVisibleCountry = data.find(country => country.name.common.toLowerCase().includes(searchInput.value));

        if (firstVisibleCountry) {
            regionTitle.innerText = firstVisibleCountry.region;
        }

        if (searchInput.value === '') {
            regionTitle.innerText = 'Region';
        }
    }
}

document.addEventListener('DOMContentLoaded', initCountryList);
