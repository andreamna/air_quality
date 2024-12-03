const apiKey = '642f7b103b1a8fe078e4dd6df0ef8721'; // Replace with your actual OpenWeather API key
let lineChart, barChart, doughnutChart, polarAreaChart, pieChart;
let lat, lon; // Global variables for latitude and longitude

// Function to display the main data section, hide the intro, and fetch data
function displayData() {
  document.getElementById('intro-section').style.display = 'none';
  document.getElementById('home').style.display = 'block';
  document.getElementById('home').scrollIntoView({ behavior: "smooth" });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude.toFixed(6);
        lon = position.coords.longitude.toFixed(6);

        // Fetch weather and air quality data for the user's location
        fetchWeather(lat, lon);
        fetchAirQualityStatus(lat, lon).then(data => {
          if (data) {
            // Use the data for updating charts if necessary
            updateBarChartWithRealData(data);
            updateDoughnutChartWithRealData(data);
            updateLineChartWithRealData(data);
          }
        });
        fetchFiveDayForecast(lat, lon);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve location. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function updateLineChartWithRealData(lat, lon) {
  fetchWeatherHistory(lat, lon).then(data => {
    if (data && lineChart) {
      lineChart.data.labels = data.labels;
      lineChart.data.datasets[0].data = data.temperatures;
      lineChart.data.datasets[1].data = data.humidities;
      lineChart.update();
    }
  }).catch(error => {
    console.error('Error updating line chart:', error);
  });
}

function updateBarChartWithRealData(data) {
    if (data && barChart) {
      barChart.data.datasets[0].data = [
        data.pm2_5,
        data.pm10,
        data.no2,
        data.nh3,
        data.co,
        data.so2,
      ];
      barChart.update();
    } 
}

function updateDoughnutChartWithRealData(data) {
    if (data && doughnutChart) {
      doughnutChart.data.datasets[0].data = [
        data.pm2_5,
        data.pm10,
        data.no2,
        data.nh3,
        data.co,
        data.so2,
      ];
      doughnutChart.update();
    } 
}

// Set up the event listener on the button to trigger displayData function
document.getElementById("displayDataButton").addEventListener("click", displayData);
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.content-section, #intro-section').forEach((section) => {
    section.style.display = 'none'; // Hide all other sections
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
}

// Modified fetchWeather function to accept latitude and longitude as parameters
function fetchWeather(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(weatherUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      // Update current weather details on the webpage
      document.getElementById('temperature').textContent = data.main.temp.toFixed(1);
      document.getElementById('humidity').textContent = `${data.main.humidity}%`;
      document.getElementById('feels-like').textContent = data.main.feels_like.toFixed(1) + "°C";
      document.getElementById('pressure').textContent = data.main.pressure + " hPa";
      document.getElementById('wind-speed').textContent = data.wind.speed + " m/s";
      document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + " km";

      // Sunrise and sunset times
      const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('sunrise').textContent = sunriseTime;
      document.getElementById('sunset').textContent = sunsetTime;

      // Set weather icon and description
      const weatherIcon = document.getElementById('weather-icon');
      switch (data.weather[0].main) {
        case 'Clear':
          weatherIcon.textContent = '☀️';
          break;
        case 'Clouds':
          weatherIcon.textContent = '☁️';
          break;
        case 'Rain':
          weatherIcon.textContent = '🌧️';
          break;
        case 'Snow':
          weatherIcon.textContent = '❄️';
          break;
        default:
          weatherIcon.textContent = '🌈';
      }
      const city = data.name;
      document.getElementById('title').textContent = `Today's Current Data in ${city}`;
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

// Function to update date and time
function updateDateTime() {
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('current-time');
  const now = new Date();

  // Format date (e.g., "November 27, 2024")
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);

  // Format time (e.g., "12:00 PM")
  const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
  timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

function fetchFiveDayForecast(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(forecastUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const forecastCards = document.getElementById('forecast-cards');
      forecastCards.innerHTML = ''; // Clear any existing content

      const dailyData = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        if (!dailyData[date]) {
          dailyData[date] = {
            tempSum: 0,
            count: 0,
            weatherIcon: item.weather[0].main,
          };
        }

        dailyData[date].tempSum += item.main.temp;
        dailyData[date].count += 1;
      });

      Object.keys(dailyData).slice(0, 5).forEach(date => {
        const avgTemp = (dailyData[date].tempSum / dailyData[date].count).toFixed(1);
        const dayCard = document.createElement('div');
        dayCard.classList.add('forecast-card');

        let iconSymbol = '';
        switch (dailyData[date].weatherIcon) {
          case 'Clear':
            iconSymbol = '☀️';
            break;
          case 'Clouds':
            iconSymbol = '☁️';
            break;
          case 'Rain':
            iconSymbol = '🌧️';
            break;
          case 'Snow':
            iconSymbol = '❄️';
            break;
          default:
            iconSymbol = '🌈';
        }

        dayCard.innerHTML = `
          <p class="forecast-date">${date}</p>
          <div class="forecast-icon">${iconSymbol}</div>
          <p class="forecast-temp">${avgTemp}°C</p>
        `;

        forecastCards.appendChild(dayCard);
        
      });
    })
    .catch(error => {
      console.error('Error fetching 5-day forecast data:', error);
    });
}

