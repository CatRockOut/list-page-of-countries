function initCountryList() {
    const searchInput = document.querySelector('.input');

    if (!searchInput) {
        return;
    }

    const darkThemeBtn = document.querySelector('input[type="checkbox"].toggle');
    const regionTitle = document.querySelector('.region__title');
    const regionList = document.querySelector('.list-regions');
    const countryList = document.querySelector('.list-countries');

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

    // API manipulation when DOMContentLoaded:
    const displayAllCountries = () => {
        const url = 'https://restcountries.com/v3.1/all';

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

        const getData = async () => {
            try {
                const data = await fetchData(url);

                const allRegions = [];
                let isFlagForSelectedRegion = false;

                data.forEach((country) => {
                    // Displaying all countries when DOMContentLoaded:
                    const flagCountry = country.flags.svg;
                    const nameCountry = country.name.common;
                    const populationCountry = country.population;
                    const regionCountry = country.region;
                    const capitalCountry = country.capital || 'No capital';
                    let countryTemplate = '';

                    countryTemplate += `
                        <li class="country">
                            <img src="${flagCountry}" alt="country flag">
                            <h3>${nameCountry}</h3>
                            <span class="country-info">Population: ${populationCountry}</span>
                            <span class="country-info region">Region: ${regionCountry}</span>
                            <span class="country-info">Capital: ${capitalCountry}</span>
                        </li>
                    `;

                    countryList.innerHTML += countryTemplate;

                    // Sorting repeating regions and saving only one copy without repetitions:
                    if (regionCountry && !allRegions.includes(regionCountry)) {
                        allRegions.push(regionCountry);
                    }
                });

                // Displaying all regions when DOMContentLoaded:
                allRegions.forEach((region) => {
                    let regionTemplate = '';

                    regionTemplate += `
                        <li class="region__name">
                            <span>${region}</span>
                        </li>
                    `;

                    regionList.innerHTML += regionTemplate;
                });

                // Event listener by click on dynamically created .region__name elements:
                regionList && regionList.addEventListener('click', (event) => {
                    const regionNameElement = event.target.closest('.region__name');

                    if (regionNameElement) {
                        const regionName = regionNameElement.textContent;

                        loadCountriesByRegion(regionName);
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

                // API manipulation via the list of regions:
                const loadCountriesByRegion = (regionName) => {
                    let selectedCountries = [];
                    let countryTemplate = '';

                    if (searchInput.value === '') {
                        // Display all countries by clicking on a specific region:
                        data.forEach((item) => {
                            if (regionName.includes(item.region)) {
                                selectedCountries.push({
                                    flag: item.flags.svg,
                                    name: item.name.common,
                                    population: item.population,
                                    region: item.region,
                                    capital: item.capital || 'No capital'
                                });

                            }
                        });
                    } else {
                        // Search for a country from input in the selected region:
                        selectedCountries = data.filter((item) => {
                            const regionNameIncludes = regionName.includes(item.region);
                            const commonNameLower = item.name.common.toLowerCase();
                            const searchValueLower = searchInput.value.toLowerCase();

                            return regionNameIncludes && commonNameLower.includes(searchValueLower);
                        }).map((item) => {
                            return {
                                flag: item.flags.svg,
                                name: item.name.common,
                                population: item.population,
                                region: item.region,
                                capital: item.capital || 'No capital'
                            };
                        });
                    }

                    // Template:
                    selectedCountries.forEach((country) => {
                        countryTemplate += `
                            <li class="country">
                                <img src="${country.flag}" alt="country flag">
                                <h3>${country.name}</h3>
                                <span class="country-info">Population: ${country.population}</span>
                                <span class="country-info region">Region: ${country.region}</span>
                                <span class="country-info">Capital: ${country.capital}</span>
                            </li>
                        `;
                    });

                    countryList.innerHTML = '';
                    countryList.innerHTML = countryTemplate;

                    regionList.classList.add('region__hide');
                    regionTitle.classList.remove('active');
                    regionTitle.innerText = regionName.trim();
                };

            } catch (error) {
                console.log(error.message);
            }
        };

        getData();
    };

    displayAllCountries();

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
        const filteredCountries = data.filter((country) => {
            const nameCountry = country.name.common.toLowerCase();
            const regionCountry = country.region.toLowerCase();

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
            const flagCountry = country.flags.svg;
            const nameCountry = country.name.common;
            const populationCountry = country.population;
            const regionCountry = country.region;
            const capitalCountry = country.capital || 'No capital';

            const countryTemplate = `
                <li class="country">
                    <img src="${flagCountry}" alt="country flag">
                    <h3>${nameCountry}</h3>
                    <span class="country-info">Population: ${populationCountry}</span>
                    <span class="country-info region">Region: ${regionCountry}</span>
                    <span class="country-info">Capital: ${capitalCountry}</span>
                </li>
            `;

            countryList.innerHTML += countryTemplate;
        });
    }

    // Function to search for a country around the world if a specific region is NOT selected:
    function searchCountryAroundTheWorld(data) {
        const countryTemplate = data.map((country) => {
            const flagCountry = country.flags.svg;
            const nameCountry = country.name.common;
            const populationCountry = country.population;
            const regionCountry = country.region;
            const capitalCountry = country.capital || 'No capital';
            const isVisible = country.name.common.toLowerCase().includes(searchInput.value);

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

        countryList.innerHTML = countryTemplate;
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
