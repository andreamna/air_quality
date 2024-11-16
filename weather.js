const apiKey = '642f7b103b1a8fe078e4dd6df0ef8721'; // Replace with your actual OpenWeather API key
const lat = '35.1731'; // Latitude for Seoul
const lon = '129.0714'; // Longitude for Seoul

let lineChart, barChart, doughnutChart;
// Function to display the main data section, hide the intro, and fetch data
function displayData() {
  document.getElementById('intro-section').style.display = 'none'; // Hide the intro section
  document.getElementById('home').style.display = 'block'; // Show the data section
  document.getElementById('home').scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the data section
  
  // Fetch weather and basic air quality status
  fetchWeather();
  fetchAirQualityStatus();
}

// Set up the event listener on the button to trigger displayData function
document.getElementById("displayDataButton").addEventListener("click", displayData);

// Function to show a specific section and hide others
function showSection(sectionId) {
  // Hide all content sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  targetSection.style.display = 'block';
  
}

// Function to fetch weather data
function fetchWeather() {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(weatherUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('temperature').textContent = data.main.temp;
      document.getElementById('humidity').textContent = data.main.humidity;
      
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
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

// Function to fetch only air quality status for initial display
function fetchAirQualityStatus() {
  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(airQualityUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const pollution = data.list[0].components;
      const averageAQ = (pollution.pm2_5 + pollution.pm10 + pollution.co + pollution.no2 + pollution.so2 + pollution.nh3) / 6;

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
    })
    .catch(error => console.error('Error fetching air quality status:', error));
}

function fetchAirQualityData() {
  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  return fetch(airQualityUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      return response.json();
    })
    .then(data => {
      // Extract relevant components
      const components = data.list[0].components;
      return {
        pm2_5: components.pm2_5,
        pm10: components.pm10,
        no2: components.no2,
        so2: components.so2,
        co: components.co,
        nh3: components.nh3,
      };
    });
}

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

function updateLineChartWithRealData() {
  fetchWeatherHistory().then(data => {
    lineChart.data.labels = data.labels;
    lineChart.data.datasets[0].data = data.temperatures;
    lineChart.data.datasets[1].data = data.humidities;
    lineChart.update();
  });
}

// Function to load and display detailed air quality data
function loadDetailedData() {
  const detailedDataSection = document.getElementById('detailed-data');
  detailedDataSection.style.display = 'block'; // Show the detailed data section

  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(airQualityUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const pollution = data.list[0].components;
      const averageAQ = (pollution.pm2_5 + pollution.pm10 + pollution.co + pollution.no2 + pollution.so2 + pollution.nh3) / 6;

      document.getElementById('pm25').textContent = pollution.pm2_5;
      document.getElementById('pm10').textContent = pollution.pm10;
      document.getElementById('co').textContent = pollution.co;
      document.getElementById('no2').textContent = pollution.no2;
      document.getElementById('so2').textContent = pollution.so2;
      document.getElementById('nh3').textContent = pollution.nh3;

      // Determine air quality status and update explanation
      const statusText = averageAQ < 50 ? 'Good' : averageAQ < 100 ? 'Average' : 'Bad';
      document.getElementById('average-aq').textContent = averageAQ.toFixed(2);
      document.getElementById('aq-status').textContent = statusText;
    })
    .catch(error => {
      console.error('Error fetching detailed air quality data:', error);
    });
}

// Ensure the default section (intro) is displayed on page load
document.addEventListener('DOMContentLoaded', () => {
  // Ensure only the intro section is visible initially
  document.getElementById('intro-section').style.display = 'block';
  document.getElementById('home').style.display = 'none';
  document.getElementById('charts').style.display = 'none';
  document.getElementById('about').style.display = 'none';
});

// Function to show a specific section and hide others
function showSection(sectionId) {
  // Hide all content sections, including the intro section
  document.querySelectorAll('.content-section, #intro-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  targetSection.style.display = 'block';
}

function updateBarChartWithRealData() {
  fetchAirQualityData().then(data => {
    barChart.data.datasets[0].data = [
      data.pm2_5,
      data.pm10,
      data.no2,
      data.nh3,
      data.co,
      data.so2,
    ];
    barChart.update();
  });
}

function updateDoughnutChartWithRealData() {
  fetchAirQualityData().then(data => {
    doughnutChart.data.datasets[0].data = [
      data.pm2_5,
      data.pm10,
      data.no2,
      data.nh3,
      data.co,
      data.so2,
    ];
    doughnutChart.update();
  });
}

function showBarChart() {
  document.getElementById("lineChart").style.display = "none";
  document.getElementById("barChart").style.display = "block";
  document.getElementById("doughnutChart").style.display = "none";
  document.getElementById("dateRangeContainer").style.display = "none"; // Hide date range dropdown
  updateBarChartWithRealData()
}

function showDoughnutChart() {
  document.getElementById("lineChart").style.display = "none";
  document.getElementById("barChart").style.display = "none";
  document.getElementById("doughnutChart").style.display = "block";
  document.getElementById("dateRangeContainer").style.display = "none"; // Hide date range dropdown
  updateDoughnutChartWithRealData();
}

function showLineChart() {
  document.getElementById("lineChart").style.display = "block";
  document.getElementById("barChart").style.display = "none";
  document.getElementById("doughnutChart").style.display = "none";
  document.getElementById("dateRangeContainer").style.display = "block";
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
      function updateBarChart(pollutantData) {
        barChart.data.datasets[0].data = pollutantData;
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
      
      // Function to update doughnut chart with fetched distribution data
      function updateDoughnutChart(distributionData) {
        doughnutChart.data.datasets[0].data = distributionData;
        doughnutChart.update();
      }