// Modified fetchAirQualityStatus function to accept latitude and longitude as parameters
function fetchAirQualityStatus(lat, lon) {
  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  return fetch(airQualityUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const pollution = data.list[0].components;

      // Calculate average air quality
      const averageAQ = (pollution.pm2_5 + pollution.pm10 + pollution.co + pollution.no2 + pollution.so2 + pollution.nh3) / 6;

      // Update air quality status
      const airQualityStatus = document.getElementById('air-quality-status');
      airQualityStatus.classList.remove('good', 'average', 'bad'); // Clear any existing classes

      let statusText = '';
      if (averageAQ < 50) {
        statusText = 'Good';
        airQualityStatus.classList.add('good');
      } else if (averageAQ < 100) {
        statusText = 'Average';
        airQualityStatus.classList.add('average');
      } else {
        statusText = 'Bad';
        airQualityStatus.classList.add('bad');
      }
      airQualityStatus.textContent = statusText;

      // Update detailed pollutant data
      document.getElementById('pm25').textContent = pollution.pm2_5;
      document.getElementById('pm10').textContent = pollution.pm10;
      document.getElementById('co').textContent = pollution.co;
      document.getElementById('no2').textContent = pollution.no2;
      document.getElementById('so2').textContent = pollution.so2;
      document.getElementById('nh3').textContent = pollution.nh3;

      document.getElementById('average-aq').textContent = averageAQ.toFixed(2);
      document.getElementById('aq-status').textContent = statusText;
      return pollution;
    })
    .catch(error => console.error('Error fetching air quality status:', error));
}

// Function to load and display detailed air quality data
function loadDetailedData() {
  // Show detailed pollutants data within air quality card
  const pollutantsData = document.getElementById('pollutants-data');
  pollutantsData.style.display = 'block';

  // Show air quality explanation in the bottom right
  const airQualityExplanationCard = document.getElementById('air-quality-explanation-card');
  airQualityExplanationCard.style.display = 'block';

  // Hide air quality status and load button after data is loaded
  document.getElementById('air-quality-status').style.display = 'none';
  document.querySelector('#air-quality-card button').style.display = 'none';

  // Fetch air quality data
  fetchAirQualityStatus(lat, lon); // Pass the user's latitude and longitude here
}

// Update date and time once on page load and every second
document.addEventListener('DOMContentLoaded', function() {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Automatically ask for location and fetch data on load
  displayData();
});

window.loadDetailedData = loadDetailedData;
window.displayData = displayData;

// Ensure the default section (intro) is displayed on page load
document.addEventListener('DOMContentLoaded', () => {
  // Ensure only the intro section is visible initially
  document.getElementById('intro-section').style.display = 'block';
  document.getElementById('home').style.display = 'none';
  document.getElementById('charts').style.display = 'none';
  document.getElementById('about').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'block';
  document.querySelector('footer').style.display = 'block';

});

function fetchWeatherHistory() {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  return fetch(weatherUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    })
    .then(data => {
      const labels = [];
      const temperatures = [];
      const humidities = [];

      // Extract temperature and humidity for each time interval
      data.list.forEach(item => {
        labels.push(new Date(item.dt * 1000).toLocaleTimeString());
        temperatures.push(item.main.temp);
        humidities.push(item.main.humidity);
      });

      return { labels, temperatures, humidities };
    });
}

function showBarChart() {
  document.getElementById("lineChart").style.display = "none";
  document.getElementById("barChart").style.display = "block";
  document.getElementById("doughnutChart").style.display = "none";
  document.getElementById("dateRangeContainer").style.display = "none"; // Hide date range dropdown
  document.getElementById("barChartDropdown").style.display = "block"; // Show bar chart dropdown
  document.getElementById("doughnutChartDropdown").style.display = "none"; // Hide doughnut chart dropdown
  updateBarChartWithRealData();
}

function showDoughnutChart() {
  document.getElementById("lineChart").style.display = "none";
  document.getElementById("barChart").style.display = "none";
  document.getElementById("doughnutChart").style.display = "block";
  document.getElementById("dateRangeContainer").style.display = "none"; // Hide date range dropdown
  document.getElementById("barChartDropdown").style.display = "none"; // Hide bar chart dropdown
  document.getElementById("doughnutChartDropdown").style.display = "block"; // Show doughnut chart dropdown
  updateDoughnutChartWithRealData();
}


function showLineChart() {
  document.getElementById("lineChart").style.display = "block";
  document.getElementById("barChart").style.display = "none";
  document.getElementById("doughnutChart").style.display = "none";
  document.getElementById("dateRangeContainer").style.display = "block";
  document.getElementById("barChartDropdown").style.display = "none"; // Hide bar chart dropdown
  document.getElementById("doughnutChartDropdown").style.display = "none"; // Show doughnut chart dropdown
}
     
      // Generate mock data for testing (Replace with actual API data fetching)
      function generateMockData(points, period) {
        const data = {
          labels: [],
          temperature: [],
          humidity: []
        };
      
        const currentDate = new Date();
        for (let i = 0; i < points; i++) {
          // Create labels based on period
          if (period === "hour") {
            data.labels.push(new Date(currentDate - i * 3600 * 1000).toLocaleTimeString());
          } else if (period === "day") {
            data.labels.push(new Date(currentDate - i * 86400 * 1000).toLocaleDateString());
          } else if (period === "month") {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            data.labels.push(date.toLocaleDateString());
          }
      
          // Mock temperature and humidity data
          data.temperature.push(Math.random() * 10 + 15); // Random temperature between 15 and 25°C
          data.humidity.push(Math.random() * 50 + 30);    // Random humidity between 30% and 80%
        }
      
        data.labels.reverse();
        data.temperature.reverse();
        data.humidity.reverse();
      
        return data;
      }
      
      // Function to update the line chart with new data
      function updateLineChart(data) {
        console.log("Updating chart with data:", data);
        lineChart.data.labels = data.labels;
        lineChart.data.datasets[0].data = data.temperature;
        lineChart.data.datasets[1].data = data.humidity;
        lineChart.update();
      }
      
      // Register the zoom plugin if using Chart.js 3 or later
      Chart.register(ChartZoom);
      
      // Initialize the line chart with zoom/pan functionality
      const lineChartCtx = document.getElementById('lineChart').getContext('2d');
      lineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Temperature (°C)',
              data: [],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
            },
            {
              label: 'Humidity (%)',
              data: [],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Time',
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  },
                  ticks: {
                    callback: function(value, index, values) {
                      // Format the time to remove seconds
                      const label = this.getLabelForValue(value);
                      return label.split(':').slice(0, 2).join(':'); // Keep only HH:MM
                  },
                      font: {
                          size: 12,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: 'Value',
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  },
                  ticks: {
                      font: {
                          size: 12,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              }
          },
          plugins: {
              legend: {
                  labels: {
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              },
              tooltip: {
                  bodyFont: {
                      weight: 'bold',
                      size: 14
                  }
              }
          }
      }      
  });

  document.getElementById('dateRange').addEventListener('change', function () {
    const selectedRange = this.value; // Get the selected value
    fetchDataForDateRange(selectedRange); // Fetch data for the selected range
});

// Function to fetch data for the selected date range
function fetchDataForDateRange(selectedRange) {
    let dataPoints;

    // Fetch or generate data based on the selected range
    switch (selectedRange) {
        case '1d': // 1 Day
            dataPoints = generateMockData(24, 'hour'); // Generate 24 hourly data points
            break;
        case '1w': // 1 Week
            dataPoints = generateMockData(7, 'day'); // Generate 7 daily data points
            break;
        case '1m': // 1 Month
            dataPoints = generateMockData(30, 'day'); // Generate 30 daily data points
            break;
        case '1y': // 1 Year
            dataPoints = generateMockData(12, 'month'); // Generate 12 monthly data points
            break;
        default:
            dataPoints = generateMockData(24, 'hour'); // Default to 1 day
    }

    // Update the chart with the new data
    updateLineChart(dataPoints);
}

// Function to update the line chart with new data
function updateLineChart(data) {
    lineChart.data.labels = data.labels; // Update the labels
    lineChart.data.datasets[0].data = data.temperature; // Update temperature data
    lineChart.data.datasets[1].data = data.humidity; // Update humidity data
    lineChart.update(); // Re-render the chart
}

// Mock data generator (replace this with actual API calls for live data)
function generateMockData(points, period) {
    const data = {
        labels: [],
        temperature: [],
        humidity: []
    };

    const currentDate = new Date();
    for (let i = 0; i < points; i++) {
        // Create labels based on the period
        if (period === 'hour') {
            data.labels.push(
                new Date(currentDate - i * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
        } else if (period === 'day') {
            data.labels.push(
                new Date(currentDate - i * 86400 * 1000).toLocaleDateString()
            );
        } else if (period === 'month') {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            data.labels.push(date.toLocaleDateString([], { year: 'numeric', month: 'short' }));
        }

        // Generate random data for temperature and humidity
        data.temperature.push(Math.random() * 15 + 15); // Random temperature (15-30°C)
        data.humidity.push(Math.random() * 50 + 30); // Random humidity (30-80%)
    }

    data.labels.reverse(); // Ensure chronological order
    data.temperature.reverse();
    data.humidity.reverse();

    return data;
}     
      // Ensure lineChart is ready before calling updateLineChart
      function updateLineChart(data) {
        console.log("Updating line chart with data:", data);  // Log entire data object
        console.log("Labels:", data.labels);
        console.log("Temperature:", data.temperature);
        console.log("Humidity:", data.humidity);
      
        lineChart.data.labels = data.labels;
        lineChart.data.datasets[0].data = data.temperature;
        lineChart.data.datasets[1].data = data.humidity;
        lineChart.update();
      }
      
      // Fetch data for a default range (e.g., 1 Day) after initializing the chart
      document.addEventListener("DOMContentLoaded", () => {
        Chart.register(ChartZoom);
        fetchDataForDateRange();
      });

      const barChartCtx = document.getElementById('barChart').getContext('2d');
      barChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
          labels: ['PM2.5', 'PM10', 'NOx', 'NH3', 'CO2', 'SO2', 'VOC'],
          datasets: [{
            label: 'Pollutant Levels (µg/m³)',
            data: [], // Fill with pollutant data when fetched
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(201, 203, 207, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Time',
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  },
                  ticks: {
                      font: {
                          size: 12,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: 'Value',
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  },
                  ticks: {
                      font: {
                          size: 12,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              }
          },
          plugins: {
              legend: {
                  labels: {
                      font: {
                          size: 14,
                          weight: 'bold'
                      },
                      color: '#333'
                  }
              },
              tooltip: {
                  bodyFont: {
                      weight: 'bold',
                      size: 14
                  }
              }
          }
      }      
  });
      
      // Function to update bar chart with fetched data
      function updateBarChart(filteredData) {
        barChart.data.datasets[0].data = filteredData;
        barChart.update();
      }
      const doughnutChartCtx = document.getElementById('doughnutChart').getContext('2d');
      doughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
          labels: ['PM2.5', 'PM10', 'NOx', 'NH3', 'CO2', 'SO2', 'VOC'],
          datasets: [{
            data: [], // Fill with distribution data
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(201, 203, 207, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'bottom',
                  labels: {
                      font: {
                          size: 14,
                          weight: 'bold' // Bold text for legend
                      },
                      color: '#333' // Darker color
                  }
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          const value = context.raw; // Tooltip value
                          const label = context.label; // Tooltip label
                          return `${label}: ${value} µg/m³`; // Add unit to value
                      }
                  },
                  bodyFont: {
                      weight: 'bold', // Bold text in tooltips
                      size: 14
                  }
              }
          }
      }
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Polar Area Chart Initialization
    const polarAreaChartCtx = document.getElementById('polarAreaChart').getContext('2d');
    polarAreaChart = new Chart(polarAreaChartCtx, {
        type: 'polarArea',
        data: {
            labels: ['PM2.5', 'PM10', 'NO2', 'NH3', 'CO', 'SO2'],
            datasets: [{
                data: [], // Fill with data after uploading the file
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(255, 105, 180, 0.6)', // Additional color if needed
                    'rgba(255, 215, 0, 0.6)' 
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                  callbacks: {
                      // Customize the tooltip label
                      label: function(tooltipItem) {
                          let value = tooltipItem.raw; // The value from the dataset
                          return value + ' µg/m³'; // Append the unit
                      }
                  }
              }
            }
        }
    });

    // Pie Chart Initialization
    const pieChartCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieChartCtx, {
        type: 'pie',
        data: {
            labels: ['PM2.5', 'PM10', 'NO2', 'NH3', 'CO', 'SO2'],
            datasets: [{
                data: [], // Fill with data after uploading the file
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(255, 105, 180, 0.6)', // Additional color if needed
                    'rgba(255, 215, 0, 0.6)' 
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                  callbacks: {
                      // Customize the tooltip label
                      label: function(tooltipItem) {
                          let value = tooltipItem.raw; // The value from the dataset
                          return value + ' µg/m³'; // Append the unit
                      }
                  }
              }
            }
        }
    });
});

function showCharts() {
  const chartsContainer = document.getElementById('charts-container');
  chartsContainer.style.display = 'flex';  // Change to flex to align charts correctly
}

// Utility function to calculate the average of an array
function getAverage(dataArray) {
  if (dataArray.length === 0) return 0; // Return 0 if no data to average
  const sum = dataArray.reduce((acc, value) => acc + value, 0);
  return sum / dataArray.length; // Calculate average
}

function handleExcelUpload() {
  const fileInput = document.getElementById('excel-file');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an Excel file!');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    console.log("File successfully read.");
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    console.log("Workbook loaded.");
 
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    console.log("Parsed JSON Data:", jsonData);

    // Now update the charts using the parsed data
    updateChartFromExcel(jsonData);
    document.getElementById('charts-container').style.display = 'flex';

    // Add a short delay before resizing charts to ensure they are properly displayed
    setTimeout(() => {
      if (pieChart) {
        console.log("Forcing Pie Chart to resize...");
        pieChart.resize(); // Force the pie chart to resize/redraw
      }

      if (polarAreaChart) {
        console.log("Forcing Polar Area Chart to resize...");
        polarAreaChart.resize(); // Force the polar area chart to resize/redraw
      }
    }, 100); // Adjust the timeout duration if necessary (100 ms)
  };

  reader.readAsArrayBuffer(file);
}

function updateChartFromExcel(parsedData) {
  if (parsedData.length === 0) {
    alert("No valid data found in the Excel file.");
    return;
  }

  // Extract pollutant values from Excel data
  const pollutantsData = {
    "PM2.5": [],
    "PM10": [],
    "NO": [],
    "CO": [],
    "NO2": [],
    "SO2": [], // Added for USA data
    "O3": [],  // Added for USA data
    "NH3": []
  };

  parsedData.forEach(item => {
    const pollutant = item.Pollutant.trim();
    console.log('Identified Pollutant:', pollutant); // Add this for debugging
    const value = parseFloat(item.Value);
    if (pollutantsData[pollutant] !== undefined && !isNaN(value)) {
      pollutantsData[pollutant].push(value);
    }
  });

  // Calculate average values for each pollutant
  const avgValues = Object.keys(pollutantsData).map(pollutant => {
    return getAverage(pollutantsData[pollutant]);
  });
  console.log("Average Values:", avgValues);

  
  updateXPieChart(avgValues);
  updateXPolarAreaChart(avgValues);
}

function updateXPieChart(avgValues) {
  if (pieChart) {
    console.log("Updating Pie Chart with:", avgValues);
    pieChart.data.datasets[0].data = avgValues;
    pieChart.update();
  }
}

function updateXPolarAreaChart(avgValues) {
  if (polarAreaChart) {
    console.log("Updating Polar Area Chart with:", avgValues);
    polarAreaChart.data.datasets[0].data = avgValues;
    polarAreaChart.update();
  }
}

document.getElementById("barChartFilter").addEventListener("change", (event) => {
  const filter = event.target.value;
  fetchAirQualityStatus(lat, lon).then((data) => {
    let filteredData;
    if (filter === "all") {
      filteredData = [data.pm2_5, data.pm10, data.no2, data.nh3, data.co, data.so2];
    } else if (filter === "particulate") {
      filteredData = [data.pm2_5, data.pm10];
    } else if (filter === "gaseous") {
      filteredData = [data.no2, data.nh3, data.co, data.so2];
    }
    updateBarChart(filteredData);
  });
});
  
  document.getElementById("doughnutChartFilter").addEventListener("change", (event) => {
    const filter = event.target.value;
    fetchAirQualityStatus(lat, lon).then((data) => {
      let filteredData;
      if (filter === "all") {
        filteredData = [data.pm2_5, data.pm10, data.no2, data.nh3, data.co, data.so2];
      } else if (filter === "particulate") {
        filteredData = [data.pm2_5, data.pm10];
      } else if (filter === "gaseous") {
        filteredData = [data.no2, data.nh3, data.co, data.so2];
      }
      updateDoughnutChart(filteredData);
    });
  });
  
      
      // Function to update doughnut chart with fetched distribution data
      function updateDoughnutChart(filteredData) {
        doughnutChart.data.datasets[0].data = filteredData;
        doughnutChart.update();
      }

      function toggleComparisonMenu() {
        const submenu = document.getElementById('comparison-submenu');
        if (submenu.style.display === 'none') {
          submenu.style.display = 'block';
        } else {
          submenu.style.display = 'none';
        }
      }

      let cities = []; // Will hold the cities from the JSON file
      let selectedCities = {}; // Object to store selected cities by inputId
      
      // Fetch cities data and store it
      async function loadCities() {
        try {
          const response = await fetch('https://andreamna.github.io/air_quality/simplified_cities.json'); // Update the path as necessary
          cities = await response.json();
        } catch (error) {
          console.error('Error loading cities:', error);
        }
      }
      
      // Call this function on page load to populate the cities array
      loadCities();
      
      function showSuggestions(inputId) {
        const inputElement = document.getElementById(inputId);
        const query = inputElement.value.toLowerCase();
        const suggestionBox = document.getElementById(`suggestions-${inputId}`);
        suggestionBox.innerHTML = ''; // Clear suggestions
    
        if (!query) {
            suggestionBox.style.display = 'none';
            selectedCities[inputId] = null; // Reset selection
            return;
        }
    
        const filteredCities = cities.filter(city =>
            city.name.toLowerCase().includes(query) || city.country.toLowerCase().includes(query)
        );
    
        filteredCities.slice(0, 5).forEach(city => {
            const option = document.createElement('div');
            option.textContent = `${city.name}, ${city.country}`;
            option.onclick = () => {
                inputElement.value = `${city.name}, ${city.country}`;
                selectedCities[inputId] = {
                    id: city.id,
                    lat: city.lat,
                    lon: city.lon
                }; // Store lat and lon
                suggestionBox.style.display = 'none';
            };
            suggestionBox.appendChild(option);
        });
        suggestionBox.style.display = 'block';
    }
    
      
      function validateCityFormat(cityInput) {
        if (typeof cityInput !== 'string') return false;
        const [city, country] = cityInput.split(',').map(part => part.trim());
        return city && country && /^[A-Za-z\s]+$/.test(city) && /^[A-Z]{2}$/.test(country);
      }
      
      document.getElementById('compareForm').addEventListener('submit', event => {
        event.preventDefault();
        const city1 = document.getElementById('city1').value.trim();
        const city2 = document.getElementById('city2').value.trim();
      
        if (!validateCityFormat(city1)) {
          alert('City 1 must be in the format: City, Country Code (e.g., New York, US)');
          return;
        }
        if (!validateCityFormat(city2)) {
          alert('City 2 must be in the format: City, Country Code (e.g., Seoul, KR)');
          return;
        }
      
        if (!selectedCities['city1'] || !selectedCities['city2']) {
          alert('Please select valid cities from the suggestions.');
          return;
        }
      
        const chartType = document.getElementById('chartType').value;
        loadCityComparison('city1', 'city2', chartType);
      });
      
      // Load city comparison data
      function loadCityComparison(city1InputId, city2InputId, chartType) {
        const city1 = selectedCities[city1InputId];
        const city2 = selectedCities[city2InputId];
    
        if (!city1 || !city2 || !city1.lat || !city1.lon || !city2.lat || !city2.lon) {
            console.error('City coordinates are missing:', { city1, city2 });
            alert('Please select valid cities.');
            return;
        }
    
        const apiKey = '642f7b103b1a8fe078e4dd6df0ef8721';
        const city1ApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city1.lat}&lon=${city1.lon}&appid=${apiKey}`;
        const city2ApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city2.lat}&lon=${city2.lon}&appid=${apiKey}`;
    
        console.log('City 1 API URL:', city1ApiUrl);
        console.log('City 2 API URL:', city2ApiUrl);
    
        Promise.all([fetch(city1ApiUrl), fetch(city2ApiUrl)])
            .then(async ([city1Response, city2Response]) => {
                if (!city1Response.ok || !city2Response.ok) {
                    throw new Error('Error fetching data for one or both cities.');
                }
                const city1Data = await city1Response.json();
                const city2Data = await city2Response.json();
    
                console.log('City 1 Data:', city1Data);
                console.log('City 2 Data:', city2Data);
    
                // Render charts (update as necessary)
                renderChart('city1Chart', city1Data.list[0].components, chartType, city1InputId);
                renderChart('city2Chart', city2Data.list[0].components, chartType, city2InputId);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert(error.message);
            });
    } 
      // Render the selected chart
      function renderChart(chartId, airData, chartType, city) {
        const ctx = document.getElementById(chartId).getContext('2d');
        const labels = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'NH3'];
        const data = Object.values(airData);
      
        const config = {
          type: chartType,
          data: {
              labels: labels,
              datasets: [
                  {
                      label: `Air Quality in ${city}`,
                      data: data,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.5)',
                          'rgba(54, 162, 235, 0.5)',
                          'rgba(75, 192, 192, 0.5)',
                          'rgba(255, 206, 86, 0.5)',
                          'rgba(153, 102, 255, 0.5)',
                          'rgba(255, 159, 64, 0.5)',
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                      ],
                      borderWidth: 1,
                  },
              ],
          },
          options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1, // Adjust aspect ratio (e.g., 1 for square, 2 for rectangle)
              plugins: {
                tooltip: {
                  callbacks: {
                      label: function(tooltipItem) {
                          return tooltipItem.raw + ' µg/m³';
                      }
                  }
              },
                  legend: {
                      position: 'top',
                  },
              },
          },
      };
      
      
        if (Chart.getChart(chartId)) {
          Chart.getChart(chartId).destroy();
        }
        new Chart(ctx, config);
      }

